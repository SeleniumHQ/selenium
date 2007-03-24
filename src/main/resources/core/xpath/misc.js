// Copyright 2005 Google Inc.
// All Rights Reserved
//
// Miscellania that support the ajaxslt implementation.
//
// Author: Steffen Meschkat <mesch@google.com>
//

function el(i) {
  return document.getElementById(i);
}

function px(x) {
  return x + 'px';
}

// Split a string s at all occurrences of character c. This is like
// the split() method of the string object, but IE omits empty
// strings, which violates the invariant (s.split(x).join(x) == s).
function stringSplit(s, c) {
  var a = s.indexOf(c);
  if (a == -1) {
    return [ s ];
  }
  
  var parts = [];
  parts.push(s.substr(0,a));
  while (a != -1) {
    var a1 = s.indexOf(c, a + 1);
    if (a1 != -1) {
      parts.push(s.substr(a + 1, a1 - a - 1));
    } else {
      parts.push(s.substr(a + 1));
    } 
    a = a1;
  }

  return parts;
}

// Returns the text value if a node; for nodes without children this
// is the nodeValue, for nodes with children this is the concatenation
// of the value of all children.
function xmlValue(node) {
  if (!node) {
    return '';
  }

  var ret = '';
  if (node.nodeType == DOM_TEXT_NODE ||
      node.nodeType == DOM_CDATA_SECTION_NODE ||
      node.nodeType == DOM_ATTRIBUTE_NODE) {
    ret += node.nodeValue;

  } else if (node.nodeType == DOM_ELEMENT_NODE ||
             node.nodeType == DOM_DOCUMENT_NODE ||
             node.nodeType == DOM_DOCUMENT_FRAGMENT_NODE) {
    for (var i = 0; i < node.childNodes.length; ++i) {
      ret += arguments.callee(node.childNodes[i]);
    }
  }
  return ret;
}

// Returns the representation of a node as XML text.
function xmlText(node) {
  var ret = '';
  if (node.nodeType == DOM_TEXT_NODE) {
    ret += xmlEscapeText(node.nodeValue);
    
  } else if (node.nodeType == DOM_ELEMENT_NODE) {
    ret += '<' + node.nodeName;
    for (var i = 0; i < node.attributes.length; ++i) {
      var a = node.attributes[i];
      if (a && a.nodeName && a.nodeValue) {
        ret += ' ' + a.nodeName;
        ret += '="' + xmlEscapeAttr(a.nodeValue) + '"';
      }
    }

    if (node.childNodes.length == 0) {
      ret += '/>';

    } else {
      ret += '>';
      for (var i = 0; i < node.childNodes.length; ++i) {
        ret += arguments.callee(node.childNodes[i]);
      }
      ret += '</' + node.nodeName + '>';
    }
    
  } else if (node.nodeType == DOM_DOCUMENT_NODE || 
             node.nodeType == DOM_DOCUMENT_FRAGMENT_NODE) {
    for (var i = 0; i < node.childNodes.length; ++i) {
      ret += arguments.callee(node.childNodes[i]);
    }
  }
  
  return ret;
}

// Applies the given function to each element of the array.
function mapExec(array, func) {
  for (var i = 0; i < array.length; ++i) {
    func(array[i]);
  }
}

// Returns an array that contains the return value of the given
// function applied to every element of the input array.
function mapExpr(array, func) {
  var ret = [];
  for (var i = 0; i < array.length; ++i) {
    ret.push(func(array[i]));
  }
  return ret;
};

// Reverses the given array in place.
function reverseInplace(array) {
  for (var i = 0; i < array.length / 2; ++i) {
    var h = array[i];
    var ii = array.length - i - 1;
    array[i] = array[ii];
    array[ii] = h;
  }
}

// Shallow-copies an array.
function copyArray(dst, src) { 
  for (var i = 0; i < src.length; ++i) {
    dst.push(src[i]);
  }
}

function assert(b) {
  if (!b) {
    throw 'assertion failed';
  }
}

// Based on
// <http://www.w3.org/TR/2000/REC-DOM-Level-2-Core-20001113/core.html#ID-1950641247>
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


var xpathdebug = false; // trace xpath parsing
var xsltdebug = false; // trace xslt processing


// Escape XML special markup chracters: tag delimiter < > and entity
// reference start delimiter &. The escaped string can be used in XML
// text portions (i.e. between tags).
function xmlEscapeText(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Escape XML special markup characters: tag delimiter < > entity
// reference start delimiter & and quotes ". The escaped string can be
// used in double quoted XML attribute value portions (i.e. in
// attributes within start tags).
function xmlEscapeAttr(s) {
  return xmlEscapeText(s).replace(/\"/g, '&quot;');
}

// Escape markup in XML text, but don't touch entity references. The
// escaped string can be used as XML text (i.e. between tags).
function xmlEscapeTags(s) {
  return s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// An implementation of the debug log. 

var logging__ = false;

function Log() {};

Log.lines = [];

Log.write = function(s) {
  if (logging__) {
    this.lines.push(xmlEscapeText(s));
    this.show();
  }
};

// Writes the given XML with every tag on a new line.
Log.writeXML = function(xml) {
  if (logging__) {
    var s0 = xml.replace(/</g, '\n<');
    var s1 = xmlEscapeText(s0);
    var s2 = s1.replace(/\s*\n(\s|\n)*/g, '<br/>');
    this.lines.push(s2);
    this.show();
  }
}

// Writes without any escaping
Log.writeRaw = function(s) {
  if (logging__) {
    this.lines.push(s);
    this.show();
  }
}

Log.clear = function() {
  if (logging__) {
    var l = this.div();
    l.innerHTML = '';
    this.lines = [];
  }
}

Log.show = function() {
  var l = this.div();
  l.innerHTML += this.lines.join('<br/>') + '<br/>';
  this.lines = [];
  l.scrollTop = l.scrollHeight;
}

Log.div = function() {
  var l = document.getElementById('log');
  if (!l) {
    l = document.createElement('div');
    l.id = 'log';
    l.style.position = 'absolute';
    l.style.right = '5px';
    l.style.top = '5px';
    l.style.width = '250px';
    l.style.height = '150px';
    l.style.overflow = 'auto';
    l.style.backgroundColor = '#f0f0f0';
    l.style.border = '1px solid gray';
    l.style.fontSize = '10px';
    l.style.padding = '5px';
    document.body.appendChild(l);
  }
  return l;
}


function Timer() {}
Timer.start = function() {}
Timer.end = function() {}
