// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

function BrowserBotFrameFinderTest(name) {
    TestCase.call(this,name);
}

BrowserBotFrameFinderTest.prototype = new TestCase();

BrowserBotFrameFinderTest.prototype.setUp = function() {
    var window = windowMaker();
    browserbot = BrowserBot.createForWindow(window);
    window.document.getElementById = function(id) {
        if (id == "testIframe-name") {
            return {
                id:"testIframe-name"
                ,contentWindow: {
                    name:"testIframe-name"
                }
                ,getAttribute: function(attr) {
                    if ("id" == attr) return this.id;
                }
            }
        }
    };
}
BrowserBotFrameFinderTest.prototype.testShouldAbleToGetFirstLevelFrameAccordingNameGiven = function(){
    var frame = browserbot._getFrameFromGlobal("testIframe-name");
    this.assertEquals("testIframe-name", frame.name)
}
