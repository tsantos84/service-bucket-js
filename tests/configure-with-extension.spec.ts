import { ContainerBuilder } from "../src/builder";
import { Logger } from "./fixtures/logger";
import {expect} from "chai";
import { LoggerExtension } from "./fixtures/logger-extension";

describe('Configure container with extensions', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should configure the logger service via custom extension', () => {
        container.registerExtension(new LoggerExtension);
        container.compile();
        const logger = container.get<Logger>('Logger');
        expect(logger.transports).to.have.length(2);
        expect(container.parameters.get('redis.host')).to.be.equals('localhost');
        expect(container.parameters.get('redis.port')).to.be.equals(1234);
    });

    it('should configure the logger service via custom extension asynchronously');
});