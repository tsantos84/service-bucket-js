import { ContainerBuilder } from "../src/builder";
import { Logger, ConsoleTransport, RedisTransport, RedisClient } from "./fixtures/logger";
import {expect} from "chai";

describe('Service decoration', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should decorate services with anonymous function', () => {

        container
            .register(Logger)
            .decorate((logger:Logger) => {
                logger.addTransport(new ConsoleTransport());
                return logger;
            })
            .decorate((logger:Logger) => {
                logger.addTransport(new RedisTransport(new RedisClient('localhost', 12345)));
                return logger;
            });

        container.compile();

        const logger = container.get<Logger>('Logger');
        expect(logger.transports).to.have.length(2);
    })

    it('should decorate services with async anonymous function');
});