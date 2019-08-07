import * as _ from "lodash";

export interface BagInterface<V> {
    set(name:string|symbol, value:V): BagInterface<V>;
    get(name:string|symbol): V;
    has(name:string|symbol): boolean;
}

export class Bag<V> implements BagInterface<V> {
    
    protected bag: {};

    constructor(bag:object = {}) {
        this.bag = bag;
    }

    set<T>(name:string|symbol, value:T): BagInterface<V> {
        this.bag[name.toString()] = value;
        return this;
    }

    get<T>(name:string|symbol): T {
        if (this.has(name)) {
            return this.bag[name];
        }

        throw new Error(`Parameter "${name.toString()}" not found`);
    }

    has(name:string|symbol): boolean {
        return typeof this.bag[name] !== 'undefined';
    }

    delete(name:string|symbol): BagInterface<V> {
        delete this.bag[name];
        return this;
    }

    all() {
        return this.bag;
    }

    length(): number {
        return _.size(this.bag);
    }

    each(predicate): Bag<V> {
        _.each(this.bag, predicate);
        return this;
    }

    merge(from: Bag<V>): Bag<V> {
        _.each(from.all(), (value:V, key:string) => {
            this.set(key, value);
        });
        return this;
    }

    find(predicate): Bag<V> {
        return new Bag<V>(_.filter(this.bag, predicate));
    }
}