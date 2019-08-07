import { ContainerBuilder } from "../src/builder";
import { Logger, RedisClient, ConstructorException } from "./fixtures/logger";
import {expect} from "chai";
import { Container } from "../src/container";

describe('Simple service dependency definition', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should register a single service without any dependency', () => {
        container.register(Logger);
        container.compile();
        const instance = container.get('Logger');
        expect(instance).to.be.instanceOf(Logger);
        expect(instance).to.be.equals(container.get('Logger'), 'The instance should be the same');
    });

    it('should register the service and instantiate only when the service is requested', () => {
        container.register(ConstructorException);
        
        try {
            container.compile();
        } catch (err) {
            expect.fail('Service exceptions should not be triggered on compile time');
        }

        try {
            container.get('Logger');
        } catch (err) {
            expect(err).to.be.instanceOf(Error);
        }
    });

    it('should register a service with scalar arguments on constructor', () => {

        container
            .register(RedisClient)
            .withArguments('localhost', 5106);

        container.compile();

        const instance = container.get<RedisClient>('RedisClient');
        
        expect(instance).to.be.instanceOf(RedisClient);
        expect(instance.getHost()).to.be.equals('localhost');
        expect(instance.getPort()).to.be.equals(5106);
    });

    it('should register with scalar arguments on constructor provided through "withArgument" method', () => {

        container
            .register(RedisClient)
            .withArgument(1, 5106)
            .withArgument(0, 'localhost');

        container.compile();

        const instance = container.get<RedisClient>('RedisClient');
        
        expect(instance).to.be.instanceOf(RedisClient);
        expect(instance.getHost()).to.be.equals('localhost');
        expect(instance.getPort()).to.be.equals(5106);
    });

    it('should register non shared services', () => {

        container
            .register(Logger)
            .shared(false);

        container.compile();

        const instance1 = container.get<RedisClient>('Logger');
        const instance2 = container.get<RedisClient>('Logger');
        
        expect(instance1).to.not.be.equals(instance2);
        expect(instance1).to.be.instanceOf(Logger);
        expect(instance2).to.be.instanceOf(Logger);
    });

    it.skip('should register synthetic services', () => {
        container.set('Logger', new Logger());
        container.compile();
        const instance = container.get('Logger');
        expect(instance).to.be.instanceOf(Logger);
    });
});