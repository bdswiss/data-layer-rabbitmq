#Data Layer for RabbitMQ
Data layer for microservices communication using RabbitMQ

```
npm i data-layer-rabbitmq
```

##Configuration Object
This object defines the RabbitMQ architecture that will be created (if it doesn't exists already). Below the different options are described.

###Set connection credentials
In order to define connection credentials you need add as key the CONNECTION string and as value an object with the following structure:
```
{
  url: 'my-rabbitmq-url-with-credentials'
}
```
If the CONNECTION key isn't defined then the default localhost credential are used.

###Exchange to Queue Bindings
In order to define one or more Exchange - Queue bindings you need to add as key the BIND_QUEUE string and as value an array with objects with the following structure:
```
{
  EXCHANGE: { //An object representing the exchange
    ID: 'my-exchange', //A String representing the id of the exchange
    TYPE: 'direct', //A String representing the type of the exchange
    OPTIONS: { //An object representing the RabbitMQ options for the exchange
      durable: true,
      autoDelete: false
    }
  },
  QUEUE: { //An object representing the queue (if it is undefined then a non-durable queue is added
    ID: 'my-queue', //A String representing the id of the queue
    OPTIONS: {  //An object representing the RabbitMQ options for the queue
      durable: true,
      autoDelete: false
    }
  },
  KEYS: [ //An array with the routing keys (if it is undefined then the '' routing key will be added
    'some-route',
    'another-route'
  ]
}
```

###Exchange to Exchange Bindings
In order to define one or more Exchange - Exchange bindings you need to add as key the BIND_EXCHANGE string and as value an array with objects with the following structure:
```
{
  SOURCE: { //An object representing the source exchange
    ID: 'my-source-exchange', //A String representing the id of the exchange
    TYPE: 'topic', //A String representing the type of the exchange
    OPTIONS: { //An object representing the RabbitMQ options for the exchange
      durable: true,
      autoDelete: false
    }
  },
  DESTINATION: { //An object representing the destination exchange
    ID: 'my-destination-exchange', //A String representing the id of the exchange
    TYPE: 'fanout', //A String representing the type of the exchange
    OPTIONS: { //An object representing the RabbitMQ options for the exchange
      durable: true,
      autoDelete: false
    }
  },
  KEYS: [ //An array with the routing keys (if it is undefined then the '' routing key will be added
    'some-route',
    'another-route'
  ]
}
```

###Consume Queues
In order to consume one or more queues you need to add as key the CONSUME_QUEUE string and as value an array with objects with the following structure:
```
{
  QUEUE: { //An object representing the queue
    ID: 'my-queue', //A String representing the id of the queue
    OPTIONS: {  //An object representing the RabbitMQ options for the queue
      durable: true,
      autoDelete: false
    }
  }
}
```

##Instantiate
In order to instantiate DataLayerRabbitMQ import the class and pass to the constructor the configuration object.

```
var config = {
  CONNECTION: {
    url: 'my-rabbitmq-url-with-credentials'
  },
  BIND_QUEUE: [
    {
      EXCHANGE: {
        ID: 'my-exchange',
        TYPE: 'direct',
        OPTIONS: {
          durable: true,
          autoDelete: false
        }
      },
      QUEUE: {
        ID: 'my-queue',
        OPTIONS: {
          durable: true,
          autoDelete: false
        }
      },
      KEYS: [
        'some-route',
        'another-route'
      ]
    }
  ],
  CONSUME_QUEUE: [
    {
      ID: 'my-queue',
      OPTIONS: {
        durable: true,
        autoDelete: false
      }
    }
  ]
};

var DataLayerRabbitMQ = require('data-layer-rabbitmq');
var rmq = new DataLayerRabbitMQ(config);
```

##API
###publish(exchange:object, routingKey:string, message:*, [options:object]):Promise
Sends a message to an exchange.
```
rmq.publish(
  {
    ID: 'my-exchange',
    TYPE: 'direct',
    OPTIONS: {
      durable: true,
      autoDelete: false
    }
  },
  'some-route',
  'message-goes-here',
  {
    persistent: true
  }
).catch(
  function(err){
    throw new Error(err);
  }
);
```
##Events
The DataLayerRabbitMQ instances emit events.
```
rmq.on(DataLayerRabbitMQ.EVENTS.CONNECTED, function(){
  //do something
})
```
###DataLayerRabbitMQ.EVENTS.CONNECTED
This event is emitted when the connection is established
###DataLayerRabbitMQ.EVENTS.DISCONNECTED
This event is emitted on disconnections
###DataLayerRabbitMQ.EVENTS.MESSAGE_ARRIVED
This event is emited when a message arrives.
```
rmq.on(DataLayerRabbitMQ.EVENTS.MESSAGE_ARRIVED, function(queue, message){
  //ack the message
  queue.ack(message);
  //or reject the message
  queue.reject(message);
});
```
###DataLayerRabbitMQ.EVENTS.MESSAGE_DELIVERED
This event is emitted when a message arrives at the RabbitMQ
```
rmq.on(DataLayerRabbitMQ.EVENTS.MESSAGE_DELIVERED, function(message){
  //do something
});
```
###DataLayerRabbitMQ.EVENTS.MESSAGE_DELIVERY_ERROR
This event is emitted when a message fails to arrive at the RabbitMQ
```
rmq.on(DataLayerRabbitMQ.EVENTS.MESSAGE_DELIVERY_ERROR, function(message){
  //do something
});
```

##Gulp commands
###Dev watcher
It runs the jshint on the codebase
```
gulp
```
###RabbitMQ status
Get info for the local RabbitMQ node.
```
gulp rmq-info
```
###RabbitMQ reset (USE WITH CAUTION!!!)
Delete all data from the local RabbitMQ node.
```
gulp rmq-delete-all
```

## Contributing

Data Layer for RabbitMQ follows the [GitFlow branching model](http://nvie.com/posts/a-successful-git-branching-model). The ```master``` branch always reflects a production-ready state while the latest development is taking place in the ```develop``` branch.

Each time you want to work on a fix or a new feature, create a new branch based on the ```develop``` branch: ```git checkout -b BRANCH_NAME develop```. Only pull requests to the ```develop``` branch will be merged.

## Versioning

Data Layer for RabbitMQ is maintained by using the [Semantic Versioning Specification (SemVer)](http://semver.org).
