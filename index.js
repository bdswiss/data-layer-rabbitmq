'use strict';

const _ = require('underscore');
const EventEmitter = require('events');
const co = require('co');
const fs = require('fs');
const amqp = require('amqplib');
const RabbitExchangeHandler = require('./source/rabbit-exchange-handler');
const RabbitExchangeBindingHandler = require('./source/rabbit-exchange-binding-handler');
const RabbitQueueHandler = require('./source/rabbit-queue-handler');
const RabbitQueueBindingHandler = require('./source/rabbit-queue-binding-handler');
const RabbitDefaults = require('./source/rabbit-defaults');
const backoff = require('backoff');
const STATES = RabbitDefaults.HANDLER_STATES;
const EVENT = require('./constants').EVENTS;


class RabbitHandler extends EventEmitter{
  constructor(config){
    super();
    const self = this;

    self.config = config;
    self.connection = undefined;
    self.channel = undefined;
    self.configBase = {};
    self.exchanges = {};
    self.queues = {};
    self.exchangeBindings = {};
    self.queueBindings = {};
    self.state = STATES.UNINITIALIZED;
    self.fib = backoff.fibonacci({
      randomisationFactor: RabbitDefaults.RECONNECT_OPTIONS.RANDOMIZATION,
      initialDelay: RabbitDefaults.RECONNECT_OPTIONS.INIT_DELAY,
      maxDelay: RabbitDefaults.RECONNECT_OPTIONS.MAX_DELAY
    });

    self.fib.on('backoff', function(number, delay){
      console.log('RabbitMQ Reconnection try: ' + number + ' ' + delay + 'ms');
    });

    self.fib.on('ready', function(/*number, delay*/){
      co(initCallback(self)).then(
        function(){
          self.state = STATES.CONNECTED;
          self.emit(EVENT.CONNECTED);
          addConnectionListeners(self);
          self.fib.reset();
        }
      ).catch(
        function(err){
          console.log('RMQ CONNECTION ERROR');
          console.log(err);
          self.fib.backoff();
        }
      );
    });

    self.connectionCloseCallback = (function(){
      const self = this;
      try{
        self.state = STATES.DISCONNECTED;
        self.emit(EVENT.DISCONNECTED);
        removeConnectionListeners(self);
        self.destroy();
        self.fib.backoff();

      }catch(e){
        console.log('ERROR on connectionCloseCallback');
        console.log(e);
      }
    }).bind(self);

    self.fib.backoff();
  }

  publish(exchangeData, key, message, options){
    const self = this;
    return co(publish(self, exchangeData, key, message, options));
  }

  consumeQueue(data){
    const self = this;
    return co(consumeQueue(self, data));
  }

  connectionErrorCallback(){
    console.log('CONNECTION ERROR');
  }

  destroy(){
    const self = this;

    _.each(self.exchanges, function(val, key){
      val.destroy();
      delete self.exchanges[key];
    });

    _.each(self.queues, function(val, key){
      val.destroy();
      delete self.queues[key];
    });

    _.each(self.exchangeBindings, function(val, key){
      val.destroy();
      delete self.exchangeBindings[key];
    });

    _.each(self.queueBindings, function(val, key){
      val.destroy();
      delete self.queueBindings[key];
    });

    self.channel = null;
    self.connection = null;
  }
}

RabbitHandler.EVENTS = require('./constants').EVENTS;

function getConfigurationData(rmq, config){
  return _.extend({}, config, rmq.configBase);
}

function *initCallback(rmq){
  let connString = rmq.config.CONNECTION ? rmq.config.CONNECTION.url : '';
  let opts = rmq.config.CONNECTION && rmq.config.CONNECTION.ssl && rmq.config.CONNECTION.ssl.caFile ?
              {ca:[fs.readFileSync(rmq.config.CONNECTION.ssl.caFile)]} :
                {};
  rmq.connection = yield amqp.connect(connString, opts);
  rmq.configBase.connection = rmq.connection;

  if(rmq.config.CONSUME_QUEUE){
    yield _.map(rmq.config.CONSUME_QUEUE, function(data){
      return consumeQueue(rmq, data);
    });
  }

  if(rmq.config.BIND_EXCHANGE){
    yield _.map(rmq.config.BIND_EXCHANGE, function(data){
      return bindExchange(rmq, data);
    });
  }

  if(rmq.config.BIND_QUEUE){
    yield _.map(rmq.config.BIND_QUEUE, function(data){
      return bindQueue(rmq, data);
    });
  }
}

function *addExcahnge(rmq, config){
  if(!rmq.exchanges[config.ID]){
    config = getConfigurationData(rmq, config);
    rmq.exchanges[config.ID] = new RabbitExchangeHandler(rmq, config);
    yield rmq.exchanges[config.ID].init();
  }
}

function *bindQueue(rmq, config){
  config = getConfigurationData(rmq, config);
  const b = new RabbitQueueBindingHandler(rmq, config);
  rmq.queueBindings[b.id] = b;
  yield b.init();
}

function *bindExchange(rmq, config){
  config = getConfigurationData(rmq, config);
  const b = new RabbitExchangeBindingHandler(rmq, config);
  rmq.exchangeBindings[b.id] = b;
  yield b.init();
}

function *consumeQueue(rmq, config){
  config = getConfigurationData(rmq, config.QUEUE);
  const b = new RabbitQueueHandler(rmq, config);
  yield b.init();
  rmq.queues[b.id] = b;
  b.consume();
}

function *publish(rmq, exchangeData, key, message, options){
  if(rmq.state === STATES.CONNECTED){
    if(exchangeData !== ''){
      yield addExcahnge(rmq, exchangeData);
      yield rmq.exchanges[exchangeData.ID].publish(key, message, options);
    }else{
      if(!rmq.channel){
        rmq.channel = yield rmq.connection.createConfirmChannel();
      }

      const getMessageOptions = require('./source/rabbit-utils').getMessageOptions;
      const confirmationCallback = require('./source/rabbit-utils').confirmationCallback;

      options = getMessageOptions(options);

      rmq.channel.sendToQueue(
        key,
        new Buffer(message),
        options,
        confirmationCallback.bind({
          rmq: rmq,
          message: message
        })
      );
    }
  }else{
    console.log('RMQ CONNECTION UNAVAILABLE, PLEASE TRY LATER...');
  }
}

function addConnectionListeners(rmq){
  rmq.connection.on('error', rmq.connectionErrorCallback);
  rmq.connection.on('close', rmq.connectionCloseCallback);
}

function removeConnectionListeners(rmq){
  rmq.connection.removeListener('error', rmq.connectionErrorCallback);
  rmq.connection.removeListener('close', rmq.connectionCloseCallback);
}

module.exports = RabbitHandler;
