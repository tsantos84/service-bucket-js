import * as _ from "lodash";
import {Bag} from "./bag";

export class ParameterBag<K> extends Bag<K> {

    resolve<T>(name:string): T {

        if (/^%[^%]*%$/.test(name)) {
            return this.get<T>(name.slice(1, name.length - 1));
        }

        let result:any;
        
        do {
            result = name.replace(/%([\w\.]+)%/gim, (substring: string, ...args: any[]): string => {
                const name = substring.slice(1, substring.length - 1);
                return this.get(name);
            });

            name = result;
        } while (name.indexOf('%') > -1);

        return result;
    }
}