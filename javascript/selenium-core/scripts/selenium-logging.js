/*
 * Copyright 2011 Software Freedom Conservancy
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
};

Logger.prototype = {

    logLevels: {
        debug: 0,
        info: 1,
        warn: 2,
        error: 3,
        off: 999
    },

    pendingMessages: new Array(),
    
    threshold: "info",

    setLogLevelThreshold: function(logLevel) {
        this.threshold = logLevel;
        var logWindow = this.getLogWindow();
        if (logWindow && logWindow.setThresholdLevel) {
            logWindow.setThresholdLevel(logLevel);
        }
        // NOTE: log messages will be discarded until the log window is
        // fully loaded.
    },

    getLogWindow: function() {
        if (this.logWindow && this.logWindow.closed) {
            this.logWindow = null;
        }
        return this.logWindow;
    },
    
    openLogWindow: function() {
        this.logWindow = window.open(
            getDocumentBase(document) + "SeleniumLog.html?startingThreshold="+this.threshold, "SeleniumLog",
            "width=600,height=1000,bottom=0,right=0,status,scrollbars,resizable"
        );
        this.logWindow.moveTo(window.screenX + 1210, window.screenY + window.outerHeight - 1400);
        if (browserVersion.appearsToBeBrokenInitialIE6) {
	// I would really prefer for the message to immediately appear in the log window, the instant the user requests that the log window be 
        	// visible.  But when I initially coded it this way, thou message simply didn't appear unless I stepped through the code with a debugger.  
        	// So obviously there is some timing issue here which I don't have the patience to figure out.
        	var pendingMessage = new LogMessage("warn", "You appear to be running an unpatched IE 6, which is not stable and can crash due to memory problems.  We recommend you run Windows update to install a more stable version of IE.");
            this.pendingMessages.push(pendingMessage);
        }
        return this.logWindow;
    },
    
    show: function() {
        if (! this.getLogWindow()) {
            this.openLogWindow();
        }
        setTimeout(function(){LOG.error("Log window displayed.  Logging events will now be recorded to this window.");}, 500);
    },

    logHook: function(logLevel, message) {
    },

    log: function(logLevel, message) {
        if (this.logLevels[logLevel] < this.logLevels[this.threshold]) {
            return;
        }
        this.logHook(logLevel, message);
        var logWindow = this.getLogWindow();

        try {
          if (Components && Components.classes["@mozilla.org/consoleservice;1"]) {
            var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
              .getService(Components.interfaces["nsIConsoleService"]);

            consoleService.logStringMessage(logLevel + "("+(new Date().getTime())+"): " + message);
          }
        } catch (ignored) {}

        if (logWindow) {
            if (logWindow.append) {
                if (logWindow.disabled) {
                    logWindow.callBack = fnBind(this.setLogLevelThreshold, this);
                    logWindow.enableButtons();
                }
                if (this.pendingMessages.length > 0) {
                    logWindow.append("info("+(new Date().getTime())+"): Appending missed logging messages", "info");
                    while (this.pendingMessages.length > 0) {
                        var msg = this.pendingMessages.shift();
                        logWindow.append(msg.type + "("+msg.timestamp+"): " + msg.msg, msg.type);
                    }
                    logWindow.append("info("+(new Date().getTime())+"): Done appending missed logging messages", "info");
                }
                logWindow.append(logLevel + "("+(new Date().getTime())+"): " + message, logLevel);
            }
        } else {
            // TODO these logging messages are never flushed, which creates 
            //   an enormous array of strings that never stops growing.
            //   there should at least be a way to clear the messages!
            this.pendingMessages.push(new LogMessage(logLevel, message));
        }
    },

    close: function(message) {
        if (this.logWindow != null) {
            try {
                this.logWindow.close();
            } catch (e) {
                // swallow exception
                // the window is probably closed if we get an exception here
            }
            this.logWindow = null;
        }
    },

    debug: function(message) {
       this.log("debug", message);
    },

    info: function(message) {
       this.log("info", message);
    },

    warn: function(message) {
       this.log("warn", message);
    },

    error: function(message) {
       this.log("error", message);
    },

    exception: function(exception) {
        this.error("Unexpected Exception: " + extractExceptionMessage(exception));
        this.error("Exception details: " + describe(exception, ', '));
    }

};

var LOG = new Logger();

var LogMessage = function(type, msg) {
    this.type = type;
    this.msg = msg;
    this.timestamp = (new Date().getTime());
};
