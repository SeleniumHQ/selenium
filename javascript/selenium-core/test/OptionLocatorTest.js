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

function OptionLocatorTest(name) {
    TestCase.call(this,name);
}

OptionLocatorTest.prototype = new TestCase();
OptionLocatorTest.prototype.setUp = function() {
    this.mockSelect = {};
    this.mockSelect.options = [{text: "Option Zero", value: "option0"},
                          {text: "Option One",  value: "option1"},
                          {text: "Option Two",  value: "option2"},
                          {text: "",  value: ""}];
    this.mockSelect.selectedIndex = 1;
    this.optionLocatorFactory = new OptionLocatorFactory();
}

OptionLocatorTest.prototype.testSample = function() {
    this.assertTrue(true);
}



OptionLocatorTest.prototype.testSelectByIndexSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("index=2");
    var option = locator.findOption(this.mockSelect);
    this.assertEquals("option2", option.value);
}

OptionLocatorTest.prototype.testSelectByIndexOutOfBounds = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("index=" + this.mockSelect.options.length);
    this.assertCallFails("Should not be able to find an option out of bounds",
                    function() {locator.findOption(this.mockSelect);});
}

OptionLocatorTest.prototype.testSelectByLabelSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("label=Opt*Two");
    var option = locator.findOption(this.mockSelect);
    this.assertEquals("option2", option.value);
}

OptionLocatorTest.prototype.testSelectByLabelFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("label=nosuchlabel");
    this.assertCallFails(
        "Should not be able to find an option with label of 'nosuchlabel'",
        function() {locator.findOption(this.mockSelect);});
}

OptionLocatorTest.prototype.testSelectByValueSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("value=opt*2");
    var option = locator.findOption(this.mockSelect);
    this.assertEquals("option2", option.value);
}

OptionLocatorTest.prototype.testSelectByValueFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("value=nosuchvalue");
    this.assertCallFails(
        "Should not be able to find an option with label of 'nosuchvalue'",
        function() {locator.findOption(this.mockSelect);});
}

OptionLocatorTest.prototype.testIsSelectedByLabelSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("label=Option One");
    locator.assertSelected(this.mockSelect);
}

OptionLocatorTest.prototype.testIsSelectedByLabelFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("label=O*ion Two");
    try {
    	locator.assertSelected(this.mockSelect);
		this.fail();
    }
    catch (e){}
}

OptionLocatorTest.prototype.testIsSelectedByValueSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("value=opt*n1");
    locator.assertSelected(this.mockSelect);
}

OptionLocatorTest.prototype.testIsSelectedByValueFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("value=option2");
    try {
    	locator.assertSelected(this.mockSelect);
		this.fail();
    }
    catch (e){}
}

OptionLocatorTest.prototype.testIsSelectedByIndexSuccess = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("index=1");
    locator.assertSelected(this.mockSelect);
}

OptionLocatorTest.prototype.testIsSelectedByIndexFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("index=2");
    try {
    	locator.assertSelected(this.mockSelect);
		this.fail();
    }
    catch (e){}
}

OptionLocatorTest.prototype.testIsSelectedByEmptyLabelSuccess = function() {
    this.mockSelect.selectedIndex = 3;
    var locator = this.optionLocatorFactory.fromLocatorString("label=");
    locator.assertSelected(this.mockSelect);
}

OptionLocatorTest.prototype.testIsSelectedByEmptyLabelFailure = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("label=");
    try {
    	locator.assertSelected(this.mockSelect);
		this.fail();
    }
    catch (e){}
}

OptionLocatorTest.prototype.testIsSelectedWithIndexOutOfBounds = function() {
    var locator = this.optionLocatorFactory.fromLocatorString("index=" + this.mockSelect.options.length);
    try {
    	locator.assertSelected(this.mockSelect);
		this.fail();
    }
    catch (e){}
}

OptionLocatorTest.prototype.testOptionLocatorWithBadLocatorType = function() {
    var self = this;
    this.assertCallFails(
        "Should not be able to create a locator with an unkown type",
        function() {self.optionLocatorFactory.fromLocatorString("badtype=foo");});
}

OptionLocatorTest.prototype.testOptionLocatorWithBadIndex = function() {
    var self = this;
    this.assertCallFails(
        "Should not be able to create a locator with a bad index.",
        function() {self.optionLocatorFactory.fromLocatorString("index=foo");});
}

OptionLocatorTest.prototype.testOptionLocatorWithNegativeIndex = function() {
    var self = this;
    this.assertCallFails(
        "Should not be able to create a locator with a bad index.",
        function() {self.optionLocatorFactory.fromLocatorString("index=-100");});
}

OptionLocatorTest.prototype.assertCallFails = function(message, theCall, expectedFailureMessage) {
    try {
        theCall();
    } catch (expected) {
        if (expectedFailureMessage) {
            this.assertEquals(expectedFailureMessage, e.failureMessage);
        }
        return;
    }
    this.fail(message);
}

OptionLocatorTest.prototype.assertAssertionFails = function(message, theCall, expectedFailureMessage) {
    try {
        theCall();
    } catch (e) {
        if (!e.isAssertionFailedError) {
            throw e;
        }
        if (expectedFailureMessage) {
            this.assertEquals(expectedFailureMessage, e.failureMessage);
        }
        return;
    }
    this.fail(message);
}
