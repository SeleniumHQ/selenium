/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.require("dojo.html.common");
dojo.provide("dojo.html.selection");

dojo.require("dojo.dom");
dojo.require("dojo.lang.common");

/**
 * type of selection
**/
dojo.html.selectionType = {
	NONE : 0, //selection is empty
	TEXT : 1, //selection contains text (may also contains CONTROL objects)
	CONTROL : 2 //only one element is selected (such as img, table etc)
};

dojo.html.clearSelection = function(){
	// summary: deselect the current selection to make it empty
	var _window = dojo.global();
	var _document = dojo.doc();
	try{
		if(_window["getSelection"]){ 
			if(dojo.render.html.safari){
				// pulled from WebCore/ecma/kjs_window.cpp, line 2536
				_window.getSelection().collapse();
			}else{
				_window.getSelection().removeAllRanges();
			}
		}else if(_document.selection){
			if(_document.selection.empty){
				_document.selection.empty();
			}else if(_document.selection.clear){
				_document.selection.clear();
			}
		}
		return true;
	}catch(e){
		dojo.debug(e);
		return false;
	}
}

dojo.html.disableSelection = function(/*DomNode*/element){
	// summary: disable selection on a node
	element = dojo.byId(element)||dojo.body();
	var h = dojo.render.html;
	
	if(h.mozilla){
		element.style.MozUserSelect = "none";
	}else if(h.safari){
		element.style.KhtmlUserSelect = "none"; 
	}else if(h.ie){
		element.unselectable = "on";
	}else{
		return false;
	}
	return true;
}

dojo.html.enableSelection = function(/*DomNode*/element){
	// summary: enable selection on a node
	element = dojo.byId(element)||dojo.body();
	
	var h = dojo.render.html;
	if(h.mozilla){ 
		element.style.MozUserSelect = ""; 
	}else if(h.safari){
		element.style.KhtmlUserSelect = "";
	}else if(h.ie){
		element.unselectable = "off";
	}else{
		return false;
	}
	return true;
}

dojo.html.selectElement = function(/*DomNode*/element){
	dojo.deprecated("dojo.html.selectElement", "replaced by dojo.html.selection.selectElementChildren", 0.5);
}

dojo.html.selectInputText = function(/*DomNode*/element){
	// summary: select all the text in an input element
	var _window = dojo.global();
	var _document = dojo.doc();
	element = dojo.byId(element);
	if(_document["selection"] && dojo.body()["createTextRange"]){ // IE
		var range = element.createTextRange();
		range.moveStart("character", 0);
		range.moveEnd("character", element.value.length);
		range.select();
	}else if(_window["getSelection"]){
		var selection = _window.getSelection();
		// FIXME: does this work on Safari?
		element.setSelectionRange(0, element.value.length);
	}
	element.focus();
}


dojo.html.isSelectionCollapsed = function(){
	dojo.deprecated("dojo.html.isSelectionCollapsed", "replaced by dojo.html.selection.isCollapsed", 0.5);
	return dojo.html.selection.isCollapsed();
}

dojo.lang.mixin(dojo.html.selection, {
	getType: function() {
		// summary: Get the selection type (like document.select.type in IE).
		if(dojo.doc()["selection"]){ //IE
			return dojo.html.selectionType[dojo.doc().selection.type.toUpperCase()];
		}else{
			var stype = dojo.html.selectionType.TEXT;
	
			// Check if the actual selection is a CONTROL (IMG, TABLE, HR, etc...).
			var oSel;
			try {oSel = dojo.global().getSelection();}
			catch (e) {}
			
			if(oSel && oSel.rangeCount==1){
				var oRange = oSel.getRangeAt(0);
				if (oRange.startContainer == oRange.endContainer && (oRange.endOffset - oRange.startOffset) == 1
					&& oRange.startContainer.nodeType != dojo.dom.TEXT_NODE) {
					stype = dojo.html.selectionType.CONTROL;
				}
			}
			return stype;
		}
	},
	isCollapsed: function() {
		// summary: return whether the current selection is empty
		var _window = dojo.global();
		var _document = dojo.doc();
		if(_document["selection"]){ // IE
			return _document.selection.createRange().text == "";
		}else if(_window["getSelection"]){
			var selection = _window.getSelection();
			if(dojo.lang.isString(selection)){ // Safari
				return selection == "";
			}else{ // Mozilla/W3
				return selection.isCollapsed || selection.toString() == "";
			}
		}
	},
	getSelectedElement: function() {
		// summary: 
		//		Retrieves the selected element (if any), just in the case that a single
		//		element (object like and image or a table) is selected.
		if ( dojo.html.selection.getType() == dojo.html.selectionType.CONTROL ){
			if(dojo.doc()["selection"]){ //IE
				var range = dojo.doc().selection.createRange();
		
				if ( range && range.item ){
					return dojo.doc().selection.createRange().item(0);
				}
			}else{
				var selection = dojo.global().getSelection();
				return selection.anchorNode.childNodes[ selection.anchorOffset ];
			}
		}
	},
	getParentElement: function() {
		// summary: 
		//		Get the parent element of the current selection
		if(dojo.html.selection.getType() == dojo.html.selectionType.CONTROL){
			var p = dojo.html.selection.getSelectedElement();
			if(p){ return p.parentNode; }
		}else{
			if(dojo.doc()["selection"]){ //IE
				return dojo.doc().selection.createRange().parentElement();
			}else{
				var selection = dojo.global().getSelection();
				if(selection){
					var node = selection.anchorNode;
		
					while ( node && node.nodeType != dojo.dom.ELEMENT_NODE ){
						node = node.parentNode;
					}
		
					return node;
				}
			}
		}
	},
	getSelectedText: function(){
		// summary:
		//		Return the text (no html tags) included in the current selection or null if no text is selected
		if(dojo.doc()["selection"]){ //IE
			if(dojo.html.selection.getType() == dojo.html.selectionType.CONTROL){
				return null;
			}
			return dojo.doc().selection.createRange().text;
		}else{
			var selection = dojo.global().getSelection();
			if(selection){
				return selection.toString();
			}
		}
	},
	getSelectedHtml: function(){
		// summary:
		//		Return the html of the current selection or null if unavailable
		if(dojo.doc()["selection"]){ //IE
			if(dojo.html.selection.getType() == dojo.html.selectionType.CONTROL){
				return null;
			}
			return dojo.doc().selection.createRange().htmlText;
		}else{
			var selection = dojo.global().getSelection();
			if(selection && selection.rangeCount){
				var frag = selection.getRangeAt(0).cloneContents();
				var div = document.createElement("div");
				div.appendChild(frag);
				return div.innerHTML;
			}
			return null;
		}
	},
	hasAncestorElement: function(/*String*/tagName /* ... */){
		// summary: 
		// 		Check whether current selection has a  parent element which is of type tagName (or one of the other specified tagName)
		return (dojo.html.selection.getAncestorElement.apply(this, arguments) != null);
	},
	getAncestorElement: function(/*String*/tagName /* ... */){
		// summary:
		//		Return the parent element of the current selection which is of type tagName (or one of the other specified tagName)
		var node = dojo.html.selection.getSelectedElement() || dojo.html.selection.getParentElement();
		while(node /*&& node.tagName.toLowerCase() != 'body'*/){
			if(dojo.html.selection.isTag(node, arguments).length>0){
				return node;
			}
			node = node.parentNode;
		}
		return null;
	},
	//modified from dojo.html.isTag to take an array as second parameter
	isTag: function(/*DomNode*/node, /*Array*/tags) {
		if(node && node.tagName) {
			for (var i=0; i<tags.length; i++){
				if (node.tagName.toLowerCase()==String(tags[i]).toLowerCase()){
					return String(tags[i]).toLowerCase();
				}
			}
		}
		return "";
	},
	selectElement: function(/*DomNode*/element) {
		// summary: clear previous selection and select element (including all its children)
		var _window = dojo.global();
		var _document = dojo.doc();
		element = dojo.byId(element);
		if(_document.selection && dojo.body().createTextRange){ // IE
			try{
				var range = dojo.body().createControlRange();
				range.addElement(element);
				range.select();
			}catch(e){
				dojo.html.selection.selectElementChildren(element);
			}
		}else if(_window["getSelection"]){
			var selection = _window.getSelection();
			// FIXME: does this work on Safari?
			if(selection["removeAllRanges"]){ // Mozilla
				var range = _document.createRange() ;
				range.selectNode(element) ;
				selection.removeAllRanges() ;
				selection.addRange(range) ;
			}
		}
	},
	selectElementChildren: function(/*DomNode*/element){
		// summary: clear previous selection and select the content of the node (excluding the node itself)
		var _window = dojo.global();
		var _document = dojo.doc();
		element = dojo.byId(element);
		if(_document.selection && dojo.body().createTextRange){ // IE
			var range = dojo.body().createTextRange();
			range.moveToElementText(element);
			range.select();
		}else if(_window["getSelection"]){
			var selection = _window.getSelection();
			if(selection["setBaseAndExtent"]){ // Safari
				selection.setBaseAndExtent(element, 0, element, element.innerText.length - 1);
			} else if(selection["selectAllChildren"]){ // Mozilla
				selection.selectAllChildren(element);
			}
		}
	},
	getBookmark: function(){
		// summary: Retrieves a bookmark that can be used with moveToBookmark to return to the same range
		var bookmark;
		var _document = dojo.doc();
		if(_document["selection"]){ // IE
			var range = _document.selection.createRange();
			bookmark = range.getBookmark();
		}else{
			var selection;
			try {selection = dojo.global().getSelection();}
			catch (e) {}
			if(selection){
				var range = selection.getRangeAt(0);
				bookmark = range.cloneRange();
			}else{
				dojo.debug("No idea how to store the current selection for this browser!");
			}
		}
		return bookmark;
	},
	moveToBookmark: function(/*Object*/bookmark){
		// summary: Moves current selection to a bookmark
		// bookmark: this should be a returned object from dojo.html.selection.getBookmark()
		var _document = dojo.doc();
		if(_document["selection"]){ // IE
			var range = _document.selection.createRange();
			 range.moveToBookmark(bookmark);
			 range.select();
		}else{ //Moz/W3C
			var selection;
			try {selection = dojo.global().getSelection();}
			catch (e) {}
			if(selection && selection['removeAllRanges']){
				selection.removeAllRanges() ;
				selection.addRange(bookmark) ;
			}else{
				dojo.debug("No idea how to restore selection for this browser!");
			}
		}
	},
	collapse: function(/*Boolean*/beginning) {
		// summary: clear current selection
		if(dojo.global()['getSelection']){
			var selection = dojo.global().getSelection();
			if(selection.removeAllRanges){ // Mozilla
				if(beginning){
					selection.collapseToStart();
				}else{
					selection.collapseToEnd();
				}
			}else{ // Safari
				// pulled from WebCore/ecma/kjs_window.cpp, line 2536
				 dojo.global().getSelection().collapse(beginning);
			}
		}else if(dojo.doc().selection){ // IE
			var range = dojo.doc().selection.createRange();
			range.collapse(beginning);
			range.select();
		}
	},
	remove: function() {
		// summary: delete current selection
		if(dojo.doc().selection) { //IE
			var selection = dojo.doc().selection;

			if ( selection.type.toUpperCase() != "NONE" ){
				selection.clear();
			}
		
			return selection;
		}else{
			var selection = dojo.global().getSelection();

			for ( var i = 0; i < selection.rangeCount; i++ ){
				selection.getRangeAt(i).deleteContents();
			}
		
			return selection;
		}
	}
});
