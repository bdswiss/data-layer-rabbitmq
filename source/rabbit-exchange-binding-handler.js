'use strict';

const _ = require('underscore');
const RabbitBaseHandler = require('./rabbit-base-handler');
const RabbitExchangeHandler = require('./rabbit-exchange-handler');

class RabbitExchangeBindingHandler extends RabbitBaseHandler{
  constructor(rmq, config){
    if(!config.SOURCE &&
      !config.DESTINATION){
      throw new Error('RabbitExchangeBindingHandler: Missing Configuration (SOURCE and/or DESTINATION missing).');
    }

    super(rmq, config);

    const self = this;

    self.exchangeSourceData = config.SOURCE;
    self.exchangeSource = undefined;
    self.exchangeDestinationData = config.DESTINATION;
    self.exchangeDestination = undefined;
    self.keys = config.KEYS ? config.KEYS : [''];
  }

  *init(){
    const self = this;

    yield super.init();
    
    self.exchangeSource = new RabbitExchangeHandler(
      self.rmq,
      _.extend(
        {
          connection: self.connection,
          channel: self.channel
        },
        self.exchangeSourceData
      )
    );
    yield self.exchangeSource.init();

    self.exchangeDestination = new RabbitExchangeHandler(
      self.rmq,
      _.extend(
        {
          connection: self.connection,
          channel: self.channel
        },
        self.exchangeDestinationData
      )
    );
    yield self.exchangeDestination.init();

    yield _.map(self.keys, function(key){
      return self.channel.bindExchange(self.exchangeDestination.id, self.exchangeSource.id, key);
    });
  }

  destroy(){
    const self = this;

    super.destroy();

    self.exchangeSourceData = null;
    self.exchangeSource.destroy();
    self.exchangeSource = null;

    self.exchangeDestinationData = null;
    self.exchangeDestination.destroy();
    self.exchangeDestination = null;
    
    self.keys = null;
  }
}

module.exports = RabbitExchangeBindingHandler;