import { ContainerBuilder } from "../src/builder";
import { RedisClient, StreamTransport } from "./fixtures/logger";
import {expect} from "chai";

describe('Parameter handling', () => {
    
    let container:ContainerBuilder;

    beforeEach(() => {
        container = new ContainerBuilder();
    });

    it('should compile the container with a parameters', () => {

        container.parameters.set('redis.host', 'localhost');
        container.parameters.set('redis.port', 1234);

        container
            .register(RedisClient)
            .withArguments('%redis.host%', '%redis.port%');

        container.compile();

        const instance = container.get<RedisClient>('RedisClient');
        
        expect(instance).to.be.instanceOf(RedisClient);
        expect(instance.getHost()).to.be.equals('localhost');
        expect(instance.getPort()).to.be.equals(1234);
    });

    it('should resolve parameters', () => {

        container.parameters.set('project.root', '/usr/app');
        container.parameters.set('project.env', 'test');
        container.parameters.set('logger.stream_dir', '%project.root%/var');
        container.parameters.set('logger.stream_file', '%project.env%.log');

        container
            .register(StreamTransport)
            .withArguments('%logger.stream_dir%/%logger.stream_file%');

        container.compile();
        
        const instance = container.get<StreamTransport>('StreamTransport');
        const filename = instance.getStream();
        expect(filename).to.be.equals('/usr/app/var/test.log');
    });
});