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
 *
 */

function IFrameExecutionContext() {

    this.loadFrame = function() {
        return document.getElementById('myiframe');
    };

    this.open = function(target,frame) {
        frame.src = target;
    };

    this.getContentWindow = function(frame) {
        return frame.contentWindow;
    };

    this.waitForPageLoad = function(testloop,selenium) {
        // Since we're waiting for page to reload, we can't continue command execution
        // directly, we need use a page load listener.

        // TODO there is a potential race condition by attaching a load listener after
        // the command has completed execution.
        selenium.callOnNextPageLoad(function() {eval("testLoop.continueCommandExecutionWithDelay()");});
    };
}

function KonquerorIFrameExecutionContext() {

    this.loadFrame = function() {
        return document.getElementById('myiframe');
    };

    this.open = function(target, frame) {
        // Window doesn't fire onload event when setting src to the current value,
        // so we set it to blank first.
        frame.src = "about:blank";
        frame.src = target;
    };

    this.getContentWindow = function(frame) {
        return frames['myiframe'];
    };

    this.waitForPageLoad = function(testloop,selenium) {
        // Since we're waiting for page to reload, we can't continue command execution
        // directly, we need use a page load listener.

        // TODO there is a potential race condition by attaching a load listener after
        // the command has completed execution.
        selenium.callOnNextPageLoad(function() {eval("testLoop.continueCommandExecutionWithDelay()");});
    };
}

var windowExecutionContext;

function getWindowExecutionContext() {
    if (windowExecutionContext == null) {
        windowExecutionContext = new WindowExecutionContext();
    }
    return windowExecutionContext;
}

function WindowExecutionContext() {
    this.externalWindow = null;

    this.loadFrame = function() {
        var newWindow = window.open("about:blank", "_blank", "toolbar=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=1024,height=740,left=250,top=250");
        newWindow.opener = window.frame;
        this.externalWindow = newWindow;
        return this.externalWindow;
    };

    this.open = function(target,frame) {
        frame.location = target;
    };

    this.getContentWindow = function(frame) {
        return frame;
    };

    this.waitForPageLoad = function(testloop,selenium) {
        if(window.addEventListener) {
            selenium.callOnNextPageLoad(function() {eval("testLoop.continueCommandExecutionWithDelay();");});
        } else {
            if(this.externalWindow != null) {
                if(this.getValueWhenReady() != "complete" ) {
                    var localContext = this;
                    var localLoop = testloop;
                    var localSelenium = selenium;
                    window.setTimeout(function() {localContext.waitForPageLoad(localLoop, localSelenium); }, 100 );
                } else {
                    testloop.continueCommandExecutionWithDelay();
                }
            }
        }
    };

    // this function became necessary for IE in a NEW WINDOW. the document.readyState was not ready to be accessed.
    this.getValueWhenReady = function() {
        while (true) {
            try {
                return this.externalWindow.document.readyState;
            } catch (x) {
            }
        }
    };
}