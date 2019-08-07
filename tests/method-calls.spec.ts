import { ContainerBuilder } from "../src/builder";
import { RedisClient, RedisTransport, Logger, ConsoleTransport } from "./fixtures/logger";
import { Reference } from "../src/reference";
import {expect} from "chai";

describe('Method calls', () => {

    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should call a sync method after service initialization', () => {
        
        container
            .register(Logger)
            .addCall('addTransport', [new Reference('ConsoleTransport')]);

        container.register(ConsoleTransport);

        container.compile();
        
        const logger = container.get<Logger>('Logger');
        expect(logger.transports).to.have.length(1);
        expect(logger.transports[0]).to.be.an.instanceOf(ConsoleTransport);
    });

    it.skip('should call an async method after service initialization', () => {
        
        container
            .register(Logger)
            .addCall('addAsyncTransport', [new Reference('ConsoleTransport')]);

        container.register(ConsoleTransport);

        container.compile();
        
        const logger = container.get<Logger>('Logger');
        expect(logger.transports).to.have.length(1);
        expect(logger.transports[0]).to.be.an.instanceOf(ConsoleTransport);
    });

});