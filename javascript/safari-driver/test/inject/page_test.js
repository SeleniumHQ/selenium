goog.provide('safaridriver.inject.PageTest');

goog.require('goog.dom');
goog.require('goog.style');
goog.require('goog.testing.jsunit');
goog.require('safaridriver.inject.page');
goog.require('safaridriver.message.Load');
goog.require('safaridriver.message.MessageTarget');


var messageTarget;
var testFrame;


function TestFrame() {
  this.iframe_ = document.createElement('iframe');
  this.iframe_.width = '400';
  this.iframe_.height = '150';

  document.body.appendChild(this.iframe_);

  this.window = goog.dom.getFrameContentWindow(this.iframe_);
  this.document = goog.dom.getFrameContentDocument(this.iframe_);
  this.dom = goog.dom.getDomHelper(this.document);
}


TestFrame.prototype.dispose = function() {
  goog.dom.removeNode(this.iframe_);
  delete this.iframe_;
  delete this.document;
  delete this.dom;
};


function setUp() {
  messageTarget = new safaridriver.message.MessageTarget({
    addEventListener: goog.nullFunction,
    removeEventListener: goog.nullFunction
  });
  testFrame = new TestFrame();
}


function tearDown() {
  messageTarget.dispose();
  testFrame.dispose();
}


function testRemovesScriptNodeWhenLoadMessageIsReceived() {
  var fn = function() { window.foo = 'bar'; };
  safaridriver.inject.page.addToPage_(fn, messageTarget, testFrame.dom);

  var node = testFrame.document.documentElement.lastChild;
  assertNotNullNorUndefined(node);
  assertEquals(goog.dom.TagName.SCRIPT, node.tagName);
  assertEquals('application/javascript', node.type);
  assertEquals('', node.src);
  assertEquals('(' + fn + ').call({});', node.innerText);

  var message = {isSameOrigin: function() { return true; }};
  var event = {source: window};
  messageTarget.emit(safaridriver.message.Load.TYPE, message, event);

  assertArrayEquals([],
      messageTarget.listeners(safaridriver.message.Load.TYPE));
  assertNotEquals(node, testFrame.document.documentElement.lastChild);
}

function testExecutesDecompiledFunctionInPage() {
  var fn = function() { window.foo = 'bar'; };

  assertUndefined(window.foo);
  assertUndefined(testFrame.window.foo);

  safaridriver.inject.page.addToPage_(fn, messageTarget, testFrame.dom);

  assertUndefined(window.foo);
  assertEquals('bar', testFrame.window.foo);
}


function testAddingPageScriptToPageDoesNotScrollDocument() {
  assertEquals(0, testFrame.document.body.scrollTop);
  safaridriver.inject.page.addToPage_(goog.nullFunction, messageTarget,
      testFrame.dom);
  assertEquals(0, testFrame.document.body.scrollTop);
}
