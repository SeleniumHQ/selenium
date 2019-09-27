/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.lang.assert");

dojo.require("dojo.lang.common");
dojo.require("dojo.lang.array");
dojo.require("dojo.lang.type");

dojo.lang.assert = function(/* boolean */ booleanValue, /* string? */ message){
	/* summary: 
	 *   Throws an exception if the assertion fails.
	 * description: 
	 *   If the asserted condition is true, this method does nothing. If the
	 *   condition is false, we throw an error with a error message. 
	 * booleanValue: Must be true for the assertion to succeed.
	 * message: A string describing the assertion.
	 */

	 // throws: Throws an Error if 'booleanValue' is false.
	 if(!booleanValue){
		var errorMessage = "An assert statement failed.\n" +
			"The method dojo.lang.assert() was called with a 'false' value.\n";
		if(message){
			errorMessage += "Here's the assert message:\n" + message + "\n";
		}
		// Use throw instead of dojo.raise, until bug #264 is fixed:
		// dojo.raise(errorMessage);
		throw new Error(errorMessage);
	}
}

dojo.lang.assertType = function(/* anything */ value, /* misc. */ type, /* object? */ keywordParameters){
	/* summary: 
	 *   Throws an exception if 'value' is not of type 'type'
	 * description: 
	 *   Given a value and a data type, this method checks the type of the value
	 *   to make sure it matches the data type, and throws an exception if there
	 *   is a mismatch.
	 * value: Any literal value or object instance.
	 * type: A class of object, or a literal type, or the string name of a type, or an array with a list of types.
	 * keywordParameters: {optional: boolean}
	 */
	 
	/* examples: 
	 *   dojo.lang.assertType("foo", String);
	 *   dojo.lang.assertType(12345, Number);
	 *   dojo.lang.assertType(false, Boolean);
	 *   dojo.lang.assertType([6, 8], Array);
	 *   dojo.lang.assertType(dojo.lang.assertType, Function);
	 *   dojo.lang.assertType({foo: "bar"}, Object);
	 *   dojo.lang.assertType(new Date(), Date);
	 *   dojo.lang.assertType(null, Array, {optional: true});
	 * throws: Throws an Error if 'value' is not of type 'type'.
	 */
	if (dojo.lang.isString(keywordParameters)) {
		dojo.deprecated('dojo.lang.assertType(value, type, "message")', 'use dojo.lang.assertType(value, type) instead', "0.5");
	}
	if(!dojo.lang.isOfType(value, type, keywordParameters)){
		if(!dojo.lang.assertType._errorMessage){
			dojo.lang.assertType._errorMessage = "Type mismatch: dojo.lang.assertType() failed.";
		}
		dojo.lang.assert(false, dojo.lang.assertType._errorMessage);
	}
}

dojo.lang.assertValidKeywords = function(/* object */ object, /* array */ expectedProperties, /* string? */ message){
	/* summary: 
	 *   Throws an exception 'object' has any properties other than the 'expectedProperties'.
	 * description: 
	 *   Given an anonymous object and a list of expected property names, this
	 *   method check to make sure the object does not have any properties
	 *   that aren't on the list of expected properties, and throws an Error
	 *   if there are unexpected properties. This is useful for doing error
	 *   checking on keyword arguments, to make sure there aren't typos.
	 * object: An anonymous object.
	 * expectedProperties: An array of strings (or an object with all the expected properties).
	 * message: A message describing the assertion.
	 */
	 
	/* examples: 
	 *   dojo.lang.assertValidKeywords({a: 1, b: 2}, ["a", "b"]);
	 *   dojo.lang.assertValidKeywords({a: 1, b: 2}, ["a", "b", "c"]);
	 *   dojo.lang.assertValidKeywords({foo: "iggy"}, ["foo"]);
	 *   dojo.lang.assertValidKeywords({foo: "iggy"}, ["foo", "bar"]);
	 *   dojo.lang.assertValidKeywords({foo: "iggy"}, {foo: null, bar: null});
	 * throws: Throws an Error if 'object' has unexpected properties.
	 */
	var key;
	if(!message){
		if(!dojo.lang.assertValidKeywords._errorMessage){
			dojo.lang.assertValidKeywords._errorMessage = "In dojo.lang.assertValidKeywords(), found invalid keyword:";
		}
		message = dojo.lang.assertValidKeywords._errorMessage;
	}
	if(dojo.lang.isArray(expectedProperties)){
		for(key in object){
			if(!dojo.lang.inArray(expectedProperties, key)){
				dojo.lang.assert(false, message + " " + key);
			}
		}
	}else{
		for(key in object){
			if(!(key in expectedProperties)){
				dojo.lang.assert(false, message + " " + key);
			}
		}
	}
}
