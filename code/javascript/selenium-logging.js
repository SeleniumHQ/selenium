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

var Logger = function(logLevel) {
    this.level = logLevel;
    this.logConsole = document.getElementById('logging-console');
    this.logList = document.getElementById('log-list');
    this.hide();
}
Logger.prototype = {

    show: function() {
        this.logConsole.style.display = "";
    },

    hide: function() {
        this.logConsole.style.display = "none";
    },

    clear: function() {
        while (this.logList.hasChildNodes()) {
            this.logList.removeChild(this.logList.firstChild);
        }
    },

    debug: function(message) {
        if (this.level <= LEVEL_DEBUG) {
            this.log(message, "debug");
        }
    },

    info: function(message) {
        if (this.level <= LEVEL_INFO) {
            this.log(message, "info");
        }
    },

    warn: function(message) {
        if (this.level <= LEVEL_WARN) {
            this.log(message, "warn");
        }
    },

    error: function(message) {
        if (this.level <= LEVEL_ERROR) {
            this.log(message, "error");
        }
    },

    exception: function(exception) {
        var msg = "Unexpected Exception: " + describe(exception, ', ');
        this.error(msg);
    },

    log: function(message, className) {
        var loggingNode = document.createElement('li');
        loggingNode.className = className;
        loggingNode.appendChild(document.createTextNode(message));
        
        this.logList.appendChild(loggingNode);
        this.show();
    }
    
};

function noop() {};

var DummyLogger = function() {};
DummyLogger.prototype = {
    show: noop,
    hide: noop,
    clear: noop,
    log: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
};

