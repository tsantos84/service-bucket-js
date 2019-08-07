import { ContainerBuilder } from "../src/builder";
import { StreamTransport, RedisTransport, Logger } from "./fixtures/logger";
import {expect} from "chai";
 
describe('Service tagging', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should tag a service properly', () => {

        container
            .register(StreamTransport)
            .addTag('logger.transport');

        container
            .register(RedisTransport)
            .addTag('logger.transport');

        container.register(Logger);

        const definitions = container.findDefinitionsByTag('logger.transport');

        expect(definitions.all()).to.have.length(2);
    });

    it('should remove service tags', () => {

        container
            .register(StreamTransport)
            .addTag('logger.transport');

        container.getDefinition('StreamTransport').removeTag('logger.transport');

        const definitions = container.findDefinitionsByTag('logger.transport');

        expect(definitions.all()).to.have.length(0);
    });

    it('should pass all services tagged with "logger.transport" as a dependency', () => {

        container
            .register(StreamTransport)
            .addTag('logger.transport');

        container
            .register(RedisTransport)
            .addTag('logger.transport');

        container
            .register(Logger)
            .withArgument(0, '!tagged logger.transport');

        container.compile();

        const logger:Logger = container.get<Logger>('Logger');
        expect(logger.transports).to.have.length(2);
    });
});