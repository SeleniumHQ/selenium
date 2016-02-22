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

function PageBotAccessorTest(name) {
    TestCase.call(this,name);
}

PageBotAccessorTest.prototype = new TestCase();
PageBotAccessorTest.prototype.setUp = function() {
    this.testWindow = windowMaker();
    var element = function(id, type) {
        this.id = id;
        this.type = type;
    }
    var elements = {
        a: [new element("myLink"), new element("myOtherLink"), new element("yetAnotherLink")]
        ,input: [
            new element("theTextbox", "text")
            ,new element("theOtherTextbox", "text")
            ,new element("theButton", "button")
            ,new element("theSubmit", "submit")
        ]
    }
    this.testWindow.document.getElementsByTagName = function(tagName) {
        return elements[tagName];
    }
        
    this.pageBot = BrowserBot.createForWindow(this.testWindow);
}

PageBotAccessorTest.prototype.testGetButtonsReturnsBothButtons = function() {
    var result = this.pageBot.getAllButtons();
    this.assertArrayEquals(["theButton","theSubmit"], result);
}

PageBotAccessorTest.prototype.testGetLinksReturnsLinks = function() {
    var result = this.pageBot.getAllLinks();
    this.assertArrayEquals(["myLink","myOtherLink","yetAnotherLink"], result);
}

PageBotAccessorTest.prototype.testGetFieldsReturnsFields = function() {
    var result = this.pageBot.getAllFields();
    this.assertArrayEquals(["theTextbox","theOtherTextbox"], result);
}

PageBotAccessorTest.prototype.assertArrayEquals = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertEquals(arr1[i], arr2[i]);
    }
}