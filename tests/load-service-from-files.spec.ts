import { ContainerBuilder } from "../src/builder";
import {expect} from "chai";

describe('Load service from resource', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should load services defined inside a module', async () => {
        await container.registerResource(__dirname + '/fixtures/**/*.ts', {
            ignore: '**/logger-extension.ts',
            tags: [
                { name: "logger.transport" }
            ]
        });

        container.compile();

        expect(container.has('Logger')).to.be.true;
        expect(container.has('ConsoleTransport')).to.be.true;
        expect(container.has('StreamTransport')).to.be.true;
        expect(container.has('ConstructorException')).to.be.true;
        expect(container.has('ConstructorException')).to.be.true;
        expect(container.has('RedisClient')).to.be.true;
    });
});