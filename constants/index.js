'use_strict';

module.exports = {
	EVENTS: {
		CONNECTED: 'amqp:state:connected',
    DISCONNECTED: 'amqp:state:disconnected',
    MESSAGE_ARRIVED: 'amqp:queue:message',
    MESSAGE_DELIVERED: 'amqp:message:confirmation-ack',
    MESSAGE_DELIVERY_ERROR: 'amqp:message:confirmation-nack'
	}
};