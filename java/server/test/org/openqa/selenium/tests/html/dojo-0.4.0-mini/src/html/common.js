/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.html.common");
dojo.require("dojo.lang.common");
dojo.require("dojo.dom");

dojo.lang.mixin(dojo.html, dojo.dom);

dojo.html.body = function(){
	dojo.deprecated("dojo.html.body() moved to dojo.body()", "0.5");
	return dojo.body();
}

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS.
// Need to investigate for KHTML and Opera

dojo.html.getEventTarget = function(/* DOMEvent */evt){
	//	summary
	//	Returns the target of an event
	if(!evt) { evt = dojo.global().event || {} };
	var t = (evt.srcElement ? evt.srcElement : (evt.target ? evt.target : null));
	while((t)&&(t.nodeType!=1)){ t = t.parentNode; }
	return t;	//	HTMLElement
}

dojo.html.getViewport = function(){
	//	summary
	//	Returns the dimensions of the viewable area of a browser window
	var _window = dojo.global();
	var _document = dojo.doc();
	var w = 0;
	var h = 0;

	if(dojo.render.html.mozilla){
		// mozilla
		w = _document.documentElement.clientWidth;
		h = _window.innerHeight;
	}else if(!dojo.render.html.opera && _window.innerWidth){
		//in opera9, dojo.body().clientWidth should be used, instead
		//of window.innerWidth/document.documentElement.clientWidth
		//so we have to check whether it is opera
		w = _window.innerWidth;
		h = _window.innerHeight;
	} else if (!dojo.render.html.opera && dojo.exists(_document, "documentElement.clientWidth")){
		// IE6 Strict
		var w2 = _document.documentElement.clientWidth;
		// this lets us account for scrollbars
		if(!w || w2 && w2 < w) {
			w = w2;
		}
		h = _document.documentElement.clientHeight;
	} else if (dojo.body().clientWidth){
		// IE, Opera
		w = dojo.body().clientWidth;
		h = dojo.body().clientHeight;
	}
	return { width: w, height: h };	//	object
}

dojo.html.getScroll = function(){
	//	summary
	//	Returns the scroll position of the document
	var _window = dojo.global();
	var _document = dojo.doc();
	var top = _window.pageYOffset || _document.documentElement.scrollTop || dojo.body().scrollTop || 0;
	var left = _window.pageXOffset || _document.documentElement.scrollLeft || dojo.body().scrollLeft || 0;
	return { 
		top: top, 
		left: left, 
		offset:{ x: left, y: top }	//	note the change, NOT an Array with added properties. 
	};	//	object
}

dojo.html.getParentByType = function(/* HTMLElement */node, /* string */type) {
	//	summary
	//	Returns the first ancestor of node with tagName type.
	var _document = dojo.doc();
	var parent = dojo.byId(node);
	type = type.toLowerCase();
	while((parent)&&(parent.nodeName.toLowerCase()!=type)){
		if(parent==(_document["body"]||_document["documentElement"])){
			return null;
		}
		parent = parent.parentNode;
	}
	return parent;	//	HTMLElement
}

dojo.html.getAttribute = function(/* HTMLElement */node, /* string */attr){
	//	summary
	//	Returns the value of attribute attr from node.
	node = dojo.byId(node);
	// FIXME: need to add support for attr-specific accessors
	if((!node)||(!node.getAttribute)){
		// if(attr !== 'nwType'){
		//	alert("getAttr of '" + attr + "' with bad node"); 
		// }
		return null;
	}
	var ta = typeof attr == 'string' ? attr : new String(attr);

	// first try the approach most likely to succeed
	var v = node.getAttribute(ta.toUpperCase());
	if((v)&&(typeof v == 'string')&&(v!="")){ 
		return v;	//	string 
	}

	// try returning the attributes value, if we couldn't get it as a string
	if(v && v.value){ 
		return v.value;	//	string 
	}

	// this should work on Opera 7, but it's a little on the crashy side
	if((node.getAttributeNode)&&(node.getAttributeNode(ta))){
		return (node.getAttributeNode(ta)).value;	//	string
	}else if(node.getAttribute(ta)){
		return node.getAttribute(ta);	//	string
	}else if(node.getAttribute(ta.toLowerCase())){
		return node.getAttribute(ta.toLowerCase());	//	string
	}
	return null;	//	string
}
	
dojo.html.hasAttribute = function(/* HTMLElement */node, /* string */attr){
	//	summary
	//	Determines whether or not the specified node carries a value for the attribute in question.
	return dojo.html.getAttribute(dojo.byId(node), attr) ? true : false;	//	boolean
}
	
dojo.html.getCursorPosition = function(/* DOMEvent */e){
	//	summary
	//	Returns the mouse position relative to the document (not the viewport).
	//	For example, if you have a document that is 10000px tall,
	//	but your browser window is only 100px tall,
	//	if you scroll to the bottom of the document and call this function it
	//	will return {x: 0, y: 10000}
	//	NOTE: for events delivered via dojo.event.connect() and/or dojoAttachEvent (for widgets),
	//	you can just access evt.pageX and evt.pageY, rather than calling this function.
	e = e || dojo.global().event;
	var cursor = {x:0, y:0};
	if(e.pageX || e.pageY){
		cursor.x = e.pageX;
		cursor.y = e.pageY;
	}else{
		var de = dojo.doc().documentElement;
		var db = dojo.body();
		cursor.x = e.clientX + ((de||db)["scrollLeft"]) - ((de||db)["clientLeft"]);
		cursor.y = e.clientY + ((de||db)["scrollTop"]) - ((de||db)["clientTop"]);
	}
	return cursor;	//	object
}

dojo.html.isTag = function(/* HTMLElement */node) {
	//	summary
	//	Like dojo.dom.isTag, except case-insensitive
	node = dojo.byId(node);
	if(node && node.tagName) {
		for (var i=1; i<arguments.length; i++){
			if (node.tagName.toLowerCase()==String(arguments[i]).toLowerCase()){
				return String(arguments[i]).toLowerCase();	//	string
			}
		}
	}
	return "";	//	string
}

//define dojo.html.createExternalElement for IE to workaround the annoying activation "feature" in new IE
//details: http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/overview/activating_activex.asp
if(dojo.render.html.ie && !dojo.render.html.ie70){
	//only define createExternalElement for IE in none https to avoid "mixed content" warning dialog
	if(window.location.href.substr(0,6).toLowerCase() != "https:"){
		(function(){
			// FIXME: this seems not to work correctly on IE 7!!

			//The trick is to define a function in a script.src property:
			// <script src="javascript:'function createExternalElement(){...}'"></script>,
			//which will be treated as an external javascript file in IE
			var xscript = dojo.doc().createElement('script');
			xscript.src = "javascript:'dojo.html.createExternalElement=function(doc, tag){ return doc.createElement(tag); }'";
			dojo.doc().getElementsByTagName("head")[0].appendChild(xscript);
		})();
	}
}else{
	//for other browsers, simply use document.createElement
	//is enough
	dojo.html.createExternalElement = function(/* HTMLDocument */doc, /* string */tag){
		//	summary
		//	Creates an element in the HTML document, here for ActiveX activation workaround.
		return doc.createElement(tag);	//	HTMLElement
	}
}

dojo.html._callDeprecated = function(inFunc, replFunc, args, argName, retValue){
	dojo.deprecated("dojo.html." + inFunc,
					"replaced by dojo.html." + replFunc + "(" + (argName ? "node, {"+ argName + ": " + argName + "}" : "" ) + ")" + (retValue ? "." + retValue : ""), "0.5");
	var newArgs = [];
	if(argName){ var argsIn = {}; argsIn[argName] = args[1]; newArgs.push(args[0]); newArgs.push(argsIn); }
	else { newArgs = args }
	var ret = dojo.html[replFunc].apply(dojo.html, args);
	if(retValue){ return ret[retValue]; }
	else { return ret; }
}

dojo.html.getViewportWidth = function(){
	return dojo.html._callDeprecated("getViewportWidth", "getViewport", arguments, null, "width");
}
dojo.html.getViewportHeight = function(){
	return dojo.html._callDeprecated("getViewportHeight", "getViewport", arguments, null, "height");
}
dojo.html.getViewportSize = function(){
	return dojo.html._callDeprecated("getViewportSize", "getViewport", arguments);
}
dojo.html.getScrollTop = function(){
	return dojo.html._callDeprecated("getScrollTop", "getScroll", arguments, null, "top");
}
dojo.html.getScrollLeft = function(){
	return dojo.html._callDeprecated("getScrollLeft", "getScroll", arguments, null, "left");
}
dojo.html.getScrollOffset = function(){
	return dojo.html._callDeprecated("getScrollOffset", "getScroll", arguments, null, "offset");
}
