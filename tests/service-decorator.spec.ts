import { ContainerBuilder } from "../src/builder";
import { Logger, LoggerFactory } from "./fixtures/logger";
import {expect} from "chai";

describe('Factory services', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should register services through factories', () => {
        container.register(LoggerFactory);
        container
            .register(Logger)
            .throughFactory('LoggerFactory', 'create')
            .withArguments('a', 'b', 'c');

        container.compile();

        const logger = container.get<Logger>('Logger');
        expect(logger).to.be.an.instanceOf(Logger);
    })

    it.skip('should register services through async factories', () => {
        container.register(LoggerFactory);
        container
            .register(Logger)
            .throughAsyncFactory('LoggerFactory', 'createAsync')
            .withArguments('a', 'b', 'c');

        container.compile();
        
        const logger = container.get<Logger>('Logger');
        expect(logger).to.be.an.instanceOf(Logger);
    })
});