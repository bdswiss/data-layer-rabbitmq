'use strict';

//import DataLayerAgent class
const DataLayerAgent = require('../../index.js');
const exchangeData = {
  ID: 'dla-example-01-exchange',
  TYPE: 'fanout',
  OPTIONS: {
    durable: true,
    autoDelete: false
  }
};
//define RabbitMQ configuration
const config = {};

//create an instance of the DataLayerAgent
const agent = new DataLayerAgent(config);

//keep a reference of the event constants
const EVENT = DataLayerAgent.EVENTS;

//send message when RabbitMQ is connected
agent.on(EVENT.CONNECTED, function(){
  console.log('RabbitMQ is connected');
  agent.publish(
    exchangeData, //the exchange that the message will published
    '', //the routing key (in this example just the empty string because its a fanout exchange)
    'dla-msg' //the message
  ).catch(function(err){
    console.log('ERROR OCCURRED ON PUBLISH');
  });
});

//do something when RabbitMQ is disconnected
agent.on(EVENT.DISCONNECTED, function(){
  console.log('RMQ IS DISCONNECTED');
});

//do something if the message is received from RabbitMQ
agent.on(EVENT.MESSAGE_DELIVERED, function(message){
  console.log('MESSAGE REACHED RABBIT MQ');
});

//do something if the message is NOT received from RabbitMQ
agent.on(EVENT.MESSAGE_DELIVERY_ERROR, function(message){
  console.log('MESSAGE DIDNT REACH RABBIT MQ');
});