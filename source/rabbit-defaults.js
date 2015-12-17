'use strict';

module.exports = {
  HANDLER_STATES: {
    UNINITIALIZED: 'uninitialized',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected'
  },
  RECONNECT_OPTIONS: {
    RANDOMIZATION: 0,
    INIT_DELAY: 100,
    MAX_DELAY: 3*60*1000
  },
  MESSAGE_OPTIONS: {
    persistent: true
  }
};