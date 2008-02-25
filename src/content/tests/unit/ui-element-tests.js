function setUp() {
}



/**
 * Returns true if two arrays are identical, and false otherwise.
 *
 * @param a1  the first array, may only contain simple values (strings or
 *            numbers)
 * @param a2  the second array, same restricts on data as for a1
 * @return    true if the arrays are equivalent, false otherwise.
 */
function are_equal(a1, a2)
{
    if (typeof(a1) != typeof(a2))
        return false;
    
    switch(typeof(a1)) {
        case 'object':
            // arrays
            if (a1.length) {
                if (a1.length != a2.length)
                    return false;
                for (var i = 0; i < a1.length; ++i) {
                    if (!are_equal(a1[i], a2[i]))
                        return false
                }
            }
            // associative arrays
            else {
                var keys = {};
                for (var key in a1)   { keys[key] = true; }
                for (var key in a2)   { keys[key] = true; }
                for (var key in keys) { if (!are_equal(a1[key], a2[key])) return false; }
            }
            return true;
            
        default:
            return a1 == a2;
    }
}



function test_String_quoteForXPath()
{
    assertEquals('\'foo\'', 'foo'.quoteForXPath());
    assertEquals('\'13" TV\'', '13" TV'.quoteForXPath());
    assertEquals("\"'chief' and 'best'\"",
        "'chief' and 'best'".quoteForXPath());
    // the string to quote is '"'foo"'
    assertEquals('concat("\'", \'"\', "\'foo", \'"\', "\'")',
        '\'"\'foo"\''.quoteForXPath());
}



// assert on absolute equality for simple literals, but content equality only
// for complex values; the object references should be different. Functions
// are copied by reference only (not a true copy).
function test_clone()
{
    var orig, copy;
    orig = 2;
    assertEquals(orig, clone(orig));
    orig = 'dolly';
    assertEquals(orig, clone(orig));
    
    orig = [2, 6, 0, -439, 10539];
    copy = clone(orig);
    assertNotEquals(orig, copy);
    assertTrue(are_equal(orig, copy));
    orig = {a: 1, b: 'man', 'cd': ['minty', 'fresh'], e: {'taste': [3, 2, 1]}};
    copy = clone(orig);
    assertNotEquals(orig, copy);
    assertTrue(are_equal(orig, copy));
    orig = {};
    copy = clone(orig);
    assertNotEquals(orig, copy);
    assertTrue(are_equal(orig, copy));
    
    orig = function(x) { return x * x; };
    copy = clone(orig);
    assertEquals(orig, copy);
}



function test_keys()
{
    var dict = {
        'doe': 'a deer',
        1: 'female deer',
        '_ray': [1, 'drop of golden sun']
    };
    assertTrue(are_equal(['doe', '1', '_ray'], keys(dict)));
    assertTrue(are_equal([], keys({})));
}



function test_range()
{
    assertTrue(are_equal([0, 1, 2, 3, 4]     , range( 5)));
    assertTrue(are_equal([0, -1, -2, -3, -4] , range(-5)));
    assertTrue(are_equal([0, 1, 2, 3, 4]     , range( 0,  5)));
    assertTrue(are_equal([5, 4, 3, 2, 1]     , range( 5,  0)));
    assertTrue(are_equal([2, 3, 4]           , range( 2,  5)));
    assertTrue(are_equal([]                  , range( 2,  2)));
    assertTrue(are_equal([5, 4, 3]           , range( 5,  2)));
    assertTrue(are_equal([0, -1, -2, -3, -4] , range( 0, -5)));
    assertTrue(are_equal([-5, -4, -3, -2, -1], range(-5,  0)));
    assertTrue(are_equal([-2, -3, -4]        , range(-2, -5)));
    assertTrue(are_equal([]                  , range(-2, -2)));
    assertTrue(are_equal([-5, -4, -3]        , range(-5, -2)));
    assertTrue(are_equal([2, 1, 0, -1]       , range( 2, -2)));
    assertTrue(are_equal([-2, -1, 0, 1]      , range(-2,  2)));
}



function test_parse_kwargs()
{
    assertTrue(are_equal({k1: 'v1'}, parse_kwargs('k1=v1')));
    assertTrue(are_equal({k1: 'v1', k2: 'v2'}, parse_kwargs('k1=v1, k2=v2')));
    assertTrue(are_equal({k1: 'v 1', 'k  2': 'v    2'}, parse_kwargs('  k1  =  v 1  ,   k  2   =v    2  ')));
    assertTrue(are_equal({k1: 'v1=v1.1', k2: 'v2=v2.2'}, parse_kwargs('k1=v1=v1.1, k2=v2=v2.2')));
    assertTrue(are_equal({k1: 'v1, v1.1', k2: 'v2'}, parse_kwargs('k1=v1, v1.1, k2=v2')));
    
    // destructive - should be handled gracefully
    assertTrue(are_equal({k1: 'v1,,'}, parse_kwargs('k1=v1,,')));
    assertTrue(are_equal({k1: ''}, parse_kwargs('k1=')));
    assertTrue(are_equal({k1: ','}, parse_kwargs('k1=,')));
    assertTrue(are_equal({k2: 'v2'}, parse_kwargs(',k2=v2')));
    assertTrue(are_equal({'': ''}, parse_kwargs('=')));
    assertTrue(are_equal({}, parse_kwargs(',')));
}



function test_to_kwargs()
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
        assertTrue(are_equal(inputs[i], parse_kwargs(to_kwargs(inputs[i]))));
    }
    
    // test the default sorting
    var kwargs1 = {aleph: 'foo', booster: 'kick', tamarind: 42, z: '5'};
    var kwargs2 = {z: '5', aleph: 'foo', tamarind: 42, booster: 'kick'};
    assertTrue(are_equal(to_kwargs(kwargs1), to_kwargs(kwargs2)));
    
    // test the explicit sorting
    var argsOrder = [ 'tamarind', 'booster', 'aleph', 'z' ];
    var re = /tamarind.+booster.+aleph.+z/;
    assertTrue(re.test(to_kwargs(kwargs1, argsOrder)));
    
    // test the case where an argument in the sort list is missing
    delete(kwargs1['booster']);
    re = /tamarind.+aleph.+z/;
    var result = to_kwargs(kwargs1, argsOrder);
    assertTrue(re.test(result));
    assertTrue(result.indexOf('booster') == -1);
}



function test_parse_url()
{
    assertTrue(are_equal(
        {
            protocol: 'http',
            domain: 'www.alistapart.com',
            path: '',
            params: {}
        },
        parse_url('http://www.alistapart.com/'))
    );
    assertTrue(are_equal(
        {
            protocol: 'http',
            domain: 'www.alistapart.com',
            path: 'contact',
            params: {}
        },
        parse_url('http://www.alistapart.com/contact/'))
    );
    assertTrue(are_equal(
        {
            protocol: 'http',
            domain: 'www.alistapart.com',
            path: 'topics/userscience',
            params: {}
        },
        parse_url('http://www.alistapart.com/topics/userscience'))
    );
    assertTrue(are_equal(
        {
            protocol: 'http',
            domain: 'search.atomz.com',
            path: 'search',
            params: { 
                'sp-q': 'poobah',
                x: '0',
                y: '0',
                'sp-a': 'sp1002d27b',
                'sp-f': 'ISO-8859-1',
                'sp-p': 'All',
                'sp-k': 'All'
            }
        },
        parse_url('http://search.atomz.com/search/?sp-q=poobah&x=0&y=0&sp-a=sp1002d27b&sp-f=ISO-8859-1&sp-p=All&sp-k=All'))
    );
    // URL encoding (XSS example)
    assertTrue(are_equal(
        {
            protocol: 'http',
            domain: 'target',
            path: 'getdata.php',
            params: {
                data: '<script src="http://www.badplace.com/nasty.js"></script>'
            }
        },
        parse_url('http://target/getdata.php?data=%3cscript%20src=%22http%3a%2f%2fwww.badplace.com%2fnasty.js%22%3e%3c%2fscript%3e'))
    );
    // invalid URL
    try {
        parse_url('htp:///foo@bar.kom/baz');
        assertTrue(false);
    }
    catch(e) {
        assertEquals('ParseException', e.name);
    }
}



function test_UIElement_validate()
{
    var uiElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , xpath: '//a'
    });
    
    // happy path 1
    assertTrue(uiElement.validate({ name: 'name', description: 'desc',
        xpath: '//a' }));
    
    // happy path 2
    assertTrue(uiElement.validate({ name: 'name', description: 'desc',
        getLocator: function(args) { return '//a'; } }));
    
    // destructive: no name
    try {
        uiElement.validate({ description: 'desc', xpath: '//a' });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIElementException', e.name);
    }
    
    // destructive: no description
    try {
        uiElement.validate({ name: 'name', xpath: '//a' });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIElementException', e.name);
    }
    
    // destructive: no xpath
    try {
        uiElement.validate({ name: 'name', description: 'desc' });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIElementException', e.name);
    }
}



function test_UIElement_init()
{
    // name, description, args, getLocator, testcases, getDefaultLocators
    var uiElement = new UIElement({
        name: 'name'
        , description: 'desc'
        , xpath: '//a'
    });
    
    // happy path 1
    uiElement.init({ name: 'name', description: 'desc', xpath: '//a' });
    assertEquals('name', uiElement.name);
    assertEquals('desc', uiElement.description);
    assertTrue(are_equal([], uiElement.args));
    assertEquals('//a', uiElement.getLocator());
    assertTrue(are_equal([], uiElement.getTestcases()));
    assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));
    
    // happy path 2
    uiElement.init({ name: 'name', description: 'desc',
        getLocator: function() { return '//a'; } });
    assertEquals('name', uiElement.name);
    assertEquals('desc', uiElement.description);
    assertTrue(are_equal([], uiElement.args));
    assertEquals('//a', uiElement.getLocator());
    assertTrue(are_equal([], uiElement.getTestcases()));
    assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));
    
    // happy path 3
    uiElement.init({ name: 'name', description: 'desc', args: [],
        xpath: '//a', testcase1: { args: {},
        xhtml: '<a expected-result="1" />' } });
    assertEquals('name', uiElement.name);
    assertEquals('desc', uiElement.description);
    assertTrue(are_equal([], uiElement.args));
    assertEquals('//a', uiElement.getLocator());
    assertTrue(are_equal([ { name: 'testcase1', args: {},
        xhtml: '<a expected-result="1" />' } ], uiElement.getTestcases()));
    assertTrue(are_equal({ '//a': {} }, uiElement.getDefaultLocators()));
}



function test_UIElement_permuteArgs()
{
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
        , getLocator: function(args) { return '//a'; }
    });
    
    assertTrue(are_equal(
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
        testUIElement.permuteArgs(testUIElement.args))
    );
}



function test_UIElement_getTestcases()
{
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
    
    assertTrue(are_equal([
        {name: 'testcase1', xhtml: '<div id="content" expected-result></div>'},
        {name: 'testcase2', xhtml: '<div id="main"><div id="content" expected-result></div></div>'}],
        testUIElement.getTestcases()));
}



function test_UIElement_test()
{
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
    assertTrue(testUIElement.test());
    
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
    assertTrue(testUIElement.test());
    
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
    assertFalse(testUIElement.test());
}


function test_UIElement_initDefaultXPaths()
{
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
    assertTrue(are_equal(
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
    assertTrue(are_equal(
        {
            "//div[@id='content']": {}
        },
        testUIElement.getDefaultLocators())
    );
}



function test_UIArgument_validate()
{
    var uiArgument = new UIArgument({ name: 'name'
        , description: 'desc'
        , defaultValues: [1, 2]
    });
    
    // happy path 1
    assertTrue(uiArgument.validate({ name: 'name'
        , description: 'desc'
        , defaultValues: [1, 2]
    }));
    
    // happy path 2
    assertTrue(uiArgument.validate({ name: 'name'
        , description: 'desc'
        , getDefaultValues: function() { return [1, 2]; }
    }));
    
    // destructive: no name
    try {
        uiArgument.validate({ description: 'desc', defaultValues: [1, 2] });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIArgumentException', e.name);
    }
    
    // destructive: no description
    try {
        uiArgument.validate({ name: 'name', defaultValues: [1, 2] });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIArgumentException', e.name);
    }
    
    // destructive: no default values
    try {
        uiArgument.validate({ name: 'name', description: 'desc' });
        assertTrue(false);
    }
    catch (e) {
        assertEquals('UIArgumentException', e.name);
    }
}


function test_UIArgument_init()
{
    var uiArgument = new UIArgument({ name: 'name'
        , description: 'desc'
        , defaultValues: []
    });
    var localVars = { _foo: 'bar' };
    
    // happy path 1: specifying defaultValues
    uiArgument.init({ name: 'name', description: 'desc', defaultValues: [1, 2]},
        localVars);
    assertEquals('name', uiArgument.name);
    assertEquals('desc', uiArgument.description);
    assertTrue(are_equal([1, 2], uiArgument.getDefaultValues()));
    assertEquals('bar', uiArgument._foo);
    
    // happy path 2: specifying getDefaultValues()
    uiArgument.init({ name: 'name', description: 'desc',
        getDefaultValues: function() { return [1, 2]; } }, localVars);
    assertEquals('name', uiArgument.name);
    assertEquals('desc', uiArgument.description);
    assertTrue(are_equal([1, 2], uiArgument.getDefaultValues()));
    assertEquals('bar', uiArgument._foo);
}



// test the UISpecifier constructor. In particular, make sure that the
// components of the UI specifier are created correctly: path, elementName,
// and args. The string can be tested in the tests for UISpecifier methods.
function test_UISpecifier()
{
    // construct from a UI specifier string
    var testUISpecifier =
        new UISpecifier('pagesetName::elementName(k1=v1, k2=v2)');
    assertEquals('pagesetName', testUISpecifier.pagesetName);
    assertEquals('elementName', testUISpecifier.elementName);
    assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));
    
    // construct from components
    testUISpecifier = new UISpecifier('pagesetName', 'elementName',
        {k1: 'v1', k2: 'v2'});
    assertEquals('pagesetName', testUISpecifier.pagesetName);
    assertEquals('elementName', testUISpecifier.elementName);
    assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));
}



function test_UISpecifier__initFromUISpecifierString()
{
    var testUISpecifier = new UISpecifier('pagesetName::elementName()');
    assertEquals('pagesetName', testUISpecifier.pagesetName);
    assertEquals('elementName', testUISpecifier.elementName);
    assertTrue(are_equal({}, testUISpecifier.args));
    
    testUISpecifier._initFromUISpecifierString('pagesetName::elementName(k1=v1, k2=v2)');
    assertEquals('pagesetName', testUISpecifier.pagesetName);
    assertEquals('elementName', testUISpecifier.elementName);
    assertTrue(are_equal({k1: 'v1', k2: 'v2'}, testUISpecifier.args));
    
    testUISpecifier._initFromUISpecifierString('complex:. pagesetName  ::# elementName:*@  ( k1 = v1 ,  k  2=v2   )');
    assertEquals('complex:. pagesetName  ', testUISpecifier.pagesetName);
    assertEquals('# elementName:*@  ', testUISpecifier.elementName);
    assertTrue(are_equal({k1: 'v1', 'k  2': 'v2'}, testUISpecifier.args));
    
    // destructive
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::()');
        fail('Expected exception but none was thrown: missing element name');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('elementName()');
        fail('Expected exception but none was thrown: missing pageset name');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::elementName');
        fail('Expected exception but none was thrown: missing arguments');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier._initFromUISpecifierString('pagesetName::elementName(k1=v1, k2=v2');
        fail('Expected exception but none was thrown: missing close parenthesis for arguments');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
}



function test_UISpecifier_toString()
{
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
        assertEquals(inputs[i].pagesetName, testUISpecifier2.pagesetName);
        assertEquals(inputs[i].elementName, testUISpecifier2.elementName);
        assertTrue(are_equal(inputs[i].args, testUISpecifier2.args));
    }
    
    // destructive
    try {
        testUISpecifier.pagesetName = undefined;
        testUISpecifier.elementName = 'elementName';
        testUISpecifier.args = {};
        testUISpecifier.toString();
        fail('Expected exception but none was thrown: undefined pageset name');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier.pagesetName = 'pagesetName';
        testUISpecifier.elementName = '';
        testUISpecifier.args = {};
        testUISpecifier.toString();
        fail('Expected exception but none was thrown: empty element name');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
    try {
        testUISpecifier.pagesetName = 'pagesetName';
        testUISpecifier.elementName = 'elementName';
        testUISpecifier.args = null;
        testUISpecifier.toString();
        fail('Expected exception but none was thrown: empty arguments array');
    }
    catch (e) {
        assertEquals('UISpecifierException', e.name);
    }
}



function test_Pageset_init()
{
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
    assertEquals('name', pageset.name);
    assertEquals('desc', pageset.description);
    assertEquals('foo/', pageset.pathPrefix);
    assertEquals('^foo\\/(?:bar|baz|shizzle\\.py)$', pageset.pathRegexp.source);
    assertTrue(are_equal({}, pageset.paramRegexps));
    
    // happy path 2
    pageset.init({
        name: 'name'
        , description: 'desc'
        , pathPrefix: 'no.way.'
        , pathRegexp: 'to.e'
        , paramRegexps: { id: 'wallabee', type: '(?:medium|large)' }
    });
    assertEquals('name', pageset.name);
    assertEquals('desc', pageset.description);
    assertEquals('no.way.', pageset.pathPrefix);
    assertEquals('^no\\.way\\.(?:to.e)$', pageset.pathRegexp.source);
    assertEquals('wallabee', pageset.paramRegexps.id.source);
    assertEquals('(?:medium|large)', pageset.paramRegexps.type.source);
}



function test_Pageset_contains()
{
    var pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.*(?:foo|bar).*'
    });
    var mockDoc = { location: {} };
    mockDoc.location.href = 'http://w3.org/food';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/beach/sandbar.php';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://foo.org/baz.html';
    assertFalse(pageset.contains(mockDoc));
    
    pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.*(?:foo|bar).*'
        , paramRegexps: { 'baz': 'yea' }
    });
    mockDoc.location.href = 'http://w3.org/food?baz=hellyeah';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/beach/sandbar.php?lang=zh_CN&baz=yeahbuddy';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/fool';
    assertFalse(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/bar.mitzvah?baz=hag'
    assertFalse(pageset.contains(mockDoc));
    
    pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathPrefix: 'prefix/'
        , paths: [ 'onepath', 'twopath' ]
    });
    mockDoc.location.href = 'http://w3.org/prefix/onepath';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/onepath';
    assertTrue(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/';
    assertFalse(pageset.contains(mockDoc));
    mockDoc.location.href = 'http://w3.org/prefix/foo';
    assertFalse(pageset.contains(mockDoc));
    
    pageset = new Pageset({
        name: 'name'
        , description: 'desc'
        , pathRegexp: '.*'
        , pageContent: function(inDocument) {
            var tags = inDocument.getElementsByTagName('script');
            for (var i = 0; i < tags.length; ++i) {
                if (/ui-element-tests\.js$/.test(tags[i].src)) {
                    return true;
                }
            }
            return false;
        }
    });
    assertTrue(pageset.contains(document));
}



function test_Pageset_validate()
{
    // no name
    try {
        new Pageset({ description: 'desc', paths: [ 'foo' ] });
        fail('PagesetException expected but not thrown');
    }
    catch (e) {
        assertEquals('PagesetException', e.name);
    }
    
    // no description
    try {
        new Pageset({ name: 'name', paths: [ 'foo' ] });
        fail('PagesetException expected but not thrown');
    }
    catch (e) {
        assertEquals('PagesetException', e.name);
    }
    
    // no paths, pathRegexp, or pageContent
    try {
        new Pageset({ name: 'name', description: 'desc' });
        fail('PagesetException expected but not thrown');
    }
    catch (e) {
        assertEquals('PagesetException', e.name);
    }
    
    // happy paths
    try {
        new Pageset({ name: 'name', description: 'desc', paths: [ 'foo' ] });
        new Pageset({ name: 'name', description: 'desc', pathRegexp: 'bar' });
        new Pageset({ name: 'name', description: 'desc', pageContent: function() { return true; } });
    }
    catch (e) {
        fail('Unexpected exception thrown: ' + e.message);
    }
}



function test_UIMap_getUIElementsByUrl()
{
    var myMap = new UIMap(true);
    
    assertTrue(myMap.addPageset({
        name: 'ishPages'
        , description: 'pages whose URLs end with "ish"'
        , pathRegexp: '.*ish'
    }));
    assertTrue(myMap.addElement('ishPages', {
        name: 'someElement'
        , description: 'some real element'
        , args: []
        , getLocator: function(args) { return "//input"; }
    }));
    
    // it's ugly, but it give us coverage! Test "this" in the getDefaultValues()
    // and getLocator() methods.
    assertTrue(myMap.addPageset({
        name: 'discPages'
        , description: 'pages whose URLs start with "disc"'
        , pathRegexp: 'disc.*'
    }));
    assertTrue(myMap.addElement('discPages', {
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
    assertTrue(are_equal(['foo', 'baz'], uiElement.args[0].getDefaultValues()));
    assertEquals("//div[@id='hep']", uiElement.getLocator({name: 'baz'}));
    
    // test forthcoming ...
}



function test_CommandMatcher_validate()
{
    // no target
    try {
        new CommandMatcher({ command: 'command' });
        fail('CommandMatcherException expected but not thrown');
    }
    catch (e) {
        assertEquals('CommandMatcherException', e.name);
    }

    // no command
    try {
        new CommandMatcher({ target: 'target' });
        fail('CommandMatcherException expected but not thrown');
    }
    catch (e) {
        assertEquals('CommandMatcherException', e.name);
    }
    
    // minMatches > maxMatches
    try {
        new CommandMatcher({
            command: 'command'
            , target: 'target'
            , minMatches: 5
            , maxMatches: 1
        });
        fail('CommandMatcherException expected but not thrown');
    }
    catch (e) {
        assertEquals('CommandMatcherException', e.name);
    }
    
    // happy path
    new CommandMatcher({ command: 'command', target: 'target' });
}

function test_CommandMatcher_init()
{
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
    assertEquals('command', cm.command);
    assertEquals('target', cm.target);
    assertEquals('value', cm.value);
    assertEquals(1, cm.minMatches);
    assertEquals(5, cm.maxMatches);
    assertEquals(f, cm.updateArgs);
    
    // leave out all non-required fields
    cm = new CommandMatcher({ command: 'command', target: 'target' });
    assertEquals('command', cm.command);
    assertEquals('target', cm.target);
    assertNull(cm.value);
    assertEquals(1, cm.minMatches);
    assertEquals(1, cm.maxMatches);
    assertNotUndefined(cm.updateArgs);
}

function test_CommandMatcher_match()
{
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
    assertTrue(cm.isMatch(command));
    
    // sad path 1: failed command
    command.command = 'type';
    assertFalse(cm.isMatch(command));
    
    // sad path 2: failed target
    command.command = 'click';
    command.target = 'password';
    assertFalse(cm.isMatch(command));
    
    // sad path 3: failed value
    command.target = 'ui=allPages::faq()';
    command.value = 'asdf';
    assertFalse(cm.isMatch(command));
}



function test_RollupRule_getRollup()
{
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
    assertEquals('rollup', result.command);
    assertEquals('name', result.target);
    assertEquals('', result.value);
    assertTrue(are_equal([ 0, 1 ], result.replacementIndexes));
    
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
    assertTrue(are_equal({ count: '3' }, parse_kwargs(result.value)));
    assertTrue(are_equal([ 0, 1, 2, 3 ], result.replacementIndexes));
    
    // now we add non-matching commands after
    commands.push(new Command('cmd1', 'target'));
    commands.push(new Command('cmd2', 'tar2', 'dro$$'));
    result = rule.getRollup(commands);
    assertTrue(are_equal({ count: '3' }, parse_kwargs(result.value)));
    assertTrue(are_equal([ 0, 1, 2, 3 ], result.replacementIndexes));
    
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
    assertFalse(result);
    
    // this test uses commands that satisfy the minMatches.
    commands.splice(4, 0, new Command('cmd2', 'tar2', '$_'));
    result = rule.getRollup(commands);
    assertTrue(are_equal({ count: '3', count2: '2' },
        parse_kwargs(result.value)));
    assertTrue(are_equal([ 0, 1, 2, 3, 4 ], result.replacementIndexes));
    
    // test the alternate command replacement
    rule = new RollupRule({
        name: 'btnG'
        , description: 'desc'
        , alternateCommand: 'clickAndWait'
        , commandMatchers: [
            {
                command: 'click'
                , target: 'btnG'
            }
        ]
        , expandedCommands: []
    });
    commands = [ new Command('click', 'btnG') ];
    result = rule.getRollup(commands);
    assertEquals('clickAndWait', result.command);
    assertEquals('btnG', result.target);
}
















