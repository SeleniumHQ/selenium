/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.dnd.HtmlDragCopy");
dojo.require("dojo.dnd.*");

dojo.declare("dojo.dnd.HtmlDragCopySource", dojo.dnd.HtmlDragSource,
function(node, type, copyOnce){
		this.copyOnce = copyOnce;
		this.makeCopy = true;
},
{
	onDragStart: function(){
		var dragObj = new dojo.dnd.HtmlDragCopyObject(this.dragObject, this.type, this);
		if(this.dragClass) { dragObj.dragClass = this.dragClass; }

		if (this.constrainToContainer) {
			dragObj.constrainTo(this.constrainingContainer || this.domNode.parentNode);
		}

		return dragObj;
	},
	onSelected: function() {
		for (var i=0; i<this.dragObjects.length; i++) {
			dojo.dnd.dragManager.selectedSources.push(new dojo.dnd.HtmlDragCopySource(this.dragObjects[i]));
		}
	}
});

dojo.declare("dojo.dnd.HtmlDragCopyObject", dojo.dnd.HtmlDragObject,
function(dragObject, type, source){
		this.copySource = source;
},
{
	onDragStart: function(e) {
		dojo.dnd.HtmlDragCopyObject.superclass.onDragStart.apply(this, arguments);
		if(this.copySource.makeCopy) {
			this.sourceNode = this.domNode;
			this.domNode    = this.domNode.cloneNode(true);
		}
	},
	onDragEnd: function(e){
		switch(e.dragStatus){
			case "dropFailure": // slide back to the start
				var startCoords = dojo.html.getAbsolutePosition(this.dragClone, true);
				// offset the end so the effect can be seen
				var endCoords = { left: this.dragStartPosition.x + 1,
					top: this.dragStartPosition.y + 1};

				// animate
				var anim = dojo.lfx.slideTo(this.dragClone, endCoords, 500, dojo.lfx.easeOut);
				var dragObject = this;
				dojo.event.connect(anim, "onEnd", function (e) {
					// pause for a second (not literally) and disappear
					dojo.lang.setTimeout(function() {
							dojo.html.removeNode(dragObject.dragClone);
							dragObject.dragClone = null;
							if(dragObject.copySource.makeCopy) {
								dojo.html.removeNode(dragObject.domNode);
								dragObject.domNode = dragObject.sourceNode;
								dragObject.sourceNode = null;
							}
						},
						200);
				});
				anim.play();
				dojo.event.topic.publish('dragEnd', { source: this } );
				return;
		}
		dojo.dnd.HtmlDragCopyObject.superclass.onDragEnd.apply(this, arguments);
		this.copySource.dragObject = this.domNode;
		if(this.copySource.copyOnce){
			this.copySource.makeCopy = false;
		}
		new dojo.dnd.HtmlDragCopySource(this.sourceNode, this.type, this.copySource.copyOnce);
		this.sourceNode = null;
	}
});
