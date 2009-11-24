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
