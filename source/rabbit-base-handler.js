'use strict';

class RabbitBaseHandler{
	constructor(rmq, config){
		this.rmq = rmq;
		this.connection = config.connection;
		this.channel = config.channel;
	}

	*init(){
		const self = this;
		yield self.checkChannel();
	}

	*checkChannel(){
		const self = this;
		if(!self.channel){
			self.channel = yield self.connection.createConfirmChannel();
		}
	}

	destroy(){
		const self = this;
		self.rmq = null;
		self.connection = null;
		self.channel = null;
	}
}

module.exports = RabbitBaseHandler;