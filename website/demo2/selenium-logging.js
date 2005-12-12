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

var Logger = function() {
    this.logWindow = null;
}
Logger.prototype = {

    getLogWindow: function() {
        if (this.logWindow && this.logWindow.closed) {
            this.logWindow = null;
        }
        return this.logWindow;
    },
    
    openLogWindow: function() {
        this.logWindow = window.open(
            "SeleniumLog.html", "SeleniumLog",
            "width=600,height=250,bottom=0,right=0,status,scrollbars,resizable"
        );
        return this.logWindow;
    },
    
    show: function() {
        if (! this.getLogWindow()) {
            this.openLogWindow();
        }
    },

    log: function(message, className) {
        var logWindow = this.getLogWindow();
        if (logWindow) {
            if (logWindow.append) {
                logWindow.append(message, className);
            }
        }
    },

    debug: function(message) {
        this.log(message, "debug");
    },

    info: function(message) {
        this.log(message, "info");
    },

    warn: function(message) {
        this.log(message, "warn");
    },

    error: function(message) {
        this.log(message, "error");
    },

    exception: function(exception) {
        var msg = "Unexpected Exception: " + describe(exception, ', ');
        this.error(msg);
    }

};

var LOG = new Logger();

function noop() {};

var DummyLogger = function() {};
DummyLogger.prototype = {
    show: noop,
    log: noop,
    debug: noop,
    info: noop,
    warn: noop,
    error: noop
};

