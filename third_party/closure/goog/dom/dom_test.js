// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Copyright 2009 Google Inc. All Rights Reserved.

/**
 * @fileoverview Shared code for dom_test.html and dom_quirks_test.html.
 */

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.testing.asserts');
goog.require('goog.userAgent');

var $ = goog.dom.$;

// Setup for the iframe
var myIframe = $('myIframe');
var myIframeDoc = goog.dom.getFrameContentDocument(
    /** @type {HTMLIFrameElement} */ (myIframe));

// Set up document for iframe: total height of elements in document is 65
// If the elements are not create like below, IE will get a wrong height for
// the document.
myIframeDoc.open();
// Make sure we progate the compat mode
myIframeDoc.write((goog.dom.isCss1CompatMode() ? '<!DOCTYPE html>' : '') +
    '<style>body{margin:0;padding:0}</style>' +
    '<div style="height:42px;font-size:1px;line-height:0;">hello world</div>' +
    '<div style="height:23px;font-size:1px;line-height:0;">hello world</div>');
myIframeDoc.close();

function testDom() {
  assert('Dom library exists', typeof goog.dom != 'undefined');
}

function testGetElement() {
  var el = $('testEl');
  assertEquals('Should be able to get id', el.id, 'testEl');

  assertEquals($, goog.dom.getElement);
  assertEquals(goog.dom.$, goog.dom.getElement);
}

function testGetElementsByTagNameAndClass() {
  assertEquals('Should get 6 spans', goog.dom.$$('span').length, 6);
  assertEquals('Should get 3 spans', goog.dom.$$('span', 'test1').length, 3);
  assertEquals('Should get 1 span', goog.dom.$$('span', 'test2').length, 1);
  assertEquals('Should get lots of elements', goog.dom.$$().length,
      document.getElementsByTagName('*').length);

  assertEquals('Should get 1 span', goog.dom.$$('span', null,
                                                $('testEl')).length, 1);

  // '*' as the tag name should be equivalent to all tags
  var container = goog.dom.$('span-container');
  assertEquals(5, goog.dom.$$('*', undefined, container).length);
  assertEquals(3, goog.dom.$$('*', 'test1', container).length);
  assertEquals(1, goog.dom.$$('*', 'test2', container).length);

  // Some version of WebKit have problems with mixed-case class names
  assertEquals(1, goog.dom.$$(undefined, 'mixedCaseClass').length);

  // Make sure that out of bounds indices are OK
  assertUndefined(goog.dom.$$(undefined, 'noSuchClass')[0]);

  assertEquals(goog.dom.$$, goog.dom.getElementsByTagNameAndClass);
}

function testSetProperties() {
  var attrs = { 'name': 'test3', 'title': 'A title', 'random': 'woop' };
  var el = $('testEl');

  var res = goog.dom.setProperties(el, attrs);
  assertEquals('Should be equal', el.name, 'test3');
  assertEquals('Should be equal', el.title, 'A title');
  assertEquals('Should be equal', el.random, 'woop');
}

function testSetPropertiesDirectAttributeMap() {
  var attrs = {'usemap': '#myMap'};
  var el = goog.dom.createDom('img');

  var res = goog.dom.setProperties(el, attrs);
  assertEquals('Should be equal', '#myMap', el.getAttribute('usemap'));
}

function testSetTableProperties() {
  var attrs = { 'style': 'padding-left: 10px;', 'class': 'mytestclass',
                'height': '101', 'cellpadding': '15' };
  var el = $('testTable1');

  var res = goog.dom.setProperties(el, attrs);
  assertEquals('Should be equal', el.style.paddingLeft, '10px');
  assertEquals('Should be equal', el.className, 'mytestclass');
  assertEquals('Should be equal', el.getAttribute('height'), '101');
  assertEquals('Should be equal', el.cellPadding, '15');
}

function testGetViewportSize() {
  // TODO: This is failing in the test runner now, fix later.
  //var dims = getViewportSize();
  //assertNotUndefined('Should be defined at least', dims.width);
  //assertNotUndefined('Should be defined at least', dims.height);
}

function testGetViewportSizeInIframe() {
  var iframe = /** @type {HTMLIFrameElement} */ (goog.dom.$('iframe'));
  var contentDoc = goog.dom.getFrameContentDocument(iframe);
  contentDoc.write('<body></body>');

  var outerSize = goog.dom.getViewportSize();
  var innerSize = (new goog.dom.DomHelper(contentDoc)).getViewportSize();
  assert('Viewport sizes must not match',
      innerSize.width != outerSize.width);
}

function testGetDocumentHeightInIframe() {
  var doc = goog.dom.getDomHelper(myIframeDoc).getDocument();
  var height = goog.dom.getDomHelper(myIframeDoc).getDocumentHeight();

  // Broken in webkit quirks mode.
  if (goog.dom.isCss1CompatMode_(doc) || !goog.userAgent.WEBKIT) {
    assertEquals('height should be 65', 42 + 23, height);
  }
}

function testCreateDom() {
  var el = goog.dom.$dom('div', {
        style: 'border: 1px solid black; width: 50%; background-color: #EEE;',
        onclick: "alert('woo')"
      },
      goog.dom.$dom('p', {style: 'font: normal 12px arial; color: red; '},
                    'Para 1'),
      goog.dom.$dom('p', {style: 'font: bold 18px garamond; color: blue; '},
                    'Para 2'),
      goog.dom.$dom('p', {style: 'font: normal 24px monospace; color: green'},
                    'Para 3 ',
                    goog.dom.$dom('a', {
                          name: 'link', href: 'http://bbc.co.uk'
                      },
                      'has a link'),
                    ', how cool is this?'));

  assertEquals('Tagname should be a DIV', 'DIV', el.tagName);
  assertEquals('Style width should be 50%', '50%', el.style.width);
  assertEquals('first child is a P tag', 'P', el.childNodes[0].tagName);
  assertEquals('second child .innerHTML', 'Para 2',
               el.childNodes[1].innerHTML);

  assertEquals(goog.dom.$dom, goog.dom.createDom);
}

function testCreateDomNoChildren() {
  var el;

  // Test unspecified children.
  el = goog.dom.$dom('div');
  assertNull('firstChild should be null', el.firstChild);

  // Test null children.
  el = goog.dom.$dom('div', null, null);
  assertNull('firstChild should be null', el.firstChild);

  // Test empty array of children.
  el = goog.dom.$dom('div', null, []);
  assertNull('firstChild should be null', el.firstChild);
}

function testCreateDomAcceptsArray() {
  var items = [
    goog.dom.$dom('li', {}, 'Item 1'),
    goog.dom.$dom('li', {}, 'Item 2')
  ];
  var ul = goog.dom.$dom('ul', {}, items);
  assertEquals('List should have two children', 2, ul.childNodes.length);
  assertEquals('First child should be an LI tag',
      'LI', ul.firstChild.tagName);
  assertEquals('Item 1', ul.childNodes[0].innerHTML);
  assertEquals('Item 2', ul.childNodes[1].innerHTML);
}

function testCreateDomStringArg() {
  var el;

  // Test string arg.
  el = goog.dom.$dom('div', null, 'Hello');
  assertEquals('firstChild should be a text node', goog.dom.NodeType.TEXT,
      el.firstChild.nodeType);
  assertEquals('firstChild should have node value "Hello"', 'Hello',
      el.firstChild.nodeValue);

  // Test text node arg.
  el = goog.dom.$dom('div', null, goog.dom.createTextNode('World'));
  assertEquals('firstChild should be a text node', goog.dom.NodeType.TEXT,
      el.firstChild.nodeType);
  assertEquals('firstChild should have node value "World"', 'World',
      el.firstChild.nodeValue);
}

function testCreateDomNodeListArg() {
  var el;
  var emptyElem = goog.dom.$dom('div');
  var simpleElem = goog.dom.$dom('div', null, 'Hello, world!');
  var complexElem = goog.dom.$dom('div', null, 'Hello, ',
                                  goog.dom.$dom('b', null, 'world'),
      goog.dom.createTextNode('!'));

  // Test empty node list.
  el = goog.dom.$dom('div', null, emptyElem.childNodes);
  assertNull('emptyElem.firstChild should be null', emptyElem.firstChild);
  assertNull('firstChild should be null', el.firstChild);

  // Test simple node list.
  el = goog.dom.$dom('div', null, simpleElem.childNodes);
  assertNull('simpleElem.firstChild should be null', simpleElem.firstChild);
  assertEquals('firstChild should be a text node with value "Hello, world!"',
      'Hello, world!', el.firstChild.nodeValue);

  // Test complex node list.
  el = goog.dom.$dom('div', null, complexElem.childNodes);
  assertNull('complexElem.firstChild should be null', complexElem.firstChild);
  assertEquals('Element should have 3 child nodes', 3, el.childNodes.length);
  assertEquals('childNodes[0] should be a text node with value "Hello, "',
      'Hello, ', el.childNodes[0].nodeValue);
  assertEquals('childNodes[1] should be an element node with tagName "B"',
      'B', el.childNodes[1].tagName);
  assertEquals('childNodes[2] should be a text node with value "!"', '!',
      el.childNodes[2].nodeValue);
}

function testCreateDomWithTypeAttribute() {
  var el = goog.dom.createDom('button', {'type': 'reset'}, 'Cool button');
  assertNotNull('Button with type attribute was created successfully', el);
  assertEquals('Button has correct type attribute', 'reset', el.type);
}

function testContains() {
  assertTrue('HTML should contain BODY', goog.dom.contains(
      document.documentElement, document.body));
  assertTrue('Document should contain BODY', goog.dom.contains(
      document, document.body));

  var d = goog.dom.$dom('p', null, 'A paragraph');
  var t = d.firstChild;
  assertTrue('Same element', goog.dom.contains(d, d));
  assertTrue('Same text', goog.dom.contains(t, t));
  assertTrue('Nested text', goog.dom.contains(d, t));
  assertFalse('Nested text, reversed', goog.dom.contains(t, d));
  assertFalse('Disconnected element', goog.dom.contains(
      document, d));
  goog.dom.appendChild(document.body, d);
  assertTrue('Connected element', goog.dom.contains(
      document, d));
  goog.dom.removeNode(d);
}

function testCreateDomWithClassName() {
  var el = goog.dom.$dom('div', 'cls');
  assertNull('firstChild should be null', el.firstChild);
  assertEquals('Tagname should be a DIV', 'DIV', el.tagName);
  assertEquals('ClassName should be cls', 'cls', el.className);

  el = goog.dom.$dom('div', '');
  assertEquals('ClassName should be empty', '', el.className);
}

function testCompareNodeOrder() {
  var b1 = $('b1');
  var b2 = $('b2');
  var p2 = $('p2');

  assertEquals('equal nodes should compare to 0', 0,
      goog.dom.compareNodeOrder(b1, b1));

  assertTrue('parent should come before child',
      goog.dom.compareNodeOrder(p2, b1) < 0);
  assertTrue('child should come after parent',
      goog.dom.compareNodeOrder(b1, p2) > 0);

  assertTrue('parent should come before text child',
      goog.dom.compareNodeOrder(b1, b1.firstChild) < 0);
  assertTrue('text child should come after parent', goog.dom.compareNodeOrder(
      b1.firstChild, b1) > 0);

  assertTrue('first sibling should come before second',
      goog.dom.compareNodeOrder(b1, b2) < 0);
  assertTrue('second sibling should come after first',
      goog.dom.compareNodeOrder(b2, b1) > 0);

  assertTrue('text node after cousin element returns correct value',
      goog.dom.compareNodeOrder(b1.nextSibling, b1) > 0);
  assertTrue('text node before cousin element returns correct value',
      goog.dom.compareNodeOrder(b1, b1.nextSibling) < 0);

  assertTrue('text node is before once removed cousin element',
      goog.dom.compareNodeOrder(b1.firstChild, b2) < 0);
  assertTrue('once removed cousin element is before text node',
      goog.dom.compareNodeOrder(b2, b1.firstChild) > 0);

  assertTrue('text node is after once removed cousin text node',
      goog.dom.compareNodeOrder(b1.nextSibling, b1.firstChild) > 0);
  assertTrue('once removed cousin text node is before text node',
      goog.dom.compareNodeOrder(b1.firstChild, b1.nextSibling) < 0);

  assertTrue('first text node is before second text node',
      goog.dom.compareNodeOrder(b1.previousSibling, b1.nextSibling) < 0);
  assertTrue('second text node is after first text node',
      goog.dom.compareNodeOrder(b1.nextSibling, b1.previousSibling) > 0);

  assertTrue('grandchild is after grandparent',
      goog.dom.compareNodeOrder(b1.firstChild, b1.parentNode) > 0);
  assertTrue('grandparent is after grandchild',
      goog.dom.compareNodeOrder(b1.parentNode, b1.firstChild) < 0);

  assertTrue('grandchild is after grandparent',
      goog.dom.compareNodeOrder(b1.firstChild, b1.parentNode) > 0);
  assertTrue('grandparent is after grandchild',
      goog.dom.compareNodeOrder(b1.parentNode, b1.firstChild) < 0);

  assertTrue('second cousins compare correctly',
      goog.dom.compareNodeOrder(b1.firstChild, b2.firstChild) < 0);
  assertTrue('second cousins compare correctly in reverse',
      goog.dom.compareNodeOrder(b2.firstChild, b1.firstChild) > 0);

  assertTrue('testEl2 is after testEl',
      goog.dom.compareNodeOrder($('testEl2'), $('testEl')) > 0);
  assertTrue('testEl is before testEl2',
      goog.dom.compareNodeOrder($('testEl'), $('testEl2')) < 0);

  var p = $('order-test');
  var text1 = document.createTextNode('1');
  p.appendChild(text1);
  var text2 = document.createTextNode('1');
  p.appendChild(text2);

  assertEquals('Equal text nodes should compare to 0', 0,
      goog.dom.compareNodeOrder(text1, text1));
  assertTrue('First text node is before second',
      goog.dom.compareNodeOrder(text1, text2) < 0);
  assertTrue('Second text node is after first',
      goog.dom.compareNodeOrder(text2, text1) > 0);
  assertTrue('Late text node is after b1',
      goog.dom.compareNodeOrder(text1, $('b1')) > 0);
}

function testFindCommonAncestor() {
  var b1 = $('b1');
  var b2 = $('b2');
  var p1 = $('p1');
  var p2 = $('p2');
  var testEl2 = $('testEl2');

  assertNull('findCommonAncestor() = null', goog.dom.findCommonAncestor());
  assertEquals('findCommonAncestor(b1) = b1', b1,
      goog.dom.findCommonAncestor(b1));
  assertEquals('findCommonAncestor(b1, b1) = b1', b1,
      goog.dom.findCommonAncestor(b1, b1));
  assertEquals('findCommonAncestor(b1, b2) = p2', p2,
      goog.dom.findCommonAncestor(b1, b2));
  assertEquals('findCommonAncestor(p1, b2) = body', document.body,
      goog.dom.findCommonAncestor(p1, b2));
  assertEquals('findCommonAncestor(testEl2, b1, b2, p1, p2) = body',
      document.body, goog.dom.findCommonAncestor(testEl2, b1, b2, p1, p2));

  var outOfDoc = document.createElement('div');
  assertNull('findCommonAncestor(outOfDoc, b1) = null',
      goog.dom.findCommonAncestor(outOfDoc, b1));
}

function testRemoveNode() {
  var b = document.createElement('b');
  var el = $('p1');
  el.appendChild(b);
  goog.dom.removeNode(b);
  assertTrue('b should have been removed', el.lastChild != b);
}

function testReplaceNode() {
  var n = $('toReplace');
  var previousSibling = n.previousSibling;
  var goodNode = goog.dom.createDom('div', {'id': 'goodReplaceNode'});
  goog.dom.replaceNode(goodNode, n);

  assertEquals('n should have been replaced', previousSibling.nextSibling,
      goodNode);
  assertNull('n should no longer be in the DOM tree', $('toReplace'));

  var badNode = goog.dom.createDom('div', {'id': 'badReplaceNode'});
  goog.dom.replaceNode(badNode, n);
  assertNull('badNode should not be in the DOM tree', $('badReplaceNode'));
}

function testFlattenElement() {
  var text = document.createTextNode('Text');
  var br = document.createElement('br');
  var span = goog.dom.createDom('span', null, text, br);
  assertEquals('span should have 2 children', 2, span.childNodes.length);

  var el = $('p1');
  el.appendChild(span);

  var ret = goog.dom.flattenElement(span);

  assertTrue('span should have been removed', el.lastChild != span);
  assertFalse('span should have no parent', !!span.parentNode &&
      span.parentNode.nodeType != goog.dom.NodeType.DOCUMENT_FRAGMENT);
  assertEquals('span should have no children', 0, span.childNodes.length);
  assertEquals('Last child of p should be br', br, el.lastChild);
  assertEquals('Previous sibling of br should be text', text,
      br.previousSibling);

  var outOfDoc = goog.dom.createDom('span', null, '1 child');
  // Should do nothing.
  goog.dom.flattenElement(outOfDoc);
  assertEquals('outOfDoc should still have 1 child', 1,
      outOfDoc.childNodes.length);
}

function testIsNodeLike() {
  assertTrue('document should be node like', goog.dom.isNodeLike(document));
  assertTrue('document.body should be node like',
             goog.dom.isNodeLike(document.body));
  assertTrue('a text node should be node like', goog.dom.isNodeLike(
      document.createTextNode('')));

  assertFalse('null should not be node like', goog.dom.isNodeLike(null));
  assertFalse('a string should not be node like', goog.dom.isNodeLike('abcd'));

  assertTrue('custom object should be node like',
             goog.dom.isNodeLike({nodeType: 1}));
}

function testGetOwnerDocument() {
  assertEquals(goog.dom.getOwnerDocument($('p1')), document);
  assertEquals(goog.dom.getOwnerDocument(document.body), document);
  assertEquals(goog.dom.getOwnerDocument(document.documentElement), document);
}

function testDomHelper() {
  var x = new goog.dom.DomHelper(window.frames['frame'].document);
  assertTrue('Should have some HTML',
             x.getDocument().body.innerHTML.length > 0);
}

function testGetFirstElementChild() {
  var p2 = $('p2');
  var b1 = goog.dom.getFirstElementChild(p2);
  assertNotNull('First element child of p2 should not be null', b1);
  assertEquals('First element child is b1', 'b1', b1.id);

  var c = goog.dom.getFirstElementChild(b1);
  assertNull('First element child of b1 should be null', c);
}

function testGetLastElementChild() {
  var p2 = $('p2');
  var b2 = goog.dom.getLastElementChild(p2);
  assertNotNull('Last element child of p2 should not be null', b2);
  assertEquals('Last element child is b2', 'b2', b2.id);

  var c = goog.dom.getLastElementChild(b2);
  assertNull('Last element child of b2 should be null', c);
}

function testGetNextElementSibling() {
  var b1 = $('b1');
  var b2 = goog.dom.getNextElementSibling(b1);
  assertNotNull('Next element sibling of b1 should not be null', b1);
  assertEquals('Next element sibling is b2', 'b2', b2.id);

  var c = goog.dom.getNextElementSibling(b2);
  assertNull('Next element sibling of b2 should be null', c);
}

function testGetPreviousElementSibling() {
  var b2 = $('b2');
  var b1 = goog.dom.getPreviousElementSibling(b2);
  assertNotNull('Previous element sibling of b2 should not be null', b1);
  assertEquals('Previous element sibling is b1', 'b1', b1.id);

  var c = goog.dom.getPreviousElementSibling(b1);
  assertNull('Previous element sibling of b1 should be null', c);
}

function testSetTextContent() {
  var p1 = $('p1');
  var s = 'hello world';
  goog.dom.setTextContent(p1, s);
  assertEquals('We should have one childNode after setTextContent', 1,
      p1.childNodes.length);
  assertEquals(s, p1.firstChild.data);
  assertEquals(s, p1.innerHTML);

  s = 'four elefants < five ants';
  var sHtml = 'four elefants &lt; five ants';
  goog.dom.setTextContent(p1, s);
  assertEquals('We should have one childNode after setTextContent', 1,
      p1.childNodes.length);
  assertEquals(s, p1.firstChild.data);
  assertEquals(sHtml, p1.innerHTML);

  // ensure that we remove existing children
  p1.innerHTML = 'a<b>b</b>c';
  s = 'hello world';
  goog.dom.setTextContent(p1, s);
  assertEquals('We should have one childNode after setTextContent', 1,
      p1.childNodes.length);
  assertEquals(s, p1.firstChild.data);

  // same but start with an element
  p1.innerHTML = '<b>a</b>b<i>c</i>';
  s = 'hello world';
  goog.dom.setTextContent(p1, s);
  assertEquals('We should have one childNode after setTextContent', 1,
      p1.childNodes.length);
  assertEquals(s, p1.firstChild.data);

  // clean up
  p1.innerHTML = '';
}

function testFindNode() {
  var expected = document.body;
  var result = goog.dom.findNode(document, function(n) {
    return n.nodeType == goog.dom.NodeType.ELEMENT && n.tagName == 'BODY';
  });
  assertEquals(expected, result);

  expected = document.getElementsByTagName('P')[0];
  result = goog.dom.findNode(document, function(n) {
    return n.nodeType == goog.dom.NodeType.ELEMENT && n.tagName == 'P';
  });
  assertEquals(expected, result);

  result = goog.dom.findNode(document, function(n) {
    return false;
  });
  assertUndefined(result);
}

function testFindNodes() {
  var expected = document.getElementsByTagName('P');
  var result = goog.dom.findNodes(document, function(n) {
    return n.nodeType == goog.dom.NodeType.ELEMENT && n.tagName == 'P';
  });
  assertEquals(expected.length, result.length);
  assertEquals(expected[0], result[0]);
  assertEquals(expected[1], result[1]);

  result = goog.dom.findNodes(document, function(n) {
    return false;
  }).length;
  assertEquals(0, result);
}

function createTestDom(txt) {
  var dom = goog.dom.createDom('div');
  dom.innerHTML = txt;
  return dom;
}

function testIsFocusableTabIndex() {
  assertFalse('isFocusableTabIndex() must be false for no tab index',
      goog.dom.isFocusableTabIndex(goog.dom.$('noTabIndex')));
  assertFalse('isFocusableTabIndex() must be false for tab index -2',
      goog.dom.isFocusableTabIndex(goog.dom.$('tabIndexNegative2')));
  assertFalse('isFocusableTabIndex() must be false for tab index -1',
      goog.dom.isFocusableTabIndex(goog.dom.$('tabIndexNegative1')));

  // WebKit on Mac doesn't support focusable DIVs until version 526 and later.
  if (!goog.userAgent.WEBKIT || !goog.userAgent.MAC ||
      goog.userAgent.isVersion('526')) {
    assertTrue('isFocusableTabIndex() must be true for tab index 0',
        goog.dom.isFocusableTabIndex(goog.dom.$('tabIndex0')));
    assertTrue('isFocusableTabIndex() must be true for tab index 1',
        goog.dom.isFocusableTabIndex(goog.dom.$('tabIndex1')));
    assertTrue('isFocusableTabIndex() must be true for tab index 2',
        goog.dom.isFocusableTabIndex(goog.dom.$('tabIndex2')));
  }
}

function testSetFocusableTabIndex() {
  // WebKit on Mac doesn't support focusable DIVs until version 526 and later.
  if (!goog.userAgent.WEBKIT || !goog.userAgent.MAC ||
      goog.userAgent.isVersion('526')) {
    // Test enabling focusable tab index.
    goog.dom.setFocusableTabIndex(goog.dom.$('noTabIndex'), true);
    assertTrue('isFocusableTabIndex() must be true after enabling tab index',
        goog.dom.isFocusableTabIndex(goog.dom.$('noTabIndex')));

    // Test disabling focusable tab index that was added programmatically.
    goog.dom.setFocusableTabIndex(goog.dom.$('noTabIndex'), false);
    assertFalse('isFocusableTabIndex() must be false after disabling tab ' +
        'index that was programmatically added',
        goog.dom.isFocusableTabIndex(goog.dom.$('noTabIndex')));

    // Test disabling focusable tab index that was specified in markup.
    goog.dom.setFocusableTabIndex(goog.dom.$('tabIndex0'), false);
    assertFalse('isFocusableTabIndex() must be false after disabling tab ' +
        'index that was specified in markup',
        goog.dom.isFocusableTabIndex(goog.dom.$('tabIndex0')));

    // Test re-enabling focusable tab index.
    goog.dom.setFocusableTabIndex(goog.dom.$('tabIndex0'), true);
    assertTrue('isFocusableTabIndex() must be true after reenabling tab' +
        'index', goog.dom.isFocusableTabIndex(goog.dom.$('tabIndex0')));
  }
}

function testGetTextContent() {
  function t(inp, out) {
    assertEquals(out.replace(/ /g, '_'),
                 goog.dom.getTextContent(
                    createTestDom(inp)).replace(/ /g, '_'));
  }

  t('abcde', 'abcde');
  t('a<b>bcd</b>efgh', 'abcdefgh');
  t('a<script type="text/javascript' + '">var a=1;<' + '/script>h', 'ah');
  t('<html><head><style type="text/css">' +
    'p{margin:100%;padding:5px}\n.class{background-color:red;}</style>' +
    '</head><body><h1>Hello</h1>\n<p>One two three</p>\n<table><tr><td>a' +
    '<td>b</table><' + 'script>var a = \'foo\';' +
    '</scrip' + 't></body></html>', 'HelloOne two threeab');
  t('abc<br>def', 'abc\ndef');
  t('abc<br>\ndef', 'abc\ndef');
  t('abc<br>\n\ndef', 'abc\ndef');
  t('abc<br><br>\ndef', 'abc\n\ndef');
  t(' <b>abcde  </b>   ', 'abcde ');
  t(' <b>abcde    </b> hi  ', 'abcde hi ');
  t(' \n<b>abcde  </b>   ', 'abcde ');
  t(' \n<b>abcde  </b>   \n\n\n', 'abcde ');
  t('<p>abcde</p>\nfg', 'abcdefg');
  t('\n <div>  <b>abcde  </b>   ', 'abcde ');
  t(' \n&shy;<b>abcde &shy; </b>   \n\n\n&shy;', 'abcde ');
  t(' \n&shy;\n\n&shy;\na   ', 'a ');
  t(' \n<wbr></wbr><b>abcde <wbr></wbr> </b>   \n\n\n<wbr></wbr>', 'abcde ');
}

function testGetNodeTextLength() {

  assertEquals(6, goog.dom.getNodeTextLength(createTestDom('abcdef')));
  assertEquals(8, goog.dom.getNodeTextLength(
      createTestDom('a<b>bcd</b>efgh')));
  assertEquals(2, goog.dom.getNodeTextLength(createTestDom(
      'a<script type="text/javascript' + '">var a = 1234;<' + '/script>h')));
  assertEquals(4, goog.dom.getNodeTextLength(createTestDom(
      'a<br>\n<!-- some comments -->\nfo')));
  assertEquals(20, goog.dom.getNodeTextLength(createTestDom(
      '<html><head><style type="text/css">' +
      'p{margin:100%;padding:5px}\n.class{background-color:red;}</style>' +
      '</head><body><h1>Hello</h1><p>One two three</p><table><tr><td>a<td>b' +
      '</table><' + 'script>var a = \'foo\';</scrip' +
      't></body></html>')));
  assertEquals(10, goog.dom.getNodeTextLength(createTestDom(
      'a<b>bcd</b><br />efghi')));
}

function testGetNodeTextOffset() {
  assertEquals(4, goog.dom.getNodeTextOffset($('offsetTest1'),
                                             $('offsetParent1')));
  assertEquals(12, goog.dom.getNodeTextOffset($('offsetTest1')));
}

function testGetNodeAtOffset() {
  var html = '<div id=a>123<b id=b>45</b><span id=c>67<b id=d>89<i id=e>01' +
             '</i>23<i id=f>45</i>67</b>890<i id=g>123</i><b id=h>456</b>' +
             '</span></div><div id=i>7890<i id=j>123</i></div>';
  var node = document.createElement('div');
  node.innerHTML = html;
  var rv = {};

  goog.dom.getNodeAtOffset(node, 2, rv);
  assertEquals('123', rv.node.nodeValue);
  assertEquals('a', rv.node.parentNode.id);
  assertEquals(1, rv.remainder);

  goog.dom.getNodeAtOffset(node, 3, rv);
  assertEquals('123', rv.node.nodeValue);
  assertEquals('a', rv.node.parentNode.id);
  assertEquals(2, rv.remainder);

  goog.dom.getNodeAtOffset(node, 5, rv);
  assertEquals('45', rv.node.nodeValue);
  assertEquals('b', rv.node.parentNode.id);
  assertEquals(1, rv.remainder);

  goog.dom.getNodeAtOffset(node, 6, rv);
  assertEquals('67', rv.node.nodeValue);
  assertEquals('c', rv.node.parentNode.id);
  assertEquals(0, rv.remainder);

  goog.dom.getNodeAtOffset(node, 23, rv);
  assertEquals('123', rv.node.nodeValue);
  assertEquals('g', rv.node.parentNode.id);
  assertEquals(2, rv.remainder);

  goog.dom.getNodeAtOffset(node, 30, rv);
  assertEquals('7890', rv.node.nodeValue);
  assertEquals('i', rv.node.parentNode.id);
  assertEquals(3, rv.remainder);

}

// IE inserts line breaks and capitalizes nodenames.
function assertEqualsCaseAndLeadingWhitespaceInsensitive(value1, value2) {
  value1 = value1.replace(/^\s+|\s+$/g, '').toLowerCase();
  value2 = value2.replace(/^\s+|\s+$/g, '').toLowerCase();
  assertEquals(value1, value2);
}

function testGetOuterHtml() {
  var contents = '<b>foo</b>';
  var node = document.createElement('div');
  node.setAttribute('foo', 'bar');
  node.innerHTML = contents;
  assertEqualsCaseAndLeadingWhitespaceInsensitive(
      goog.dom.getOuterHtml(node), '<div foo="bar">' + contents + '</div>');

  var imgNode = document.createElement('img');
  imgNode.setAttribute('foo', 'bar');
  assertEqualsCaseAndLeadingWhitespaceInsensitive(
      goog.dom.getOuterHtml(imgNode), '<img foo="bar">');
}


function testGetWindowFrame() {
  var frameWindow = window.frames['frame'];
  var frameDocument = frameWindow.document;
  var frameDomHelper = new goog.dom.DomHelper(frameDocument);

  // Cannot use assertEquals since IE fails on ===
  assertTrue(frameWindow == frameDomHelper.getWindow());
}

function testGetWindow() {
  var domHelper = new goog.dom.DomHelper();
  // Cannot use assertEquals since IE fails on ===
  assertTrue(window == domHelper.getWindow());
}

function testGetWindowStatic() {
  // Cannot use assertEquals since IE fails on ===
  assertTrue(window == goog.dom.getWindow());
}

function testIsNodeList() {
  var elem = document.getElementById('p2');
  var text = document.getElementById('b2').firstChild;

  assertTrue('NodeList should be a node list',
      goog.dom.isNodeList(elem.childNodes));
  assertFalse('TextNode should not be a node list',
      goog.dom.isNodeList(text));
  assertFalse('Array of nodes should not be a node list',
      goog.dom.isNodeList([elem.firstChild, elem.lastChild]));
}

function testGetFrameContentDocument() {
  var iframe = document.getElementsByTagName('iframe')[0];
  var name = iframe.name;
  var iframeDoc = goog.dom.getFrameContentDocument(iframe);
  assertEquals(window.frames[name].document, iframeDoc);
}

function testGetFrameContentWindow() {
  var iframe = document.getElementsByTagName('iframe')[0];
  var name = iframe.name;
  var iframeWin = goog.dom.getFrameContentWindow(iframe);
  assertEquals(window.frames[name], iframeWin);
}

function testCanHaveChildren() {
  for (var tag in goog.dom.TagName) {
    var expected = true;
    switch (tag) {
      case goog.dom.TagName.APPLET:
      case goog.dom.TagName.AREA:
      case goog.dom.TagName.BR:
      case goog.dom.TagName.COL:
      case goog.dom.TagName.FRAME:
      case goog.dom.TagName.HR:
      case goog.dom.TagName.IMG:
      case goog.dom.TagName.INPUT:
      case goog.dom.TagName.IFRAME:
      case goog.dom.TagName.ISINDEX:
      case goog.dom.TagName.LINK:
      case goog.dom.TagName.NOFRAMES:
      case goog.dom.TagName.NOSCRIPT:
      case goog.dom.TagName.META:
      case goog.dom.TagName.OBJECT:
      case goog.dom.TagName.PARAM:
      case goog.dom.TagName.SCRIPT:
      case goog.dom.TagName.STYLE:
        expected = false;
    }
    var node = goog.dom.createDom(tag);
    assertEquals(tag + ' should ' + (expected ? '' : 'not ') +
        'have children', expected, goog.dom.canHaveChildren(node));
  }
}

function testGetAncestorNoMatch() {
  var elem = goog.dom.$('nestedElement');
  assertNull(goog.dom.getAncestor(elem, function() {return false;}));
}

function testGetAncestorMatchSelf() {
  var elem = goog.dom.$('nestedElement');
  var matched = goog.dom.getAncestor(elem, function() {return true;}, true);
  assertEquals(elem, matched);
}

function testGetAncestorNoMatchSelf() {
  var elem = goog.dom.$('nestedElement');
  var matched = goog.dom.getAncestor(elem, function() {return true;});
  assertEquals(elem.parentNode, matched);
}

function testGetAncestorWithMaxSearchStepsMatchSelf()  {
  var elem = goog.dom.$('nestedElement');
  var matched = goog.dom.getAncestor(
      elem, function() {return true;}, true, 2);
  assertEquals(elem, matched);
}

function testGetAncestorWithMaxSearchStepsMatch() {
  var elem = goog.dom.$('nestedElement');
  var searchEl = elem.parentNode.parentNode;
  var matched = goog.dom.getAncestor(
      elem, function(el) {return el == searchEl;}, false, 1);
  assertEquals(searchEl, matched);
}

function testGetAncestorWithMaxSearchStepsNoMatch() {
  var elem = goog.dom.$('nestedElement');
  var searchEl = elem.parentNode.parentNode;
  var matched = goog.dom.getAncestor(
      elem, function(el) {return el == searchEl;}, false, 0);
  assertNull(matched);
}

function testGetAncestorByTagNameNoMatch() {
  var elem = goog.dom.$('nestedElement');
  assertNull(
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.IMG));
}

function testGetAncestorByTagNameOnly() {
  var elem = goog.dom.$('nestedElement');
  var expected = goog.dom.$('testAncestorDiv');
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.DIV));
}

function testGetAncestorByClassNameNoMatch() {
  var elem = goog.dom.$('nestedElement');
  assertNull(
      goog.dom.getAncestorByTagNameAndClass(elem, null, 'bogusClassName'));
}

function testGetAncestorByClassName() {
  var elem = goog.dom.$('nestedElement');
  var expected = goog.dom.$('testAncestorP');
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, null, 'testAncestor'));
}

function testGetAncestorByTagNameAndClass() {
  var elem = goog.dom.$('nestedElement');
  var expected = goog.dom.$('testAncestorDiv');
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.DIV,
          'testAncestor'));
}
