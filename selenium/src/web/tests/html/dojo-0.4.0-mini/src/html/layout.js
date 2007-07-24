/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.html.layout");

dojo.require("dojo.html.common");
dojo.require("dojo.html.style");
dojo.require("dojo.html.display");

dojo.html.sumAncestorProperties = function(/* HTMLElement */node, /* string */prop){
	//	summary
	//	Returns the sum of the passed property on all ancestors of node.
	node = dojo.byId(node);
	if(!node){ return 0; } // FIXME: throw an error?
	
	var retVal = 0;
	while(node){
		if(dojo.html.getComputedStyle(node, 'position') == 'fixed'){
			return 0;
		}
		var val = node[prop];
		if(val){
			retVal += val - 0;
			if(node==dojo.body()){ break; }// opera and khtml #body & #html has the same values, we only need one value
		}
		node = node.parentNode;
	}
	return retVal;	//	integer
}

dojo.html.setStyleAttributes = function(/* HTMLElement */node, /* string */attributes) { 
	//	summary
	//	allows a dev to pass a string similar to what you'd pass in style="", and apply it to a node.
	node = dojo.byId(node);
	var splittedAttribs=attributes.replace(/(;)?\s*$/, "").split(";"); 
	for(var i=0; i<splittedAttribs.length; i++){ 
		var nameValue=splittedAttribs[i].split(":"); 
		var name=nameValue[0].replace(/\s*$/, "").replace(/^\s*/, "").toLowerCase();
		var value=nameValue[1].replace(/\s*$/, "").replace(/^\s*/, "");
		switch(name){
			case "opacity":
				dojo.html.setOpacity(node, value); 
				break; 
			case "content-height":
				dojo.html.setContentBox(node, {height: value}); 
				break; 
			case "content-width":
				dojo.html.setContentBox(node, {width: value}); 
				break; 
			case "outer-height":
				dojo.html.setMarginBox(node, {height: value}); 
				break; 
			case "outer-width":
				dojo.html.setMarginBox(node, {width: value}); 
				break; 
			default:
				node.style[dojo.html.toCamelCase(name)]=value; 
		}
	} 
}

dojo.html.boxSizing = {
	MARGIN_BOX: "margin-box",
	BORDER_BOX: "border-box",
	PADDING_BOX: "padding-box",
	CONTENT_BOX: "content-box"
};

dojo.html.getAbsolutePosition = dojo.html.abs = function(/* HTMLElement */node, /* boolean? */includeScroll, /* string? */boxType){
	//	summary
	//	Gets the absolute position of the passed element based on the document itself.
	node = dojo.byId(node, node.ownerDocument);
	var ret = {
		x: 0,
		y: 0
	};

	var bs = dojo.html.boxSizing;
	if(!boxType) { boxType = bs.CONTENT_BOX; }
	var nativeBoxType = 2; //BORDER box
	var targetBoxType;
	switch(boxType){
		case bs.MARGIN_BOX:
			targetBoxType = 3;
			break;
		case bs.BORDER_BOX:
			targetBoxType = 2;
			break;
		case bs.PADDING_BOX:
		default:
			targetBoxType = 1;
			break;
		case bs.CONTENT_BOX:
			targetBoxType = 0;
			break;
	}

	var h = dojo.render.html;
	var db = document["body"]||document["documentElement"];

	if(h.ie){
		with(node.getBoundingClientRect()){
			ret.x = left-2;
			ret.y = top-2;
		}
	}else if(document.getBoxObjectFor){
		// mozilla
		nativeBoxType = 1; //getBoxObjectFor return padding box coordinate
		try{
			var bo = document.getBoxObjectFor(node);
			ret.x = bo.x - dojo.html.sumAncestorProperties(node, "scrollLeft");
			ret.y = bo.y - dojo.html.sumAncestorProperties(node, "scrollTop");
		}catch(e){
			// squelch
		}
	}else{
		if(node["offsetParent"]){
			var endNode;
			// in Safari, if the node is an absolutely positioned child of
			// the body and the body has a margin the offset of the child
			// and the body contain the body's margins, so we need to end
			// at the body
			if(	(h.safari)&&
				(node.style.getPropertyValue("position") == "absolute")&&
				(node.parentNode == db)){
				endNode = db;
			}else{
				endNode = db.parentNode;
			}

			//TODO: set correct nativeBoxType for safari/konqueror

			if(node.parentNode != db){
				var nd = node;
				if(dojo.render.html.opera){ nd = db; }
				ret.x -= dojo.html.sumAncestorProperties(nd, "scrollLeft");
				ret.y -= dojo.html.sumAncestorProperties(nd, "scrollTop");
			}
			var curnode = node;
			do{
				var n = curnode["offsetLeft"];
				//FIXME: ugly hack to workaround the submenu in 
				//popupmenu2 does not shown up correctly in opera. 
				//Someone have a better workaround?
				if(!h.opera || n>0){
					ret.x += isNaN(n) ? 0 : n;
				}
				var m = curnode["offsetTop"];
				ret.y += isNaN(m) ? 0 : m;
				curnode = curnode.offsetParent;
			}while((curnode != endNode)&&(curnode != null));
		}else if(node["x"]&&node["y"]){
			ret.x += isNaN(node.x) ? 0 : node.x;
			ret.y += isNaN(node.y) ? 0 : node.y;
		}
	}

	// account for document scrolling!
	if(includeScroll){
		var scroll = dojo.html.getScroll();
		ret.y += scroll.top;
		ret.x += scroll.left;
	}

	var extentFuncArray=[dojo.html.getPaddingExtent, dojo.html.getBorderExtent, dojo.html.getMarginExtent];
	if(nativeBoxType > targetBoxType){
		for(var i=targetBoxType;i<nativeBoxType;++i){
			ret.y += extentFuncArray[i](node, 'top');
			ret.x += extentFuncArray[i](node, 'left');
		}
	}else if(nativeBoxType < targetBoxType){
		for(var i=targetBoxType;i>nativeBoxType;--i){
			ret.y -= extentFuncArray[i-1](node, 'top');
			ret.x -= extentFuncArray[i-1](node, 'left');
		}
	}
	ret.top = ret.y;
	ret.left = ret.x;
	return ret;	//	object
}

dojo.html.isPositionAbsolute = function(/* HTMLElement */node){
	//	summary
	//	Returns true if the element is absolutely positioned.
	return (dojo.html.getComputedStyle(node, 'position') == 'absolute');	//	boolean
}

dojo.html._sumPixelValues = function(/* HTMLElement */node, selectors, autoIsZero){
	var total = 0;
	for(var x=0; x<selectors.length; x++){
		total += dojo.html.getPixelValue(node, selectors[x], autoIsZero);
	}
	return total;
}

dojo.html.getMargin = function(/* HTMLElement */node){
	//	summary
	//	Returns the width and height of the passed node's margin
	return {
		width: dojo.html._sumPixelValues(node, ["margin-left", "margin-right"], (dojo.html.getComputedStyle(node, 'position') == 'absolute')),
		height: dojo.html._sumPixelValues(node, ["margin-top", "margin-bottom"], (dojo.html.getComputedStyle(node, 'position') == 'absolute'))
	};	//	object
}

dojo.html.getBorder = function(/* HTMLElement */node){
	//	summary
	//	Returns the width and height of the passed node's border
	return {
		width: dojo.html.getBorderExtent(node, 'left') + dojo.html.getBorderExtent(node, 'right'),
		height: dojo.html.getBorderExtent(node, 'top') + dojo.html.getBorderExtent(node, 'bottom')
	};	//	object
}

dojo.html.getBorderExtent = function(/* HTMLElement */node, /* string */side){
	//	summary
	//	returns the width of the requested border
	return (dojo.html.getStyle(node, 'border-' + side + '-style') == 'none' ? 0 : dojo.html.getPixelValue(node, 'border-' + side + '-width'));	// integer
}

dojo.html.getMarginExtent = function(/* HTMLElement */node, /* string */side){
	//	summary
	//	returns the width of the requested margin
	return dojo.html._sumPixelValues(node, ["margin-" + side], dojo.html.isPositionAbsolute(node));	//	integer
}

dojo.html.getPaddingExtent = function(/* HTMLElement */node, /* string */side){
	//	summary
	//	Returns the width of the requested padding 
	return dojo.html._sumPixelValues(node, ["padding-" + side], true);	//	integer
}

dojo.html.getPadding = function(/* HTMLElement */node){
	//	summary
	//	Returns the width and height of the passed node's padding
	return {
		width: dojo.html._sumPixelValues(node, ["padding-left", "padding-right"], true),
		height: dojo.html._sumPixelValues(node, ["padding-top", "padding-bottom"], true)
	};	//	object
}

dojo.html.getPadBorder = function(/* HTMLElement */node){
	//	summary
	//	Returns the width and height of the passed node's padding and border
	var pad = dojo.html.getPadding(node);
	var border = dojo.html.getBorder(node);
	return { width: pad.width + border.width, height: pad.height + border.height };	//	object
}

dojo.html.getBoxSizing = function(/* HTMLElement */node){
	//	summary
	//	Returns which box model the passed element is working with
	var h = dojo.render.html;
	var bs = dojo.html.boxSizing;
	if((h.ie)||(h.opera)){ 
		var cm = document["compatMode"];
		if((cm == "BackCompat")||(cm == "QuirksMode")){ 
			return bs.BORDER_BOX; 	//	string
		}else{
			return bs.CONTENT_BOX; 	//	string
		}
	}else{
		if(arguments.length == 0){ node = document.documentElement; }
		var sizing = dojo.html.getStyle(node, "-moz-box-sizing");
		if(!sizing){ sizing = dojo.html.getStyle(node, "box-sizing"); }
		return (sizing ? sizing : bs.CONTENT_BOX);	//	string
	}
}

dojo.html.isBorderBox = function(/* HTMLElement */node){
	//	summary
	//	returns whether the passed element is using border box sizing or not.
	return (dojo.html.getBoxSizing(node) == dojo.html.boxSizing.BORDER_BOX);	//	boolean
}

dojo.html.getBorderBox = function(/* HTMLElement */node){
	//	summary
	//	Returns the dimensions of the passed element based on border-box sizing.
	node = dojo.byId(node);
	return { width: node.offsetWidth, height: node.offsetHeight };	//	object
}

dojo.html.getPaddingBox = function(/* HTMLElement */node){
	//	summary
	//	Returns the dimensions of the padding box (see http://www.w3.org/TR/CSS21/box.html)
	var box = dojo.html.getBorderBox(node);
	var border = dojo.html.getBorder(node);
	return {
		width: box.width - border.width,
		height:box.height - border.height
	};	//	object
}

dojo.html.getContentBox = function(/* HTMLElement */node){
	//	summary
	//	Returns the dimensions of the content box (see http://www.w3.org/TR/CSS21/box.html)
	node = dojo.byId(node);
	var padborder = dojo.html.getPadBorder(node);
	return {
		width: node.offsetWidth - padborder.width,
		height: node.offsetHeight - padborder.height
	};	//	object
}

dojo.html.setContentBox = function(/* HTMLElement */node, /* object */args){
	//	summary
	//	Sets the dimensions of the passed node according to content sizing.
	node = dojo.byId(node);
	var width = 0; var height = 0;
	var isbb = dojo.html.isBorderBox(node);
	var padborder = (isbb ? dojo.html.getPadBorder(node) : { width: 0, height: 0});
	var ret = {};
	if(typeof args.width != "undefined"){
		width = args.width + padborder.width;
		ret.width = dojo.html.setPositivePixelValue(node, "width", width);
	}
	if(typeof args.height != "undefined"){
		height = args.height + padborder.height;
		ret.height = dojo.html.setPositivePixelValue(node, "height", height);
	}
	return ret;	//	object
}

dojo.html.getMarginBox = function(/* HTMLElement */node){
	//	summary
	//	returns the dimensions of the passed node including any margins.
	var borderbox = dojo.html.getBorderBox(node);
	var margin = dojo.html.getMargin(node);
	return { width: borderbox.width + margin.width, height: borderbox.height + margin.height };	//	object
}

dojo.html.setMarginBox = function(/* HTMLElement */node, /* object */args){
	//	summary
	//	Sets the dimensions of the passed node using margin box calcs.
	node = dojo.byId(node);
	var width = 0; var height = 0;
	var isbb = dojo.html.isBorderBox(node);
	var padborder = (!isbb ? dojo.html.getPadBorder(node) : { width: 0, height: 0 });
	var margin = dojo.html.getMargin(node);
	var ret = {};
	if(typeof args.width != "undefined"){
		width = args.width - padborder.width;
		width -= margin.width;
		ret.width = dojo.html.setPositivePixelValue(node, "width", width);
	}
	if(typeof args.height != "undefined"){
		height = args.height - padborder.height;
		height -= margin.height;
		ret.height = dojo.html.setPositivePixelValue(node, "height", height);
	}
	return ret;	//	object
}

dojo.html.getElementBox = function(/* HTMLElement */node, /* string */type){
	//	summary
	//	return dimesions of a node based on the passed box model type.
	var bs = dojo.html.boxSizing;
	switch(type){
		case bs.MARGIN_BOX:
			return dojo.html.getMarginBox(node);	//	object
		case bs.BORDER_BOX:
			return dojo.html.getBorderBox(node);	//	object
		case bs.PADDING_BOX:
			return dojo.html.getPaddingBox(node);	//	object
		case bs.CONTENT_BOX:
		default:
			return dojo.html.getContentBox(node);	//	object
	}
}
// in: coordinate array [x,y,w,h] or dom node
// return: coordinate object
dojo.html.toCoordinateObject = dojo.html.toCoordinateArray = function(/* array */coords, /* boolean? */includeScroll, /* string? */boxtype) {
	//	summary
	//	Converts an array of coordinates into an object of named arguments.
	if(coords instanceof Array || typeof coords == "array"){
		dojo.deprecated("dojo.html.toCoordinateArray", "use dojo.html.toCoordinateObject({left: , top: , width: , height: }) instead", "0.5");
		// coords is already an array (of format [x,y,w,h]), just return it
		while ( coords.length < 4 ) { coords.push(0); }
		while ( coords.length > 4 ) { coords.pop(); }
		var ret = {
			left: coords[0],
			top: coords[1],
			width: coords[2],
			height: coords[3]
		};
	}else if(!coords.nodeType && !(coords instanceof String || typeof coords == "string") &&
			 ('width' in coords || 'height' in coords || 'left' in coords ||
			  'x' in coords || 'top' in coords || 'y' in coords)){
		// coords is a coordinate object or at least part of one
		var ret = {
			left: coords.left||coords.x||0,
			top: coords.top||coords.y||0,
			width: coords.width||0,
			height: coords.height||0
		};
	}else{
		// coords is an dom object (or dom object id); return it's coordinates
		var node = dojo.byId(coords);
		var pos = dojo.html.abs(node, includeScroll, boxtype);
		var marginbox = dojo.html.getMarginBox(node);
		var ret = {
			left: pos.left,
			top: pos.top,
			width: marginbox.width,
			height: marginbox.height
		};
	}
	ret.x = ret.left;
	ret.y = ret.top;
	return ret;	//	object
}

dojo.html.setMarginBoxWidth = dojo.html.setOuterWidth = function(node, width){
	return dojo.html._callDeprecated("setMarginBoxWidth", "setMarginBox", arguments, "width");
}
dojo.html.setMarginBoxHeight = dojo.html.setOuterHeight = function(){
	return dojo.html._callDeprecated("setMarginBoxHeight", "setMarginBox", arguments, "height");
}
dojo.html.getMarginBoxWidth = dojo.html.getOuterWidth = function(){
	return dojo.html._callDeprecated("getMarginBoxWidth", "getMarginBox", arguments, null, "width");
}
dojo.html.getMarginBoxHeight = dojo.html.getOuterHeight = function(){
	return dojo.html._callDeprecated("getMarginBoxHeight", "getMarginBox", arguments, null, "height");
}
dojo.html.getTotalOffset = function(node, type, includeScroll){
	return dojo.html._callDeprecated("getTotalOffset", "getAbsolutePosition", arguments, null, type);
}
dojo.html.getAbsoluteX = function(node, includeScroll){
	return dojo.html._callDeprecated("getAbsoluteX", "getAbsolutePosition", arguments, null, "x");
}
dojo.html.getAbsoluteY = function(node, includeScroll){
	return dojo.html._callDeprecated("getAbsoluteY", "getAbsolutePosition", arguments, null, "y");
}
dojo.html.totalOffsetLeft = function(node, includeScroll){
	return dojo.html._callDeprecated("totalOffsetLeft", "getAbsolutePosition", arguments, null, "left");
}
dojo.html.totalOffsetTop = function(node, includeScroll){
	return dojo.html._callDeprecated("totalOffsetTop", "getAbsolutePosition", arguments, null, "top");
}
dojo.html.getMarginWidth = function(node){
	return dojo.html._callDeprecated("getMarginWidth", "getMargin", arguments, null, "width");
}
dojo.html.getMarginHeight = function(node){
	return dojo.html._callDeprecated("getMarginHeight", "getMargin", arguments, null, "height");
}
dojo.html.getBorderWidth = function(node){
	return dojo.html._callDeprecated("getBorderWidth", "getBorder", arguments, null, "width");
}
dojo.html.getBorderHeight = function(node){
	return dojo.html._callDeprecated("getBorderHeight", "getBorder", arguments, null, "height");
}
dojo.html.getPaddingWidth = function(node){
	return dojo.html._callDeprecated("getPaddingWidth", "getPadding", arguments, null, "width");
}
dojo.html.getPaddingHeight = function(node){
	return dojo.html._callDeprecated("getPaddingHeight", "getPadding", arguments, null, "height");
}
dojo.html.getPadBorderWidth = function(node){
	return dojo.html._callDeprecated("getPadBorderWidth", "getPadBorder", arguments, null, "width");
}
dojo.html.getPadBorderHeight = function(node){
	return dojo.html._callDeprecated("getPadBorderHeight", "getPadBorder", arguments, null, "height");
}
dojo.html.getBorderBoxWidth = dojo.html.getInnerWidth = function(){
	return dojo.html._callDeprecated("getBorderBoxWidth", "getBorderBox", arguments, null, "width");
}
dojo.html.getBorderBoxHeight = dojo.html.getInnerHeight = function(){
	return dojo.html._callDeprecated("getBorderBoxHeight", "getBorderBox", arguments, null, "height");
}
dojo.html.getContentBoxWidth = dojo.html.getContentWidth = function(){
	return dojo.html._callDeprecated("getContentBoxWidth", "getContentBox", arguments, null, "width");
}
dojo.html.getContentBoxHeight = dojo.html.getContentHeight = function(){
	return dojo.html._callDeprecated("getContentBoxHeight", "getContentBox", arguments, null, "height");
}
dojo.html.setContentBoxWidth = dojo.html.setContentWidth = function(node, width){
	return dojo.html._callDeprecated("setContentBoxWidth", "setContentBox", arguments, "width");
}
dojo.html.setContentBoxHeight = dojo.html.setContentHeight = function(node, height){
	return dojo.html._callDeprecated("setContentBoxHeight", "setContentBox", arguments, "height");
}
