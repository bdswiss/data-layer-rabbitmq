'use strict';

const _ = require('underscore');
const messageDefaults = require('./rabbit-defaults').MESSAGE_OPTIONS;
const EVENT = require('../constants').EVENTS;

module.exports = {
  getMessageOptions: function(options){
    options = options ? options : {};

    _.defaults(options, messageDefaults);

    return options;
  },
  confirmationCallback: function(err){
    let self = this;
    if(err !== null){
      self.rmq.emit(EVENT.MESSAGE_DELIVERY_ERROR, self.message);
    }else{
      self.rmq.emit(EVENT.MESSAGE_DELIVERED, self.message);
    }
  }
};