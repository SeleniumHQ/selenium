/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.dom");

dojo.dom.ELEMENT_NODE                  = 1;
dojo.dom.ATTRIBUTE_NODE                = 2;
dojo.dom.TEXT_NODE                     = 3;
dojo.dom.CDATA_SECTION_NODE            = 4;
dojo.dom.ENTITY_REFERENCE_NODE         = 5;
dojo.dom.ENTITY_NODE                   = 6;
dojo.dom.PROCESSING_INSTRUCTION_NODE   = 7;
dojo.dom.COMMENT_NODE                  = 8;
dojo.dom.DOCUMENT_NODE                 = 9;
dojo.dom.DOCUMENT_TYPE_NODE            = 10;
dojo.dom.DOCUMENT_FRAGMENT_NODE        = 11;
dojo.dom.NOTATION_NODE                 = 12;
	
dojo.dom.dojoml = "http://www.dojotoolkit.org/2004/dojoml";

/**
 *	comprehensive list of XML namespaces
**/
dojo.dom.xmlns = {
	//	summary
	//	aliases for various common XML namespaces
	svg : "http://www.w3.org/2000/svg",
	smil : "http://www.w3.org/2001/SMIL20/",
	mml : "http://www.w3.org/1998/Math/MathML",
	cml : "http://www.xml-cml.org",
	xlink : "http://www.w3.org/1999/xlink",
	xhtml : "http://www.w3.org/1999/xhtml",
	xul : "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	xbl : "http://www.mozilla.org/xbl",
	fo : "http://www.w3.org/1999/XSL/Format",
	xsl : "http://www.w3.org/1999/XSL/Transform",
	xslt : "http://www.w3.org/1999/XSL/Transform",
	xi : "http://www.w3.org/2001/XInclude",
	xforms : "http://www.w3.org/2002/01/xforms",
	saxon : "http://icl.com/saxon",
	xalan : "http://xml.apache.org/xslt",
	xsd : "http://www.w3.org/2001/XMLSchema",
	dt: "http://www.w3.org/2001/XMLSchema-datatypes",
	xsi : "http://www.w3.org/2001/XMLSchema-instance",
	rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs : "http://www.w3.org/2000/01/rdf-schema#",
	dc : "http://purl.org/dc/elements/1.1/",
	dcq: "http://purl.org/dc/qualifiers/1.0",
	"soap-env" : "http://schemas.xmlsoap.org/soap/envelope/",
	wsdl : "http://schemas.xmlsoap.org/wsdl/",
	AdobeExtensions : "http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
};

dojo.dom.isNode = function(/* object */wh){
	//	summary
	//	checks to see if wh is actually a node.
	if(typeof Element == "function") {
		try {
			return wh instanceof Element;	//	boolean
		} catch(E) {}
	} else {
		// best-guess
		return wh && !isNaN(wh.nodeType);	//	boolean
	}
}

dojo.dom.getUniqueId = function(){
	//	summary
	//	returns a unique string for use with any DOM element
	var _document = dojo.doc();
	do {
		var id = "dj_unique_" + (++arguments.callee._idIncrement);
	}while(_document.getElementById(id));
	return id;	//	string
}
dojo.dom.getUniqueId._idIncrement = 0;

dojo.dom.firstElement = dojo.dom.getFirstChildElement = function(/* Element */parentNode, /* string? */tagName){
	//	summary
	//	returns the first child element matching tagName
	var node = parentNode.firstChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE){
		node = node.nextSibling;
	}
	if(tagName && node && node.tagName && node.tagName.toLowerCase() != tagName.toLowerCase()) {
		node = dojo.dom.nextElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.lastElement = dojo.dom.getLastChildElement = function(/* Element */parentNode, /* string? */tagName){
	//	summary
	//	returns the last child element matching tagName
	var node = parentNode.lastChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE) {
		node = node.previousSibling;
	}
	if(tagName && node && node.tagName && node.tagName.toLowerCase() != tagName.toLowerCase()) {
		node = dojo.dom.prevElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.nextElement = dojo.dom.getNextSiblingElement = function(/* Node */node, /* string? */tagName){
	//	summary
	//	returns the next sibling element matching tagName
	if(!node) { return null; }
	do {
		node = node.nextSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);

	if(node && tagName && tagName.toLowerCase() != node.tagName.toLowerCase()) {
		return dojo.dom.nextElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.prevElement = dojo.dom.getPreviousSiblingElement = function(/* Node */node, /* string? */tagName){
	//	summary
	//	returns the previous sibling element matching tagName
	if(!node) { return null; }
	if(tagName) { tagName = tagName.toLowerCase(); }
	do {
		node = node.previousSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);

	if(node && tagName && tagName.toLowerCase() != node.tagName.toLowerCase()) {
		return dojo.dom.prevElement(node, tagName);
	}
	return node;	//	Element
}

// TODO: hmph
/*this.forEachChildTag = function(node, unaryFunc) {
	var child = this.getFirstChildTag(node);
	while(child) {
		if(unaryFunc(child) == "break") { break; }
		child = this.getNextSiblingTag(child);
	}
}*/

dojo.dom.moveChildren = function(/* Element */srcNode, /* Element */destNode, /* boolean? */trim){
	//	summary
	//	Moves children from srcNode to destNode and returns the count of children moved; 
	//		will trim off text nodes if trim == true
	var count = 0;
	if(trim) {
		while(srcNode.hasChildNodes() &&
			srcNode.firstChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.firstChild);
		}
		while(srcNode.hasChildNodes() &&
			srcNode.lastChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.lastChild);
		}
	}
	while(srcNode.hasChildNodes()){
		destNode.appendChild(srcNode.firstChild);
		count++;
	}
	return count;	//	number
}

dojo.dom.copyChildren = function(/* Element */srcNode, /* Element */destNode, /* boolean? */trim){
	//	summary
	//	Copies children from srcNde to destNode and returns the count of children copied;
	//		will trim off text nodes if trim == true
	var clonedNode = srcNode.cloneNode(true);
	return this.moveChildren(clonedNode, destNode, trim);	//	number
}

dojo.dom.removeChildren = function(/* Element */node){
	//	summary
	//	removes all children from node and returns the count of children removed.
	var count = node.childNodes.length;
	while(node.hasChildNodes()){ node.removeChild(node.firstChild); }
	return count;	//	number
}

dojo.dom.replaceChildren = function(/* Element */node, /* Node */newChild){
	//	summary
	//	Removes all children of node and appends newChild
	// FIXME: what if newChild is an array-like object?
	dojo.dom.removeChildren(node);
	node.appendChild(newChild);
}

dojo.dom.removeNode = function(/* Node */node){
	//	summary
	//	if node has a parent, removes node from parent and returns a reference to the removed child.
	if(node && node.parentNode){
		// return a ref to the removed child
		return node.parentNode.removeChild(node);	//	Node
	}
}

dojo.dom.getAncestors = function(/* Node */node, /* function? */filterFunction, /* boolean? */returnFirstHit) {
	//	summary
	//	returns all ancestors matching optional filterFunction; will return only the first if returnFirstHit
	var ancestors = [];
	var isFunction = (filterFunction && (filterFunction instanceof Function || typeof filterFunction == "function"));
	while(node) {
		if (!isFunction || filterFunction(node)) {
			ancestors.push(node);
		}
		if (returnFirstHit && ancestors.length > 0) { 
			return ancestors[0]; 	//	Node
		}
		
		node = node.parentNode;
	}
	if (returnFirstHit) { return null; }
	return ancestors;	//	array
}

dojo.dom.getAncestorsByTag = function(/* Node */node, /* string */tag, /* boolean? */returnFirstHit) {
	//	summary
	//	returns all ancestors matching tag (as tagName), will only return first one if returnFirstHit
	tag = tag.toLowerCase();
	return dojo.dom.getAncestors(node, function(el){
		return ((el.tagName)&&(el.tagName.toLowerCase() == tag));
	}, returnFirstHit);	//	Node || array
}

dojo.dom.getFirstAncestorByTag = function(/* Node */node, /* string */tag) {
	//	summary
	//	Returns first ancestor of node with tag tagName
	return dojo.dom.getAncestorsByTag(node, tag, true);	//	Node
}

dojo.dom.isDescendantOf = function(/* Node */node, /* Node */ancestor, /* boolean? */guaranteeDescendant){
	//	summary
	//	Returns boolean if node is a descendant of ancestor
	// guaranteeDescendant allows us to be a "true" isDescendantOf function
	if(guaranteeDescendant && node) { node = node.parentNode; }
	while(node) {
		if(node == ancestor){ 
			return true; 	//	boolean
		}
		node = node.parentNode;
	}
	return false;	//	boolean
}

dojo.dom.innerXML = function(/* Node */node){
	//	summary
	//	Implementation of MS's innerXML function.
	if(node.innerXML){
		return node.innerXML;	//	string
	}else if (node.xml){
		return node.xml;		//	string
	}else if(typeof XMLSerializer != "undefined"){
		return (new XMLSerializer()).serializeToString(node);	//	string
	}
}

dojo.dom.createDocument = function(){
	//	summary
	//	cross-browser implementation of creating an XML document object.
	var doc = null;
	var _document = dojo.doc();

	if(!dj_undef("ActiveXObject")){
		var prefixes = [ "MSXML2", "Microsoft", "MSXML", "MSXML3" ];
		for(var i = 0; i<prefixes.length; i++){
			try{
				doc = new ActiveXObject(prefixes[i]+".XMLDOM");
			}catch(e){ /* squelch */ };

			if(doc){ break; }
		}
	}else if((_document.implementation)&&
		(_document.implementation.createDocument)){
		doc = _document.implementation.createDocument("", "", null);
	}
	
	return doc;	//	DOMDocument
}

dojo.dom.createDocumentFromText = function(/* string */str, /* string? */mimetype){
	//	summary
	//	attempts to create a Document object based on optional mime-type, using str as the contents of the document
	if(!mimetype){ mimetype = "text/xml"; }
	if(!dj_undef("DOMParser")){
		var parser = new DOMParser();
		return parser.parseFromString(str, mimetype);	//	DOMDocument
	}else if(!dj_undef("ActiveXObject")){
		var domDoc = dojo.dom.createDocument();
		if(domDoc){
			domDoc.async = false;
			domDoc.loadXML(str);
			return domDoc;	//	DOMDocument
		}else{
			dojo.debug("toXml didn't work?");
		}
	/*
	}else if((dojo.render.html.capable)&&(dojo.render.html.safari)){
		// FIXME: this doesn't appear to work!
		// from: http://web-graphics.com/mtarchive/001606.php
		// var xml = '<?xml version="1.0"?>'+str;
		var mtype = "text/xml";
		var xml = '<?xml version="1.0"?>'+str;
		var url = "data:"+mtype+";charset=utf-8,"+encodeURIComponent(xml);
		var req = new XMLHttpRequest();
		req.open("GET", url, false);
		req.overrideMimeType(mtype);
		req.send(null);
		return req.responseXML;
	*/
	}else{
		var _document = dojo.doc();
		if(_document.createElement){
			// FIXME: this may change all tags to uppercase!
			var tmp = _document.createElement("xml");
			tmp.innerHTML = str;
			if(_document.implementation && _document.implementation.createDocument) {
				var xmlDoc = _document.implementation.createDocument("foo", "", null);
				for(var i = 0; i < tmp.childNodes.length; i++) {
					xmlDoc.importNode(tmp.childNodes.item(i), true);
				}
				return xmlDoc;	//	DOMDocument
			}
			// FIXME: probably not a good idea to have to return an HTML fragment
			// FIXME: the tmp.doc.firstChild is as tested from IE, so it may not
			// work that way across the board
			return ((tmp.document)&&
				(tmp.document.firstChild ?  tmp.document.firstChild : tmp));	//	DOMDocument
		}
	}
	return null;
}

dojo.dom.prependChild = function(/* Element */node, /* Element */parent) {
	// summary
	//	prepends node to parent's children nodes
	if(parent.firstChild) {
		parent.insertBefore(node, parent.firstChild);
	} else {
		parent.appendChild(node);
	}
	return true;	//	boolean
}

dojo.dom.insertBefore = function(/* Node */node, /* Node */ref, /* boolean? */force){
	//	summary
	//	Try to insert node before ref
	if (force != true &&
		(node === ref || node.nextSibling === ref)){ return false; }
	var parent = ref.parentNode;
	parent.insertBefore(node, ref);
	return true;	//	boolean
}

dojo.dom.insertAfter = function(/* Node */node, /* Node */ref, /* boolean? */force){
	//	summary
	//	Try to insert node after ref
	var pn = ref.parentNode;
	if(ref == pn.lastChild){
		if((force != true)&&(node === ref)){
			return false;	//	boolean
		}
		pn.appendChild(node);
	}else{
		return this.insertBefore(node, ref.nextSibling, force);	//	boolean
	}
	return true;	//	boolean
}

dojo.dom.insertAtPosition = function(/* Node */node, /* Node */ref, /* string */position){
	//	summary
	//	attempt to insert node in relation to ref based on position
	if((!node)||(!ref)||(!position)){ 
		return false;	//	boolean 
	}
	switch(position.toLowerCase()){
		case "before":
			return dojo.dom.insertBefore(node, ref);	//	boolean
		case "after":
			return dojo.dom.insertAfter(node, ref);		//	boolean
		case "first":
			if(ref.firstChild){
				return dojo.dom.insertBefore(node, ref.firstChild);	//	boolean
			}else{
				ref.appendChild(node);
				return true;	//	boolean
			}
			break;
		default: // aka: last
			ref.appendChild(node);
			return true;	//	boolean
	}
}

dojo.dom.insertAtIndex = function(/* Node */node, /* Element */containingNode, /* number */insertionIndex){
	//	summary
	//	insert node into child nodes nodelist of containingNode at insertionIndex.
	var siblingNodes = containingNode.childNodes;

	// if there aren't any kids yet, just add it to the beginning

	if (!siblingNodes.length){
		containingNode.appendChild(node);
		return true;	//	boolean
	}

	// otherwise we need to walk the childNodes
	// and find our spot

	var after = null;

	for(var i=0; i<siblingNodes.length; i++){

		var sibling_index = siblingNodes.item(i)["getAttribute"] ? parseInt(siblingNodes.item(i).getAttribute("dojoinsertionindex")) : -1;

		if (sibling_index < insertionIndex){
			after = siblingNodes.item(i);
		}
	}

	if (after){
		// add it after the node in {after}

		return dojo.dom.insertAfter(node, after);	//	boolean
	}else{
		// add it to the start

		return dojo.dom.insertBefore(node, siblingNodes.item(0));	//	boolean
	}
}
	
dojo.dom.textContent = function(/* Node */node, /* string */text){
	//	summary
	//	implementation of the DOM Level 3 attribute; scan node for text
	if (arguments.length>1) {
		var _document = dojo.doc();
		dojo.dom.replaceChildren(node, _document.createTextNode(text));
		return text;	//	string
	} else {
		if(node.textContent != undefined){ //FF 1.5
			return node.textContent;	//	string
		}
		var _result = "";
		if (node == null) { return _result; }
		for (var i = 0; i < node.childNodes.length; i++) {
			switch (node.childNodes[i].nodeType) {
				case 1: // ELEMENT_NODE
				case 5: // ENTITY_REFERENCE_NODE
					_result += dojo.dom.textContent(node.childNodes[i]);
					break;
				case 3: // TEXT_NODE
				case 2: // ATTRIBUTE_NODE
				case 4: // CDATA_SECTION_NODE
					_result += node.childNodes[i].nodeValue;
					break;
				default:
					break;
			}
		}
		return _result;	//	string
	}
}

dojo.dom.hasParent = function (/* Node */node) {
	//	summary
	//	returns whether or not node is a child of another node.
	return node && node.parentNode && dojo.dom.isNode(node.parentNode);	//	boolean
}

/**
 * Examples:
 *
 * myFooNode = <foo />
 * isTag(myFooNode, "foo"); // returns "foo"
 * isTag(myFooNode, "bar"); // returns ""
 * isTag(myFooNode, "FOO"); // returns ""
 * isTag(myFooNode, "hey", "foo", "bar"); // returns "foo"
**/
dojo.dom.isTag = function(/* Node */node /* ... */) {
	//	summary
	//	determines if node has any of the provided tag names and returns the tag name that matches, empty string otherwise.
	if(node && node.tagName) {
		for(var i=1; i<arguments.length; i++){
			if(node.tagName==String(arguments[i])){
				return String(arguments[i]);	//	string
			}
		}
	}
	return "";	//	string
}

dojo.dom.setAttributeNS = function(/* Element */elem, /* string */namespaceURI, /* string */attrName, /* string */attrValue){
	//	summary
	//	implementation of DOM2 setAttributeNS that works cross browser.
	if(elem == null || ((elem == undefined)&&(typeof elem == "undefined"))){
		dojo.raise("No element given to dojo.dom.setAttributeNS");
	}
	
	if(!((elem.setAttributeNS == undefined)&&(typeof elem.setAttributeNS == "undefined"))){ // w3c
		elem.setAttributeNS(namespaceURI, attrName, attrValue);
	}else{ // IE
		// get a root XML document
		var ownerDoc = elem.ownerDocument;
		var attribute = ownerDoc.createNode(
			2, // node type
			attrName,
			namespaceURI
		);
		
		// set value
		attribute.nodeValue = attrValue;
		
		// attach to element
		elem.setAttributeNode(attribute);
	}
}
