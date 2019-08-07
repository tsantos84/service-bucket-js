import * as _ from "lodash"
import { Bag } from "./bag";


interface FactoryOptions {
    service: string|symbol,
    method: string,
    async: boolean
}

interface CallOptions {
    method: string,
    args: any[],
    async: boolean;
}

export class Definition {
    type:any;
    id:string|symbol;
    arguments = [];
    isShared:boolean = true;
    tags: Bag<any[]> = new Bag<any[]>();
    decorators: Function[] = [];
    factory: FactoryOptions;
    calls: CallOptions[] = []

    constructor(type:any, id?:string|symbol) {
        this.type = type;
        this.id = id;
    }

    withArguments(...args:any): Definition {
        this.arguments = args;
        return this;
    }

    withArgument(index:number, value:any): Definition {
        this.arguments[index] = value;
        return this;
    }

    shared(shared:boolean): Definition {
        this.isShared = shared;
        return this;
    }

    addTag(name:string, opts: object = {}): Definition {
        
        if (!this.tags.has(name)) {
            this.tags.set(name, [opts]);
            return this;
        }

        const tags = this.tags.get<any[]>(name);
        tags.push(opts);
        this.tags.set(name, tags);

        return this;
    }

    removeTag(name:string): Definition {
        this.tags.delete(name);
        return this;
    }

    decorate(decorator:Function): Definition {
        this.decorators.push(decorator);
        return this;
    }

    throughFactory(service:string|symbol, method:string): Definition {
        this.factory = {service, method, async: false};
        return this;
    }

    throughAsyncFactory(service:string|symbol, method:string): Definition {
        this.factory = {service, method, async: true};
        return this;
    }

    addCall(method:string, args:any[]): Definition {
        this.calls.push({method, args, async: false});
        return this;
    }

    addAsyncCall(method:string, args:any[]): Definition {
        this.calls.push({method, args, async: true});
        return this;
    }
}