import { Definition } from "./definition";
import * as _ from "lodash";
import { Bag } from "./bag";
import { ExtensionInterface } from "./extension";
import * as glob from "glob";
import { Container } from "./container";
import { Reference } from "./reference";

interface ResourceOptions {
    ignore?: string,
    tags?: [{
        name: string
    }]
};

export class ContainerBuilder extends Container {

    private compiled:boolean = false;
    private definitions:Bag<Definition> = new Bag<Definition>();
    readonly extensions:Bag<ExtensionInterface> = new Bag<ExtensionInterface>();
    private resolvedServices:Bag<boolean> = new Bag<boolean>();

    register(type:any, id?:string|symbol): Definition {
        id = id || type.name;
        const definition = new Definition(type, id);
        this.definitions.set(id, definition);
        return definition;
    }

    registerExtension(extension: ExtensionInterface): ContainerBuilder {
        this.extensions.set(extension.getName(), extension);
        return this;
    }

    getDefinitions() {
        return this.definitions;
    }

    getDefinition(id:string|symbol): Definition {

        if (!this.definitions.has(id)) {
            throw new Error('Definition ' + id.toString() + ' not registered');
        }

        return this.definitions.get(id);
    }

    findDefinitionsByTag(tagName: string) {
        return this.definitions.find((def:Definition) => {
            return def.tags.has(tagName);
        });
    }

    merge(from: ContainerBuilder): ContainerBuilder {
        this.definitions.merge(from.getDefinitions());
        this.parameters.merge(from.parameters);
        return this;
    }

    compile(): void {
        if (this.isCompiled()) {
            throw new Error('Cannot compile a container twice');
        }

        this.extensions.each((ext:ExtensionInterface) => {
            const tmpContainer = new ContainerBuilder();
            ext.configure(tmpContainer);
            this.merge(tmpContainer);
        });

        this.definitions.each((def:Definition) => {
            const factory = this.resolve(def);

            if (!def.isShared) {
                this.nonShared.set(def.id, true);
            }
            
            this.factories.set(def.id, factory);
        });

        this.compiled = true;
    }

    private resolve(definition:Definition): Function {
        
        if (this.resolvedServices.has(definition.id)) {
            return this.resolvedServices.get(definition.id);
        }

        let factory = (container:Container): Promise<any> => {

            let service:any;
            const args = this.resolveArguments(definition.arguments);

            if (typeof definition.factory !== 'undefined') {
                const factoryOptions = definition.factory;
                const serviceFactory = container.get(factoryOptions.service);
                if (factoryOptions.async) {
                    //await serviceFactory[factoryOptions.method].call(serviceFactory, ...args);
                    //TODO incluir chamada assíncrona aqui
                } else {
                    service = serviceFactory[factoryOptions.method].call(serviceFactory, ...args);
                }
            } else {
                service = Reflect.construct(definition.type, args);
            }

            for (let i = 0; i < definition.decorators.length; i++) {
                service = definition.decorators[i].call(container, service, container);
            }

            definition.calls.forEach((call) => {
                if (call.async) {
                    // TODO incluir chamada assincrona aqui
                } else {
                    service[call.method].call(service, ...this.resolveArguments(call.args));
                }
            });

            return service;
        };

        this.resolvedServices[definition.id] = factory;
        
        return factory;
    }

    private resolveArguments(args:any[]): any[] {
        args = args.map((arg) => {
            if (arg instanceof Reference) {
                return this.get(arg.id);
            } else if (typeof arg === 'string' && arg.indexOf('%') >= 0) {
                return this.parameters.resolve(arg);
            } else if (/^\!tagged\s(.+)/.test(arg)) {
                const matches = arg.match(/^\!tagged\s(.+)/);
                const defs = this.findDefinitionsByTag(matches[1]);
                const dependencies = [];
                defs.each((def:Definition) => dependencies.push(this.get(def.id)));
                return dependencies;
            }
            
            return arg;
        });

        return args;
    }

    isCompiled(): boolean {
        return this.compiled;
    }

    async registerResource(include: string, options: ResourceOptions) :Promise<ContainerBuilder>{
        
        const files = glob.sync(include, {
            ignore: options.ignore
        });

        for (let i = 0; i < files.length; i++) {
            const modules = await import(files[i]);
            _.each(modules, (module) => {
                if (/^class /.test(module.toString())) {
                    const def = this.register(module);
                    if (options.tags) {
                        options.tags.forEach((tag) => def.addTag(tag.name, _.omit(tag, 'name')));
                    }
                }
            });
        }

        return this;
    }
}