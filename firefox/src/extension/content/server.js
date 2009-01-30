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

var driver = false;

window.addEventListener("load", function(e) {
    handle = Components.classes["@googlecode.com/webdriver/fxdriver;1"].createInstance(Components.interfaces.nsISupports);
    var server = handle.wrappedJSObject;

    if (!driver) {
        driver = server.newDriver(window);
    } else {
        if (window.content)
            var frames = window.content.frames;

        // If we are already focused on a frame, try and stay focused
        if (driver.context.frameId !== undefined && frames) {
            if (frames && frames.length > driver.context.frameId) {
                // do nothing
            } else {
                if (frames && frames.length && "FRAME" == frames[0].frameElement.tagName) {
                    if (!frames[driver.context.frameId]) {
                        driver.context.frameId = 0;
                    }
                } else {
                    driver.context.frameId = undefined;
                }

            }
        } else {
            // Other use a sensible default
            if (frames && frames.length && "FRAME" == frames[0].frameElement.tagName) {
                if (!frames[driver.context.frameId]) {
                    driver.context.frameId = 0;
                }
            } else {
                driver.context.frameId = undefined;
            }
        }
    }
    
    server.startListening();

}, true);

//window.addEventListener("focus", function(e) {
//    var active = e.originalTarget;
//    var doc = gBrowser.selectedBrowser.contentDocument;
//    if (active.ownerDocument == doc) {
//        driver.activeElement = active;
//    }
//}, true);
