/*
 * Copyright 2015 Samit Badle
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * A dispatcher that accepts data and queues and posts it to a server
 */
function Dispatcher(queuePath, server) {
  this.server = server;
  this.queuePath = queuePath;
}


Dispatcher.prototype.setServer = function(server) {
  this.server = server;
};


Dispatcher.prototype.send = function(data) {
  return HTTP.post(this.server, data);
  // TODO convert and persist in queue
  // TODO setup background process to handle failures
};

