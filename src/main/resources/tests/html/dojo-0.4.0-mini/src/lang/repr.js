/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.lang.repr");

dojo.require("dojo.lang.common");
dojo.require("dojo.AdapterRegistry");
dojo.require("dojo.string.extras");

dojo.lang.reprRegistry = new dojo.AdapterRegistry();
dojo.lang.registerRepr = function(/*String*/name, /*Function*/check, /*Function*/wrap, /*Boolean?*/override){
	// summary:
	//	Register a repr function.  repr functions should take
	//	one argument and return a string representation of it
	//	suitable for developers, primarily used when debugging.
	//
	//	If override is given, it is used as the highest priority
	//	repr, otherwise it will be used as the lowest.

	dojo.lang.reprRegistry.register(name, check, wrap, override);
};

dojo.lang.repr = function(/*Object*/obj){
	// summary: Return a "programmer representation" for an object
	// description: returns a string representation of an object suitable for developers, primarily used when debugging

	if(typeof(obj) == "undefined"){
		// obj: undefined
		return "undefined"; // String
	}else if(obj === null){
		// obj: null
		return "null"; // String
	}

	try{
		if(typeof(obj["__repr__"]) == 'function'){
			return obj["__repr__"]();
		}else if((typeof(obj["repr"]) == 'function')&&(obj.repr != arguments.callee)){
			return obj["repr"]();
		}
		return dojo.lang.reprRegistry.match(obj);
	}catch(e){
		if(typeof(obj.NAME) == 'string' && (
				obj.toString == Function.prototype.toString ||
				obj.toString == Object.prototype.toString
			)){
			return obj.NAME; // String
		}
	}

	if(typeof(obj) == "function"){
		// obj: Function
		obj = (obj + "").replace(/^\s+/, "");
		var idx = obj.indexOf("{");
		if(idx != -1){
			obj = obj.substr(0, idx) + "{...}";
		}
	}
	return obj + ""; // String
}

dojo.lang.reprArrayLike = function(/*Array*/arr){
	// summary: Maps each element of arr to dojo.lang.repr and provides output in an array-like format
	// description: returns an array-like string representation of the provided array suitable for developers, primarily used when debugging
	try{
		var na = dojo.lang.map(arr, dojo.lang.repr);
		return "[" + na.join(", ") + "]"; // String
	}catch(e){ }
};

(function(){
	var m = dojo.lang;
	m.registerRepr("arrayLike", m.isArrayLike, m.reprArrayLike);
	m.registerRepr("string", m.isString, m.reprString);
	m.registerRepr("numbers", m.isNumber, m.reprNumber);
	m.registerRepr("boolean", m.isBoolean, m.reprNumber);
	// m.registerRepr("numbers", m.typeMatcher("number", "boolean"), m.reprNumber);
})();
