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

function CommandHandlerTest(name) {
    TestCase.call(this,name);
}

CommandHandlerTest.prototype = new TestCase();
CommandHandlerTest.prototype.setUp = function() {
}

CommandHandlerTest.prototype.testActionCommandsShouldCheckForUnhandledPopups = function() {

     var mockSelenium = new Mock();
     mockSelenium.expects("ensureNoUnhandledPopups");

     var noop = function() {};
     var handler = new ActionHandler(noop, false);
     handler.execute(mockSelenium, "command");

     mockSelenium.verify();
}


CommandHandlerTest.prototype.testAccessorHandlerShouldReturnResultInCommandResult = function() {
        function MockSelenium() {
     }

        var executorCalled = false;
        var executor = function() { executorCalled = true; return "foo"; };
        var handler = new AccessorHandler(executor, false);

        result = handler.execute(new MockSelenium(), "command");

        this.assertTrue(executorCalled);
        this.assertEquals("foo", result.result);
}
