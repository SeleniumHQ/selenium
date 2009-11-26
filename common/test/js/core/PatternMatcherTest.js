function PatternMatcherTest(name) {
    TestCase.call(this,name);
}

PatternMatcherTest.prototype = new TestCase();

PatternMatcherTest.prototype.testRegexpFromGlob = function() {
    var regexpFromGlob = PatternMatcher.regexpFromGlob;
    this.assertEquals("^(.|[\r\n])*$", regexpFromGlob("*"));
    this.assertEquals("^(.|[\r\n])$", regexpFromGlob("?"));
    this.assertEquals("^a(.|[\r\n])*b$", regexpFromGlob("a*b"));
    this.assertEquals("^\\.\\|\\^\\$\\(\\)\\[\\]\\{\\}$", regexpFromGlob(".|^$()[]{}"));
    this.assertEquals("^(.|[\r\n])*/foo/bar(.|[\r\n])*$", regexpFromGlob("*/foo/bar*"));
}

PatternMatcherTest.prototype.testCanMatchUsingGlob = function() {
    this.assertTrue(new PatternMatcher("glob:a*e").matches("apple"));
    this.assertFalse(new PatternMatcher("glob:a*z").matches("apple"));
}

PatternMatcherTest.prototype.testMatchUsingGlobByDefault = function() {
    this.assertTrue(new PatternMatcher("a*e").matches("apple"));
    this.assertFalse(new PatternMatcher("a*z").matches("apple"));
}

PatternMatcherTest.prototype.testCanMatchUsingRegexp = function() {
    this.assertTrue(new PatternMatcher("regexp:pp").matches("apple"));
    this.assertFalse(new PatternMatcher("regexp:^pp").matches("apple"));
    this.assertTrue(new PatternMatcher("regexp:[a-z]$").matches("apple"));
}

PatternMatcherTest.prototype.testCanDoExactMatch = function() {
    this.assertTrue(new PatternMatcher("exact:abc").matches("abc"));
    this.assertFalse(new PatternMatcher("exact:a*c").matches("abc"));
    this.assertTrue(new PatternMatcher("exact:a*c").matches("a*c"));
}

