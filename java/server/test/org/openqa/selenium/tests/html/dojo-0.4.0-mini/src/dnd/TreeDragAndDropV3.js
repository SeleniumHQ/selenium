/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

/**
 * TreeDrag* specialized on managing subtree drags
 * It selects nodes and visualises what's going on,
 * but delegates real actions upon tree to the controller
 *
 * This code is considered a part of controller
*/

dojo.provide("dojo.dnd.TreeDragAndDropV3");

dojo.require("dojo.dnd.HtmlDragAndDrop");
dojo.require("dojo.lang.func");
dojo.require("dojo.lang.array");
dojo.require("dojo.lang.extras");
dojo.require("dojo.Deferred");
dojo.require("dojo.html.layout");

// FIXME: if controller can't move then skip node on move start
dojo.dnd.TreeDragSourceV3 = function(node, syncController, type, treeNode){
	//dojo.profile.start("TreeDragSourceV3 "+treeNode);
	this.controller = syncController;
	this.treeNode = treeNode;

	dojo.dnd.HtmlDragSource.call(this, node, type);
	//dojo.profile.end("TreeDragSourceV3 "+treeNode);

}

dojo.inherits(dojo.dnd.TreeDragSourceV3, dojo.dnd.HtmlDragSource);


// .......................................

dojo.dnd.TreeDropTargetV3 = function(domNode, controller, type, treeNode){

	this.treeNode = treeNode;
	this.controller = controller; // I will sync-ly process drops
	
	dojo.dnd.HtmlDropTarget.call(this, domNode, type);
}

dojo.inherits(dojo.dnd.TreeDropTargetV3, dojo.dnd.HtmlDropTarget);

dojo.lang.extend(dojo.dnd.TreeDropTargetV3, {

	autoExpandDelay: 1500,
	autoExpandTimer: null,


	position: null,

	indicatorStyle: "2px black groove",

	showIndicator: function(position) {

		// do not change style too often, cause of blinking possible
		if (this.position == position) {
			return;
		}

		//dojo.debug("set position for "+this.treeNode)

		this.hideIndicator();

		this.position = position;
		
		var node = this.treeNode;
			
		
		node.contentNode.style.width = dojo.html.getBorderBox(node.labelNode).width + "px";

		if (position == "onto") {					
			node.contentNode.style.border = this.indicatorStyle;
		} else {
			// FIXME: bottom-top or highlight should cover ONLY top/bottom or div itself,
			// not span whole line (try Dnd)
			// FAILURE: Can't put span inside div: multiline bottom-top will span multiple lines
			if (position == "before") {
				node.contentNode.style.borderTop = this.indicatorStyle;
			} else if (position == "after") {
				node.contentNode.style.borderBottom = this.indicatorStyle;
			}									
		}  
	},

	hideIndicator: function() {
		this.treeNode.contentNode.style.borderBottom = "";
		this.treeNode.contentNode.style.borderTop = "";
		this.treeNode.contentNode.style.border = "";
		this.treeNode.contentNode.style.width=""
		this.position = null;
	},



	// is the target possibly ok ?
	// This function is run on dragOver, but drop possibility is also determined by position over node
	// that's why acceptsWithPosition is called
	// doesnt take index into account ( can change while moving mouse w/o changing target )
	/**
	 * Coarse (tree-level) access check.
	 * We can't determine real accepts status w/o position
	*/
	onDragOver: function(e){
		//dojo.debug("onDragOver for "+e);

		var accepts = dojo.dnd.HtmlDropTarget.prototype.onDragOver.apply(this, arguments);

		//dojo.debug("TreeDropTarget.onDragOver accepts:"+accepts)

		if (accepts && this.treeNode.isFolder && !this.treeNode.isExpanded) {
			this.setAutoExpandTimer();
		}
		
		if (accepts) {
			this.cacheNodeCoords();
		}


		return accepts;
	},

	/* Parent.onDragOver calls this function to get accepts status */
	accepts: function(dragObjects) {

		var accepts = dojo.dnd.HtmlDropTarget.prototype.accepts.apply(this, arguments);

		//dojo.debug("accepts "+accepts);

		if (!accepts) return false;

		for(var i=0; i<dragObjects.length; i++) {
			// there may be NO treeNode
			var sourceTreeNode = dragObjects[i].dragSource.treeNode;
			
			if (sourceTreeNode === this.treeNode) return false;
		}

		return true;
	},



	setAutoExpandTimer: function() {
		// set up autoexpand timer
		var _this = this;

		var autoExpand = function () {
			if (dojo.dnd.dragManager.currentDropTarget === _this) {
				_this.controller.expand(_this.treeNode);
				// SLOW. Coordinates will not be recalculated if collapse occurs, or
				// other (generic) resize. So that's a kind of hack.
				dojo.dnd.dragManager.cacheTargetLocations();
			}
		}

		this.autoExpandTimer = dojo.lang.setTimeout(autoExpand, _this.autoExpandDelay);
	},

		

	getAcceptPosition: function(e, dragObjects) {


		var DndMode = this.treeNode.tree.DndMode;

		// disable ONTO mode possibility if impossible 
		if (DndMode & dojo.widget.TreeV3.prototype.DndModes.ONTO &&
			// check if ONTO is allowed localy
			// check dynamically cause may change w/o regeneration of dropTarget
			this.treeNode.actionIsDisabledNow(this.treeNode.actions.ADDCHILD) 
		) {
			// disable ONTO if can't move
			DndMode &= ~dojo.widget.TreeV3.prototype.DndModes.ONTO;
		}
		

		var position = this.getPosition(e, DndMode);

		//dojo.debug(DndMode & +" : "+position);


		// if onto is here => it was allowed before, no accept check is needed
		if (position=="onto") {
			return position;
		}
		
		for(var i=0; i<dragObjects.length; i++) {
			var source = dragObjects[i].dragSource;
			if (source.treeNode && this.isAdjacentNode(source.treeNode, position)) { // skip check if same parent
				continue;
			}		
						
			if (!this.controller.canMove(source.treeNode ? source.treeNode : source, this.treeNode.parent)) {
				return false;
			}
		}
		
		return position;
	
	},

	

	onDropEnd: function(e) {
		this.clearAutoExpandTimer();

		this.hideIndicator();
	},


	onDragOut: function(e) {
		this.clearAutoExpandTimer();

		this.hideIndicator();
	},

	clearAutoExpandTimer: function() {
		if (this.autoExpandTimer) {
			clearTimeout(this.autoExpandTimer);
			this.autoExpandTimer = null;
		}
	},



	onDragMove: function(e, dragObjects){
		
		var position = this.getAcceptPosition(e, dragObjects);

		if (position) {
			this.showIndicator(position);
		}

	},

	isAdjacentNode: function(sourceNode, position) {

		if (sourceNode === this.treeNode) return true;
		if (sourceNode.getNextSibling() === this.treeNode && position=="before") return true;
		if (sourceNode.getPreviousSibling() === this.treeNode && position=="after") return true;

		return false;
	},


	/**
	 * cache node coordinates to speed up onDragMove
	 */
	cacheNodeCoords: function() {
		var node = this.treeNode.contentNode;
		
		this.cachedNodeY = dojo.html.getAbsolutePosition(node).y;
		this.cachedNodeHeight = dojo.html.getBorderBox(node).height;
	},
	
	

	/* get DndMode and see which position e fits */
	getPosition: function(e, DndMode) {
		var mousey = e.pageY || e.clientY + dojo.body().scrollTop;
		
		var relY = mousey - this.cachedNodeY;
		var p = relY / this.cachedNodeHeight;

		var position = ""; // "" <=> forbidden
		if (DndMode & dojo.widget.TreeV3.prototype.DndModes.ONTO
		  && DndMode & dojo.widget.TreeV3.prototype.DndModes.BETWEEN) {
			//dojo.debug("BOTH");
			if (p<=0.33) {
				position = "before";
				// if children are expanded then I ignore understrike, cause it is confusing with firstChild
				// but for last nodes I put understrike there
			} else if (p<=0.66 || this.treeNode.isExpanded && this.treeNode.children.length && !this.treeNode.isLastChild()) {
				position = "onto";
			} else {
				position = "after";
			}
		} else if (DndMode & dojo.widget.TreeV3.prototype.DndModes.BETWEEN) {
			//dojo.debug("BETWEEN");
			if (p<=0.5 || this.treeNode.isExpanded && this.treeNode.children.length && !this.treeNode.isLastChild()) {
				position = "before";
			} else {
				position = "after";
			}
		}
		else if (DndMode & dojo.widget.TreeV3.prototype.DndModes.ONTO) {
			//dojo.debug("ONTO");
			position = "onto";
		}

		//dojo.debug(position);

		return position;
	},



	getTargetParentIndex: function(source, position) {

		var index = position == "before" ? this.treeNode.getParentIndex() : this.treeNode.getParentIndex()+1;
		if (source.treeNode
		  && this.treeNode.parent === source.treeNode.parent
		  && this.treeNode.getParentIndex() > source.treeNode.getParentIndex()) {
		  	index--;  // dragging a node is different for simple move bacause of before-after issues
		}

		return index;
	},


	onDrop: function(e) {
		// onDropEnd will clean position

		
		var position = this.position;

//dojo.debug(position);
		var source = e.dragObject.dragSource;
		
		//dojo.debug("onDrop "+source.treeNode+" " + position + " "+this.treeNode);


		var targetParent, targetIndex;
		if (position == "onto") {
			targetParent = this.treeNode;
			targetIndex = 0;
		} else {
			targetIndex = this.getTargetParentIndex(source, position);
			targetParent = this.treeNode.parent;
		}
		
		//dojo.profile.start("onDrop "+sourceTreeNode);
		var r = this.getDropHandler(e, source, targetParent, targetIndex)();
		
		//dojo.profile.end("onDrop "+sourceTreeNode);
			
		return r;

	},
	
	/**
	 * determine, which action I should perform with nodes
	 * e.g move, clone..
	 */
	getDropHandler: function(e, source, targetParent, targetIndex) {
		var handler;
		var _this = this;
		handler = function () {
			var result;
			
			//dojo.debug("Move "+source.treeNode+" to parent "+targetParent+":"+targetIndex);
			if (source.treeNode) {
				result = _this.controller.move(source.treeNode, targetParent, targetIndex, true);
				//dojo.debug("moved "+result);
			} else {
				if (dojo.lang.isFunction(source.onDrop)) {
					source.onDrop(targetParent, targetIndex);
				}
				
				var treeNode = source.getTreeNode();
				if (treeNode) {
					result = _this.controller.createChild(targetParent, targetIndex, treeNode, true);
				} else {
					result = true;
				}
			}
			
			if (result instanceof dojo.Deferred) {
				// this Deferred is always sync
				var isSuccess = result.fired == 0;
				if (!isSuccess) {
					_this.handleDropError(source, targetParent, targetIndex, result);
				}
				
				return isSuccess;				
				
			} else {
				return result;
			}
		}
		
		return handler;
	},
	
	
	handleDropError: function(source, parent, index, result) {
		dojo.debug("TreeDropTargetV3.handleDropError: DND error occured");
		dojo.debugShallow(result);
	}


});

