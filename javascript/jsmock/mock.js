// A simple mock library for Javascript
//
// Original code by Aslak Hellesoy and Ji Wang

Mock = function() {
    this.expectedInvocations = {};
    this.expectedArgs = {};
    this.returnValues = {};
}

Mock.prototype.expects = function() {
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
     "  return this.returnValues[\"" + functionName + "\"];\n" +
     "}";
   eval(javascriptCode);
   // initially mark this function as "not yet executed"
   this.expectedInvocations[functionName] = false;
   return new Returner(this, functionName);
}

Mock.prototype.verify = function() {
    // loop over all expected invocations and see if they were called
    for(var functionName in this.expectedInvocations) {
       var wasCalled = this.expectedInvocations[functionName];
       if(!wasCalled) {
           fail("Expected function not called:" + functionName);
       }
    }
}

Returner = function(mock, functionName) {
    this.mock = mock;
    this.functionName = functionName;
}

Returner.prototype.returns = function(returnValue) {
    this.mock.returnValues[this.functionName] = returnValue;
}
