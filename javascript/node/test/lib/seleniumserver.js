// Copyright 2013 Selenium committers
// Copyright 2013 Software Freedom Conservancy
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require('./_bootstrap')(module);

var util = require('util'),
    promise = require('selenium-webdriver').promise,
    RemoteServer = require('selenium-webdriver/remote').SeleniumServer;

var build = require('./build'),
    inproject = require('./inproject');


var SERVER_JAR_PATH =
    'build/java/server/src/org/openqa/grid/selenium/selenium-standalone.jar';


function buildServer() {
  if (process.env.SKIP_BUILD) {
    return promise.resolved();
  }
  return build.of('selenium-server-standalone').onlyOnce().go();
}


/**
 * Manages the life and death of a Selenium server built in the current client.
 * @constructor
 * @extends {RemoteServer}
 */
function Server() {
  RemoteServer.call(this, {
    jar: SERVER_JAR_PATH,
    port: 0
  });
}
util.inherits(Server, RemoteServer);


/** @override */
Server.prototype.start = function(opt_timeout) {
  var self = this;
  return buildServer().then(function() {
    return RemoteServer.prototype.start.call(self, opt_timeout);
  });
};


// PUBLIC API


exports.Server = Server;
