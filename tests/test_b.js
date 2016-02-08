const RabbitHandler = require('../index.js');

var myQueue = {
  ID: 'moufa-queue',
  OPTIONS: {
    durable: true,
    autoDelete: false,
    exclusive: false
  }
};

var config = {};

var rmq = new RabbitHandler(config);
rmq.on(RabbitHandler.EVENTS.CONNECTED, function(){
  //Test cancel consume and then start consuming again
  rmq.consumeQueue({
    QUEUE: myQueue
  }).then(function(){
    console.log('STARTED CONSUMING');
    setTimeout(function(){
      rmq.queues[myQueue.ID].cancelConsume().then(function(){
        console.log('STOPED CONSUMING');
        setTimeout(function(){
          rmq.consumeQueue({
            QUEUE: myQueue
          }).then(function(){
            console.log('CONSUMING AGAIN');
          });
        }, 5000);
      });
    }, 5000);
  });

  //Test multiple consume attempt
  // rmq.consumeQueue({
  //   QUEUE: myQueue
  // }).then(function(){
  //   console.log('11111');
  //   rmq.consumeQueue({
  //     QUEUE: myQueue
  //   }).then(function(){
  //     console.log('22222');
  //   }).catch(function(){
  //     console.log('ERROR');
  //   });
  // });
});