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

// A simple mock library for Javascript
//
// Original code by Aslak Hellesoy and Ji Wang

var Mock = function() {
    this.expectedMethodInvocations = [];
    this.attrs = [];
    this.expectedProperties = {};

    var attrCount = 0;
    for (var attr in this) {
        this.attrs[attrCount] = attr;
        attrCount++;
    }
};

Mock.prototype.expects = function() {
    var functionName = arguments[0];
    var expectedArgs = [];
    for (var i = 1; i < arguments.length; i++) {
        expectedArgs[i - 1] = arguments[i];
    }
    var methodInvocation = new MethodInvocation(functionName, expectedArgs);

    eval("if (!this." + functionName + ") { this." + functionName + " = this._executeMethod; }");

    this.expectedMethodInvocations.push(methodInvocation);
    this.attrs[this.attrs.length] = "dummy";
    return new Returner(methodInvocation);
};

Mock.prototype._executeMethod = function() {
    var methodInvocation = this.expectedMethodInvocations.shift();
    if (!methodInvocation) {
        fail("No more expected method invocations.")
    }
    assertEquals(methodInvocation.functionName + ": Wrong number of arguments.", methodInvocation.expectedArgs.length, arguments.length);
    for (var i = 0; i < arguments.length; i++) {
        assertEquals(methodInvocation.expectedArgs[i], arguments[i]);
    }
    var returnValue = methodInvocation.returnValue;
    if (returnValue && returnValue.isMockError) {
        throw returnValue;
    }
    return returnValue;
};

Mock.prototype.expectsProperty = function() {
    var propertyName = arguments[0];
    if (arguments.length == 2) {
        var expectedPropertyValue = arguments[1];
        this.expectedProperties[propertyName] = expectedPropertyValue;
        this.attrs[this.attrs.length] = "dummy";
    } else {
        return new PropertySetter(this, propertyName);
    }
};

Mock.prototype.verify = function() {
    // loop over all expected invocations and see if they were called
    for (var i = 0; i < this.expectedMethodInvocations.length; i++) {
        var methodInvocation = this.expectedMethodInvocations[i];
        fail("Expected function not called:" + methodInvocation.functionName);
    }
};

var MethodInvocation = function(functionName, expectedArgs) {
    this.functionName = functionName;
    this.expectedArgs = expectedArgs;
    this.returnValue = undefined;
}

var Returner = function(methodInvocation) {
    this.methodInvocation = methodInvocation;
};

Returner.prototype.returns = function(returnValue) {
    this.methodInvocation.returnValue = returnValue;
};

Returner.prototype.andThrows = function(message) {
    var error = new Error(message);
    error.isMockError = true;
    this.methodInvocation.returnValue = error;
};

var PropertySetter = function(mock, propertyName) {
    this.mock = mock;
    this.propertyName = propertyName;
};

PropertySetter.prototype.returns = function(returnValue) {
    var ref = new Object();
    ref.value = returnValue;
    eval("this.mock." + this.propertyName + "=ref.value");
};
