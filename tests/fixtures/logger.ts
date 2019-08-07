export interface TransportInterface {}

export class ConsoleTransport implements TransportInterface {}

export class StreamTransport implements TransportInterface {
    private stream:string;

    constructor(stream:string) {
        this.stream = stream;
    }

    getStream() {
        return this.stream;
    }
}

export class RedisTransport implements TransportInterface {
    private client:RedisClient;

    constructor(client:RedisClient) {
        this.client = client;
    }

    getRedisClient() {
        return this.client;
    }
}

export class ConstructorException implements TransportInterface {
    constructor() {
        throw new Error('Forced error on constructor');
    }
}

export class RedisClient {

    private host:string;
    private port:number;

    constructor(host:string, port:number) {
        this.host = host;
        this.port = port;
    }

    getHost() {
        return this.host;
    }

    getPort() {
        return this.port;
    }
}

export class Logger {

    transports:TransportInterface[] = [];

    constructor(transports:TransportInterface[] = []) {
        this.transports = transports;
    }

    addTransport(transport:TransportInterface) {
        this.transports.push(transport);
    }
}

export class LoggerFactory {
    
    create(): Logger {
        return new Logger();
    }

    async createAsync(): Promise<Logger> {
        return new Logger();
    }
}