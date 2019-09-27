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

function HtmlUtilTest(name) {
    TestCase.call(this,name);
}

HtmlUtilTest.prototype = new TestCase();
HtmlUtilTest.prototype.setUp = function() {
    element1 = {id:"id1", parentNode:{}};
    window.setTimeout = function (func, time) {
        func.call();
    }
}

HtmlUtilTest.prototype.testFlashEffectShouldHighlightElementBackgroundColorThenChangeItBack = function() {
    var previousColor = "#000000";
    var highlightColor = "yellow";
    var colorsChanged = [];
    elementGetStyle = function(element, styleAttribut) {
        return previousColor;
    }
    elementSetStyle = function(element, style) {
        colorsChanged.push(style["backgroundColor"]);
    };
    
    highlight(element1);

    this.assertArrayEquals([highlightColor, previousColor], colorsChanged);
}

HtmlUtilTest.prototype.testgetKeyCodeFromKeySequenceShouldReturnCorrectAsciiCodeOfInputKeySequence = function() {
    this.assertEquals(119, getKeyCodeFromKeySequence("w"));
    this.assertEquals(119, getKeyCodeFromKeySequence("\\119"));
    this.assertEquals(92, getKeyCodeFromKeySequence("\\"));
    this.assertEquals(92, getKeyCodeFromKeySequence("\\92"));
    this.assertEquals(55, getKeyCodeFromKeySequence("7"));
    this.assertEquals(55, getKeyCodeFromKeySequence("\\55"));
}

HtmlUtilTest.prototype.testgetKeyCodeFromKeySequenceShouldBackwardCompatibleFor2Or3DigitAsciiCodes = function() {
    this.assertEquals(119, getKeyCodeFromKeySequence("119"));
    this.assertEquals(92, getKeyCodeFromKeySequence("92"));
    this.assertEquals(55, getKeyCodeFromKeySequence("55"));
}

HtmlUtilTest.prototype.testgetKeyCodeFromKeySequenceShouldFailOnIncorrectInput = function() {
    this.checkKeySequence("");
    this.checkKeySequence("\\a");
    this.checkKeySequence("\\1234");
    this.checkKeySequence("ab");
}

HtmlUtilTest.prototype.testAbsolutify = function() {
    this.assertEquals("http://x/blah", absolutify("http://x/blah", "http://y"));
    
    this.assertEquals("http://y/blah", absolutify("blah", "http://y"));
    
    this.assertEquals("http://y/blah", absolutify("blah", "http://y/foo"));
    this.assertEquals("http://y/foo/blah", absolutify("blah", "http://y/foo/"));
    
    this.assertEquals("http://y/foo/blah", absolutify("blah", "http://y/foo/?bar=1"));
    this.assertEquals("http://y/foo/blah", absolutify("blah", "http://y/foo/?bar=1#baz=2"));
    this.assertEquals("http://y/foo/blah", absolutify("blah", "http://y/foo/#baz=2"));
    
    // windows file urls
    this.assertEquals("file:///c:/foo/blah", absolutify("blah", "c:\\foo\\"));
    this.assertEquals("file:///c:/blah", absolutify("blah", "c:\\foo"));
    this.assertEquals("file:///blah", absolutify("/blah", "c:\\foo\\bar"));
    
}


HtmlUtilTest.prototype.testParseAndReassembleUrl = function() {
    var tests = [
        "http://www.google.com"
        ,"file://localhost/c:/blah"
        ,"file:///c:/blah"
        ,"http://www.google.com/"
        ,"http://www.google.com/foo"
        ,"http://www.google.com/foo?blah=blah/blah"
        ,"http://www.google.com/foo?blah=blah/blah#barbar"
        ,"http://www.google.com/foo#bur?blah"
        ,"http://foo:bar@www.google.com"
        ,"http://foo@www.google.com"
        ,"http://foo:ba%20r@www.google.com"
    ];
    for (var i = 0; i < tests.length; i++) {
        this.assertEquals(tests[i], reassembleLocation(parseUrl(tests[i])));
    }
}

HtmlUtilTest.prototype.checkKeySequence = function(input) {
    try {
        getKeyCodeFromKeySequence(input);
        this.fail("exception expected");
    } catch (e) {
        this.assertTrue(e.isSeleniumError);
        this.assertEquals("invalid keySequence", e.message);
    }
}

HtmlUtilTest.prototype.testString_quoteForXPath = function() {
    this.assertEquals('\'foo\'', 'foo'.quoteForXPath());
    this.assertEquals('\'13" TV\'', '13" TV'.quoteForXPath());
    this.assertEquals("\"'chief' and 'best'\"",
        "'chief' and 'best'".quoteForXPath());
    // the string to quote is '"'foo"'
    this.assertEquals('concat("\'", \'"\', "\'foo", \'"\', "\'")',
        '\'"\'foo"\''.quoteForXPath());
}
        
// assert on absolute equality for simple literals, but content equality only
// for complex values; the object references should be different. Functions
// are copied by reference only (not a true copy).
HtmlUtilTest.prototype.test_clone = function()
{
    var orig, copy;
    orig = 2;
    this.assertEquals(orig, clone(orig));
    orig = 'dolly';
    this.assertEquals(orig, clone(orig));
    
    orig = [2, 6, 0, -439, 10539];
    copy = clone(orig);
    this.assertNotSame(orig, copy);
    this.assertTrue(are_equal(orig, copy));
    orig = {a: 1, b: 'man', 'cd': ['minty', 'fresh'], e: {'taste': [3, 2, 1]}};
    copy = clone(orig);
    this.assertNotSame(orig, copy);
    this.assertTrue(are_equal(orig, copy));
    orig = {};
    copy = clone(orig);
    this.assertNotSame(orig, copy);
    this.assertTrue(are_equal(orig, copy));
    
    orig = function(x) { return x * x; };
    copy = clone(orig);
    this.assertEquals(orig, copy);
}

HtmlUtilTest.prototype.test_keys = function()
{
    var dict = {
        'doe': 'a deer',
        1: 'female deer',
        '_ray': [1, 'drop of golden sun']
    };
    this.assertArrayEqualsIgnoreOrder(['doe', '1', '_ray'], keys(dict));
    this.assertTrue(are_equal([], keys({})));
}

HtmlUtilTest.prototype.test_range = function()
{
    this.assertTrue(are_equal([0, 1, 2, 3, 4]     , range( 5)));
    this.assertTrue(are_equal([0, -1, -2, -3, -4] , range(-5)));
    this.assertTrue(are_equal([0, 1, 2, 3, 4]     , range( 0,  5)));
    this.assertTrue(are_equal([5, 4, 3, 2, 1]     , range( 5,  0)));
    this.assertTrue(are_equal([2, 3, 4]           , range( 2,  5)));
    this.assertTrue(are_equal([]                  , range( 2,  2)));
    this.assertTrue(are_equal([5, 4, 3]           , range( 5,  2)));
    this.assertTrue(are_equal([0, -1, -2, -3, -4] , range( 0, -5)));
    this.assertTrue(are_equal([-5, -4, -3, -2, -1], range(-5,  0)));
    this.assertTrue(are_equal([-2, -3, -4]        , range(-2, -5)));
    this.assertTrue(are_equal([]                  , range(-2, -2)));
    this.assertTrue(are_equal([-5, -4, -3]        , range(-5, -2)));
    this.assertTrue(are_equal([2, 1, 0, -1]       , range( 2, -2)));
    this.assertTrue(are_equal([-2, -1, 0, 1]      , range(-2,  2)));
}

HtmlUtilTest.prototype.test_parse_kwargs = function()
{
    this.assertTrue(are_equal({k1: 'v1'}, parse_kwargs('k1=v1')));
    this.assertTrue(are_equal({k1: 'v1', k2: 'v2'}, parse_kwargs('k1=v1, k2=v2')));
    this.assertTrue(are_equal({k1: 'v 1', 'k  2': 'v    2'}, parse_kwargs('  k1  =  v 1  ,   k  2   =v    2  ')));
    this.assertTrue(are_equal({k1: 'v1=v1.1', k2: 'v2=v2.2'}, parse_kwargs('k1=v1=v1.1, k2=v2=v2.2')));
    this.assertTrue(are_equal({k1: 'v1, v1.1', k2: 'v2'}, parse_kwargs('k1=v1, v1.1, k2=v2')));
    
    // destructive - should be handled gracefully
    this.assertTrue(are_equal({k1: 'v1,,'}, parse_kwargs('k1=v1,,')));
    this.assertTrue(are_equal({k1: ''}, parse_kwargs('k1=')));
    this.assertTrue(are_equal({k1: ','}, parse_kwargs('k1=,')));
    this.assertTrue(are_equal({k2: 'v2'}, parse_kwargs(',k2=v2')));
    this.assertTrue(are_equal({'': ''}, parse_kwargs('=')));
    this.assertTrue(are_equal({}, parse_kwargs(',')));
}

HtmlUtilTest.prototype.test_to_kwargs = function()
{
    // round-tripping the unique test_parse_kwargs() cases
    var inputs = [
        {k1: 'v1'},
        {k1: 'v1', k2: 'v2'},
        {k1: 'v 1', 'k  2': 'v    2'},
        {k1: 'v1=v1.1', k2: 'v2=v2.2'},
        {k1: ''},
        {'': ''},
        {}
    ];
    for (var i = 0; i < inputs.length; ++i) {
        this.assertTrue(are_equal(inputs[i], parse_kwargs(to_kwargs(inputs[i]))));
    }
    
    // test the default sorting
    var kwargs1 = {aleph: 'foo', booster: 'kick', tamarind: 42, z: '5'};
    var kwargs2 = {z: '5', aleph: 'foo', tamarind: 42, booster: 'kick'};
    this.assertTrue(are_equal(to_kwargs(kwargs1), to_kwargs(kwargs2)));
    
    // test the explicit sorting
    var argsOrder = [ 'tamarind', 'booster', 'aleph', 'z' ];
    var re = /tamarind.+booster.+aleph.+z/;
    this.assertTrue(re.test(to_kwargs(kwargs1, argsOrder)));
    
    // test the case where an argument in the sort list is missing
    delete(kwargs1['booster']);
    re = /tamarind.+aleph.+z/;
    var result = to_kwargs(kwargs1, argsOrder);
    this.assertTrue(re.test(result));
    this.assertTrue(result.indexOf('booster') == -1);
}


HtmlUtilTest.prototype.assertArrayEquals = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertEquals(arr1[i], arr2[i]);
    }
}

HtmlUtilTest.prototype.assertArrayEqualsIgnoreOrder = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertArrayContains(arr2, arr1[i]);
    }
}

HtmlUtilTest.prototype.assertArrayContains = function(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) return;
    }
    this.fail(val);
}