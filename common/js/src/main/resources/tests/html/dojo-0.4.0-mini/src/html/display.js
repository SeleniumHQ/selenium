/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.html.display");
dojo.require("dojo.html.style");

dojo.html._toggle = function(node, tester, setter){
	node = dojo.byId(node);
	setter(node, !tester(node));
	return tester(node);
}

dojo.html.show = function(/* HTMLElement */node){
	//	summary
	//	Show the passed element by reverting display property set by dojo.html.hide
	node = dojo.byId(node);
	if(dojo.html.getStyleProperty(node, 'display')=='none'){
		dojo.html.setStyle(node, 'display', (node.dojoDisplayCache||''));
		node.dojoDisplayCache = undefined;	// cannot use delete on a node in IE6
	}
}

dojo.html.hide = function(/* HTMLElement */node){
	//	summary
	//	Hide the passed element by setting display:none
	node = dojo.byId(node);
	if(typeof node["dojoDisplayCache"] == "undefined"){ // it could == '', so we cannot say !node.dojoDisplayCount
		var d = dojo.html.getStyleProperty(node, 'display')
		if(d!='none'){
			node.dojoDisplayCache = d;
		}
	}
	dojo.html.setStyle(node, 'display', 'none');
}

dojo.html.setShowing = function(/* HTMLElement */node, /* boolean? */showing){
	//	summary
	// Calls show() if showing is true, hide() otherwise
	dojo.html[(showing ? 'show' : 'hide')](node);
}

dojo.html.isShowing = function(/* HTMLElement */node){
	//	summary
	//	Returns whether the element is displayed or not.
	// FIXME: returns true if node is bad, isHidden would be easier to make correct
	return (dojo.html.getStyleProperty(node, 'display') != 'none');	//	boolean
}

dojo.html.toggleShowing = function(/* HTMLElement */node){
	//	summary
	// Call setShowing() on node with the complement of isShowing(), then return the new value of isShowing()
	return dojo.html._toggle(node, dojo.html.isShowing, dojo.html.setShowing);	//	boolean
}

// Simple mapping of tag names to display values
// FIXME: simplistic 
dojo.html.displayMap = { tr: '', td: '', th: '', img: 'inline', span: 'inline', input: 'inline', button: 'inline' };

dojo.html.suggestDisplayByTagName = function(/* HTMLElement */node){
	//	summary
	// Suggest a value for the display property that will show 'node' based on it's tag
	node = dojo.byId(node);
	if(node && node.tagName){
		var tag = node.tagName.toLowerCase();
		return (tag in dojo.html.displayMap ? dojo.html.displayMap[tag] : 'block');	//	string
	}
}

dojo.html.setDisplay = function(/* HTMLElement */node, /* string */display){
	//	summary
	// 	Sets the value of style.display to value of 'display' parameter if it is a string.
	// 	Otherwise, if 'display' is false, set style.display to 'none'.
	// 	Finally, set 'display' to a suggested display value based on the node's tag
	dojo.html.setStyle(node, 'display', ((display instanceof String || typeof display == "string") ? display : (display ? dojo.html.suggestDisplayByTagName(node) : 'none')));
}

dojo.html.isDisplayed = function(/* HTMLElement */node){
	//	summary
	// 	Is true if the the computed display style for node is not 'none'
	// 	FIXME: returns true if node is bad, isNotDisplayed would be easier to make correct
	return (dojo.html.getComputedStyle(node, 'display') != 'none');	//	boolean
}

dojo.html.toggleDisplay = function(/* HTMLElement */node){
	//	summary
	// 	Call setDisplay() on node with the complement of isDisplayed(), then
	// 	return the new value of isDisplayed()
	return dojo.html._toggle(node, dojo.html.isDisplayed, dojo.html.setDisplay);	//	boolean
}

dojo.html.setVisibility = function(/* HTMLElement */node, /* string */visibility){
	//	summary
	// 	Sets the value of style.visibility to value of 'visibility' parameter if it is a string.
	// 	Otherwise, if 'visibility' is false, set style.visibility to 'hidden'. Finally, set style.visibility to 'visible'.
	dojo.html.setStyle(node, 'visibility', ((visibility instanceof String || typeof visibility == "string") ? visibility : (visibility ? 'visible' : 'hidden')));
}

dojo.html.isVisible = function(/* HTMLElement */node){
	//	summary
	// 	Returns true if the the computed visibility style for node is not 'hidden'
	// 	FIXME: returns true if node is bad, isInvisible would be easier to make correct
	return (dojo.html.getComputedStyle(node, 'visibility') != 'hidden');	//	boolean
}

dojo.html.toggleVisibility = function(node){
	//	summary
	// Call setVisibility() on node with the complement of isVisible(), then return the new value of isVisible()
	return dojo.html._toggle(node, dojo.html.isVisible, dojo.html.setVisibility);	//	boolean
}

dojo.html.setOpacity = function(/* HTMLElement */node, /* float */opacity, /* boolean? */dontFixOpacity){
	//	summary
	//	Sets the opacity of node in a cross-browser way.
	//	float between 0.0 (transparent) and 1.0 (opaque)
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(!dontFixOpacity){
		if( opacity >= 1.0){
			if(h.ie){
				dojo.html.clearOpacity(node);
				return;
			}else{
				opacity = 0.999999;
			}
		}else if( opacity < 0.0){ opacity = 0; }
	}
	if(h.ie){
		if(node.nodeName.toLowerCase() == "tr"){
			// FIXME: is this too naive? will we get more than we want?
			var tds = node.getElementsByTagName("td");
			for(var x=0; x<tds.length; x++){
				tds[x].style.filter = "Alpha(Opacity="+opacity*100+")";
			}
		}
		node.style.filter = "Alpha(Opacity="+opacity*100+")";
	}else if(h.moz){
		node.style.opacity = opacity; // ffox 1.0 directly supports "opacity"
		node.style.MozOpacity = opacity;
	}else if(h.safari){
		node.style.opacity = opacity; // 1.3 directly supports "opacity"
		node.style.KhtmlOpacity = opacity;
	}else{
		node.style.opacity = opacity;
	}
}

dojo.html.clearOpacity = function(/* HTMLElement */node){
	//	summary
	//	Clears any opacity setting on the passed element.
	node = dojo.byId(node);
	var ns = node.style;
	var h = dojo.render.html;
	if(h.ie){
		try {
			if( node.filters && node.filters.alpha ){
				ns.filter = ""; // FIXME: may get rid of other filter effects
			}
		} catch(e) {
			/*
			 * IE7 gives error if node.filters not set;
			 * don't know why or how to workaround (other than this)
			 */
		}
	}else if(h.moz){
		ns.opacity = 1;
		ns.MozOpacity = 1;
	}else if(h.safari){
		ns.opacity = 1;
		ns.KhtmlOpacity = 1;
	}else{
		ns.opacity = 1;
	}
}

dojo.html.getOpacity = function(/* HTMLElement */node){
	//	summary
	//	Returns the opacity of the passed element
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(h.ie){
		var opac = (node.filters && node.filters.alpha &&
			typeof node.filters.alpha.opacity == "number"
			? node.filters.alpha.opacity : 100) / 100;
	}else{
		var opac = node.style.opacity || node.style.MozOpacity ||
			node.style.KhtmlOpacity || 1;
	}
	return opac >= 0.999999 ? 1.0 : Number(opac);	//	float
}
