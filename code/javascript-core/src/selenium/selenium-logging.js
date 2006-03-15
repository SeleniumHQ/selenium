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

    setLogLevelThreshold: function(logLevel) {
    	this.pendingLogLevelThreshold = logLevel;
        this.show();
        //
        // The following message does not show up in the log -- _unless_ I step along w/ the debugger
        // down to the append call.  I believe this is because the new log window has not yet loaded,
        // and therefore the log msg is discarded; but if I step through the debugger, this changes
        // the scheduling so as to load that window and make it ready.
        // this.info("Log level programmatically set to " + logLevel + " (presumably by driven-mode test code)");
    },

    getLogWindow: function() {
        if (this.logWindow && this.logWindow.closed) {
            this.logWindow = null;
        }
        if (this.logWindow && this.pendingLogLevelThreshold && this.logWindow.setThresholdLevel) {
            this.logWindow.setThresholdLevel(this.pendingLogLevelThreshold);
            
            // can't just directly log because that action would loop back to this code infinitely
            this.pendingInfoMessage = "Log level programmatically set to " + this.pendingLogLevelThreshold + " (presumably by driven-mode test code)";
            
            this.pendingLogLevelThreshold = null;	// let's only go this way one time
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
            	if (this.pendingInfoMessage) {
 		    logWindow.append(this.pendingInfoMessage, "info");
                    this.pendingInfoMessage = null;
                }
                logWindow.append(message, className);
            }
        }
    },

    close: function(message) {
    	if (this.logWindow != null) {
        	this.logWindow.close();
        	this.logWindow = null;
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

