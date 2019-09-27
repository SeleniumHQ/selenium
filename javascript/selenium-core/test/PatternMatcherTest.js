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

