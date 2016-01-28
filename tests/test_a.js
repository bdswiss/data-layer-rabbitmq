const RabbitHandler = require('../index.js');

var myQueue = {
  ID: 'my-queue',
  OPTIONS: {
    durable: false,
    autoDelete: true,
    exclusive: true
  }
};

var config = {};

var rmq = new RabbitHandler(config);
rmq.on(RabbitHandler.EVENTS.CONNECTED, function(){
  rmq.consumeQueue({
    QUEUE: myQueue
  }).then(function(){
    setTimeout(function(){
      rmq.queues[myQueue.ID].channel.deleteQueue(myQueue.ID).then(function(){
        console.log('SHOULD BE DELETED');
      });
    }, 5000);
  });
});