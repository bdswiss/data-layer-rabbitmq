#Publisher - Consumer Example
In this simple example a publisher and a consumer are created. In this example all messages are durable and persistent.

##RabbitMQ Architecture
A fanout exchange and a durable queue are created and then are binded together using the empty string (it is a good practice to define the architecture in both the consumer and the producer).

##Consumer
The consumer just consumes the queue and acknowledges or rejects the messages.

##Publisher
The producer publishes a message to the exchange when he is connected to the RabbitMQ. He can also act if the message reaches or not the RabbitMQ