/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.html.style");
dojo.require("dojo.uri.Uri");

dojo.html.getClass = function(/* HTMLElement */node){
	//	summary
	//	Returns the string value of the list of CSS classes currently assigned directly 
	//	to the node in question. Returns an empty string if no class attribute is found;
	node = dojo.byId(node);
	if(!node){ return ""; }
	var cs = "";
	if(node.className){
		cs = node.className;
	}else if(dojo.html.hasAttribute(node, "class")){
		cs = dojo.html.getAttribute(node, "class");
	}
	return cs.replace(/^\s+|\s+$/g, "");	//	string
}

dojo.html.getClasses = function(/* HTMLElement */node) {
	//	summary
	//	Returns an array of CSS classes currently assigned directly to the node in question. 
	//	Returns an empty array if no classes are found;
	var c = dojo.html.getClass(node);
	return (c == "") ? [] : c.split(/\s+/g);	//	array
}

dojo.html.hasClass = function(/* HTMLElement */node, /* string */classname){
	//	summary
	//	Returns whether or not the specified classname is a portion of the
	//	class list currently applied to the node. Does not cover cascaded
	//	styles, only classes directly applied to the node.
	return (new RegExp('(^|\\s+)'+classname+'(\\s+|$)')).test(dojo.html.getClass(node))	//	boolean
}

dojo.html.prependClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Adds the specified class to the beginning of the class list on the
	//	passed node. This gives the specified class the highest precidence
	//	when style cascading is calculated for the node. Returns true or
	//	false; indicating success or failure of the operation, respectively.
	classStr += " " + dojo.html.getClass(node);
	return dojo.html.setClass(node, classStr);	//	boolean
}

dojo.html.addClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Adds the specified class to the end of the class list on the
	//	passed &node;. Returns &true; or &false; indicating success or failure.
	if (dojo.html.hasClass(node, classStr)) {
	  return false;
	}
	classStr = (dojo.html.getClass(node) + " " + classStr).replace(/^\s+|\s+$/g,"");
	return dojo.html.setClass(node, classStr);	//	boolean
}

dojo.html.setClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Clobbers the existing list of classes for the node, replacing it with
	//	the list given in the 2nd argument. Returns true or false
	//	indicating success or failure.
	node = dojo.byId(node);
	var cs = new String(classStr);
	try{
		if(typeof node.className == "string"){
			node.className = cs;
		}else if(node.setAttribute){
			node.setAttribute("class", classStr);
			node.className = cs;
		}else{
			return false;
		}
	}catch(e){
		dojo.debug("dojo.html.setClass() failed", e);
	}
	return true;
}

dojo.html.removeClass = function(/* HTMLElement */node, /* string */classStr, /* boolean? */allowPartialMatches){
	//	summary
	//	Removes the className from the node;. Returns true or false indicating success or failure.
	try{
		if (!allowPartialMatches) {
			var newcs = dojo.html.getClass(node).replace(new RegExp('(^|\\s+)'+classStr+'(\\s+|$)'), "$1$2");
		} else {
			var newcs = dojo.html.getClass(node).replace(classStr,'');
		}
		dojo.html.setClass(node, newcs);
	}catch(e){
		dojo.debug("dojo.html.removeClass() failed", e);
	}
	return true;	//	boolean
}

dojo.html.replaceClass = function(/* HTMLElement */node, /* string */newClass, /* string */oldClass) {
	//	summary
	//	Replaces 'oldClass' and adds 'newClass' to node
	dojo.html.removeClass(node, oldClass);
	dojo.html.addClass(node, newClass);
}

// Enum type for getElementsByClass classMatchType arg:
dojo.html.classMatchType = {
	ContainsAll : 0, // all of the classes are part of the node's class (default)
	ContainsAny : 1, // any of the classes are part of the node's class
	IsOnly : 2 // only all of the classes are part of the node's class
}


dojo.html.getElementsByClass = function(
	/* string */classStr, 
	/* HTMLElement? */parent, 
	/* string? */nodeType, 
	/* integer? */classMatchType, 
	/* boolean? */useNonXpath
){
	//	summary
	//	Returns an array of nodes for the given classStr, children of a
	//	parent, and optionally of a certain nodeType
	// FIXME: temporarily set to false because of several dojo tickets related
	// to the xpath version not working consistently in firefox.
	useNonXpath = false;
	var _document = dojo.doc();
	parent = dojo.byId(parent) || _document;
	var classes = classStr.split(/\s+/g);
	var nodes = [];
	if( classMatchType != 1 && classMatchType != 2 ) classMatchType = 0; // make it enum
	var reClass = new RegExp("(\\s|^)((" + classes.join(")|(") + "))(\\s|$)");
	var srtLength = classes.join(" ").length;
	var candidateNodes = [];
	
	if(!useNonXpath && _document.evaluate) { // supports dom 3 xpath
		var xpath = ".//" + (nodeType || "*") + "[contains(";
		if(classMatchType != dojo.html.classMatchType.ContainsAny){
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ') and contains(concat(' ',@class,' '), ' ") +
			" ')";
			if (classMatchType == 2) {
				xpath += " and string-length(@class)="+srtLength+"]";
			}else{
				xpath += "]";
			}
		}else{
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ') or contains(concat(' ',@class,' '), ' ") +
			" ')]";
		}
		var xpathResult = _document.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);
		var result = xpathResult.iterateNext();
		while(result){
			try{
				candidateNodes.push(result);
				result = xpathResult.iterateNext();
			}catch(e){ break; }
		}
		return candidateNodes;	//	NodeList
	}else{
		if(!nodeType){
			nodeType = "*";
		}
		candidateNodes = parent.getElementsByTagName(nodeType);

		var node, i = 0;
		outer:
		while(node = candidateNodes[i++]){
			var nodeClasses = dojo.html.getClasses(node);
			if(nodeClasses.length == 0){ continue outer; }
			var matches = 0;
	
			for(var j = 0; j < nodeClasses.length; j++){
				if(reClass.test(nodeClasses[j])){
					if(classMatchType == dojo.html.classMatchType.ContainsAny){
						nodes.push(node);
						continue outer;
					}else{
						matches++;
					}
				}else{
					if(classMatchType == dojo.html.classMatchType.IsOnly){
						continue outer;
					}
				}
			}
	
			if(matches == classes.length){
				if(	(classMatchType == dojo.html.classMatchType.IsOnly)&&
					(matches == nodeClasses.length)){
					nodes.push(node);
				}else if(classMatchType == dojo.html.classMatchType.ContainsAll){
					nodes.push(node);
				}
			}
		}
		return nodes;	//	NodeList
	}
}
dojo.html.getElementsByClassName = dojo.html.getElementsByClass;

dojo.html.toCamelCase = function(/* string */selector){
	//	summary
	//	Translates a CSS selector string to a camel-cased one.
	var arr = selector.split('-'), cc = arr[0];
	for(var i = 1; i < arr.length; i++) {
		cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	}
	return cc;	//	string
}

dojo.html.toSelectorCase = function(/* string */selector){
	//	summary
	//	Translates a camel cased string to a selector cased one.
	return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase();	//	string
}

dojo.html.getComputedStyle = function(/* HTMLElement */node, /* string */cssSelector, /* integer? */inValue){
	//	summary
	//	Returns the computed style of cssSelector on node.
	node = dojo.byId(node);
	// cssSelector may actually be in camel case, so force selector version
	var cssSelector = dojo.html.toSelectorCase(cssSelector);
	var property = dojo.html.toCamelCase(cssSelector);
	if(!node || !node.style){
		return inValue;			
	} else if (document.defaultView && dojo.html.isDescendantOf(node, node.ownerDocument)){ // W3, gecko, KHTML
		try{
			// mozilla segfaults when margin-* and node is removed from doc
			// FIXME: need to figure out a if there is quicker workaround
			var cs = document.defaultView.getComputedStyle(node, "");
			if(cs){
				return cs.getPropertyValue(cssSelector);	//	integer
			} 
		}catch(e){ // reports are that Safari can throw an exception above
			if(node.style.getPropertyValue){ // W3
				return node.style.getPropertyValue(cssSelector);	//	integer
			} else {
				return inValue;	//	integer
			}
		}
	} else if(node.currentStyle){ // IE
		return node.currentStyle[property];	//	integer
	}
	
	if(node.style.getPropertyValue){ // W3
		return node.style.getPropertyValue(cssSelector);	//	integer
	}else{
		return inValue;	//	integer
	}
}

dojo.html.getStyleProperty = function(/* HTMLElement */node, /* string */cssSelector){
	//	summary
	//	Returns the value of the passed style
	node = dojo.byId(node);
	return (node && node.style ? node.style[dojo.html.toCamelCase(cssSelector)] : undefined);	//	string
}

dojo.html.getStyle = function(/* HTMLElement */node, /* string */cssSelector){
	//	summary
	//	Returns the computed value of the passed style
	var value = dojo.html.getStyleProperty(node, cssSelector);
	return (value ? value : dojo.html.getComputedStyle(node, cssSelector));	//	string || integer
}

dojo.html.setStyle = function(/* HTMLElement */node, /* string */cssSelector, /* string */value){
	//	summary
	//	Set the value of passed style on node
	node = dojo.byId(node);
	if(node && node.style){
		var camelCased = dojo.html.toCamelCase(cssSelector);
		node.style[camelCased] = value;
	}
}

dojo.html.setStyleText = function (/* HTMLElement */target, /* string */text) {
	//	summary
	//	Try to set the entire cssText property of the passed target; equiv of setting style attribute.
	try {
	 	target.style.cssText = text;
	} catch (e) {
		target.setAttribute("style", text);
	}
}

dojo.html.copyStyle = function(/* HTMLElement */target, /* HTMLElement */source){
	//	summary
	// work around for opera which doesn't have cssText, and for IE which fails on setAttribute 
	if(!source.style.cssText){ 
		target.setAttribute("style", source.getAttribute("style")); 
	}else{
		target.style.cssText = source.style.cssText; 
	}
	dojo.html.addClass(target, dojo.html.getClass(source));
}

dojo.html.getUnitValue = function(/* HTMLElement */node, /* string */cssSelector, /* boolean? */autoIsZero){
	//	summary
	//	Get the value of passed selector, with the specific units used
	var s = dojo.html.getComputedStyle(node, cssSelector);
	if((!s)||((s == 'auto')&&(autoIsZero))){ 
		return { value: 0, units: 'px' };	//	object 
	}
	// FIXME: is regex inefficient vs. parseInt or some manual test? 
	var match = s.match(/(\-?[\d.]+)([a-z%]*)/i);
	if (!match){return dojo.html.getUnitValue.bad;}
	return { value: Number(match[1]), units: match[2].toLowerCase() };	//	object
}
dojo.html.getUnitValue.bad = { value: NaN, units: '' };

dojo.html.getPixelValue = function(/* HTMLElement */node, /* string */cssSelector, /* boolean? */autoIsZero){
	//	summary
	//	Get the value of passed selector in pixels.
	var result = dojo.html.getUnitValue(node, cssSelector, autoIsZero);
	// FIXME: there is serious debate as to whether or not this is the right solution
	if(isNaN(result.value)){ 
		return 0; //	integer 
	}	
	// FIXME: code exists for converting other units to px (see Dean Edward's IE7) 
	// but there are cross-browser complexities
	if((result.value)&&(result.units != 'px')){ 
		return NaN;	//	integer 
	}
	return result.value;	//	integer
}

dojo.html.setPositivePixelValue = function(/* HTMLElement */node, /* string */selector, /* integer */value){
	//	summary
	//	Attempt to set the value of selector on node as a positive pixel value.
	if(isNaN(value)){return false;}
	node.style[selector] = Math.max(0, value) + 'px'; 
	return true;	//	boolean
}

dojo.html.styleSheet = null;

// FIXME: this is a really basic stub for adding and removing cssRules, but
// it assumes that you know the index of the cssRule that you want to add 
// or remove, making it less than useful.  So we need something that can 
// search for the selector that you you want to remove.
dojo.html.insertCssRule = function(/* string */selector, /* string */declaration, /* integer? */index) {
	//	summary
	//	Attempt to insert declaration as selector on the internal stylesheet; if index try to set it there.
	if (!dojo.html.styleSheet) {
		if (document.createStyleSheet) { // IE
			dojo.html.styleSheet = document.createStyleSheet();
		} else if (document.styleSheets[0]) { // rest
			// FIXME: should create a new style sheet here
			// fall back on an exsiting style sheet
			dojo.html.styleSheet = document.styleSheets[0];
		} else { 
			return null;	//	integer 
		} // fail
	}

	if (arguments.length < 3) { // index may == 0
		if (dojo.html.styleSheet.cssRules) { // W3
			index = dojo.html.styleSheet.cssRules.length;
		} else if (dojo.html.styleSheet.rules) { // IE
			index = dojo.html.styleSheet.rules.length;
		} else { 
			return null;	//	integer 
		} // fail
	}

	if (dojo.html.styleSheet.insertRule) { // W3
		var rule = selector + " { " + declaration + " }";
		return dojo.html.styleSheet.insertRule(rule, index);	//	integer
	} else if (dojo.html.styleSheet.addRule) { // IE
		return dojo.html.styleSheet.addRule(selector, declaration, index);	//	integer
	} else { 
		return null; // integer
	} // fail
}

dojo.html.removeCssRule = function(/* integer? */index){
	//	summary
	//	Attempt to remove the rule at index.
	if(!dojo.html.styleSheet){
		dojo.debug("no stylesheet defined for removing rules");
		return false;
	}
	if(dojo.render.html.ie){
		if(!index){
			index = dojo.html.styleSheet.rules.length;
			dojo.html.styleSheet.removeRule(index);
		}
	}else if(document.styleSheets[0]){
		if(!index){
			index = dojo.html.styleSheet.cssRules.length;
		}
		dojo.html.styleSheet.deleteRule(index);
	}
	return true;	//	boolean
}

dojo.html._insertedCssFiles = []; // cache container needed because IE reformats cssText when added to DOM
dojo.html.insertCssFile = function(/* string */URI, /* HTMLDocument? */doc, /* boolean? */checkDuplicates, /* boolean */fail_ok){
	//	summary
	// calls css by XmlHTTP and inserts it into DOM as <style [widgetType="widgetType"]> *downloaded cssText*</style>
	if(!URI){ return; }
	if(!doc){ doc = document; }
	var cssStr = dojo.hostenv.getText(URI, false, fail_ok);
  if(cssStr===null){ return; } 
	cssStr = dojo.html.fixPathsInCssText(cssStr, URI);

	if(checkDuplicates){
		var idx = -1, node, ent = dojo.html._insertedCssFiles;
		for(var i = 0; i < ent.length; i++){
			if((ent[i].doc == doc) && (ent[i].cssText == cssStr)){
				idx = i; node = ent[i].nodeRef;
				break;
			}
		}
		// make sure we havent deleted our node
		if(node){
			var styles = doc.getElementsByTagName("style");
			for(var i = 0; i < styles.length; i++){
				if(styles[i] == node){
					return;
				}
			}
			// delete this entry
			dojo.html._insertedCssFiles.shift(idx, 1);
		}
	}

	var style = dojo.html.insertCssText(cssStr);
	dojo.html._insertedCssFiles.push({'doc': doc, 'cssText': cssStr, 'nodeRef': style});

	// insert custom attribute ex dbgHref="../foo.css" usefull when debugging in DOM inspectors, no?
	if(style && djConfig.isDebug){
		style.setAttribute("dbgHref", URI);
	}
	return style;	//	HTMLStyleElement
}

dojo.html.insertCssText = function(/* string */cssStr, /* HTMLDocument? */doc, /* string? */URI){
	//	summary
	//	Attempt to insert CSS rules into the document through inserting a style element
	// DomNode Style  = insertCssText(String ".dojoMenu {color: green;}"[, DomDoc document, dojo.uri.Uri Url ])
	if(!cssStr){ 
		return; //	HTMLStyleElement
	}
	if(!doc){ doc = document; }
	if(URI){// fix paths in cssStr
		cssStr = dojo.html.fixPathsInCssText(cssStr, URI);
	}
	var style = doc.createElement("style");
	style.setAttribute("type", "text/css");
	// IE is b0rken enough to require that we add the element to the doc
	// before changing it's properties
	var head = doc.getElementsByTagName("head")[0];
	if(!head){ // must have a head tag 
		dojo.debug("No head tag in document, aborting styles");
		return;	//	HTMLStyleElement
	}else{
		head.appendChild(style);
	}
	if(style.styleSheet){// IE
		style.styleSheet.cssText = cssStr;
	}else{ // w3c
		var cssText = doc.createTextNode(cssStr);
		style.appendChild(cssText);
	}
	return style;	//	HTMLStyleElement
}

dojo.html.fixPathsInCssText = function(/* string */cssStr, /* string */URI){
	//	summary
	// usage: cssText comes from dojoroot/src/widget/templates/Foobar.css
	// 	it has .dojoFoo { background-image: url(images/bar.png);} then uri should point to dojoroot/src/widget/templates/
	function iefixPathsInCssText() {
		var regexIe = /AlphaImageLoader\(src\=['"]([\t\s\w()\/.\\'"-:#=&?~]*)['"]/;
		while(match = regexIe.exec(cssStr)){
			url = match[1].replace(regexTrim, "$2");
			if(!regexProtocol.exec(url)){
				url = (new dojo.uri.Uri(URI, url).toString());
			}
			str += cssStr.substring(0, match.index) + "AlphaImageLoader(src='" + url + "'";
			cssStr = cssStr.substr(match.index + match[0].length);
		}
		return str + cssStr;
	}

	if(!cssStr || !URI){ return; }
	var match, str = "", url = "";
	var regex = /url\(\s*([\t\s\w()\/.\\'"-:#=&?]+)\s*\)/;
	var regexProtocol = /(file|https?|ftps?):\/\//;
	var regexTrim = /^[\s]*(['"]?)([\w()\/.\\'"-:#=&?]*)\1[\s]*?$/;
	if (dojo.render.html.ie55 || dojo.render.html.ie60) {
		cssStr = iefixPathsInCssText();
	}
	while(match = regex.exec(cssStr)){
		url = match[1].replace(regexTrim, "$2");
		if(!regexProtocol.exec(url)){
			url = (new dojo.uri.Uri(URI, url).toString());
		}
		str += cssStr.substring(0, match.index) + "url(" + url + ")";
		cssStr = cssStr.substr(match.index + match[0].length);
	}
	return str + cssStr;	//	string
}

dojo.html.setActiveStyleSheet = function(/* string */title){
	//	summary
	//	Activate style sheet with specified title.
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")){
			a.disabled = true;
			if (a.getAttribute("title") == title) { a.disabled = false; }
		}
	}
}

dojo.html.getActiveStyleSheet = function(){
	//	summary
	//	return the title of the currently active stylesheet
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if (a.getAttribute("rel").indexOf("style") != -1 
			&& a.getAttribute("title") 
			&& !a.disabled
		){
			return a.getAttribute("title");	//	string 
		}
	}
	return null;	//	string
}

dojo.html.getPreferredStyleSheet = function(){
	//	summary
	//	Return the preferred stylesheet title (i.e. link without alt attribute)
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1
			&& a.getAttribute("rel").indexOf("alt") == -1
			&& a.getAttribute("title")
		){ 
			return a.getAttribute("title"); 	//	string
		}
	}
	return null;	//	string
}

dojo.html.applyBrowserClass = function(/* HTMLElement */node){
	//	summary
	//	Applies pre-set class names based on browser & version to the passed node.
	//	Modified version of Morris' CSS hack.
	var drh=dojo.render.html;
	var classes = {
		dj_ie: drh.ie,
		dj_ie55: drh.ie55,
		dj_ie6: drh.ie60,
		dj_ie7: drh.ie70,
		dj_iequirks: drh.ie && drh.quirks,
		dj_opera: drh.opera,
		dj_opera8: drh.opera && (Math.floor(dojo.render.version)==8),
		dj_opera9: drh.opera && (Math.floor(dojo.render.version)==9),
		dj_khtml: drh.khtml,
		dj_safari: drh.safari,
		dj_gecko: drh.mozilla
	}; // no dojo unsupported browsers
	for(var p in classes){
		if(classes[p]){
			dojo.html.addClass(node, p);
		}
	}
};
