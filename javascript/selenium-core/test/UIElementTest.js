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

function UIElementTest(name) {
    TestCase.call(this,name);
}

UIElementTest.prototype = new TestCase();

UIElementTest.prototype.test_UIElement_validate = function() {
    var uiElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , xpath: '//a'
    });

    // happy path 1
    uiElement.validate({ name: 'name', description: 'desc', xpath: '//a' });

    // happy path 2
    uiElement.validate({ name: 'name', description: 'desc',
        getLocator: function(args) { return '//a'; } });

    // destructive: no name
    try {
        uiElement.validate({ description: 'desc', xpath: '//a' });
        this.fail('Expected UIElementException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIElementException', e.name);
    }

    // destructive: no description
    try {
        uiElement.validate({ name: 'name', xpath: '//a' });
        this.fail('Expected UIElementException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIElementException', e.name);
    }

    // destructive: no xpath
    try {
        uiElement.validate({ name: 'name', description: 'desc' });
        this.fail('Expected UIElementException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIElementException', e.name);
    }
}



UIElementTest.prototype.test_UIElement_init = function() {
    // name, description, args, getLocator, testcases, getDefaultLocators
    var uiElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , xpath: '//a'
    });

    // happy path 1
    uiElement.init({ name: 'name', description: 'desc', xpath: '//a' });
    this.assertEquals('name', uiElement.name);
    this.assertEquals('desc', uiElement.description);
    this.assertTrue(are_equal([], uiElement.args));
    this.assertEquals('//a', uiElement.getLocator());
    this.assertTrue(are_equal([], uiElement.getTestcases()));
    this.assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));

    // happy path 2
    uiElement.init({ name: 'name', description: 'desc',
        getLocator: function() { return '//a'; } });
    this.assertEquals('name', uiElement.name);
    this.assertEquals('desc', uiElement.description);
    this.assertTrue(are_equal([], uiElement.args));
    this.assertEquals('//a', uiElement.getLocator());
    this.assertTrue(are_equal([], uiElement.getTestcases()));
    this.assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));

    // happy path 3
    uiElement.init({ name: 'name', description: 'desc', args: [],
        xpath: '//a', testcase1: { args: {},
        xhtml: '<a expected-result="1" />' } });
    this.assertEquals('name', uiElement.name);
    this.assertEquals('desc', uiElement.description);
    this.assertTrue(are_equal([], uiElement.args));
    this.assertEquals('//a', uiElement.getLocator());
    this.assertTrue(are_equal([ { name: 'testcase1', args: {},
        xhtml: '<a expected-result="1" />' } ], uiElement.getTestcases()));
    this.assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));
}



UIElementTest.prototype.test_UIElement_permuteArgs = function() {
    var testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: [
            {
                name: 'arg1',
                description: 'desc1',
                getDefaultValues: function(inDocument) {
                    if (inDocument != 'foo') {
                        throw new Exception('document was not propagated!');
                    }
                    return [4, 'g', '*'];
                }
            },
            {
                name: 'arg2',
                description: 'desc2',
                getDefaultValues: function(inDocument) {
                    if (inDocument != 'foo') {
                        throw new Exception('document was not propagated!');
                    }
                    return [];
                }
            },
            {
                name: 'arg3',
                description: 'desc3',
                defaultValues: ['%', 0, 'q']
            }
        ]
        , getLocator: function(args) { return '//a'; }
    });

    this.assertTrue(are_equal(
        [
            {arg1: '4', arg3: '%'},
            {arg1: '4', arg3: '0'},
            {arg1: '4', arg3: 'q'},
            {arg1: 'g', arg3: '%'},
            {arg1: 'g', arg3: '0'},
            {arg1: 'g', arg3: 'q'},
            {arg1: '*', arg3: '%'},
            {arg1: '*', arg3: '0'},
            {arg1: '*', arg3: 'q'}
        ],
        testUIElement.permuteArgs(testUIElement.args, 'foo'))
    );
}



UIElementTest.prototype.test_UIElement_permuteArgsRespectsRequiredArguments = function() {
    var testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: [
            {
                name: 'arg1',
                description: 'desc1',
                required: true,
                getDefaultValues: function() {
                    return [];
                }
            }
            , {
                name: 'arg3',
                description: 'desc3',
                required: false,
                defaultValues: ['%', 0, 'q']
            }
        ]
        , getLocator: function(args) { return '//a'; }
    });

    this.assertTrue(are_equal([], testUIElement.permuteArgs(testUIElement.args, 'foo')));
}



UIElementTest.prototype.test_UIElement_getTestcases = function() {
    var testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: []
        , getLocator: function(args) {
            return "//div[@id='content']";
        }
        , testcase1: {
            xhtml: '<div id="content" expected-result></div>'
        }
        , testcase2: {
            xhtml: '<div id="main"><div id="content" expected-result>'
                + '</div></div>'
        }
    });

    var output = testUIElement.getTestcases();
    this.assertArrayEqualsIgnoreOrder(['testcase1','testcase2'], [output[0].name, output[1].name]);
    this.assertArrayEqualsIgnoreOrder(['<div id="content" expected-result></div>','<div id="main"><div id="content" expected-result></div></div>'], [output[0].xhtml, output[1].xhtml]);
}


// DGF this test doesn't work in jsunit/rhino without a DOMPar
UIElementTest.prototype.DISABLEDtest_UIElement_test = function() {
    var testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: []
        , getLocator: function(args) {
            return "//div[@id='content']";
        }
        , testcase1: {
            xhtml: '<div id="content" expected-result="1"></div>'
        }
        , testcase2: {
            xhtml: '<div id="main"><div id="content" expected-result="1">'
                + '</div></div>'
        }
    });
    this.assertTrue(testUIElement.test());

    // more complicated
    testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: [
            {
                name: 'index'
                , description: 'the index'
                , defaultValues: []
            }
        ]
        , getLocator: function(args) {
            return "//div[@id='section" + args['index'] + "']";
        }
        , testcase1: {
            args: { index: 1 }
            , xhtml: '<div id="section1" expected-result="1"></div>'
        }
        , testcase2: {
            args: { index: 42 }
            , xhtml: '<div id="section1"><div id="section42" expected-result="1">'
                + '</div></div>'
        }
    });
    this.assertTrue(testUIElement.test());

    // destructive
    testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: [
            {
                name: 'index'
                , description: 'the index'
                , defaultValues: []
            }
        ]
        , getLocator: function(args) {
            return "//div[@id='section" + args['index'] + "']";
        }
        , testcase1: {
            args: { index: 1 }
            , xhtml: '<div id="section4" expected-result="1"></div>'
        }
    });
    this.assertFalse(testUIElement.test());
}


UIElementTest.prototype.test_UIElement_initDefaultXPaths = function() {
    var testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: [
            {
                name: 'arg1',
                description: 'desc1',
                defaultValues: [4, 'g', '*']
            },
            {
                name: 'arg2',
                description: 'desc2',
                defaultValues: []
            },
            {
                name: 'arg3',
                description: 'desc3',
                defaultValues: ['%', 0, 'q']
            }
        ]
        , getLocator: function(args) {
            return "//div[@id='" + args['arg1'] + "']/" +
                (args['arg2'] ? args['arg2'] : 'span') +
                "[@class='" + args['arg3'] + "']/a";
        }
    });
    this.assertTrue(are_equal(
        {
            "//div[@id='4']/span[@class='%']/a": {arg1: '4', arg3: '%'},
            "//div[@id='4']/span[@class='0']/a": {arg1: '4', arg3: '0'},
            "//div[@id='4']/span[@class='q']/a": {arg1: '4', arg3: 'q'},
            "//div[@id='g']/span[@class='%']/a": {arg1: 'g', arg3: '%'},
            "//div[@id='g']/span[@class='0']/a": {arg1: 'g', arg3: '0'},
            "//div[@id='g']/span[@class='q']/a": {arg1: 'g', arg3: 'q'},
            "//div[@id='*']/span[@class='%']/a": {arg1: '*', arg3: '%'},
            "//div[@id='*']/span[@class='0']/a": {arg1: '*', arg3: '0'},
            "//div[@id='*']/span[@class='q']/a": {arg1: '*', arg3: 'q'}
        },
        testUIElement.getDefaultLocators())
    );

    testUIElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , args: []
        , getLocator: function(args) { return "//div[@id='content']"; }
    });
    this.assertTrue(are_equal(
        {
            "//div[@id='content']": {}
        },
        testUIElement.getDefaultLocators())
    );
}



UIElementTest.prototype.test_UIArgument_validate = function() {
    var uiArgument = new UIArgument({ name: 'name'
        , description: 'desc'
        , defaultValues: [1, 2]
    });

    // happy path 1
    uiArgument.validate({ name: 'name'
        , description: 'desc'
        , defaultValues: [1, 2]
    });

    // happy path 2
    uiArgument.validate({ name: 'name'
        , description: 'desc'
        , getDefaultValues: function() { return [1, 2]; }
    });

    // destructive: no name
    try {
        uiArgument.validate({ description: 'desc', defaultValues: [1, 2] });
        this.fail('Expected UIArgumentException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIArgumentException', e.name);
    }

    // destructive: no description
    try {
        uiArgument.validate({ name: 'name', defaultValues: [1, 2] });
        this.fail('Expected UIArgumentException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIArgumentException', e.name);
    }

    // destructive: no default values
    try {
        uiArgument.validate({ name: 'name', description: 'desc' });
        this.fail('Expected UIArgumentException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('UIArgumentException', e.name);
    }
}


UIElementTest.prototype.test_UIArgument_init = function() {
    var uiArgument = new UIArgument({ name: 'name'
        , description: 'desc'
        , defaultValues: []
    });
    var localVars = { _foo: 'bar' };

    // happy path 1: specifying defaultValues
    uiArgument.init({ name: 'name', description: 'desc', defaultValues: [1, 2]},
        localVars);
    this.assertEquals('name', uiArgument.name);
    this.assertEquals('desc', uiArgument.description);
    this.assertEquals(false, uiArgument.required);
    this.assertTrue(are_equal([1, 2], uiArgument.getDefaultValues()));
    this.assertEquals('bar', uiArgument._foo);

    // happy path 2: specifying getDefaultValues()
    uiArgument.init({ name: 'name', description: 'desc',
        getDefaultValues: function() { return [1, 2]; } }, localVars);
    this.assertEquals('name', uiArgument.name);
    this.assertEquals('desc', uiArgument.description);
    this.assertTrue(are_equal([1, 2], uiArgument.getDefaultValues()));
    this.assertEquals('bar', uiArgument._foo);
}



// test the UISpecifier constructor. In particular, make sure that the
// components of the UI specifier are created correctly: path, elementName,
// and args. The string can be tested in the tests for UISpecifier methods.
UIElementTest.prototype.test_UISpecifier = function() {
    // construct from a UI specifier string
    var testUISpecifier =
        new UISpecifier('pagesetName::elementName(k1=v1, k2=v2)');
    this.assertEquals('pagesetName', testUISpecifier.pagesetName);
    this.assertEquals('elementName', testUISpecifier.elementName);
    this.assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));

    // construct from components
    testUISpecifier = new UISpecifier('pagesetName', 'elementName',
        {k1: 'v1', k2: 'v2'});
    this.assertEquals('pagesetName', testUISpecifier.pagesetName);
    this.assertEquals('elementName', testUISpecifier.elementName);
    this.assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));
}



UIElementTest.prototype.test_UISpecifier__initFromUISpecifierString = function() {
    var testUISpecifier = new UISpecifier('pagesetName::elementName()');
    this.assertEquals('pagesetName', testUISpecifier.pagesetName);
    this.assertEquals('elementName', testUISpecifier.elementName);
    this.assertTrue(are_equal({}, testUISpecifier.args));

    testUISpecifier._initFromUISpecifierString('pagesetName::elementName(k1=v1, k2=v2)');
    this.assertEquals('pagesetName', testUISpecifier.pagesetName);
    this.assertEquals('elementName', testUISpecifier.elementName);
    this.assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));

    testUISpecifier._initFromUISpecifierString('complex:. pagesetName  ::# elementName:*@  ( k1 = v1 ,  k  2=v2   )');
    this.assertEquals('complex:. pagesetName  ', testUISpecifier.pagesetName);
    this.assertEquals('# elementName:*@  ', testUISpecifier.elementName);
    this.assertTrue(are_equal({k1: 'v1', 'k  2': 'v2'}, testUISpecifier.args));

    testUISpecifier._initFromUISpecifierString('a::b(k1=v1())');
    this.assertTrue(are_equal({k1: 'v1()'}, testUISpecifier.args));

    // destructive
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::()');
        this.fail('Expected UISpecifierException, but none was thrown: missing element name');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('elementName()');
        this.fail('Expected UISpecifierException, but none was thrown: missing pageset name');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::elementName');
        this.fail('Expected UISpecifierException, but none was thrown: missing arguments');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::elementName(k1=v1, k2=v2');
        this.fail('Expected UISpecifierException, but none was thrown: missing close parenthesis for arguments');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
}



UIElementTest.prototype.test_UISpecifier_toString = function() {
    var testUISpecifier = new UISpecifier('pagesetName::elementName()');

    // round-tripping the unique test_UISpecifier__initFromUISpecifierString() cases
    var inputs = [
        {pagesetName: 'pagesetName', elementName: 'elementName', args: {}},
        {pagesetName: 'pagesetName', elementName: 'elementName', args: {k1: 'v1', k2: 'v2'}},
        {pagesetName: 'complex:. pagesetName  ', elementName: '# elementName:*@  ', args: {k1: 'v1', 'k  2': 'v2'}}
    ];

    for (var i = 0; i < inputs.length; ++i) {
        testUISpecifier.pagesetName = inputs[i].pagesetName;
        testUISpecifier.elementName = inputs[i].elementName;
        testUISpecifier.args = inputs[i].args;
        var testUISpecifier2 = new UISpecifier(testUISpecifier.toString());
        this.assertEquals(inputs[i].pagesetName, testUISpecifier2.pagesetName);
        this.assertEquals(inputs[i].elementName, testUISpecifier2.elementName);
        this.assertTrue(are_equal(inputs[i].args, testUISpecifier2.args));
    }

    // destructive
    try {
        testUISpecifier.pagesetName = undefined;
        testUISpecifier.elementName = 'elementName';
        testUISpecifier.args = {};
        testUISpecifier.toString();
        this.fail('Expected exception but none was thrown: undefined pageset name');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier.pagesetName = 'pagesetName';
        testUISpecifier.elementName = '';
        testUISpecifier.args = {};
        testUISpecifier.toString();
        this.fail('Expected exception but none was thrown: empty element name');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier.pagesetName = 'pagesetName';
        testUISpecifier.elementName = 'elementName';
        testUISpecifier.args = null;
        testUISpecifier.toString();
        this.fail('Expected exception but none was thrown: empty arguments array');
    }
    catch (e) {
        this.assertEquals('UISpecifierException', e.name);
    }
}



UIElementTest.prototype.test_Pageset_init = function() {
    var pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , paths: [ 'foo' ]
    });

    // happy path 1
    pageset.init({
        name: 'name'
        , description: 'desc'
        , pathPrefix: 'foo/'
        , paths: [ 'bar', 'baz', 'shizzle.py' ]
    });
    this.assertEquals('name', pageset.name);
    this.assertEquals('desc', pageset.description);
    this.assertEquals('^foo\\/(?:bar|baz|shizzle\\.py)$', pageset.pathRegexp.source);
    this.assertTrue(are_equal({}, pageset.paramRegexps));

    // happy path 2
    pageset.init({
        name: 'name'
        , description: 'desc'
        , pathPrefix: 'no.way.'
        , pathRegexp: 'to.e'
        , paramRegexps: { id: 'wallabee', type: '(?:medium|large)' }
    });
    this.assertEquals('name', pageset.name);
    this.assertEquals('desc', pageset.description);
    this.assertEquals('^no\\.way\\.(?:to.e)$', pageset.pathRegexp.source);
    this.assertEquals('wallabee', pageset.paramRegexps.id.source);
    this.assertEquals('(?:medium|large)', pageset.paramRegexps.type.source);

    // happy path: paths only
    pageset.init({
        name: 'name'
        , description: 'desc'
        , paths: [ 'just.html', 'do.html', 'it.html' ]
    });
    this.assertEquals('name', pageset.name);
    this.assertEquals('desc', pageset.description);
    this.assertEquals('^(?:just\\.html|do\\.html|it\\.html)$',
        pageset.pathRegexp.source);

    // happy path: pathRegexp only
    pageset.init({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.+\\.rb'
    });
    this.assertEquals('name', pageset.name);
    this.assertEquals('desc', pageset.description);
    this.assertEquals('^(?:.+\\.rb)$', pageset.pathRegexp.source);

    // omitting both paths and pathRegexp isn't allowed now, but we might allow
    // it in the future
    try {
        pageset.init({
            name: 'name'
            , description: 'desc'
            , pathPrefix: 'helloWorld'
        });
        this.fail('PagesetException expected but not thrown');
    }
    catch (e) {
        this.assertEquals('PagesetException', e.name);
    }
}



UIElementTest.prototype.test_Pageset_contains = function() {
    var pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.*(?:foo|bar).*'
    });
    var mockDoc = { location: {} };
    mockDoc.location.href = 'http://w3.org/food';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/beach/sandbar.php';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://foo.org/baz.html';
    this.assertFalse(pageset.contains(mockDoc));

    pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.*(?:foo|bar).*'
        , paramRegexps: { 'baz': 'yea' }
    });
    mockDoc.location.href = 'http://w3.org/food?baz=hellyeah';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/beach/sandbar.php?lang=zh_CN&baz=yeahbuddy';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/fool';
    this.assertFalse(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/bar.mitzvah?baz=hag'
    this.assertFalse(pageset.contains(mockDoc));

    pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathPrefix: 'prefix/'
        , paths: [ 'onepath', 'twopath' ]
    });
    mockDoc.location.href = 'http://w3.org/prefix/onepath';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/onepath';
    this.assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/';
    this.assertFalse(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/foo';
    this.assertFalse(pageset.contains(mockDoc));

}



UIElementTest.prototype.test_Pageset_validate = function() {
    // no name
    try {
        new Pageset({ description: 'desc', paths: [ 'foo' ] });
        this.fail('Expected PagesetException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('PagesetException', e.name);
    }

    // no description
    try {
        new Pageset({ name: 'name', paths: [ 'foo' ] });
        this.fail('Expected PagesetException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('PagesetException', e.name);
    }

    // no paths, pathRegexp, or pageContent
    try {
        new Pageset({ name: 'name', description: 'desc' });
        this.fail('Expected PagesetException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('PagesetException', e.name);
    }

    // happy paths
    new Pageset({ name: 'name', description: 'desc', paths: [ 'foo' ] });
    new Pageset({ name: 'name', description: 'desc', pathRegexp: 'bar' });
    new Pageset({ name: 'name', description: 'desc', pageContent: function() { return true; } });
}



UIElementTest.prototype.test_UIMap_getUIElementsByUrl = function() {
    var myMap = new UIMap(true);

    this.assertTrue(myMap.addPageset({
        name: 'ishPages'
        , description: 'pages whose URLs end with "ish"'
        , pathRegexp: '.*ish'
    }));
    this.assertTrue(myMap.addElement('ishPages', {
        name: 'someElement'
        , description: 'some real element'
        , args: []
        , getLocator: function(args) { return "//input"; }
    }));

    // it's ugly, but it give us coverage! Test "this" in the getDefaultValues()
    // and getLocator() methods.
    this.assertTrue(myMap.addPageset({
        name: 'discPages'
        , description: 'pages whose URLs start with "disc"'
        , pathRegexp: 'disc.*'
    }));
    this.assertTrue(myMap.addElement('discPages', {
        name: 'anElement'
        , description: 'a real element'
        , args: [
            {
                name: 'name'
                , description: 'desc'
                , getDefaultValues: function() { return keys(this._map); }
            }
        ]
        , getLocator: function(args) {
            var name = this._map[args['name']];
            return "//div[@id='" + name + "']";
        }
        , _map: {
            foo: 'bar'
            , baz: 'hep'
        }
    }));
    var uiElement = myMap.getUIElement('discPages', 'anElement');
    this.assertArrayEqualsIgnoreOrder(['foo', 'baz'], uiElement.args[0].getDefaultValues());
    this.assertEquals("//div[@id='hep']", uiElement.getLocator({name: 'baz'}));

    // test forthcoming ...
}



UIElementTest.prototype.test_CommandMatcher_validate = function() {
    // no target
    try {
        new CommandMatcher({ command: 'command' });
        this.fail('Expected CommandMatcherException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('CommandMatcherException', e.name);
    }

    // no command
    try {
        new CommandMatcher({ target: 'target' });
        this.fail('Expected CommandMatcherException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('CommandMatcherException', e.name);
    }

    // minMatches > maxMatches
    try {
        new CommandMatcher({
            command: 'command'
            , target: 'target'
            , minMatches: 5
            , maxMatches: 1
        });
        this.fail('Expected CommandMatcherException, but none was thrown');
    }
    catch (e) {
        this.assertEquals('CommandMatcherException', e.name);
    }

    // happy path
    new CommandMatcher({ command: 'command', target: 'target' });
}

UIElementTest.prototype.test_CommandMatcher_init = function() {
    var f = function() { };

    // happy path, all elements
    var cm = new CommandMatcher({
        command: 'command'
        , target: 'target'
        , value: 'value'
        , minMatches: 1
        , maxMatches: 5
        , updateArgs: f
    });
    this.assertEquals('command', cm.command);
    this.assertEquals('target', cm.target);
    this.assertEquals('value', cm.value);
    this.assertEquals(1, cm.minMatches);
    this.assertEquals(5, cm.maxMatches);
    this.assertEquals(f, cm.updateArgs);

    // leave out all non-required fields
    cm = new CommandMatcher({ command: 'command', target: 'target' });
    this.assertEquals('command', cm.command);
    this.assertEquals('target', cm.target);
    this.assertNull(cm.value);
    this.assertEquals(1, cm.minMatches);
    this.assertEquals(1, cm.maxMatches);
    this.assertNotUndefined(cm.updateArgs);
}

UIElementTest.prototype.test_CommandMatcher_match = function() {
    // test matching on command, target, and value using regular expressions.
    // Assert on the arguments object being updated correctly.
    var cm = new CommandMatcher({
        command: 'click.*'
        , target: 'ui=allPages::.+'
        , value: '\\d{4}'
    });

    // happy path
    var command = {
        command: 'clickAndWait'
        , target: 'ui=allPages::help()'
        , value: '2085'
    };
    this.assertTrue(cm.isMatch(command));

    // sad path 1: failed command
    command.command = 'type';
    this.assertFalse(cm.isMatch(command));

    // sad path 2: failed target
    command.command = 'click';
    command.target = 'password';
    this.assertFalse(cm.isMatch(command));

    // sad path 3: failed value
    command.target = 'ui=allPages::faq()';
    command.value = 'asdf';
    this.assertFalse(cm.isMatch(command));
}



UIElementTest.prototype.test_RollupRule_getRollup = function() {
    var rule = new RollupRule({
        name: 'name'
        , description: 'desc'
        , commandMatchers: [
            {
                command: 'cmd1'
                , target: 'tar\\d'
            }
            , {
                command: 'cmd2'
                , target: '[Tt]ar2'
                , value: '\\$.*'
            }
        ]
        , expandedCommands: []
    });

    // exact match
    var commands = [
        new Command('cmd1', 'tar1', '')
        , new Command('cmd2', 'Tar2', '$5')
    ];
    var result = rule.getRollup(commands);
    this.assertEquals('rollup', result.command);
    this.assertEquals('name', result.target);
    this.assertEquals('', result.value);
    this.assertTrue(are_equal([ 0, 1 ], result.replacementIndexes));

    // now we set maxMatches, and have multiple matches for the first
    // CommandMatcher
    rule.commandMatchers[0].maxMatches = 5;
    rule.commandMatchers[0].updateArgs = function(command, args) {
        if (args.count) {
            ++args.count;
        }
        else {
            args.count = 1;
        }
        return args;
    };
    commands.unshift(new Command('cmd1', 'tar0'));
    commands.unshift(new Command('cmd1', 'tar9'));
    result = rule.getRollup(commands);
    this.assertTrue(are_equal({ count: '3' }, parse_kwargs(result.value)));
    this.assertTrue(are_equal([ 0, 1, 2, 3 ], result.replacementIndexes));

    // now we add non-matching commands after
    commands.push(new Command('cmd1', 'target'));
    commands.push(new Command('cmd2', 'tar2', 'dro$$'));
    result = rule.getRollup(commands);
    this.assertTrue(are_equal({ count: '3' }, parse_kwargs(result.value)));
    this.assertTrue(are_equal([ 0, 1, 2, 3 ], result.replacementIndexes));

    // now we set minMatches. The first test should fail to match.
    rule.commandMatchers[1].minMatches = 2;
    rule.commandMatchers[1].maxMatches = 5;
    rule.commandMatchers[1].updateArgs = function(command, args) {
        if (args.count2) {
            ++args.count2;
        }
        else {
            args.count2 = 1;
        }
        return args;
    };
    result = rule.getRollup(commands);
    this.assertFalse(result);

    // this test uses commands that satisfy the minMatches.
    commands.splice(4, 0, new Command('cmd2', 'tar2', '$_'));
    result = rule.getRollup(commands);
    this.assertTrue(are_equal({ count: '3', count2: '2' },
        parse_kwargs(result.value)));
    this.assertTrue(are_equal([ 0, 1, 2, 3, 4 ], result.replacementIndexes));

    // test the alternate command replacement
    rule = new RollupRule({
        name: 'btnK'
        , description: 'desc'
        , alternateCommand: 'clickAndWait'
        , commandMatchers: [
            {
                command: 'click'
                , target: 'btnK'
            }
        ]
        , expandedCommands: []
    });
    commands = [ new Command('click', 'btnK') ];
    result = rule.getRollup(commands);
    this.assertEquals('clickAndWait', result.command);
    this.assertEquals('btnK', result.target);
}

UIElementTest.prototype.assertArrayEqualsIgnoreOrder = function(arr1, arr2) {
    this.assertEquals(arr1.length, arr2.length);
    for (var i = 0; i < arr1.length; i++) {
        this.assertArrayContains(arr2, arr1[i]);
    }
}

UIElementTest.prototype.assertArrayContains = function(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == val) return;
    }
    this.fail(val);
}
