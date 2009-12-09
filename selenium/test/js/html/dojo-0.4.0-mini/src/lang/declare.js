/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.lang.declare");

dojo.require("dojo.lang.common");
dojo.require("dojo.lang.extras");

dojo.lang.declare = function(/*String*/ className, /*Function|Array*/ superclass, /*Function?*/ init, /*Object|Array*/ props){
/*
 * summary: Create a feature-rich constructor with a compact notation
 *
 * className: the name of the constructor (loosely, a "class")
 *
 * superclass: may be a Function, or an Array of Functions. 
 *   If "superclass" is an array, the first element is used 
 *   as the prototypical ancestor and any following Functions 
 *   become mixin ancestors.
 *
 * init: an initializer function
 *
 * props: an object (or array of objects) whose properties are copied to the created prototype
 *
 * description: Create a constructor using a compact notation for inheritance and prototype extension.
 *
 *   "superclass" argument may be a Function, or an array of 
 *   Functions. 
 *
 *   If "superclass" is an array, the first element is used 
 *   as the prototypical ancestor and any following Functions 
 *   become mixin ancestors. 
 * 
 *   All "superclass(es)" must be Functions (not mere Objects).
 *
 *   Using mixin ancestors provides a type of multiple
 *   inheritance. Mixin ancestors prototypical 
 *   properties are copied to the subclass, and any 
 *   inializater/constructor is invoked. 
 *
 *   Properties of object "props" are copied to the constructor 
 *   prototype. If "props" is an array, properties of each
 *   object in the array are copied to the constructor prototype.
 *
 *   name of the class ("className" argument) is stored in 
 *   "declaredClass" property
 * 
 *   Initializer functions are called when an object 
 *   is instantiated from this constructor.
 * 
 * Aliased as "dojo.declare"
 *
 * Usage:
 *
 * dojo.declare("my.classes.bar", my.classes.foo,
 *	function() {
 *		// initialization function
 *		this.myComplicatedObject = new ReallyComplicatedObject(); 
 *	},{
 *	someValue: 2,
 *	someMethod: function() { 
 *		doStuff(); 
 *	}
 * });
 *
 */
	if((dojo.lang.isFunction(props))||((!props)&&(!dojo.lang.isFunction(init)))){ 
	 // parameter juggling to support omitting init param (also allows reordering init and props arguments)
		var temp = props;
		props = init;
		init = temp;
	}	
	var mixins = [ ];
	if(dojo.lang.isArray(superclass)){
		mixins = superclass;
		superclass = mixins.shift();
	}
	if(!init){
		init = dojo.evalObjPath(className, false);
		if((init)&&(!dojo.lang.isFunction(init))){ init = null };
	}
	var ctor = dojo.lang.declare._makeConstructor();
	var scp = (superclass ? superclass.prototype : null);
	if(scp){
		scp.prototyping = true;
		ctor.prototype = new superclass();
		scp.prototyping = false; 
	}
	ctor.superclass = scp;
	ctor.mixins = mixins;
	for(var i=0,l=mixins.length; i<l; i++){
		dojo.lang.extend(ctor, mixins[i].prototype);
	}
	ctor.prototype.initializer = null;
	ctor.prototype.declaredClass = className;
	if(dojo.lang.isArray(props)){
		dojo.lang.extend.apply(dojo.lang, [ctor].concat(props));
	}else{
		dojo.lang.extend(ctor, (props)||{});
	}
	dojo.lang.extend(ctor, dojo.lang.declare._common);
	ctor.prototype.constructor = ctor;
	ctor.prototype.initializer = (ctor.prototype.initializer)||(init)||(function(){});
	dojo.lang.setObjPathValue(className, ctor, null, true);
	return ctor; // Function
}

dojo.lang.declare._makeConstructor = function() {
	return function(){ 
		// get the generational context (which object [or prototype] should be constructed)
		var self = this._getPropContext();
		var s = self.constructor.superclass;
		if((s)&&(s.constructor)){
			if(s.constructor==arguments.callee){
				// if this constructor is invoked directly (my.ancestor.call(this))
				this._inherited("constructor", arguments);
			}else{
				this._contextMethod(s, "constructor", arguments);
			}
		}
		var ms = (self.constructor.mixins)||([]);
		for(var i=0, m; (m=ms[i]); i++) {
			(((m.prototype)&&(m.prototype.initializer))||(m)).apply(this, arguments);
		}
		if((!this.prototyping)&&(self.initializer)){
			self.initializer.apply(this, arguments);
		}
	}
}

dojo.lang.declare._common = {
	_getPropContext: function() { return (this.___proto||this); },
	// caches ptype context and calls method on it
	_contextMethod: function(ptype, method, args){
		var result, stack = this.___proto;
		this.___proto = ptype;
		try { result = ptype[method].apply(this,(args||[])); }
		catch(e) { throw e; }	
		finally { this.___proto = stack; }
		return result;
	},
	_inherited: function(prop, args){
		// summary
		//	Searches backward thru prototype chain to find nearest ancestral instance of prop.
		//	Internal use only.
		var p = this._getPropContext();
		do{
			if((!p.constructor)||(!p.constructor.superclass)){return;}
			p = p.constructor.superclass;
		}while(!(prop in p));
		return (dojo.lang.isFunction(p[prop]) ? this._contextMethod(p, prop, args) : p[prop]);
	}
}

dojo.declare = dojo.lang.declare;