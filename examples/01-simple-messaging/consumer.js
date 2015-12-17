'use strict';

//import DataLayerAgent class
const DataLayerAgent = require('../../index.js');

//define RabbitMQ configuration
const config = {
  BIND_QUEUE: [
    {
      EXCHANGE: {
        ID: 'dla-example-01-exchange',
        TYPE: 'fanout',
        OPTIONS: {
          durable: true,
          autoDelete: false
        }
      },
      QUEUE: {
        ID: 'dla-example-01-consumer-queue',
        OPTIONS: {
          durable: true,
          autoDelete: false
        }
      }
    }
  ],
  CONSUME_QUEUE: [
    {
      QUEUE: {
        ID: 'dla-example-01-consumer-queue',
        OPTIONS: {
          durable: true,
          autoDelete: false
        }
      }
    }
  ]
};

//create an instance of the DataLayerAgent
const agent = new DataLayerAgent(config);

console.log(DataLayerAgent.EVENT);
//keep a reference of the event constants
const EVENT = DataLayerAgent.EVENTS;

//do something when RabbitMQ is connected
agent.on(EVENT.CONNECTED, function(){
  console.log('RabbitMQ is connected');
});

//do something when RabbitMQ is disconnected
agent.on(EVENT.DISCONNECTED, function(){
  console.log('RMQ IS DISCONNECTED');
});

//do something when a queue message arrives
agent.on(EVENT.MESSAGE_ARRIVED, function(queue, message){
  const msg = message.content.toString();
  console.log('RECEIVED MESSAGE ' + msg);
  if(msg === 'dla-msg'){
    //if the message is ok then acknowledge it
    queue.ack(message);
  }else{
    //if there is some problem the reject it
    queue.reject(message);
  }
});