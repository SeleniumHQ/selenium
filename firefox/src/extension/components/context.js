/*
 Copyright 2007-2009 WebDriver committers
 Copyright 2007-2009 Google Inc.
 Portions copyright 2007 ThoughtWorks, Inc

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

function Context(windowId, frameId) {
  this.windowId = windowId;

  if (typeof frameId == 'number' || (typeof frameId == 'string' && frameId)) {
    this.frameId = frameId;
  }
}


Context.fromString = function(text) {
  var bits = text.split(" ");
  return new Context(bits[0], bits[1]);
};


Context.prototype.toString = function() {
  return this.windowId + " " +
         (this.frameId !== undefined ? this.frameId.toString() : "");
};
