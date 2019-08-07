import { ParameterBag } from "./parameter-bag";
import { Bag } from "./bag";

export interface ContainerInterface {
    get<T>(id:string|symbol): T;
    has(id:string|symbol): boolean;
    set(id:string|symbol, service:any): void;
}

export class Container implements ContainerInterface {

    protected factories:Bag<Function> = new Bag<Function>();
    private services:Bag<any> = new Bag<any>();
    readonly parameters:ParameterBag<any>;
    protected nonShared:Bag<boolean> = new Bag<boolean>();

    constructor(parameters:ParameterBag<any> = null) {
        this.parameters = parameters || new ParameterBag();
    }

    get<T>(id:string|symbol): T {

        if (this.nonShared.has(id)) {
            return this.factories.get<Function>(id).call(this, this);
        }
        
        if (this.services.has(id)) {
            return this.services.get(id);
        }

        const value = this.factories.get<Function>(id).call(this, this);
        this.services.set(id, value);

        return value;
    }

    set<T>(id:string|symbol, service:any): void {
        this.services.set(id, service);
    }

    has(id:string|symbol): boolean {
        return this.factories.has(id);
    }
}