/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.experimental");

dojo.experimental = function(/* String */ moduleName, /* String? */ extra){
	// summary: Marks code as experimental.
	// description: 
	//    This can be used to mark a function, file, or module as experimental.
	//    Experimental code is not ready to be used, and the APIs are subject
	//    to change without notice.  Experimental code may be completed deleted
	//    without going through the normal deprecation process.
	// moduleName: The name of a module, or the name of a module file or a specific function
	// extra: some additional message for the user
	
	// examples:
	//    dojo.experimental("dojo.data.Result");
	//    dojo.experimental("dojo.weather.toKelvin()", "PENDING approval from NOAA");
	var message = "EXPERIMENTAL: " + moduleName;
	message += " -- Not yet ready for use.  APIs subject to change without notice.";
	if(extra){ message += " " + extra; }
	dojo.debug(message);
}
