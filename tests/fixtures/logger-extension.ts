import {ExtensionInterface} from "../../src/extension";
import {ContainerBuilder} from "../../src/builder";
import {Logger, RedisTransport, StreamTransport} from "./logger";

export class LoggerExtension implements ExtensionInterface {
    
    configure(builder: ContainerBuilder): void {

        builder.parameters.set('redis.host', 'localhost');
        builder.parameters.set('redis.port', 1234);
        builder.parameters.set('project.root_dir', '/usr/app');
        builder.parameters.set('project.env', 'prod');

        builder
            .register(Logger)
            .withArguments('!tagged logger.transport');

        builder
            .register(RedisTransport)
            .withArguments('%redis.host%', '%redis.port%')
            .addTag('logger.transport');

        builder
            .register(StreamTransport)
            .withArguments('%project.root_dir%/var/%project.env%.log')
            .addTag('logger.transport');
    }

    getName(): string {
        return 'logger';
    }
}