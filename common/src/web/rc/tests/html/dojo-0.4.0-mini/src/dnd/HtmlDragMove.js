/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.dnd.HtmlDragMove");
dojo.require("dojo.dnd.*");

dojo.declare("dojo.dnd.HtmlDragMoveSource", dojo.dnd.HtmlDragSource, {
	onDragStart: function(){
		var dragObj =  new dojo.dnd.HtmlDragMoveObject(this.dragObject, this.type);
		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer);
		}
		return dragObj;
	},
	/*
	 * see dojo.dnd.HtmlDragSource.onSelected
	 */
	onSelected: function() {
		for (var i=0; i<this.dragObjects.length; i++) {
			dojo.dnd.dragManager.selectedSources.push(new dojo.dnd.HtmlDragMoveSource(this.dragObjects[i]));
		}
	}
});

dojo.declare("dojo.dnd.HtmlDragMoveObject", dojo.dnd.HtmlDragObject, {
	onDragEnd: function(e){
		// shortly the browser will fire an onClick() event,
		// but since this was really a drag, just squelch it
		dojo.event.connect(this.domNode, "onclick", this, "squelchOnClick");
	},
	onDragStart: function(e){
		dojo.html.clearSelection();

		this.dragClone = this.domNode;

		this.scrollOffset = dojo.html.getScroll().offset;
		this.dragStartPosition = dojo.html.abs(this.domNode, true);
		
		this.dragOffset = {y: this.dragStartPosition.y - e.pageY,
			x: this.dragStartPosition.x - e.pageX};

		this.containingBlockPosition = this.domNode.offsetParent ? 
			dojo.html.abs(this.domNode.offsetParent, true) : {x:0, y:0};

		this.dragClone.style.position = "absolute";

		if (this.constrainToContainer) {
			this.constraints = this.getConstraints();
		}
	},
	/**
	 * Set the position of the drag node.  (x,y) is relative to <body>.
	 */
	setAbsolutePosition: function(x, y){
		// The drag clone is attached to it's constraining container so offset for that
		if(!this.disableY) { this.domNode.style.top = (y-this.containingBlockPosition.y) + "px"; }
		if(!this.disableX) { this.domNode.style.left = (x-this.containingBlockPosition.x) + "px"; }
	}
});
