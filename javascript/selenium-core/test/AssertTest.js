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

function AssertTest(name) {
    TestCase.call(this,name);
}

AssertTest.prototype = new TestCase();

AssertTest.prototype.testAssertEqalsDoesntThrowExceptionWhenMatches = function() {
	Assert.equals("foo", "foo");
}

AssertTest.prototype.testAssertEqualsThrowsExceptionWhenNotMatches = function() {
	try {
		Assert.equals("foo", "fox");
	}
	catch (e) {		
		this.assertEquals("Expected 'foo' but was 'fox'", e.failureMessage);
		return;
	}
	this.fail("Should have thrown exception");
}

AssertTest.prototype.testAssertEqualsCanIncludeAComment = function() {
	try {
		Assert.equals("testComment", "foo", "fox");
	}
	catch (e) {		
		this.assertEquals("testComment; Expected 'foo' but was 'fox'", e.failureMessage);
		return;
	}
	this.fail("Should have thrown exception");
}

AssertTest.prototype.testAssertMatchesDoesntThrowExceptionWhenMatches = function() {
	Assert.matches("regexp:fo[aeiou]", "foo");
}

AssertTest.prototype.testAssertMatchesThrowsExceptionWhenNotMatches = function() {
	try {
		Assert.matches("regexp:fo[aei]", "foo");
	}
	catch (e) {		
		this.assertEquals("Actual value 'foo' did not match 'regexp:fo[aei]'", e.failureMessage);
		return;
	}
	this.fail("Should have thrown exception");
}

AssertTest.prototype.testPatternMatchesCanIncludeComment = function() {
	try {
		Assert.matches("TestComment", "regexp:fo[aei]", "foo");
		this.assertEquals("TestComment; Actual value 'foo' did not match 'regexp:fo[aei]'", e.failureMessage);
	}
	catch (e) {
		return;
	}
	this.fail("Should have thrown exception");
}

AssertTest.prototype.testAssertNotMatchesDoesntThrowExceptionWhenNotMatches = function() {
	Assert.notMatches("regexp:fo[aeiou]", "fox");
}

AssertTest.prototype.testAssertNotMatchesThrowsExceptionWhenMatches = function() {
	try {
		Assert.notMatches("regexp:fo[aeix]", "fox");
	}
	catch (e) {
		this.assertEquals("Actual value 'fox' did match 'regexp:fo[aeix]'", e.failureMessage);
		return;
	}
	this.fail("Should have thrown exception");
}

AssertTest.prototype.testAssertNotMatchesCanIncludeComment = function() {
	try {
		Assert.notMatches("TestComment", "regexp:fo[aeix]", "fox");
	}
	catch (e) {
		this.assertEquals("TestComment; Actual value 'fox' did match 'regexp:fo[aeix]'", e.failureMessage);
		return;
	}
	this.fail("Should have thrown exception");
}
