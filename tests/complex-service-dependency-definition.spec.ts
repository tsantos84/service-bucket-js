import { ContainerBuilder } from "../src/builder";
import { RedisClient, RedisTransport } from "./fixtures/logger";
import { Reference } from "../src/reference";
import {expect} from "chai";

describe('Complex service dependency definition', () => {

    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should regsiter a service containing a reference to another service', async () => {
        container
            .register(RedisTransport)
            .withArguments(new Reference('RedisClient'));

        container
            .register(RedisClient)
            .withArguments('localhost', 1234);

        container.compile();

        const transport = container.get<RedisTransport>('RedisTransport');
        const client = container.get<RedisClient>('RedisClient');
        
        expect(transport).to.be.instanceOf(RedisTransport);
        expect(client).to.be.instanceOf(RedisClient);
        expect(client).to.be.equals(transport.getRedisClient());
    });
});