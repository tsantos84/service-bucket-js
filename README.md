# PoC - Service Container for Typescript

This is a Proof of Concept to validate an alternative to Inversify package.  

## Concept

Service container is a object that resolves and retrieve all services used by an application. 

## Use cases

### Simplest use case

Register a `Logger` service in container and retrieve the concrete service after compile the container.

```typescript
const container = new ContainerBuider();
container.register(Logger); // returns a new service definition
container.compile();
const logger:Logger = container.get<Logger>('Logger');
console.log(logger === container.get<Logger>('Logger')); // true
```

All services are shared by default, it means that consequent calls to container for the same service will return the same instance always.

### Non shared services

```typescript
const container = new ContainerBuider();
container.register(Logger).shared(false);
container.compile();
const logger:Logger = container.get<Logger>('Logger');
console.log(logger === container.get<Logger>('Logger')); // false
```

### Defining parameters to container

Passing arguments to services through container parameters.

```typescript
container.parameters.set('project.env', process.env.NODE_ENV)
container.register(Logger).withArguments('%project.env%');
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Defining dependency betweeng services

Injecting constructor dependency as a reference

```typescript
container.register(Logger).withArguments(new Reference('ConsoleTransport'));
container.register(ConsoleTransport);
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Decorating the services

Decorates the service after its initialization. You can add one or more decorators
for the same service.

```typescript
container.register(Logger).decorate((logger:Logger, container:Container) => {
    logger.addTransport(container.get('ConsoleTransport'));
    return logger; // required return
});
container.register(ConsoleTransport);
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Merging container builders

You can merge the service definitions. One container can define reference to a service
defined in another container before compilation.

```typescript
const containerA = new ContainerBuilder();
const containerB = new ContainerBuilder();
containerA.merge(containerB);
containerA.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Organizing containers with extensions

Good way to organize the services in separated containers and merge them after its configuration is done. 
Each extension will receive an empty `ContainerBuilder` on `configure` method and then merged to the main container.

```typescript
const container = new ContainerBuilder();
container.registerExtension(new LoggerExtension());
container.registerExtension(new DatabaseExtension());
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Tagging services

You can tag the services to pass custom metadata to service definition. The example bellow passes an array of `TransportInterface` as a first parameter to service `Logger`. This technique is known as `multiInject` on `Inversify` 
package.

```typescript
const container = new ContainerBuilder();
container.register(ConsoleTransport).addTag('logger.transport');
container.register(RedisTransport).addTag('logger.transport');
// inject all services tagged with logger.transport as an array for the 1st argument
container.register(Logger).withArgument(0, '!tagged logger.transport');
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Auto registering the services

Instead of registering all services manually, you can pass a directory (glob pattern) and the container builder
will read all exported classes in the modules and register the definitions for them.

```typescript
const container = new ContainerBuilder();

container.registerResource('/path/to/logger/transports', {
    tags: [
        {name: 'logger.transport'}
    ]
})

// inject all services tagged with logger.transport as an array for the 1st argument
container.register(Logger).withArguments('!tagged logger.transport');
container.compile();
const logger:Logger = container.get<Logger>('Logger');
```

### Factory Services

You can create a factory service and use it to create some service.

```typescript
const container = new ContainerBuilder();
container.register(MongoDatabase);
container
    .register(MyCollection)
    .factory('MongoDatabase', 'getCollection')
    .withArguments('my_collection_name');
container.compile();
const collection = container.get<Collection<MyCollection>>('MyCollection');
// TODO: needs work for async calls
```

### Method calls

The container will automatically call the methods after the service is initialized.

```typescript
const container = new ContainerBuilder();
container
    .register(MongoClient)
    .addCall('connect', ['%mongo.url%']);
container.compile();
const logger:Logger = container.get<Logger>('Logger');
// TODO: needs work for async calls
```

## TODO:

* Async service factories
* Async method calls
* Autowiring
* Public vs private services
* Load from config file (yaml and json)
* Resolve environment variable
* Dump container to javascript module
