/*
* Copyright 2004 ThoughtWorks, Inc
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License.
*/

var LEVEL_DEBUG = 0;
var LEVEL_INFO = 1;
var LEVEL_WARN = 2;
var LEVEL_ERROR = 3;

function Logger(logLevel) {
    this.level = logLevel;
    this.logConsole = document.getElementById('logging-console');
    this.logList = document.getElementById('log-list');
    this.hide();
}

Logger.prototype.show = function() {
   this.logConsole.style.display = "";
};

Logger.prototype.hide = function() {
   this.logConsole.style.display = "none";
};

Logger.prototype.clear = function() {
    while (this.logList.hasChildNodes()) {
        this.logList.removeChild(this.logList.firstChild);
    }
};

Logger.prototype.debug = function(message) {
    if (this.level <= LEVEL_DEBUG) {
        this.log(message, "debug");
    }
};

Logger.prototype.info = function(message) {
    if (this.level <= LEVEL_INFO) {
        this.log(message, "info");
    }
};

Logger.prototype.warn = function(message) {
    if (this.level <= LEVEL_WARN) {
        this.log(message, "warn");
    }
};

Logger.prototype.error = function(message) {
    if (this.level <= LEVEL_ERROR) {
        this.log(message, "error");
    }
};

Logger.prototype.log = function(message, className) {
    var loggingNode = document.createElement('li');
    loggingNode.className = className;
    loggingNode.appendChild(document.createTextNode(message));

    this.logList.appendChild(loggingNode);
    this.show();
};

function noop() {};

function DummyLogger() {
};

DummyLogger.prototype.show = noop;
DummyLogger.prototype.hide = noop;
DummyLogger.prototype.clear = noop;
DummyLogger.prototype.log = noop;
DummyLogger.prototype.debug = noop;
DummyLogger.prototype.info = noop;
DummyLogger.prototype.warn = noop;
DummyLogger.prototype.error = noop;