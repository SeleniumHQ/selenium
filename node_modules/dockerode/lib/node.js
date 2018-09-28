var util = require('./util');

/**
 * Represents an Node
 * @param {Object} modem docker-modem
 * @param {String} id    Node's ID
 */
var Node = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Node.prototype[require('util').inspect.custom] = function() { return this; };

/**
 * Query Docker for Node details.
 *
 * @param {object} options
 * @param {function} callback
 */
Node.prototype.inspect = function(callback) {
  var self = this;

  var optsf = {
    path: '/nodes/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    }
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Update a node.
 *
 * @param {object} options
 * @param {function} callback
 */
Node.prototype.update = function(opts, callback) {
  var self = this;
  if (!callback && typeof opts === 'function') {
    callback = opts;
  }

  var optsf = {
    path: '/nodes/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such node',
      406: 'node is not part of a swarm',
      500: 'server error'
    },
    options: opts
  };

  if(callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        self.output = data;
        resolve(self);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};


/**
 * Remove a Node.
 * Warning: This method is not documented in the API.
 *
 * @param {object} options
 * @param {function} callback
 */
Node.prototype.remove = function(opts, callback) {
  var self = this;
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/nodes/' + this.id + '?',
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    },
    options: args.opts
  };

  if(args.callback === undefined) {
    return new this.modem.Promise(function(resolve, reject) {
      self.modem.dial(optsf, function(err, data) {
        if (err) {
          return reject(err);
        }
        resolve(data);
      });
    });
  } else {
    this.modem.dial(optsf, function(err, data) {
      args.callback(err, data);
    });
  }
};


module.exports = Node;
