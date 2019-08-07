import { ContainerBuilder } from "../src/builder";
import { RedisClient, RedisTransport } from "./fixtures/logger";
import { Reference } from "../src/reference";
import {expect} from "chai";

describe('Merged container', () => {

    let containerA:ContainerBuilder;
    let containerB:ContainerBuilder;

    beforeEach(() => {
        containerA = new ContainerBuilder();
        containerB = new ContainerBuilder();
    });

    it('should merge the services of two containers', () => {
        containerA
            .register(RedisTransport)
            .withArguments(new Reference('RedisClient'));

        containerB
            .register(RedisClient)
            .withArguments('localhost', 1234);

        containerA.merge(containerB);

        containerA.compile();
        
        const transport = containerA.get<RedisTransport>('RedisTransport');
        const client = containerA.get<RedisClient>('RedisClient');
        
        expect(transport).to.be.instanceOf(RedisTransport);
        expect(client).to.be.instanceOf(RedisClient);
        expect(client).to.be.equals(transport.getRedisClient());
    });

    it('should merge the parameters of two containers', () => {

        containerA.parameters.set('foo', 'bar');
        containerB.parameters.set('bar', 'baz');

        containerA.merge(containerB);

        expect(containerA.parameters.get('foo')).to.be.equals('bar');
        expect(containerA.parameters.get('bar')).to.be.equals('baz');
    });
});