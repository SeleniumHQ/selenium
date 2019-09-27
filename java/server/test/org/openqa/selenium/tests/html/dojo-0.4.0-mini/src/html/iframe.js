/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.html.iframe");
dojo.require("dojo.html.util");

// thanks burstlib!
dojo.html.iframeContentWindow = function(/* HTMLIFrameElement */iframe_el) {
	//	summary
	//	returns the window reference of the passed iframe
	var win = dojo.html.getDocumentWindow(dojo.html.iframeContentDocument(iframe_el)) ||
		// Moz. TODO: is this available when defaultView isn't?
		dojo.html.iframeContentDocument(iframe_el).__parent__ ||
		(iframe_el.name && document.frames[iframe_el.name]) || null;
	return win;	//	Window
}

dojo.html.iframeContentDocument = function(/* HTMLIFrameElement */iframe_el){
	//	summary
	//	returns a reference to the document object inside iframe_el
	var doc = iframe_el.contentDocument // W3
		|| ((iframe_el.contentWindow)&&(iframe_el.contentWindow.document))	// IE
		|| ((iframe_el.name)&&(document.frames[iframe_el.name])&&(document.frames[iframe_el.name].document)) 
		|| null;
	return doc;	//	HTMLDocument
}

dojo.html.BackgroundIframe = function(/* HTMLElement */node) {
	//	summary
	//	For IE z-index schenanigans
	//	Two possible uses:
	//	1. new dojo.html.BackgroundIframe(node)
	//		Makes a background iframe as a child of node, that fills area (and position) of node
	//	2. new dojo.html.BackgroundIframe()
	//		Attaches frame to dojo.body().  User must call size() to set size.
	if(dojo.render.html.ie55 || dojo.render.html.ie60) {
		var html="<iframe src='javascript:false'"
			+ "' style='position: absolute; left: 0px; top: 0px; width: 100%; height: 100%;"
			+ "z-index: -1; filter:Alpha(Opacity=\"0\");' "
			+ ">";
		this.iframe = dojo.doc().createElement(html);
		this.iframe.tabIndex = -1; // Magic to prevent iframe from getting focus on tab keypress - as style didnt work.
		if(node){
			node.appendChild(this.iframe);
			this.domNode=node;
		}else{
			dojo.body().appendChild(this.iframe);
			this.iframe.style.display="none";
		}
	}
}
dojo.lang.extend(dojo.html.BackgroundIframe, {
	iframe: null,
	onResized: function(){
		//	summary
		//	Resize event handler.
		// TODO: this function shouldn't be necessary but setting width=height=100% doesn't work!
		if(this.iframe && this.domNode && this.domNode.parentNode){ // No parentElement if onResized() timeout event occurs on a removed domnode
			var outer = dojo.html.getMarginBox(this.domNode);
			if (outer.width  == 0 || outer.height == 0 ){
				dojo.lang.setTimeout(this, this.onResized, 100);
				return;
			}
			this.iframe.style.width = outer.width + "px";
			this.iframe.style.height = outer.height + "px";
		}
	},

	size: function(/* HTMLElement */node) {
		// 	Call this function if the iframe is connected to dojo.body() rather than the node being shadowed 
		//	(TODO: erase)
		if(!this.iframe) { return; }
		var coords = dojo.html.toCoordinateObject(node, true, dojo.html.boxSizing.BORDER_BOX);
		this.iframe.style.width = coords.width + "px";
		this.iframe.style.height = coords.height + "px";
		this.iframe.style.left = coords.left + "px";
		this.iframe.style.top = coords.top + "px";
	},

	setZIndex: function(/* HTMLElement */node) {
		//	summary
		//	Sets the z-index of the background iframe.
		if(!this.iframe) { return; }
		if(dojo.dom.isNode(node)) {
			this.iframe.style.zIndex = dojo.html.getStyle(node, "z-index") - 1;
		} else if(!isNaN(node)) {
			this.iframe.style.zIndex = node;
		}
	},

	show: function() {
		//	summary
		//	show the iframe
		if(!this.iframe) { return; }
		this.iframe.style.display = "block";
	},

	hide: function() {
		//	summary
		//	hide the iframe
		if(!this.iframe) { return; }
		this.iframe.style.display = "none";
	},

	remove: function() {
		//	summary
		//	remove the iframe
		dojo.html.removeNode(this.iframe);
	}
});
