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

Mock = function() {
    this.expectedInvocations = {};
    this.expectedArgs = {};
    this.returnValues = {};
    this.attrs = [];
    this.expectedProperties = {};
    
    this.expects = function() {
        functionName = arguments[0];
        this.expectedArgs[functionName] = [];
        for(i = 1; i < arguments.length; i++) {
            this.expectedArgs[functionName][i-1] = arguments[i];
        }
        javascriptCode = "this." + functionName + " = function() {\n" +
            "  // mark this function as \"executed\"\n" +
            "  this.expectedInvocations[\"" + functionName + "\"] = true;\n" +
            "  assertEquals(\"" + functionName + ": Wrong number of arguments.\", " + this.expectedArgs[functionName].length + ", arguments.length);\n" +
            "  for(i = 0; i < arguments.length; i++) {\n" +
            "    assertEquals(this.expectedArgs[\"" + functionName + "\"][i], arguments[i]);\n" +
            "  };\n" +
            "  var returnValue = this.returnValues[\"" + functionName + "\"];\n" +
            "  if (returnValue && returnValue.isMockError) { throw returnValue };\n" +
            "  return returnValue;\n" +
            "}";
        eval(javascriptCode);
        // initially mark this function as "not yet executed"
        this.expectedInvocations[functionName] = false;
        this.attrs[this.attrs.length] = "dummy";
        return new Returner(this, functionName);
    }
    
    this.expectsProperty = function() {
        var propertyName = arguments[0];
        if(arguments.length == 2) {
            expectedPropertyValue = arguments[1]
            this.expectedProperties[propertyName] = expectedPropertyValue;
            this.attrs[this.attrs.length] = "dummy";
        } else {
            return new PropertySetter(this, propertyName)
        }
    }

    this.verify = function() {
        // loop over all expected invocations and see if they were called
        for(var functionName in this.expectedInvocations) {
            var wasCalled = this.expectedInvocations[functionName];
            if(!wasCalled) {
                fail("Expected function not called:" + functionName);
            }
        }
        var currentAttrs = []
        var currentAttrCount = 0;
        
        // verify that all expected properties are set
//        for(var attr in this) {
//            currentAttrs[currentAttrCount] = attr;
//            currentAttrCount++;
//        }
//        if(this.attrs.length < currentAttrCount) {
//            unexpectedAttr = currentAttrs[this.attrs.length]
//            fail("Unexpected property was set: " + unexpectedAttr + "=" + eval("this." + unexpectedAttr))
//        }
        
        // verify that all expected properties are set with the right value
//        for(var attr in this.expectedProperties) {
//            if(this.expectedProperties[attr] != eval("this." + attr)) {
//                fail("Expected property was not set: " + attr + "=" + this.expectedProperties[attr])
//            }
//        }
    }

    var attrCount = 0;
    for(var attr in this) {
        this.attrs[attrCount] = attr;
        attrCount++;
    }
}

Returner = function(mock, functionName) {
    this.mock = mock;
    this.functionName = functionName;
}

Returner.prototype.returns = function(returnValue) {
    this.mock.returnValues[this.functionName] = returnValue;
}

Returner.prototype.andThrows = function(message) {
    var error = new Error(message);
    error.isMockError = true;
    this.mock.returnValues[this.functionName] = error;
}

PropertySetter = function(mock, propertyName) {
    this.mock = mock;
    this.propertyName = propertyName;
}

PropertySetter.prototype.returns = function(returnValue) {
    var ref = new Object();
    ref.value = returnValue;
    eval("this.mock." + this.propertyName + "=ref.value");
}
