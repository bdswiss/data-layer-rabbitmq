#!/bin/bash
echo 'CONNECTIONS';
rabbitmqctl list_connections;
echo 'CHANNELS name transactional confirm consumer_count messages_unacknowledged messages_uncommitted acks_uncommitted messages_unconfirmed';
rabbitmqctl list_channels name transactional confirm consumer_count messages_unacknowledged messages_uncommitted acks_uncommitted messages_unconfirmed;
echo 'VHOSTS';
rabbitmqctl list_vhosts name tracing;
echo 'QUEUES name durable auto_delete messages messages_ready messages_unacknowledged messages_persistent';
rabbitmqctl list_queues name durable auto_delete messages messages_ready messages_unacknowledged messages_persistent;
echo 'EXCHANGES name type durable auto_delete';
rabbitmqctl list_exchanges name type durable auto_delete;
echo 'BINDINGS source_name source_kind destination_name destination_kind routing_key';
rabbitmqctl list_bindings source_name source_kind destination_name destination_kind routing_key;