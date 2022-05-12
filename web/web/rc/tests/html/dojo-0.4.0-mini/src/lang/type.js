/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.lang.type");
dojo.require("dojo.lang.common");

dojo.lang.whatAmI = function(value) {
	dojo.deprecated("dojo.lang.whatAmI", "use dojo.lang.getType instead", "0.5");
	return dojo.lang.getType(value);
}
dojo.lang.whatAmI.custom = {};

dojo.lang.getType = function(/* anything */ value){
	/* summary:
	 *	 Attempts to determine what type value is.
	 * value: Any literal value or object instance.
	 */
	try {
		if(dojo.lang.isArray(value)) { 
			return "array";	//	string 
		}
		if(dojo.lang.isFunction(value)) { 
			return "function";	//	string 
		}
		if(dojo.lang.isString(value)) { 
			return "string";	//	string 
		}
		if(dojo.lang.isNumber(value)) { 
			return "number";	//	string 
		}
		if(dojo.lang.isBoolean(value)) { 
			return "boolean";	//	string 
		}
		if(dojo.lang.isAlien(value)) { 
			return "alien";	//	string 
		}
		if(dojo.lang.isUndefined(value)) { 
			return "undefined";	//	string 
		}
		// FIXME: should this go first?
		for(var name in dojo.lang.whatAmI.custom) {
			if(dojo.lang.whatAmI.custom[name](value)) {
				return name;	//	string
			}
		}
		if(dojo.lang.isObject(value)) { 
			return "object";	//	string 
		}
	} catch(e) {}
	return "unknown";	//	string
}

dojo.lang.isNumeric = function(/* anything */ value){
	/* summary:
	 *   Returns true if value can be interpreted as a number
	 * value: Any literal value or object instance.
	 */
	 
	/* examples: 
	 *   dojo.lang.isNumeric(3);                 // returns true
	 *   dojo.lang.isNumeric("3");               // returns true
	 *   dojo.lang.isNumeric(new Number(3));     // returns true
	 *   dojo.lang.isNumeric(new String("3"));   // returns true
	 *
	 *   dojo.lang.isNumeric(3/0);               // returns false
	 *   dojo.lang.isNumeric("foo");             // returns false
	 *   dojo.lang.isNumeric(new Number("foo")); // returns false
	 *   dojo.lang.isNumeric(false);             // returns false
	 *   dojo.lang.isNumeric(true);              // returns false
	 */
	return (!isNaN(value) 
		&& isFinite(value) 
		&& (value != null) 
		&& !dojo.lang.isBoolean(value) 
		&& !dojo.lang.isArray(value) 
		&& !/^\s*$/.test(value)
	);	//	boolean
}

dojo.lang.isBuiltIn = function(/* anything */ value){
	/* summary:
	 *   Returns true if value is of a type provided by core JavaScript
	 * description: 
	 *   Returns true for any literal, and for any object that is an 
	 *   instance of a built-in type like String, Number, Boolean, 
	 *   Array, Function, or Error.
	 * value: Any literal value or object instance.
	 */
	return (dojo.lang.isArray(value)
		|| dojo.lang.isFunction(value)	
		|| dojo.lang.isString(value)
		|| dojo.lang.isNumber(value)
		|| dojo.lang.isBoolean(value)
		|| (value == null)
		|| (value instanceof Error)
		|| (typeof value == "error") 
	);	//	boolean
}

dojo.lang.isPureObject = function(/* anything */ value){
	/* summary:
	 *   Returns true for any value where the value of value.constructor == Object
	 * description: 
	 *   Returns true for any literal, and for any object that is an 
	 *   instance of a built-in type like String, Number, Boolean, 
	 *   Array, Function, or Error.
	 * value: Any literal value or object instance.
	 */
	
	/* examples: 
	 *   dojo.lang.isPureObject(new Object()); // returns true
	 *   dojo.lang.isPureObject({a: 1, b: 2}); // returns true
	 * 
	 *   dojo.lang.isPureObject(new Date());   // returns false
	 *   dojo.lang.isPureObject([11, 2, 3]);   // returns false
	 */
	return ((value != null) 
		&& dojo.lang.isObject(value) 
		&& value.constructor == Object
	);	//	boolean
}

dojo.lang.isOfType = function(/* anything */ value, /* function */ type, /* object? */ keywordParameters) {
	/* summary:
	 *	 Returns true if 'value' is of type 'type'
	 * description: 
	 *	 Given a value and a datatype, this method returns true if the
	 *	 type of the value matches the datatype. The datatype parameter
	 *	 can be an array of datatypes, in which case the method returns
	 *	 true if the type of the value matches any of the datatypes.
	 * value: Any literal value or object instance.
	 * type: A class of object, or a literal type, or the string name of a type, or an array with a list of types.
	 * keywordParameters: {optional: boolean}
	 */
	 
	/* examples: 
	 *   dojo.lang.isOfType("foo", String);                // returns true
	 *   dojo.lang.isOfType(12345, Number);                // returns true
	 *   dojo.lang.isOfType(false, Boolean);               // returns true
	 *   dojo.lang.isOfType([6, 8], Array);                // returns true
	 *   dojo.lang.isOfType(dojo.lang.isOfType, Function); // returns true
	 *   dojo.lang.isOfType({foo: "bar"}, Object);         // returns true
	 *   dojo.lang.isOfType(new Date(), Date);             // returns true
	 *
	 *   dojo.lang.isOfType("foo", "string");                // returns true
	 *   dojo.lang.isOfType(12345, "number");                // returns true
	 *   dojo.lang.isOfType(false, "boolean");               // returns true
	 *   dojo.lang.isOfType([6, 8], "array");                // returns true
	 *   dojo.lang.isOfType(dojo.lang.isOfType, "function"); // returns true
	 *   dojo.lang.isOfType({foo: "bar"}, "object");         // returns true
	 *   dojo.lang.isOfType(xxxxx, "undefined");             // returns true
	 *   dojo.lang.isOfType(null, "null");                   // returns true
	 *
	 *   dojo.lang.isOfType("foo", [Number, String, Boolean]); // returns true
	 *   dojo.lang.isOfType(12345, [Number, String, Boolean]); // returns true
	 *   dojo.lang.isOfType(false, [Number, String, Boolean]); // returns true
	 *
	 *   dojo.lang.isOfType(null, Date, {optional: true} );    // returns true	// description: 
	 */
	var optional = false;
	if (keywordParameters) {
		optional = keywordParameters["optional"];
	}
	if (optional && ((value === null) || dojo.lang.isUndefined(value))) {
		return true;	//	boolean
	}
	if(dojo.lang.isArray(type)){
		var arrayOfTypes = type;
		for(var i in arrayOfTypes){
			var aType = arrayOfTypes[i];
			if(dojo.lang.isOfType(value, aType)) {
				return true; 	//	boolean
			}
		}
		return false;	//	boolean
	}else{
		if(dojo.lang.isString(type)){
			type = type.toLowerCase();
		}
		switch (type) {
			case Array:
			case "array":
				return dojo.lang.isArray(value);	//	boolean
			case Function:
			case "function":
				return dojo.lang.isFunction(value);	//	boolean
			case String:
			case "string":
				return dojo.lang.isString(value);	//	boolean
			case Number:
			case "number":
				return dojo.lang.isNumber(value);	//	boolean
			case "numeric":
				return dojo.lang.isNumeric(value);	//	boolean
			case Boolean:
			case "boolean":
				return dojo.lang.isBoolean(value);	//	boolean
			case Object:
			case "object":
				return dojo.lang.isObject(value);	//	boolean
			case "pureobject":
				return dojo.lang.isPureObject(value);	//	boolean
			case "builtin":
				return dojo.lang.isBuiltIn(value);	//	boolean
			case "alien":
				return dojo.lang.isAlien(value);	//	boolean
			case "undefined":
				return dojo.lang.isUndefined(value);	//	boolean
			case null:
			case "null":
				return (value === null);	//	boolean
			case "optional":
				dojo.deprecated('dojo.lang.isOfType(value, [type, "optional"])', 'use dojo.lang.isOfType(value, type, {optional: true} ) instead', "0.5");
				return ((value === null) || dojo.lang.isUndefined(value));	//	boolean
			default:
				if (dojo.lang.isFunction(type)) {
					return (value instanceof type);	//	boolean
				} else {
					dojo.raise("dojo.lang.isOfType() was passed an invalid type");
				}
		}
	}
	dojo.raise("If we get here, it means a bug was introduced above.");
}

dojo.lang.getObject=function(/* String */ str){
	// summary:
	//   Will return an object, if it exists, based on the name in the passed string.
	var parts=str.split("."), i=0, obj=dj_global; 
	do{ 
		obj=obj[parts[i++]]; 
	}while(i<parts.length&&obj); 
	return (obj!=dj_global)?obj:null;	//	Object
}

dojo.lang.doesObjectExist=function(/* String */ str){
	// summary:
	//   Check to see if object [str] exists, based on the passed string.
	var parts=str.split("."), i=0, obj=dj_global; 
	do{ 
		obj=obj[parts[i++]]; 
	}while(i<parts.length&&obj); 
	return (obj&&obj!=dj_global);	//	boolean
}
