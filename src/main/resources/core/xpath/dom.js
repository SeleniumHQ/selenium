// Copyright 2005 Google Inc.
// All Rights Reserved
//
// Author: Steffen Meschkat <mesch@google.com>
//
// An XML parse and a minimal DOM implementation that just supportes
// the subset of the W3C DOM that is used in the XSLT implementation.

// NOTE: The split() method in IE omits empty result strings. This is
// utterly annoying. So we don't use it here.

// Resolve entities in XML text fragments. According to the DOM
// specification, the DOM is supposed to resolve entity references at
// the API level. I.e. no entity references are passed through the
// API. See "Entities and the DOM core", p.12, DOM 2 Core
// Spec. However, different browsers actually pass very different
// values at the API. See <http://mesch.nyc/test-xml-quote>.
function xmlResolveEntities(s) {

  var parts = stringSplit(s, '&');

  var ret = parts[0];
  for (var i = 1; i < parts.length; ++i) {
    var rp = parts[i].indexOf(';');
    if (rp == -1) {
      // no entity reference: just a & but no ;
      ret += parts[i];
      continue;
    }

    var entityName = parts[i].substring(0, rp);
    var remainderText = parts[i].substring(rp + 1);

    var ch;
    switch (entityName) {
      case 'lt':
        ch = '<';
        break;
      case 'gt':
        ch = '>';
        break;
      case 'amp':
        ch = '&';
        break;
      case 'quot':
        ch = '"';
        break;
      case 'apos':
        ch = '\'';
        break;
      case 'nbsp':
        ch = String.fromCharCode(160);
        break;
      default:
        // Cool trick: let the DOM do the entity decoding. We assign
        // the entity text through non-W3C DOM properties and read it
        // through the W3C DOM. W3C DOM access is specified to resolve
        // entities.
        var span = domCreateElement(window.document, 'span');
        span.innerHTML = '&' + entityName + '; ';
        ch = span.childNodes[0].nodeValue.charAt(0);
    }
    ret += ch + remainderText;
  }

  return ret;
}

var XML10_TAGNAME_REGEXP = new RegExp('^(' + XML10_NAME + ')');
var XML10_ATTRIBUTE_REGEXP = new RegExp(XML10_ATTRIBUTE, 'g');

var XML11_TAGNAME_REGEXP = new RegExp('^(' + XML11_NAME + ')');
var XML11_ATTRIBUTE_REGEXP = new RegExp(XML11_ATTRIBUTE, 'g');

// Parses the given XML string with our custom, JavaScript XML parser. Written
// by Steffen Meschkat (mesch@google.com).
function xmlParse(xml) {
  var regex_empty = /\/$/;

  var regex_tagname;
  var regex_attribute;
  if (xml.match(/^<\?xml/)) {
    // When an XML document begins with an XML declaration
    // VersionInfo must appear.
    if (xml.search(new RegExp(XML10_VERSION_INFO)) == 5) {
      regex_tagname = XML10_TAGNAME_REGEXP;
      regex_attribute = XML10_ATTRIBUTE_REGEXP;
    } else if (xml.search(new RegExp(XML11_VERSION_INFO)) == 5) {
      regex_tagname = XML11_TAGNAME_REGEXP;
      regex_attribute = XML11_ATTRIBUTE_REGEXP;
    } else {
      // VersionInfo is missing, or unknown version number.
      // TODO : Fallback to XML 1.0 or XML 1.1, or just return null?
      alert('VersionInfo is missing, or unknown version number.');
    }
  } else {
    // When an XML declaration is missing it's an XML 1.0 document.
    regex_tagname = XML10_TAGNAME_REGEXP;
    regex_attribute = XML10_ATTRIBUTE_REGEXP;
  }

  var xmldoc = new XDocument();
  var root = xmldoc;

  // For the record: in Safari, we would create native DOM nodes, but
  // in Opera that is not possible, because the DOM only allows HTML
  // element nodes to be created, so we have to do our own DOM nodes.

  // xmldoc = document.implementation.createDocument('','',null);
  // root = xmldoc; // .createDocumentFragment();
  // NOTE(mesch): using the DocumentFragment instead of the Document
  // crashes my Safari 1.2.4 (v125.12).
  var stack = [];

  var parent = root;
  stack.push(parent);

  // The token that delimits a section that contains markup as
  // content: CDATA or comments.
  var slurp = '';

  var x = stringSplit(xml, '<');
  for (var i = 1; i < x.length; ++i) {
    var xx = stringSplit(x[i], '>');
    var tag = xx[0];
    var text = xmlResolveEntities(xx[1] || '');

    if (slurp) {
      // In a "slurp" section (CDATA or comment): only check for the
      // end of the section, otherwise append the whole text.
      var end = x[i].indexOf(slurp);
      if (end != -1) {
        var data = x[i].substring(0, end);
        parent.nodeValue += '<' + data;
        stack.pop();
        parent = stack[stack.length-1];
        text = x[i].substring(end + slurp.length);
        slurp = '';
      } else {
        parent.nodeValue += '<' + x[i];
        text = null;
      }

    } else if (tag.indexOf('![CDATA[') == 0) {
      var start = '![CDATA['.length;
      var end = x[i].indexOf(']]>');
      if (end != -1) {
        var data = x[i].substring(start, end);
        var node = domCreateCDATASection(xmldoc, data);
        domAppendChild(parent, node);
      } else {
        var data = x[i].substring(start);
        text = null;
        var node = domCreateCDATASection(xmldoc, data);
        domAppendChild(parent, node);
        parent = node;
        stack.push(node);
        slurp = ']]>';
      }

    } else if (tag.indexOf('!--') == 0) {
      var start = '!--'.length;
      var end = x[i].indexOf('-->');
      if (end != -1) {
        var data = x[i].substring(start, end);
        var node = domCreateComment(xmldoc, data);
        domAppendChild(parent, node);
      } else {
        var data = x[i].substring(start);
        text = null;
        var node = domCreateComment(xmldoc, data);
        domAppendChild(parent, node);
        parent = node;
        stack.push(node);
        slurp = '-->';
      }

    } else if (tag.charAt(0) == '/') {
      stack.pop();
      parent = stack[stack.length-1];

    } else if (tag.charAt(0) == '?') {
      // Ignore XML declaration and processing instructions
    } else if (tag.charAt(0) == '!') {
      // Ignore notation and comments
    } else {
      var empty = tag.match(regex_empty);
      var tagname = regex_tagname.exec(tag)[1];
      var node = domCreateElement(xmldoc, tagname);

      var att;
      while (att = regex_attribute.exec(tag)) {
        var val = xmlResolveEntities(att[5] || att[7] || '');
        domSetAttribute(node, att[1], val);
      }

      domAppendChild(parent, node);
      if (!empty) {
        parent = node;
        stack.push(node);
      }
    }

    if (text && parent != root) {
      domAppendChild(parent, domCreateTextNode(xmldoc, text));
    }
  }

  return root;
}

// Based on <http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/
// core.html#ID-1950641247>
var DOM_ELEMENT_NODE = 1;
var DOM_ATTRIBUTE_NODE = 2;
var DOM_TEXT_NODE = 3;
var DOM_CDATA_SECTION_NODE = 4;
var DOM_ENTITY_REFERENCE_NODE = 5;
var DOM_ENTITY_NODE = 6;
var DOM_PROCESSING_INSTRUCTION_NODE = 7;
var DOM_COMMENT_NODE = 8;
var DOM_DOCUMENT_NODE = 9;
var DOM_DOCUMENT_TYPE_NODE = 10;
var DOM_DOCUMENT_FRAGMENT_NODE = 11;
var DOM_NOTATION_NODE = 12;

// Traverses the element nodes in the DOM section underneath the given
// node and invokes the given callbacks as methods on every element
// node encountered. Function opt_pre is invoked before a node's
// children are traversed; opt_post is invoked after they are
// traversed. Traversal will not be continued if a callback function
// returns boolean false. NOTE(mesch): copied from
// <//google3/maps/webmaps/javascript/dom.js>.
function domTraverseElements(node, opt_pre, opt_post) {
  var ret;
  if (opt_pre) {
    ret = opt_pre.call(null, node);
    if (typeof ret == 'boolean' && !ret) {
      return false;
    }
  }

  for (var c = node.firstChild; c; c = c.nextSibling) {
    if (c.nodeType == DOM_ELEMENT_NODE) {
      ret = arguments.callee.call(this, c, opt_pre, opt_post);
      if (typeof ret == 'boolean' && !ret) {
        return false;
      }
    }
  }

  if (opt_post) {
    ret = opt_post.call(null, node);
    if (typeof ret == 'boolean' && !ret) {
      return false;
    }
  }
}

// Our W3C DOM Node implementation. Note we call it XNode because we
// can't define the identifier Node. We do this mostly for Opera,
// where we can't reuse the HTML DOM for parsing our own XML, and for
// Safari, where it is too expensive to have the template processor
// operate on native DOM nodes.
function XNode(type, name, opt_value, opt_owner) {
  this.attributes = [];
  this.childNodes = [];

  XNode.init.call(this, type, name, opt_value, opt_owner);
}

// Don't call as method, use apply() or call().
XNode.init = function(type, name, value, owner) {
  this.nodeType = type - 0;
  this.nodeName = '' + name;
  this.nodeValue = '' + value;
  this.ownerDocument = owner;

  this.firstChild = null;
  this.lastChild = null;
  this.nextSibling = null;
  this.previousSibling = null;
  this.parentNode = null;
}

XNode.unused_ = [];

XNode.recycle = function(node) {
  if (!node) {
    return;
  }

  if (node.constructor == XDocument) {
    XNode.recycle(node.documentElement);
    return;
  }

  if (node.constructor != this) {
    return;
  }

  XNode.unused_.push(node);
  for (var a = 0; a < node.attributes.length; ++a) {
    XNode.recycle(node.attributes[a]);
  }
  for (var c = 0; c < node.childNodes.length; ++c) {
    XNode.recycle(node.childNodes[c]);
  }
  node.attributes.length = 0;
  node.childNodes.length = 0;
  XNode.init.call(node, 0, '', '', null);
}

XNode.create = function(type, name, value, owner) {
  if (XNode.unused_.length > 0) {
    var node = XNode.unused_.pop();
    XNode.init.call(node, type, name, value, owner);
    return node;
  } else {
    return new XNode(type, name, value, owner);
  }
}

XNode.prototype.appendChild = function(node) {
  // firstChild
  if (this.childNodes.length == 0) {
    this.firstChild = node;
  }

  // previousSibling
  node.previousSibling = this.lastChild;

  // nextSibling
  node.nextSibling = null;
  if (this.lastChild) {
    this.lastChild.nextSibling = node;
  }

  // parentNode
  node.parentNode = this;

  // lastChild
  this.lastChild = node;

  // childNodes
  this.childNodes.push(node);
}


XNode.prototype.replaceChild = function(newNode, oldNode) {
  if (oldNode == newNode) {
    return;
  }

  for (var i = 0; i < this.childNodes.length; ++i) {
    if (this.childNodes[i] == oldNode) {
      this.childNodes[i] = newNode;

      var p = oldNode.parentNode;
      oldNode.parentNode = null;
      newNode.parentNode = p;

      p = oldNode.previousSibling;
      oldNode.previousSibling = null;
      newNode.previousSibling = p;
      if (newNode.previousSibling) {
        newNode.previousSibling.nextSibling = newNode;
      }

      p = oldNode.nextSibling;
      oldNode.nextSibling = null;
      newNode.nextSibling = p;
      if (newNode.nextSibling) {
        newNode.nextSibling.previousSibling = newNode;
      }

      if (this.firstChild == oldNode) {
        this.firstChild = newNode;
      }

      if (this.lastChild == oldNode) {
        this.lastChild = newNode;
      }

      break;
    }
  }
}


XNode.prototype.insertBefore = function(newNode, oldNode) {
  if (oldNode == newNode) {
    return;
  }

  if (oldNode.parentNode != this) {
    return;
  }

  if (newNode.parentNode) {
    newNode.parentNode.removeChild(newNode);
  }

  var newChildren = [];
  for (var i = 0; i < this.childNodes.length; ++i) {
    var c = this.childNodes[i];
    if (c == oldNode) {
      newChildren.push(newNode);

      newNode.parentNode = this;

      newNode.previousSibling = oldNode.previousSibling;
      oldNode.previousSibling = newNode;
      if (newNode.previousSibling) {
        newNode.previousSibling.nextSibling = newNode;
      }

      newNode.nextSibling = oldNode;

      if (this.firstChild == oldNode) {
        this.firstChild = newNode;
      }
    }
    newChildren.push(c);
  }
  this.childNodes = newChildren;
}


XNode.prototype.removeChild = function(node) {
  var newChildren = [];
  for (var i = 0; i < this.childNodes.length; ++i) {
    var c = this.childNodes[i];
    if (c != node) {
      newChildren.push(c);
    } else {
      if (c.previousSibling) {
        c.previousSibling.nextSibling = c.nextSibling;
      }
      if (c.nextSibling) {
        c.nextSibling.previousSibling = c.previousSibling;
      }
      if (this.firstChild == c) {
        this.firstChild = c.nextSibling;
      }
      if (this.lastChild == c) {
        this.lastChild = c.previousSibling;
      }
    }
  }
  this.childNodes = newChildren;
}


XNode.prototype.hasAttributes = function() {
  return this.attributes.length > 0;
}


XNode.prototype.setAttribute = function(name, value) {
  for (var i = 0; i < this.attributes.length; ++i) {
    if (this.attributes[i].nodeName == name) {
      this.attributes[i].nodeValue = '' + value;
      return;
    }
  }
  this.attributes.push(XNode.create(DOM_ATTRIBUTE_NODE, name, value, this));
}


XNode.prototype.getAttribute = function(name) {
  for (var i = 0; i < this.attributes.length; ++i) {
    if (this.attributes[i].nodeName == name) {
      return this.attributes[i].nodeValue;
    }
  }
  return null;
}


XNode.prototype.removeAttribute = function(name) {
  var a = [];
  for (var i = 0; i < this.attributes.length; ++i) {
    if (this.attributes[i].nodeName != name) {
      a.push(this.attributes[i]);
    }
  }
  this.attributes = a;
}


XNode.prototype.getElementsByTagName = function(name) {
  var ret = [];
  var self = this;
  if ("*" == name) {
    domTraverseElements(this, function(node) {
      if (self == node) return;
      ret.push(node);
    }, null);
  } else {
    domTraverseElements(this, function(node) {
      if (self == node) return;
      if (node.nodeName == name) {
        ret.push(node);
      }
    }, null);
  }
  return ret;
}


XNode.prototype.getElementById = function(id) {
  var ret = null;
  domTraverseElements(this, function(node) {
    if (node.getAttribute('id') == id) {
      ret = node;
      return false;
    }
  }, null);
  return ret;
}


function XDocument() {
  // NOTE(mesch): Acocording to the DOM Spec, ownerDocument of a
  // document node is null.
  XNode.call(this, DOM_DOCUMENT_NODE, '#document', null, null);
  this.documentElement = null;
}

XDocument.prototype = new XNode(DOM_DOCUMENT_NODE, '#document');

XDocument.prototype.clear = function() {
  XNode.recycle(this.documentElement);
  this.documentElement = null;
}

XDocument.prototype.appendChild = function(node) {
  XNode.prototype.appendChild.call(this, node);
  this.documentElement = this.childNodes[0];
}

XDocument.prototype.createElement = function(name) {
  return XNode.create(DOM_ELEMENT_NODE, name, null, this);
}

XDocument.prototype.createDocumentFragment = function() {
  return XNode.create(DOM_DOCUMENT_FRAGMENT_NODE, '#document-fragment',
                    null, this);
}

XDocument.prototype.createTextNode = function(value) {
  return XNode.create(DOM_TEXT_NODE, '#text', value, this);
}

XDocument.prototype.createAttribute = function(name) {
  return XNode.create(DOM_ATTRIBUTE_NODE, name, null, this);
}

XDocument.prototype.createComment = function(data) {
  return XNode.create(DOM_COMMENT_NODE, '#comment', data, this);
}

XDocument.prototype.createCDATASection = function(data) {
  return XNode.create(DOM_CDATA_SECTION_NODE, '#cdata-section', data, this);
}
