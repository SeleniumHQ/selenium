// Copyright 2009 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Shared code for dom_test.html and dom_quirks_test.html.
 */

goog.provide('goog.dom.dom_test');

goog.require('goog.dom');
goog.require('goog.dom.DomHelper');
goog.require('goog.dom.NodeType');
goog.require('goog.dom.TagName');
goog.require('goog.testing.asserts');
goog.require('goog.userAgent');
goog.require('goog.userAgent.product');
goog.require('goog.userAgent.product.isVersion');

goog.setTestOnly('dom_test');

var $ = goog.dom.getElement;

var divForTestingScrolling;
var myIframe;
var myIframeDoc;

function setUpPage() {
  divForTestingScrolling = document.createElement('div');
  divForTestingScrolling.style.width = '5000px';
  divForTestingScrolling.style.height = '5000px';
  document.body.appendChild(divForTestingScrolling);

  // Setup for the iframe
  myIframe = $('myIframe');
  myIframeDoc = goog.dom.getFrameContentDocument(
      /** @type {HTMLIFrameElement} */ (myIframe));

  // Set up document for iframe: total height of elements in document is 65
  // If the elements are not create like below, IE will get a wrong height for
  // the document.
  myIframeDoc.open();
  // Make sure we progate the compat mode
  myIframeDoc.write((goog.dom.isCss1CompatMode() ? '<!DOCTYPE html>' : '') +
      '<style>body{margin:0;padding:0}</style>' +
      '<div style="height:42px;font-size:1px;line-height:0;">' +
          'hello world</div>' +
      '<div style="height:23px;font-size:1px;line-height:0;">' +
          'hello world</div>');
  myIframeDoc.close();
}

function tearDownPage() {
  document.body.removeChild(divForTestingScrolling);
}

function tearDown() {
  window.scrollTo(0, 0);
}

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
  assertEquals('Should get 6 spans',
      goog.dom.getElementsByTagNameAndClass('span').length, 6);
  assertEquals('Should get 6 spans',
      goog.dom.getElementsByTagNameAndClass('SPAN').length, 6);
  assertEquals('Should get 3 spans',
      goog.dom.getElementsByTagNameAndClass('span', 'test1').length, 3);
  assertEquals('Should get 1 span',
      goog.dom.getElementsByTagNameAndClass('span', 'test2').length, 1);
  assertEquals('Should get 1 span',
      goog.dom.getElementsByTagNameAndClass('SPAN', 'test2').length, 1);
  assertEquals('Should get lots of elements',
      goog.dom.getElementsByTagNameAndClass().length,
      document.getElementsByTagName('*').length);

  assertEquals('Should get 1 span',
      goog.dom.getElementsByTagNameAndClass('span', null, $('testEl')).length,
      1);

  // '*' as the tag name should be equivalent to all tags
  var container = goog.dom.getElement('span-container');
  assertEquals(5,
      goog.dom.getElementsByTagNameAndClass('*', undefined, container).length);
  assertEquals(3,
      goog.dom.getElementsByTagNameAndClass('*', 'test1', container).length);
  assertEquals(1,
      goog.dom.getElementsByTagNameAndClass('*', 'test2', container).length);

  // Some version of WebKit have problems with mixed-case class names
  assertEquals(1,
      goog.dom.getElementsByTagNameAndClass(
          undefined, 'mixedCaseClass').length);

  // Make sure that out of bounds indices are OK
  assertUndefined(
      goog.dom.getElementsByTagNameAndClass(undefined, 'noSuchClass')[0]);

  assertEquals(goog.dom.getElementsByTagNameAndClass,
      goog.dom.getElementsByTagNameAndClass);
}

function testGetElementsByClass() {
  assertEquals(3, goog.dom.getElementsByClass('test1').length);
  assertEquals(1, goog.dom.getElementsByClass('test2').length);
  assertEquals(0, goog.dom.getElementsByClass('nonexistant').length);

  var container = goog.dom.getElement('span-container');
  assertEquals(3, goog.dom.getElementsByClass('test1', container).length);
}

function testGetElementByClass() {
  assertNotNull(goog.dom.getElementByClass('test1'));
  assertNotNull(goog.dom.getElementByClass('test2'));
  // assertNull(goog.dom.getElementByClass('nonexistant'));

  var container = goog.dom.getElement('span-container');
  assertNotNull(goog.dom.getElementByClass('test1', container));
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
  var attrs = {
    'style': 'padding-left: 10px;',
    'class': 'mytestclass',
    'height': '101',
    'cellpadding': '15'
  };
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
  var iframe = /** @type {HTMLIFrameElement} */ (goog.dom.getElement('iframe'));
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

  // Broken in webkit quirks mode and in IE8
  if ((goog.dom.isCss1CompatMode_(doc) || !goog.userAgent.WEBKIT) &&
      !isIE8()) {
    assertEquals('height should be 65', 42 + 23, height);
  }
}

function testCreateDom() {
  var el = goog.dom.$dom('div',
      {
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
  var el = goog.dom.createDom('button', {'type': 'reset', 'id': 'cool-button'},
      'Cool button');
  assertNotNull('Button with type attribute was created successfully', el);
  assertEquals('Button has correct type attribute', 'reset', el.type);
  assertEquals('Button has correct id', 'cool-button', el.id);
}

function testCreateDomWithClassList() {
  var el = goog.dom.createDom('div', ['foo', 'bar']);
  assertEquals('foo bar', el.className);

  el = goog.dom.createDom('div', ['foo', 'foo']);
  assertEquals('foo', el.className);
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

function testAppendChildAt() {
  var parent = $('p2');
  var origNumChildren = parent.childNodes.length;

  var child1 = document.createElement('div');
  goog.dom.insertChildAt(parent, child1, origNumChildren);
  assertEquals(origNumChildren + 1, parent.childNodes.length);

  var child2 = document.createElement('div');
  goog.dom.insertChildAt(parent, child2, origNumChildren + 42);
  assertEquals(origNumChildren + 2, parent.childNodes.length);

  var child3 = document.createElement('div');
  goog.dom.insertChildAt(parent, child3, 0);
  assertEquals(origNumChildren + 3, parent.childNodes.length);

  var child4 = document.createElement('div');
  goog.dom.insertChildAt(parent, child3, 2);
  assertEquals(origNumChildren + 3, parent.childNodes.length);

  parent.removeChild(child1);
  parent.removeChild(child2);
  parent.removeChild(child3);

  var emptyParentNotInDocument = document.createElement('div');
  goog.dom.insertChildAt(emptyParentNotInDocument, child1, 0);
  assertEquals(1, emptyParentNotInDocument.childNodes.length);
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

function testIsWindow() {
  var global = goog.global;
  var frame = window.frames['frame'];
  var otherWindow = window.open('', 'blank');
  var object = {window: goog.global};
  var nullVar = null;
  var notDefined;

  try {
    // Use try/finally to ensure that we clean up the window we open, even if an
    // assertion fails or something else goes wrong.
    assertTrue('global object in HTML context should be a window',
               goog.dom.isWindow(goog.global));
    assertTrue('iframe window should be a window', goog.dom.isWindow(frame));
    if (otherWindow) {
      assertTrue('other window should be a window',
                 goog.dom.isWindow(otherWindow));
    }
    assertFalse('object should not be a window', goog.dom.isWindow(object));
    assertFalse('null should not be a window', goog.dom.isWindow(nullVar));
    assertFalse('undefined should not be a window',
                goog.dom.isWindow(notDefined));
  } finally {
    if (otherWindow) {
      otherWindow.close();
    }
  }
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

  // Test with an undefined firstElementChild attribute.
  var b2 = $('b2');
  var mockP2 = {
      childNodes: [b1, b2],
      firstChild: b1,
      firstElementChild: undefined
  };

  b1 = goog.dom.getFirstElementChild(mockP2);
  assertNotNull('First element child of mockP2 should not be null', b1);
  assertEquals('First element child is b1', 'b1', b1.id);
}

function testGetLastElementChild() {
  var p2 = $('p2');
  var b2 = goog.dom.getLastElementChild(p2);
  assertNotNull('Last element child of p2 should not be null', b2);
  assertEquals('Last element child is b2', 'b2', b2.id);

  var c = goog.dom.getLastElementChild(b2);
  assertNull('Last element child of b2 should be null', c);

  // Test with an undefined lastElementChild attribute.
  var b1 = $('b1');
  var mockP2 = {
      childNodes: [b1, b2],
      lastChild: b2,
      lastElementChild: undefined
  };

  b2 = goog.dom.getLastElementChild(mockP2);
  assertNotNull('Last element child of mockP2 should not be null', b2);
  assertEquals('Last element child is b2', 'b2', b2.id);
}

function testGetNextElementSibling() {
  var b1 = $('b1');
  var b2 = goog.dom.getNextElementSibling(b1);
  assertNotNull('Next element sibling of b1 should not be null', b1);
  assertEquals('Next element sibling is b2', 'b2', b2.id);

  var c = goog.dom.getNextElementSibling(b2);
  assertNull('Next element sibling of b2 should be null', c);

  // Test with an undefined nextElementSibling attribute.
  var mockB1 = {
      nextSibling: b2,
      nextElementSibling: undefined
  };

  b2 = goog.dom.getNextElementSibling(mockB1);
  assertNotNull('Next element sibling of mockB1 should not be null', b1);
  assertEquals('Next element sibling is b2', 'b2', b2.id);
}

function testGetPreviousElementSibling() {
  var b2 = $('b2');
  var b1 = goog.dom.getPreviousElementSibling(b2);
  assertNotNull('Previous element sibling of b2 should not be null', b1);
  assertEquals('Previous element sibling is b1', 'b1', b1.id);

  var c = goog.dom.getPreviousElementSibling(b1);
  assertNull('Previous element sibling of b1 should be null', c);

  // Test with an undefined previousElementSibling attribute.
  var mockB2 = {
      previousSibling: b1,
      previousElementSibling: undefined
  };

  b1 = goog.dom.getPreviousElementSibling(mockB2);
  assertNotNull('Previous element sibling of mockB2 should not be null', b1);
  assertEquals('Previous element sibling is b1', 'b1', b1.id);
}

function testGetChildren() {
  var p2 = $('p2');
  var children = goog.dom.getChildren(p2);
  assertNotNull('Elements array should not be null', children);
  assertEquals('List of element children should be length two.', 2,
      children.length);

  var b1 = $('b1');
  var b2 = $('b2');
  assertObjectEquals('First element child should be b1.', b1, children[0]);
  assertObjectEquals('Second element child should be b2.', b2, children[1]);

  var noChildren = goog.dom.getChildren(b1);
  assertNotNull('Element children array should not be null', noChildren);
  assertEquals('List of element children should be length zero.', 0,
      noChildren.length);

  // Test with an undefined children attribute.
  var mockP2 = {
      childNodes: [b1, b2],
      children: undefined
  };

  children = goog.dom.getChildren(mockP2);
  assertNotNull('Elements array should not be null', children);
  assertEquals('List of element children should be length two.', 2,
      children.length);

  assertObjectEquals('First element child should be b1.', b1, children[0]);
  assertObjectEquals('Second element child should be b2.', b2, children[1]);
}

function testGetNextNode() {
  var tree = goog.dom.htmlToDocumentFragment(
      '<div>' +
      '<p>Some text</p>' +
      '<blockquote>Some <i>special</i> <b>text</b></blockquote>' +
      '<address><!-- comment -->Foo</address>' +
      '</div>');

  assertNull(goog.dom.getNextNode(null));

  var node = tree;
  var next = function() {
    return node = goog.dom.getNextNode(node);
  };

  assertEquals('P', next().tagName);
  assertEquals('Some text', next().nodeValue);
  assertEquals('BLOCKQUOTE', next().tagName);
  assertEquals('Some ', next().nodeValue);
  assertEquals('I', next().tagName);
  assertEquals('special', next().nodeValue);
  assertEquals(' ', next().nodeValue);
  assertEquals('B', next().tagName);
  assertEquals('text', next().nodeValue);
  assertEquals('ADDRESS', next().tagName);
  assertEquals(goog.dom.NodeType.COMMENT, next().nodeType);
  assertEquals('Foo', next().nodeValue);

  assertNull(next());
}

function testGetPreviousNode() {
  var tree = goog.dom.htmlToDocumentFragment(
      '<div>' +
      '<p>Some text</p>' +
      '<blockquote>Some <i>special</i> <b>text</b></blockquote>' +
      '<address><!-- comment -->Foo</address>' +
      '</div>');

  assertNull(goog.dom.getPreviousNode(null));

  var node = tree.lastChild.lastChild;
  var previous = function() {
    return node = goog.dom.getPreviousNode(node);
  };

  assertEquals(goog.dom.NodeType.COMMENT, previous().nodeType);
  assertEquals('ADDRESS', previous().tagName);
  assertEquals('text', previous().nodeValue);
  assertEquals('B', previous().tagName);
  assertEquals(' ', previous().nodeValue);
  assertEquals('special', previous().nodeValue);
  assertEquals('I', previous().tagName);
  assertEquals('Some ', previous().nodeValue);
  assertEquals('BLOCKQUOTE', previous().tagName);
  assertEquals('Some text', previous().nodeValue);
  assertEquals('P', previous().tagName);
  assertEquals('DIV', previous().tagName);

  if (!goog.userAgent.IE) {
    // Internet Explorer maintains a parentNode for Elements after they are
    // removed from the hierarchy. Everyone else agrees on a null parentNode.
    assertNull(previous());
  }
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
      goog.dom.isFocusableTabIndex(goog.dom.getElement('noTabIndex')));
  assertFalse('isFocusableTabIndex() must be false for tab index -2',
      goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndexNegative2')));
  assertFalse('isFocusableTabIndex() must be false for tab index -1',
      goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndexNegative1')));

  // WebKit on Mac doesn't support focusable DIVs until version 526 and later.
  if (!goog.userAgent.WEBKIT || !goog.userAgent.MAC ||
      goog.userAgent.isVersion('526')) {
    assertTrue('isFocusableTabIndex() must be true for tab index 0',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndex0')));
    assertTrue('isFocusableTabIndex() must be true for tab index 1',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndex1')));
    assertTrue('isFocusableTabIndex() must be true for tab index 2',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndex2')));
  }
}

function testSetFocusableTabIndex() {
  // WebKit on Mac doesn't support focusable DIVs until version 526 and later.
  if (!goog.userAgent.WEBKIT || !goog.userAgent.MAC ||
      goog.userAgent.isVersion('526')) {
    // Test enabling focusable tab index.
    goog.dom.setFocusableTabIndex(goog.dom.getElement('noTabIndex'), true);
    assertTrue('isFocusableTabIndex() must be true after enabling tab index',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('noTabIndex')));

    // Test disabling focusable tab index that was added programmatically.
    goog.dom.setFocusableTabIndex(goog.dom.getElement('noTabIndex'), false);
    assertFalse('isFocusableTabIndex() must be false after disabling tab ' +
        'index that was programmatically added',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('noTabIndex')));

    // Test disabling focusable tab index that was specified in markup.
    goog.dom.setFocusableTabIndex(goog.dom.getElement('tabIndex0'), false);
    assertFalse('isFocusableTabIndex() must be false after disabling tab ' +
        'index that was specified in markup',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndex0')));

    // Test re-enabling focusable tab index.
    goog.dom.setFocusableTabIndex(goog.dom.getElement('tabIndex0'), true);
    assertTrue('isFocusableTabIndex() must be true after reenabling tabindex',
        goog.dom.isFocusableTabIndex(goog.dom.getElement('tabIndex0')));
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
  t('a&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;b',
      goog.userAgent.IE ? 'a     b' : 'a\xA0\xA0\xA0\xA0\xA0b');
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
      case goog.dom.TagName.BASE:
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
        break;
    }
    var node = goog.dom.createDom(tag);
    assertEquals(tag + ' should ' + (expected ? '' : 'not ') +
        'have children', expected, goog.dom.canHaveChildren(node));

    // Make sure we can _actually_ add a child if we identify the node as
    // allowing children.
    if (goog.dom.canHaveChildren(node)) {
      node.appendChild(goog.dom.createDom('div', null, 'foo'));
    }
  }
}

function testGetAncestorNoMatch() {
  var elem = goog.dom.getElement('nestedElement');
  assertNull(goog.dom.getAncestor(elem, function() {return false;}));
}

function testGetAncestorMatchSelf() {
  var elem = goog.dom.getElement('nestedElement');
  var matched = goog.dom.getAncestor(elem, function() {return true;}, true);
  assertEquals(elem, matched);
}

function testGetAncestorNoMatchSelf() {
  var elem = goog.dom.getElement('nestedElement');
  var matched = goog.dom.getAncestor(elem, function() {return true;});
  assertEquals(elem.parentNode, matched);
}

function testGetAncestorWithMaxSearchStepsMatchSelf()  {
  var elem = goog.dom.getElement('nestedElement');
  var matched = goog.dom.getAncestor(
      elem, function() {return true;}, true, 2);
  assertEquals(elem, matched);
}

function testGetAncestorWithMaxSearchStepsMatch() {
  var elem = goog.dom.getElement('nestedElement');
  var searchEl = elem.parentNode.parentNode;
  var matched = goog.dom.getAncestor(
      elem, function(el) {return el == searchEl;}, false, 1);
  assertEquals(searchEl, matched);
}

function testGetAncestorWithMaxSearchStepsNoMatch() {
  var elem = goog.dom.getElement('nestedElement');
  var searchEl = elem.parentNode.parentNode;
  var matched = goog.dom.getAncestor(
      elem, function(el) {return el == searchEl;}, false, 0);
  assertNull(matched);
}

function testGetAncestorByTagNameNoMatch() {
  var elem = goog.dom.getElement('nestedElement');
  assertNull(
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.IMG));
}

function testGetAncestorByTagNameOnly() {
  var elem = goog.dom.getElement('nestedElement');
  var expected = goog.dom.getElement('testAncestorDiv');
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.DIV));
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, 'div'));
}

function testGetAncestorByClassNameNoMatch() {
  var elem = goog.dom.getElement('nestedElement');
  assertNull(
      goog.dom.getAncestorByClass(elem, 'bogusClassName'));
}

function testGetAncestorByClassName() {
  var elem = goog.dom.getElement('nestedElement');
  var expected = goog.dom.getElement('testAncestorP');
  assertEquals(expected,
      goog.dom.getAncestorByClass(elem, 'testAncestor'));
}

function testGetAncestorByTagNameAndClass() {
  var elem = goog.dom.getElement('nestedElement');
  var expected = goog.dom.getElement('testAncestorDiv');
  assertEquals(expected,
      goog.dom.getAncestorByTagNameAndClass(elem, goog.dom.TagName.DIV,
          'testAncestor'));
}

function testCreateTable() {
  var table = goog.dom.createTable(2, 3, true);
  assertEquals(2, table.getElementsByTagName(goog.dom.TagName.TR).length);
  assertEquals(3,
      table.getElementsByTagName(goog.dom.TagName.TR)[0].childNodes.length);
  assertEquals(6, table.getElementsByTagName(goog.dom.TagName.TD).length);
  assertEquals(goog.string.Unicode.NBSP,
      table.getElementsByTagName(goog.dom.TagName.TD)[0].firstChild.nodeValue);

  table = goog.dom.createTable(2, 3, false);
  assertEquals(2, table.getElementsByTagName(goog.dom.TagName.TR).length);
  assertEquals(3,
      table.getElementsByTagName(goog.dom.TagName.TR)[0].childNodes.length);
  assertEquals(6, table.getElementsByTagName(goog.dom.TagName.TD).length);
  assertEquals(0,
      table.getElementsByTagName(goog.dom.TagName.TD)[0].childNodes.length);
}

function testHtmlToDocumentFragment() {
  var docFragment = goog.dom.htmlToDocumentFragment('<a>1</a><b>2</b>');
  assertNull(docFragment.parentNode);
  assertEquals(2, docFragment.childNodes.length);

  var div = goog.dom.htmlToDocumentFragment('<div>3</div>');
  assertEquals('DIV', div.tagName);

  var script = goog.dom.htmlToDocumentFragment('<script></script>');
  assertEquals('SCRIPT', script.tagName);

  if (goog.userAgent.IE && !goog.userAgent.isVersion('9')) {
    // Removing an Element from a DOM tree in IE sets its parentNode to a new
    // DocumentFragment. Bizarre!
    assertEquals(goog.dom.NodeType.DOCUMENT_FRAGMENT,
                 goog.dom.removeNode(div).parentNode.nodeType);
  } else {
    assertNull(div.parentNode);
  }
}

function testAppend() {
  var div = document.createElement('div');
  var b = document.createElement('b');
  var c = document.createTextNode('c');
  goog.dom.append(div, 'a', b, c);
  assertEqualsCaseAndLeadingWhitespaceInsensitive('a<b></b>c', div.innerHTML);
}

function testAppend2() {
  var div = myIframeDoc.createElement('div');
  var b = myIframeDoc.createElement('b');
  var c = myIframeDoc.createTextNode('c');
  goog.dom.append(div, 'a', b, c);
  assertEqualsCaseAndLeadingWhitespaceInsensitive('a<b></b>c', div.innerHTML);
}

function testAppend3() {
  var div = document.createElement('div');
  var b = document.createElement('b');
  var c = document.createTextNode('c');
  goog.dom.append(div, ['a', b, c]);
  assertEqualsCaseAndLeadingWhitespaceInsensitive('a<b></b>c', div.innerHTML);
}

function testAppend4() {
  var div = document.createElement('div');
  var div2 = document.createElement('div');
  div2.innerHTML = 'a<b></b>c';
  goog.dom.append(div, div2.childNodes);
  assertEqualsCaseAndLeadingWhitespaceInsensitive('a<b></b>c', div.innerHTML);
  assertFalse(div2.hasChildNodes());
}

function testGetDocumentScroll() {
  // setUpPage added divForTestingScrolling to the DOM. It's not init'd here so
  // it can be shared amonst other tests.
  window.scrollTo(100, 100);

  assertEquals(100, goog.dom.getDocumentScroll().x);
  assertEquals(100, goog.dom.getDocumentScroll().y);
}

function testGetDocumentScrollOfFixedViewport() {
  // iOS and perhaps other environments don't actually support scrolling.
  // Instead, you view the document's fixed layout through a screen viewport.
  // We need getDocumentScroll to handle this case though.
  var fakeDocumentScrollElement = {scrollLeft: 0, scrollTop: 0};
  var fakeDocument = {
    defaultView: {pageXOffset: 100, pageYOffset: 100},
    documentElement: fakeDocumentScrollElement,
    body: fakeDocumentScrollElement
  };
  var dh = goog.dom.getDomHelper(document);
  dh.setDocument(fakeDocument);
  assertEquals(100, dh.getDocumentScroll().x);
  assertEquals(100, dh.getDocumentScroll().y);
}


/**
 * @return {boolean} Returns true if the userAgent is IE8.
 */
function isIE8() {
  return goog.userAgent.IE && goog.userAgent.product.isVersion('8') &&
      !goog.userAgent.product.isVersion('9');
}
