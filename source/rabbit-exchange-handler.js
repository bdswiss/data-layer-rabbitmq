'use strict';

const RabbitBaseHandler = require('./rabbit-base-handler');
const getMessageOptions = require('./rabbit-utils').getMessageOptions;
const confirmationCallback = require('./rabbit-utils').confirmationCallback;

class RabbitExchangeHandler extends RabbitBaseHandler{
  constructor(rmq, config){
    super(rmq, config);

    const self = this;

    self.id = config.ID;
    self.options = config.OPTIONS;
    self.type = config.TYPE;
  }

  *init(){
    const self = this;

    yield super.init();
    yield self.channel.assertExchange(
      self.id,
      self.type,
      self.options
    );
  }

  *publish(key, message, options){
    const self = this;

    options = getMessageOptions(options);

    yield self.init();
    self.channel.publish(
      self.id, 
      key, 
      new Buffer(message), 
      options, 
      confirmationCallback.bind({
        rmq: self.rmq,
        message: message
      })
    );
  }

  destroy(){
    const self = this;

    super.destroy();

    self.id = null;
    self.options = null;
    self.type = null;
  }
}

module.exports = RabbitExchangeHandler;