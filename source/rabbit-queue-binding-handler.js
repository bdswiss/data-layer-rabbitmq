'use strict';

const _ = require('underscore');
const RabbitBaseHandler = require('./rabbit-base-handler');
const RabbitExchangeHandler = require('./rabbit-exchange-handler');
const RabbitQueueHandler = require('./rabbit-queue-handler');

class RabbitQueueBindingHandler extends RabbitBaseHandler{
  constructor(rmq, config){
    super(rmq, config);

    const self = this;

    self.exchangeData = config.EXCHANGE;
    self.exchange = undefined;

    if(config.QUEUE){
      self.queueData = config.QUEUE;
    }else{
      self.queueData = {
        OPTIONS: {
          exclusive: true,
          durable: false,
          autoDelete: true
        }
      };
    } 

    self.queue = undefined;
    self.keys = config.KEYS ? config.KEYS : [''];
  }

  *init(){
    const self = this;

    yield super.init();
    
    self.exchange = new RabbitExchangeHandler(
      self.rmq,
      _.extend(
        {
          connection: self.connection,
          channel: self.channel
        },
        self.exchangeData
      )
    );
    yield self.exchange.init();

    self.queue = new RabbitQueueHandler(
      self.rmq,
      _.extend(
        {
          connection: self.connection,
          channel: self.channel
        },
        self.queueData
      )
    );
    yield self.queue.init();

    yield _.map(self.keys, function(key){
      return self.channel.bindQueue(self.queue.id, self.exchange.id, key);
    });

    self.queue.consume();
  }

  destroy(){
    const self = this;

    super.destroy();

    self.exchangeData = null;
    self.exchange.destroy();
    self.exchange = null;

    self.queueData = null;
    self.queue.destroy();
    self.queue = null;
    
    self.keys = null;
  }
}

module.exports = RabbitQueueBindingHandler;