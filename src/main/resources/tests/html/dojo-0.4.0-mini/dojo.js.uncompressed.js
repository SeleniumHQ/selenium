if(typeof dojo == "undefined"){

/**
* @file bootstrap1.js
*
* summary: First file that is loaded that 'bootstraps' the entire dojo library suite.
* note:  Must run before hostenv_*.js file.
*
* @author  Copyright 2004 Mark D. Anderson (mda@discerning.com)
* TODOC: should the copyright be changed to Dojo Foundation?
* @license Licensed under the Academic Free License 2.1 http://www.opensource.org/licenses/afl-2.1.php
*
* $Id: bootstrap1.js 6258 2006-10-20 03:12:36Z jburke $
*/

// TODOC: HOW TO DOC THE BELOW?
// @global: djConfig
// summary:  
//		Application code can set the global 'djConfig' prior to loading
//		the library to override certain global settings for how dojo works.  
// description:  The variables that can be set are as follows:
//			- isDebug: false
//			- allowQueryConfig: false
//			- baseScriptUri: ""
//			- baseRelativePath: ""
//			- libraryScriptUri: ""
//			- iePreventClobber: false
//			- ieClobberMinimal: true
//			- locale: undefined
//			- extraLocale: undefined
//			- preventBackButtonFix: true
//			- searchIds: []
//			- parseWidgets: true
// TODOC: HOW TO DOC THESE VARIABLES?
// TODOC: IS THIS A COMPLETE LIST?
// note:
//		'djConfig' does not exist under 'dojo.*' so that it can be set before the 
//		'dojo' variable exists.  
// note:
//		Setting any of these variables *after* the library has loaded does nothing at all. 
// TODOC: is this still true?  Release notes for 0.3 indicated they could be set after load.
//


//TODOC:  HOW TO DOC THIS?
// @global: dj_global
// summary: 
//		an alias for the top-level global object in the host environment
//		(e.g., the window object in a browser).
// description:  
//		Refer to 'dj_global' rather than referring to window to ensure your
//		code runs correctly in contexts other than web browsers (eg: Rhino on a server).
var dj_global = this;

//TODOC:  HOW TO DOC THIS?
// @global: dj_currentContext
// summary: 
//		Private global context object. Where 'dj_global' always refers to the boot-time
//    global context, 'dj_currentContext' can be modified for temporary context shifting.
//    dojo.global() returns dj_currentContext.
// description:  
//		Refer to dojo.global() rather than referring to dj_global to ensure your
//		code runs correctly in managed contexts.
var dj_currentContext = this;


// ****************************************************************
// global public utils
// TODOC: DO WE WANT TO NOTE THAT THESE ARE GLOBAL PUBLIC UTILS?
// ****************************************************************

function dj_undef(/*String*/ name, /*Object?*/ object){
	//summary: Returns true if 'name' is defined on 'object' (or globally if 'object' is null).
	//description: Note that 'defined' and 'exists' are not the same concept.
	return (typeof (object || dj_currentContext)[name] == "undefined");	// Boolean
}

// make sure djConfig is defined
if(dj_undef("djConfig", this)){ 
	var djConfig = {}; 
}

//TODOC:  HOW TO DOC THIS?
// dojo is the root variable of (almost all) our public symbols -- make sure it is defined.
if(dj_undef("dojo", this)){ 
	var dojo = {}; 
}

dojo.global = function(){
	// summary:
	//		return the current global context object
	//		(e.g., the window object in a browser).
	// description: 
	//		Refer to 'dojo.global()' rather than referring to window to ensure your
	//		code runs correctly in contexts other than web browsers (eg: Rhino on a server).
	return dj_currentContext;
}

// Override locale setting, if specified
dojo.locale  = djConfig.locale;

//TODOC:  HOW TO DOC THIS?
dojo.version = {
	// summary: version number of this instance of dojo.
	major: 0, minor: 4, patch: 0, flag: "",
	revision: Number("$Rev: 6258 $".match(/[0-9]+/)[0]),
	toString: function(){
		with(dojo.version){
			return major + "." + minor + "." + patch + flag + " (" + revision + ")";	// String
		}
	}
}

dojo.evalProp = function(/*String*/ name, /*Object*/ object, /*Boolean?*/ create){
	// summary: Returns 'object[name]'.  If not defined and 'create' is true, will return a new Object.
	// description: 
	//		Returns null if 'object[name]' is not defined and 'create' is not true.
	// 		Note: 'defined' and 'exists' are not the same concept.	
	if((!object)||(!name)) return undefined; // undefined
	if(!dj_undef(name, object)) return object[name]; // mixed
	return (create ? (object[name]={}) : undefined);	// mixed
}

dojo.parseObjPath = function(/*String*/ path, /*Object?*/ context, /*Boolean?*/ create){
	// summary: Parse string path to an object, and return corresponding object reference and property name.
	// description: 
	//		Returns an object with two properties, 'obj' and 'prop'.  
	//		'obj[prop]' is the reference indicated by 'path'.
	// path: Path to an object, in the form "A.B.C".
	// context: Object to use as root of path.  Defaults to 'dojo.global()'.
	// create: If true, Objects will be created at any point along the 'path' that is undefined.
	var object = (context || dojo.global());
	var names = path.split('.');
	var prop = names.pop();
	for (var i=0,l=names.length;i<l && object;i++){
		object = dojo.evalProp(names[i], object, create);
	}
	return {obj: object, prop: prop};	// Object: {obj: Object, prop: String}
}

dojo.evalObjPath = function(/*String*/ path, /*Boolean?*/ create){
	// summary: Return the value of object at 'path' in the global scope, without using 'eval()'.
	// path: Path to an object, in the form "A.B.C".
	// create: If true, Objects will be created at any point along the 'path' that is undefined.
	if(typeof path != "string"){ 
		return dojo.global(); 
	}
	// fast path for no periods
	if(path.indexOf('.') == -1){
		return dojo.evalProp(path, dojo.global(), create);		// mixed
	}

	//MOW: old 'with' syntax was confusing and would throw an error if parseObjPath returned null.
	var ref = dojo.parseObjPath(path, dojo.global(), create);
	if(ref){
		return dojo.evalProp(ref.prop, ref.obj, create);	// mixed
	}
	return null;
}

dojo.errorToString = function(/*Error*/ exception){
	// summary: Return an exception's 'message', 'description' or text.

	// TODO: overriding Error.prototype.toString won't accomplish this?
 	// 		... since natively generated Error objects do not always reflect such things?
	if(!dj_undef("message", exception)){
		return exception.message;		// String
	}else if(!dj_undef("description", exception)){
		return exception.description;	// String
	}else{
		return exception;				// Error
	}
}

dojo.raise = function(/*String*/ message, /*Error?*/ exception){
	// summary: Common point for raising exceptions in Dojo to enable logging.
	//	Throws an error message with text of 'exception' if provided, or
	//	rethrows exception object.

	if(exception){
		message = message + ": "+dojo.errorToString(exception);
	}

	// print the message to the user if hostenv.println is defined
	try { if(djConfig.isDebug){ dojo.hostenv.println("FATAL exception raised: "+message); } } catch (e) {}

	throw exception || Error(message);
}

//Stub functions so things don't break.
//TODOC:  HOW TO DOC THESE?
dojo.debug = function(){};
dojo.debugShallow = function(obj){};
dojo.profile = { start: function(){}, end: function(){}, stop: function(){}, dump: function(){} };

function dj_eval(/*String*/ scriptFragment){ 
	// summary: Perform an evaluation in the global scope.  Use this rather than calling 'eval()' directly.
	// description: Placed in a separate function to minimize size of trapped evaluation context.
	// note:
	//	 - JSC eval() takes an optional second argument which can be 'unsafe'.
	//	 - Mozilla/SpiderMonkey eval() takes an optional second argument which is the
	//  	 scope object for new symbols.
	return dj_global.eval ? dj_global.eval(scriptFragment) : eval(scriptFragment); 	// mixed
}

dojo.unimplemented = function(/*String*/ funcname, /*String?*/ extra){
	// summary: Throw an exception because some function is not implemented.
	// extra: Text to append to the exception message.
	var message = "'" + funcname + "' not implemented";
	if (extra != null) { message += " " + extra; }
	dojo.raise(message);
}

dojo.deprecated = function(/*String*/ behaviour, /*String?*/ extra, /*String?*/ removal){
	// summary: Log a debug message to indicate that a behavior has been deprecated.
	// extra: Text to append to the message.
	// removal: Text to indicate when in the future the behavior will be removed.
	var message = "DEPRECATED: " + behaviour;
	if(extra){ message += " " + extra; }
	if(removal){ message += " -- will be removed in version: " + removal; }
	dojo.debug(message);
}

dojo.render = (function(){
	//TODOC: HOW TO DOC THIS?
	// summary: Details rendering support, OS and browser of the current environment.
	// TODOC: is this something many folks will interact with?  If so, we should doc the structure created...
	function vscaffold(prefs, names){
		var tmp = {
			capable: false,
			support: {
				builtin: false,
				plugin: false
			},
			prefixes: prefs
		};
		for(var i=0; i<names.length; i++){
			tmp[names[i]] = false;
		}
		return tmp;
	}

	return {
		name: "",
		ver: dojo.version,
		os: { win: false, linux: false, osx: false },
		html: vscaffold(["html"], ["ie", "opera", "khtml", "safari", "moz"]),
		svg: vscaffold(["svg"], ["corel", "adobe", "batik"]),
		vml: vscaffold(["vml"], ["ie"]),
		swf: vscaffold(["Swf", "Flash", "Mm"], ["mm"]),
		swt: vscaffold(["Swt"], ["ibm"])
	};
})();

// ****************************************************************
// dojo.hostenv methods that must be defined in hostenv_*.js
// ****************************************************************

/**
 * The interface definining the interaction with the EcmaScript host environment.
*/

/*
 * None of these methods should ever be called directly by library users.
 * Instead public methods such as loadModule should be called instead.
 */
dojo.hostenv = (function(){
	// TODOC:  HOW TO DOC THIS?
	// summary: Provides encapsulation of behavior that changes across different 'host environments' 
	//			(different browsers, server via Rhino, etc).
	// description: None of these methods should ever be called directly by library users.
	//				Use public methods such as 'loadModule' instead.
	
	// default configuration options
	var config = {
		isDebug: false,
		allowQueryConfig: false,
		baseScriptUri: "",
		baseRelativePath: "",
		libraryScriptUri: "",
		iePreventClobber: false,
		ieClobberMinimal: true,
		preventBackButtonFix: true,
		delayMozLoadingFix: false,
		searchIds: [],
		parseWidgets: true
	};

	if (typeof djConfig == "undefined") { djConfig = config; }
	else {
		for (var option in config) {
			if (typeof djConfig[option] == "undefined") {
				djConfig[option] = config[option];
			}
		}
	}

	return {
		name_: '(unset)',
		version_: '(unset)',


		getName: function(){ 
			// sumary: Return the name of the host environment.
			return this.name_; 	// String
		},


		getVersion: function(){ 
			// summary: Return the version of the hostenv.
			return this.version_; // String
		},

		getText: function(/*String*/ uri){
			// summary:	Read the plain/text contents at the specified 'uri'.
			// description: 
			//			If 'getText()' is not implemented, then it is necessary to override 
			//			'loadUri()' with an implementation that doesn't rely on it.

			dojo.unimplemented('getText', "uri=" + uri);
		}
	};
})();


dojo.hostenv.getBaseScriptUri = function(){
	// summary: Return the base script uri that other scripts are found relative to.
	// TODOC: HUH?  This comment means nothing to me.  What other scripts? Is this the path to other dojo libraries?
	//		MAYBE:  Return the base uri to scripts in the dojo library.	 ???
	// return: Empty string or a path ending in '/'.
	if(djConfig.baseScriptUri.length){ 
		return djConfig.baseScriptUri;
	}

	// MOW: Why not:
	//			uri = djConfig.libraryScriptUri || djConfig.baseRelativePath
	//		??? Why 'new String(...)'
	var uri = new String(djConfig.libraryScriptUri||djConfig.baseRelativePath);
	if (!uri) { dojo.raise("Nothing returned by getLibraryScriptUri(): " + uri); }

	// MOW: uri seems to not be actually used.  Seems to be hard-coding to djConfig.baseRelativePath... ???
	var lastslash = uri.lastIndexOf('/');		// MOW ???
	djConfig.baseScriptUri = djConfig.baseRelativePath;
	return djConfig.baseScriptUri;	// String
}

/*
 * loader.js - A bootstrap module.  Runs before the hostenv_*.js file. Contains all of the package loading methods.
 */

//A semi-colon is at the start of the line because after doing a build, this function definition
//get compressed onto the same line as the last line in bootstrap1.js. That list line is just a
//curly bracket, and the browser complains about that syntax. The semicolon fixes it. Putting it
//here instead of at the end of bootstrap1.js, since it is more of an issue for this file, (using
//the closure), and bootstrap1.js could change in the future.
;(function(){
	//Additional properties for dojo.hostenv
	var _addHostEnv = {
		pkgFileName: "__package__",
	
		// for recursion protection
		loading_modules_: {},
		loaded_modules_: {},
		addedToLoadingCount: [],
		removedFromLoadingCount: [],
	
		inFlightCount: 0,
	
		// FIXME: it should be possible to pull module prefixes in from djConfig
		modulePrefixes_: {
			dojo: {name: "dojo", value: "src"}
		},

		setModulePrefix: function(/*String*/module, /*String*/prefix){
			// summary: establishes module/prefix pair
			this.modulePrefixes_[module] = {name: module, value: prefix};
		},

		moduleHasPrefix: function(/*String*/module){
			// summary: checks to see if module has been established
			var mp = this.modulePrefixes_;
			return Boolean(mp[module] && mp[module].value); // Boolean
		},

		getModulePrefix: function(/*String*/module){
			// summary: gets the prefix associated with module
			if(this.moduleHasPrefix(module)){
				return this.modulePrefixes_[module].value; // String
			}
			return module; // String
		},

		getTextStack: [],
		loadUriStack: [],
		loadedUris: [],
	
		//WARNING: This variable is referenced by packages outside of bootstrap: FloatingPane.js and undo/browser.js
		post_load_: false,
		
		//Egad! Lots of test files push on this directly instead of using dojo.addOnLoad.
		modulesLoadedListeners: [],
		unloadListeners: [],
		loadNotifying: false
	};
	
	//Add all of these properties to dojo.hostenv
	for(var param in _addHostEnv){
		dojo.hostenv[param] = _addHostEnv[param];
	}
})();

dojo.hostenv.loadPath = function(/*String*/relpath, /*String?*/module, /*Function?*/cb){
// summary:
//	Load a Javascript module given a relative path
//
// description:
//	Loads and interprets the script located at relpath, which is relative to the
//	script root directory.  If the script is found but its interpretation causes
//	a runtime exception, that exception is not caught by us, so the caller will
//	see it.  We return a true value if and only if the script is found.
//
//	For now, we do not have an implementation of a true search path.  We
//	consider only the single base script uri, as returned by getBaseScriptUri().
//
// relpath: A relative path to a script (no leading '/', and typically
// 	ending in '.js').
// module: A module whose existance to check for after loading a path.
//	Can be used to determine success or failure of the load.
// cb: a callback function to pass the result of evaluating the script

	var uri;
	if(relpath.charAt(0) == '/' || relpath.match(/^\w+:/)){
		// dojo.raise("relpath '" + relpath + "'; must be relative");
		uri = relpath;
	}else{
		uri = this.getBaseScriptUri() + relpath;
	}
	if(djConfig.cacheBust && dojo.render.html.capable){
		uri += "?" + String(djConfig.cacheBust).replace(/\W+/g,"");
	}
	try{
		return !module ? this.loadUri(uri, cb) : this.loadUriAndCheck(uri, module, cb); // Boolean
	}catch(e){
		dojo.debug(e);
		return false; // Boolean
	}
}

dojo.hostenv.loadUri = function(/*String (URL)*/uri, /*Function?*/cb){
// summary:
//	Loads JavaScript from a URI
//
// description:
//	Reads the contents of the URI, and evaluates the contents.  This is used to load modules as well
//	as resource bundles.  Returns true if it succeeded. Returns false if the URI reading failed.
//	Throws if the evaluation throws.
//
// uri: a uri which points at the script to be loaded
// cb: a callback function to process the result of evaluating the script as an expression, typically
//	used by the resource bundle loader to load JSON-style resources

	if(this.loadedUris[uri]){
		return true; // Boolean
	}
	var contents = this.getText(uri, null, true);
	if(!contents){ return false; } // Boolean
	this.loadedUris[uri] = true;
	if(cb){ contents = '('+contents+')'; }
	var value = dj_eval(contents);
	if(cb){ cb(value); }
	return true; // Boolean
}

// FIXME: probably need to add logging to this method
dojo.hostenv.loadUriAndCheck = function(/*String (URL)*/uri, /*String*/moduleName, /*Function?*/cb){
	// summary: calls loadUri then findModule and returns true if both succeed
	var ok = true;
	try{
		ok = this.loadUri(uri, cb);
	}catch(e){
		dojo.debug("failed loading ", uri, " with error: ", e);
	}
	return Boolean(ok && this.findModule(moduleName, false)); // Boolean
}

dojo.loaded = function(){ }
dojo.unloaded = function(){ }

dojo.hostenv.loaded = function(){
	this.loadNotifying = true;
	this.post_load_ = true;
	var mll = this.modulesLoadedListeners;
	for(var x=0; x<mll.length; x++){
		mll[x]();
	}

	//Clear listeners so new ones can be added
	//For other xdomain package loads after the initial load.
	this.modulesLoadedListeners = [];
	this.loadNotifying = false;

	dojo.loaded();
}

dojo.hostenv.unloaded = function(){
	var mll = this.unloadListeners;
	while(mll.length){
		(mll.pop())();
	}
	dojo.unloaded();
}

dojo.addOnLoad = function(/*Object?*/obj, /*String|Function*/functionName) {
// summary:
//	Registers a function to be triggered after the DOM has finished loading 
//	and widgets declared in markup have been instantiated.  Images and CSS files
//	may or may not have finished downloading when the specified function is called.
//	(Note that widgets' CSS and HTML code is guaranteed to be downloaded before said
//	widgets are instantiated.)
//
// usage:
//	dojo.addOnLoad(functionPointer)
//	dojo.addOnLoad(object, "functionName")

	var dh = dojo.hostenv;
	if(arguments.length == 1) {
		dh.modulesLoadedListeners.push(obj);
	} else if(arguments.length > 1) {
		dh.modulesLoadedListeners.push(function() {
			obj[functionName]();
		});
	}

	//Added for xdomain loading. dojo.addOnLoad is used to
	//indicate callbacks after doing some dojo.require() statements.
	//In the xdomain case, if all the requires are loaded (after initial
	//page load), then immediately call any listeners.
	if(dh.post_load_ && dh.inFlightCount == 0 && !dh.loadNotifying){
		dh.callLoaded();
	}
}

dojo.addOnUnload = function(/*Object?*/obj, /*String|Function?*/functionName){
// summary: registers a function to be triggered when the page unloads
//
// usage:
//	dojo.addOnLoad(functionPointer)
//	dojo.addOnLoad(object, "functionName")
	var dh = dojo.hostenv;
	if(arguments.length == 1){
		dh.unloadListeners.push(obj);
	} else if(arguments.length > 1) {
		dh.unloadListeners.push(function() {
			obj[functionName]();
		});
	}
}

dojo.hostenv.modulesLoaded = function(){
	if(this.post_load_){ return; }
	if(this.loadUriStack.length==0 && this.getTextStack.length==0){
		if(this.inFlightCount > 0){ 
			dojo.debug("files still in flight!");
			return;
		}
		dojo.hostenv.callLoaded();
	}
}

dojo.hostenv.callLoaded = function(){
	if(typeof setTimeout == "object"){
		setTimeout("dojo.hostenv.loaded();", 0);
	}else{
		dojo.hostenv.loaded();
	}
}

dojo.hostenv.getModuleSymbols = function(/*String*/modulename){
// summary:
//	Converts a module name in dotted JS notation to an array representing the path in the source tree

	var syms = modulename.split(".");
	for(var i = syms.length; i>0; i--){
		var parentModule = syms.slice(0, i).join(".");
		if ((i==1) && !this.moduleHasPrefix(parentModule)){		
			//Support default module directory (sibling of dojo)
			syms[0] = "../" + syms[0];
		}else{
			var parentModulePath = this.getModulePrefix(parentModule);
			if(parentModulePath != parentModule){
				syms.splice(0, i, parentModulePath);
				break;
			}
		}
	}
	return syms; // Array
}

dojo.hostenv._global_omit_module_check = false;
dojo.hostenv.loadModule = function(/*String*/moduleName, /*Boolean?*/exactOnly, /*Boolean?*/omitModuleCheck){
// summary:
//	loads a Javascript module from the appropriate URI
//
// description:
//	loadModule("A.B") first checks to see if symbol A.B is defined. 
//	If it is, it is simply returned (nothing to do).
//	
//	If it is not defined, it will look for "A/B.js" in the script root directory,
//	followed by "A.js".
//	
//	It throws if it cannot find a file to load, or if the symbol A.B is not
//	defined after loading.
//	
//	It returns the object A.B.
//	
//	This does nothing about importing symbols into the current package.
//	It is presumed that the caller will take care of that. For example, to import
//	all symbols:
//	
//	   with (dojo.hostenv.loadModule("A.B")) {
//	      ...
//	   }
//	
//	And to import just the leaf symbol:
//	
//	   var B = dojo.hostenv.loadModule("A.B");
//	   ...
//	
//	dj_load is an alias for dojo.hostenv.loadModule

	if(!moduleName){ return; }
	omitModuleCheck = this._global_omit_module_check || omitModuleCheck;
	var module = this.findModule(moduleName, false);
	if(module){
		return module;
	}

	// protect against infinite recursion from mutual dependencies
	if(dj_undef(moduleName, this.loading_modules_)){
		this.addedToLoadingCount.push(moduleName);
	}
	this.loading_modules_[moduleName] = 1;

	// convert periods to slashes
	var relpath = moduleName.replace(/\./g, '/') + '.js';

	var nsyms = moduleName.split(".");
	
	// this line allowed loading of a module manifest as if it were a namespace
	// it's an interesting idea, but shouldn't be combined with 'namespaces' proper
	// and leads to unwanted dependencies
	// the effect can be achieved in other (albeit less-flexible) ways now, so I am
	// removing this pending further design work
	// perhaps we can explicitly define this idea of a 'module manifest', and subclass
	// 'namespace manifest' from that
	//dojo.getNamespace(nsyms[0]);

	var syms = this.getModuleSymbols(moduleName);
	var startedRelative = ((syms[0].charAt(0) != '/') && !syms[0].match(/^\w+:/));
	var last = syms[syms.length - 1];
	var ok;
	// figure out if we're looking for a full package, if so, we want to do
	// things slightly diffrently
	if(last=="*"){
		moduleName = nsyms.slice(0, -1).join('.');
		while(syms.length){
			syms.pop();
			syms.push(this.pkgFileName);
			relpath = syms.join("/") + '.js';
			if(startedRelative && relpath.charAt(0)=="/"){
				relpath = relpath.slice(1);
			}
			ok = this.loadPath(relpath, !omitModuleCheck ? moduleName : null);
			if(ok){ break; }
			syms.pop();
		}
	}else{
		relpath = syms.join("/") + '.js';
		moduleName = nsyms.join('.');
		var modArg = !omitModuleCheck ? moduleName : null;
		ok = this.loadPath(relpath, modArg);
		if(!ok && !exactOnly){
			syms.pop();
			while(syms.length){
				relpath = syms.join('/') + '.js';
				ok = this.loadPath(relpath, modArg);
				if(ok){ break; }
				syms.pop();
				relpath = syms.join('/') + '/'+this.pkgFileName+'.js';
				if(startedRelative && relpath.charAt(0)=="/"){
					relpath = relpath.slice(1);
				}
				ok = this.loadPath(relpath, modArg);
				if(ok){ break; }
			}
		}

		if(!ok && !omitModuleCheck){
			dojo.raise("Could not load '" + moduleName + "'; last tried '" + relpath + "'");
		}
	}

	// check that the symbol was defined
	//Don't bother if we're doing xdomain (asynchronous) loading.
	if(!omitModuleCheck && !this["isXDomain"]){
		// pass in false so we can give better error
		module = this.findModule(moduleName, false);
		if(!module){
			dojo.raise("symbol '" + moduleName + "' is not defined after loading '" + relpath + "'"); 
		}
	}

	return module;
}

dojo.hostenv.startPackage = function(/*String*/packageName){
// summary:
//	Creates a JavaScript package
//
// description:
//	startPackage("A.B") follows the path, and at each level creates a new empty
//	object or uses what already exists. It returns the result.
//
// packageName: the package to be created as a String in dot notation

	//Make sure we have a string.
	var fullPkgName = String(packageName);
	var strippedPkgName = fullPkgName;

	var syms = packageName.split(/\./);
	if(syms[syms.length-1]=="*"){
		syms.pop();
		strippedPkgName = syms.join(".");
	}
	var evaledPkg = dojo.evalObjPath(strippedPkgName, true);
	this.loaded_modules_[fullPkgName] = evaledPkg;
	this.loaded_modules_[strippedPkgName] = evaledPkg;
	
	return evaledPkg; // Object
}

dojo.hostenv.findModule = function(/*String*/moduleName, /*Boolean?*/mustExist){
// summary:
//	Returns the Object representing the module, if it exists, otherwise null.
//
// moduleName A fully qualified module including package name, like 'A.B'.
// mustExist Optional, default false. throw instead of returning null
//	if the module does not currently exist.

	var lmn = String(moduleName);

	if(this.loaded_modules_[lmn]){
		return this.loaded_modules_[lmn]; // Object
	}

	if(mustExist){
		dojo.raise("no loaded module named '" + moduleName + "'");
	}
	return null; // null
}

//Start of old bootstrap2:

dojo.kwCompoundRequire = function(/*Object containing Arrays*/modMap){
// description:
//	This method taks a "map" of arrays which one can use to optionally load dojo
//	modules. The map is indexed by the possible dojo.hostenv.name_ values, with
//	two additional values: "default" and "common". The items in the "default"
//	array will be loaded if none of the other items have been choosen based on
//	the hostenv.name_ item. The items in the "common" array will _always_ be
//	loaded, regardless of which list is chosen.  Here's how it's normally
//	called:
//	
//	dojo.kwCompoundRequire({
//		browser: [
//			["foo.bar.baz", true, true], // an example that passes multiple args to loadModule()
//			"foo.sample.*",
//			"foo.test,
//		],
//		default: [ "foo.sample.*" ],
//		common: [ "really.important.module.*" ]
//	});

	var common = modMap["common"]||[];
	var result = modMap[dojo.hostenv.name_] ? common.concat(modMap[dojo.hostenv.name_]||[]) : common.concat(modMap["default"]||[]);

	for(var x=0; x<result.length; x++){
		var curr = result[x];
		if(curr.constructor == Array){
			dojo.hostenv.loadModule.apply(dojo.hostenv, curr);
		}else{
			dojo.hostenv.loadModule(curr);
		}
	}
}

dojo.require = function(/*String*/ resourceName){
	// summary
	//	Ensure that the given resource (ie, javascript
	//	source file) has been loaded.
	// description
	//	dojo.require() is similar to C's #include command or java's "import" command.
	//	You call dojo.require() to pull in the resources (ie, javascript source files)
	//	that define the functions you are using. 
	//
	//	Note that in the case of a build, many resources have already been included
	//	into dojo.js (ie, many of the javascript source files have been compressed and
	//	concatened into dojo.js), so many dojo.require() calls will simply return
	//	without downloading anything.
	dojo.hostenv.loadModule.apply(dojo.hostenv, arguments);
}

dojo.requireIf = function(/*Boolean*/ condition, /*String*/ resourceName){
	// summary
	//	If the condition is true then call dojo.require() for the specified resource
	var arg0 = arguments[0];
	if((arg0 === true)||(arg0=="common")||(arg0 && dojo.render[arg0].capable)){
		var args = [];
		for (var i = 1; i < arguments.length; i++) { args.push(arguments[i]); }
		dojo.require.apply(dojo, args);
	}
}

dojo.requireAfterIf = dojo.requireIf;

dojo.provide = function(/*String*/ resourceName){
	// summary
	//	Each javascript source file must have (exactly) one dojo.provide()
	//	call at the top of the file, corresponding to the file name.
	//	For example, dojo/src/foo.js must have dojo.provide("dojo.foo"); at the top of the file.
	//
	// description
	//	Each javascript source file is called a resource.  When a resource
	//	is loaded by the browser, dojo.provide() registers that it has
	//	been loaded.
	//	
	//	For backwards compatibility reasons, in addition to registering the resource,
	//	dojo.provide() also ensures that the javascript object for the module exists.  For
	//	example, dojo.provide("dojo.html.common"), in addition to registering that common.js
	//	is a resource for the dojo.html module, will ensure that the dojo.html javascript object
	//	exists, so that calls like dojo.html.foo = function(){ ... } don't fail.
	//
	//	In the case of a build (or in the future, a rollup), where multiple javascript source
	//	files are combined into one bigger file (similar to a .lib or .jar file), that file
	//	will contain multiple dojo.provide() calls, to note that it includes
	//	multiple resources.
	return dojo.hostenv.startPackage.apply(dojo.hostenv, arguments);
}

dojo.registerModulePath = function(/*String*/module, /*String*/prefix){
	// summary: maps a module name to a path
	// description: An unregistered module is given the default path of ../<module>,
	//	relative to Dojo root. For example, module acme is mapped to ../acme.
	//	If you want to use a different module name, use dojo.registerModulePath. 
	return dojo.hostenv.setModulePrefix(module, prefix);
}

dojo.setModulePrefix = function(/*String*/module, /*String*/prefix){
	// summary: maps a module name to a path
	dojo.deprecated('dojo.setModulePrefix("' + module + '", "' + prefix + '")', "replaced by dojo.registerModulePath", "0.5");
	return dojo.registerModulePath(module, prefix);
}

dojo.exists = function(/*Object*/obj, /*String*/name){
	// summary: determine if an object supports a given method
	// description: useful for longer api chains where you have to test each object in the chain
	var p = name.split(".");
	for(var i = 0; i < p.length; i++){
		if(!obj[p[i]]){ return false; } // Boolean
		obj = obj[p[i]];
	}
	return true; // Boolean
}

// Localization routines

dojo.hostenv.normalizeLocale = function(/*String?*/locale){
//	summary:
//		Returns canonical form of locale, as used by Dojo.  All variants are case-insensitive and are separated by '-'
//		as specified in RFC 3066. If no locale is specified, the user agent's default is returned.

	return locale ? locale.toLowerCase() : dojo.locale; // String
};

dojo.hostenv.searchLocalePath = function(/*String*/locale, /*Boolean*/down, /*Function*/searchFunc){
//	summary:
//		A helper method to assist in searching for locale-based resources.  Will iterate through
//		the variants of a particular locale, either up or down, executing a callback function.
//		For example, "en-us" and true will try "en-us" followed by "en" and finally "ROOT".

	locale = dojo.hostenv.normalizeLocale(locale);

	var elements = locale.split('-');
	var searchlist = [];
	for(var i = elements.length; i > 0; i--){
		searchlist.push(elements.slice(0, i).join('-'));
	}
	searchlist.push(false);
	if(down){searchlist.reverse();}

	for(var j = searchlist.length - 1; j >= 0; j--){
		var loc = searchlist[j] || "ROOT";
		var stop = searchFunc(loc);
		if(stop){ break; }
	}
}

//These two functions are placed outside of preloadLocalizations
//So that the xd loading can use/override them.
dojo.hostenv.localesGenerated /***BUILD:localesGenerated***/; // value will be inserted here at build time, if necessary

dojo.hostenv.registerNlsPrefix = function(){
// summary:
//	Register module "nls" to point where Dojo can find pre-built localization files
	dojo.registerModulePath("nls","nls");	
}

dojo.hostenv.preloadLocalizations = function(){
// summary:
//	Load built, flattened resource bundles, if available for all locales used in the page.
//	Execute only once.  Note that this is a no-op unless there is a build.

	if(dojo.hostenv.localesGenerated){
		dojo.hostenv.registerNlsPrefix();

		function preload(locale){
			locale = dojo.hostenv.normalizeLocale(locale);
			dojo.hostenv.searchLocalePath(locale, true, function(loc){
				for(var i=0; i<dojo.hostenv.localesGenerated.length;i++){
					if(dojo.hostenv.localesGenerated[i] == loc){
						dojo["require"]("nls.dojo_"+loc);
						return true; // Boolean
					}
				}
				return false; // Boolean
			});
		}
		preload();
		var extra = djConfig.extraLocale||[];
		for(var i=0; i<extra.length; i++){
			preload(extra[i]);
		}
	}
	dojo.hostenv.preloadLocalizations = function(){};
}

dojo.requireLocalization = function(/*String*/moduleName, /*String*/bundleName, /*String?*/locale){
// summary:
//	Declares translated resources and loads them if necessary, in the same style as dojo.require.
//	Contents of the resource bundle are typically strings, but may be any name/value pair,
//	represented in JSON format.  See also dojo.i18n.getLocalization.
//
// moduleName: name of the package containing the "nls" directory in which the bundle is found
// bundleName: bundle name, i.e. the filename without the '.js' suffix
// locale: the locale to load (optional)  By default, the browser's user locale as defined by dojo.locale
//
// description:
//	Load translated resource bundles provided underneath the "nls" directory within a package.
//	Translated resources may be located in different packages throughout the source tree.  For example,
//	a particular widget may define one or more resource bundles, structured in a program as follows,
//	where moduleName is mycode.mywidget and bundleNames available include bundleone and bundletwo:
//	...
//	mycode/
//	 mywidget/
//	  nls/
//	   bundleone.js (the fallback translation, English in this example)
//	   bundletwo.js (also a fallback translation)
//	   de/
//	    bundleone.js
//	    bundletwo.js
//	   de-at/
//	    bundleone.js
//	   en/
//	    (empty; use the fallback translation)
//	   en-us/
//	    bundleone.js
//	   en-gb/
//	    bundleone.js
//	   es/
//	    bundleone.js
//	    bundletwo.js
//	  ...etc
//	...
//	Each directory is named for a locale as specified by RFC 3066, (http://www.ietf.org/rfc/rfc3066.txt),
//	normalized in lowercase.  Note that the two bundles in the example do not define all the same variants.
//	For a given locale, bundles will be loaded for that locale and all more general locales above it, including
//	a fallback at the root directory.  For example, a declaration for the "de-at" locale will first
//	load nls/de-at/bundleone.js, then nls/de/bundleone.js and finally nls/bundleone.js.  The data will
//	be flattened into a single Object so that lookups will follow this cascading pattern.  An optional build
//	step can preload the bundles to avoid data redundancy and the multiple network hits normally required to
//	load these resources.

	dojo.hostenv.preloadLocalizations();
 	var bundlePackage = [moduleName, "nls", bundleName].join(".");
//NOTE: When loading these resources, the packaging does not match what is on disk.  This is an
// implementation detail, as this is just a private data structure to hold the loaded resources.
// e.g. tests/hello/nls/en-us/salutations.js is loaded as the object tests.hello.nls.salutations.en_us={...}
// The structure on disk is intended to be most convenient for developers and translators, but in memory
// it is more logical and efficient to store in a different order.  Locales cannot use dashes, since the
// resulting path will not evaluate as valid JS, so we translate them to underscores.

	var bundle = dojo.hostenv.findModule(bundlePackage);
	if(bundle){
		if(djConfig.localizationComplete && bundle._built){return;}
		var jsLoc = dojo.hostenv.normalizeLocale(locale).replace('-', '_');
		var translationPackage = bundlePackage+"."+jsLoc;
		if(dojo.hostenv.findModule(translationPackage)){return;}
	}

	bundle = dojo.hostenv.startPackage(bundlePackage);
	var syms = dojo.hostenv.getModuleSymbols(moduleName);
	var modpath = syms.concat("nls").join("/");
	var parent;
	dojo.hostenv.searchLocalePath(locale, false, function(loc){
		var jsLoc = loc.replace('-', '_');
		var translationPackage = bundlePackage + "." + jsLoc;
		var loaded = false;
		if(!dojo.hostenv.findModule(translationPackage)){
			// Mark loaded whether it's found or not, so that further load attempts will not be made
			dojo.hostenv.startPackage(translationPackage);
			var module = [modpath];
			if(loc != "ROOT"){module.push(loc);}
			module.push(bundleName);
			var filespec = module.join("/") + '.js';
			loaded = dojo.hostenv.loadPath(filespec, null, function(hash){
				// Use singleton with prototype to point to parent bundle, then mix-in result from loadPath
				var clazz = function(){};
				clazz.prototype = parent;
				bundle[jsLoc] = new clazz();
				for(var j in hash){ bundle[jsLoc][j] = hash[j]; }
			});
		}else{
			loaded = true;
		}
		if(loaded && bundle[jsLoc]){
			parent = bundle[jsLoc];
		}else{
			bundle[jsLoc] = parent;
		}
	});
};

(function(){
	// If other locales are used, dojo.requireLocalization should load them as well, by default.
	// Override dojo.requireLocalization to do load the default bundle, then iterate through the
	// extraLocale list and load those translations as well, unless a particular locale was requested.

	var extra = djConfig.extraLocale;
	if(extra){
		if(!extra instanceof Array){
			extra = [extra];
		}

		var req = dojo.requireLocalization;
		dojo.requireLocalization = function(m, b, locale){
			req(m,b,locale);
			if(locale){return;}
			for(var i=0; i<extra.length; i++){
				req(m,b,extra[i]);
			}
		};
	}
})();

};

if (typeof window != 'undefined') {

// attempt to figure out the path to dojo if it isn't set in the config
(function() {
	// before we get any further with the config options, try to pick them out
	// of the URL. Most of this code is from NW
	if(djConfig.allowQueryConfig){
		var baseUrl = document.location.toString(); // FIXME: use location.query instead?
		var params = baseUrl.split("?", 2);
		if(params.length > 1){
			var paramStr = params[1];
			var pairs = paramStr.split("&");
			for(var x in pairs){
				var sp = pairs[x].split("=");
				// FIXME: is this eval dangerous?
				if((sp[0].length > 9)&&(sp[0].substr(0, 9) == "djConfig.")){
					var opt = sp[0].substr(9);
					try{
						djConfig[opt]=eval(sp[1]);
					}catch(e){
						djConfig[opt]=sp[1];
					}
				}
			}
		}
	}

	if(((djConfig["baseScriptUri"] == "")||(djConfig["baseRelativePath"] == "")) &&(document && document.getElementsByTagName)){
		var scripts = document.getElementsByTagName("script");
		var rePkg = /(__package__|dojo|bootstrap1)\.js([\?\.]|$)/i;
		for(var i = 0; i < scripts.length; i++) {
			var src = scripts[i].getAttribute("src");
			if(!src) { continue; }
			var m = src.match(rePkg);
			if(m) {
				var root = src.substring(0, m.index);
				if(src.indexOf("bootstrap1") > -1) { root += "../"; }
				if(!this["djConfig"]) { djConfig = {}; }
				if(djConfig["baseScriptUri"] == "") { djConfig["baseScriptUri"] = root; }
				if(djConfig["baseRelativePath"] == "") { djConfig["baseRelativePath"] = root; }
				break;
			}
		}
	}

	// fill in the rendering support information in dojo.render.*
	var dr = dojo.render;
	var drh = dojo.render.html;
	var drs = dojo.render.svg;
	var dua = (drh.UA = navigator.userAgent);
	var dav = (drh.AV = navigator.appVersion);
	var t = true;
	var f = false;
	drh.capable = t;
	drh.support.builtin = t;

	dr.ver = parseFloat(drh.AV);
	dr.os.mac = dav.indexOf("Macintosh") >= 0;
	dr.os.win = dav.indexOf("Windows") >= 0;
	// could also be Solaris or something, but it's the same browser
	dr.os.linux = dav.indexOf("X11") >= 0;

	drh.opera = dua.indexOf("Opera") >= 0;
	drh.khtml = (dav.indexOf("Konqueror") >= 0)||(dav.indexOf("Safari") >= 0);
	drh.safari = dav.indexOf("Safari") >= 0;
	var geckoPos = dua.indexOf("Gecko");
	drh.mozilla = drh.moz = (geckoPos >= 0)&&(!drh.khtml);
	if (drh.mozilla) {
		// gecko version is YYYYMMDD
		drh.geckoVersion = dua.substring(geckoPos + 6, geckoPos + 14);
	}
	drh.ie = (document.all)&&(!drh.opera);
	drh.ie50 = drh.ie && dav.indexOf("MSIE 5.0")>=0;
	drh.ie55 = drh.ie && dav.indexOf("MSIE 5.5")>=0;
	drh.ie60 = drh.ie && dav.indexOf("MSIE 6.0")>=0;
	drh.ie70 = drh.ie && dav.indexOf("MSIE 7.0")>=0;

	var cm = document["compatMode"];
	drh.quirks = (cm == "BackCompat")||(cm == "QuirksMode")||drh.ie55||drh.ie50;

	// TODO: is the HTML LANG attribute relevant?
	dojo.locale = dojo.locale || (drh.ie ? navigator.userLanguage : navigator.language).toLowerCase();

	dr.vml.capable=drh.ie;
	drs.capable = f;
	drs.support.plugin = f;
	drs.support.builtin = f;
	var tdoc = window["document"];
	var tdi = tdoc["implementation"];

	if((tdi)&&(tdi["hasFeature"])&&(tdi.hasFeature("org.w3c.dom.svg", "1.0"))){
		drs.capable = t;
		drs.support.builtin = t;
		drs.support.plugin = f;
	}
	// webkits after 420 support SVG natively. The test string is "AppleWebKit/420+"
	if(drh.safari){
		var tmp = dua.split("AppleWebKit/")[1];
		var ver = parseFloat(tmp.split(" ")[0]);
		if(ver >= 420){
			drs.capable = t;
			drs.support.builtin = t;
			drs.support.plugin = f;
		}
	}
})();

dojo.hostenv.startPackage("dojo.hostenv");

dojo.render.name = dojo.hostenv.name_ = 'browser';
dojo.hostenv.searchIds = [];

// These are in order of decreasing likelihood; this will change in time.
dojo.hostenv._XMLHTTP_PROGIDS = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];

dojo.hostenv.getXmlhttpObject = function(){
    var http = null;
	var last_e = null;
	try{ http = new XMLHttpRequest(); }catch(e){}
    if(!http){
		for(var i=0; i<3; ++i){
			var progid = dojo.hostenv._XMLHTTP_PROGIDS[i];
			try{
				http = new ActiveXObject(progid);
			}catch(e){
				last_e = e;
			}

			if(http){
				dojo.hostenv._XMLHTTP_PROGIDS = [progid];  // so faster next time
				break;
			}
		}

		/*if(http && !http.toString) {
			http.toString = function() { "[object XMLHttpRequest]"; }
		}*/
	}

	if(!http){
		return dojo.raise("XMLHTTP not available", last_e);
	}

	return http;
}

/**
 * Read the contents of the specified uri and return those contents.
 *
 * @param uri A relative or absolute uri. If absolute, it still must be in the
 * same "domain" as we are.
 *
 * @param async_cb If not specified, load synchronously. If specified, load
 * asynchronously, and use async_cb as the progress handler which takes the
 * xmlhttp object as its argument. If async_cb, this function returns null.
 *
 * @param fail_ok Default false. If fail_ok and !async_cb and loading fails,
 * return null instead of throwing.
 */
dojo.hostenv._blockAsync = false;
dojo.hostenv.getText = function(uri, async_cb, fail_ok){
	// need to block async callbacks from snatching this thread as the result
	// of an async callback might call another sync XHR, this hangs khtml forever
	// hostenv._blockAsync must also be checked in BrowserIO's watchInFlight()
	// NOTE: must be declared before scope switches ie. this.getXmlhttpObject()
	if(!async_cb){ this._blockAsync = true; }

	var http = this.getXmlhttpObject();

	function isDocumentOk(http){
		var stat = http["status"];
		// allow a 304 use cache, needed in konq (is this compliant with the http spec?)
		return Boolean((!stat)||((200 <= stat)&&(300 > stat))||(stat==304));
	}

	if(async_cb){
		var _this = this, timer = null, gbl = dojo.global();
		var xhr = dojo.evalObjPath("dojo.io.XMLHTTPTransport");
		http.onreadystatechange = function(){
			if(timer){ gbl.clearTimeout(timer); timer = null; }
			if(_this._blockAsync || (xhr && xhr._blockAsync)){
				timer = gbl.setTimeout(function () { http.onreadystatechange.apply(this); }, 10);
			}else{
				if(4==http.readyState){
					if(isDocumentOk(http)){
						// dojo.debug("LOADED URI: "+uri);
						async_cb(http.responseText);
					}
				}
			}
		}
	}

	http.open('GET', uri, async_cb ? true : false);
	try{
		http.send(null);
		if(async_cb){
			return null;
		}
		if(!isDocumentOk(http)){
			var err = Error("Unable to load "+uri+" status:"+ http.status);
			err.status = http.status;
			err.responseText = http.responseText;
			throw err;
		}
	}catch(e){
		this._blockAsync = false;
		if((fail_ok)&&(!async_cb)){
			return null;
		}else{
			throw e;
		}
	}

	this._blockAsync = false;
	return http.responseText;
}

/*
 * It turns out that if we check *right now*, as this script file is being loaded,
 * then the last script element in the window DOM is ourselves.
 * That is because any subsequent script elements haven't shown up in the document
 * object yet.
 */
 /*
function dj_last_script_src() {
    var scripts = window.document.getElementsByTagName('script');
    if(scripts.length < 1){
		dojo.raise("No script elements in window.document, so can't figure out my script src");
	}
    var script = scripts[scripts.length - 1];
    var src = script.src;
    if(!src){
		dojo.raise("Last script element (out of " + scripts.length + ") has no src");
	}
    return src;
}

if(!dojo.hostenv["library_script_uri_"]){
	dojo.hostenv.library_script_uri_ = dj_last_script_src();
}
*/

dojo.hostenv.defaultDebugContainerId = 'dojoDebug';
dojo.hostenv._println_buffer = [];
dojo.hostenv._println_safe = false;
dojo.hostenv.println = function (line){
	if(!dojo.hostenv._println_safe){
		dojo.hostenv._println_buffer.push(line);
	}else{
		try {
			var console = document.getElementById(djConfig.debugContainerId ?
				djConfig.debugContainerId : dojo.hostenv.defaultDebugContainerId);
			if(!console) { console = dojo.body(); }

			var div = document.createElement("div");
			div.appendChild(document.createTextNode(line));
			console.appendChild(div);
		} catch (e) {
			try{
				// safari needs the output wrapped in an element for some reason
				document.write("<div>" + line + "</div>");
			}catch(e2){
				window.status = line;
			}
		}
	}
}

dojo.addOnLoad(function(){
	dojo.hostenv._println_safe = true;
	while(dojo.hostenv._println_buffer.length > 0){
		dojo.hostenv.println(dojo.hostenv._println_buffer.shift());
	}
});

function dj_addNodeEvtHdlr(node, evtName, fp, capture){
	var oldHandler = node["on"+evtName] || function(){};
	node["on"+evtName] = function(){
		fp.apply(node, arguments);
		oldHandler.apply(node, arguments);
	}
	return true;
}

//	BEGIN DOMContentLoaded, from Dean Edwards (http://dean.edwards.name/weblog/2006/06/again/)
function dj_load_init(e){
	// allow multiple calls, only first one will take effect
	// A bug in khtml calls events callbacks for document for event which isnt supported
	// for example a created contextmenu event calls DOMContentLoaded, workaround
	var type = (e && e.type) ? e.type.toLowerCase() : "load";
	if(arguments.callee.initialized || (type!="domcontentloaded" && type!="load")){ return; }
	arguments.callee.initialized = true;
	if(typeof(_timer) != 'undefined'){
		clearInterval(_timer);
		delete _timer;
	}

	var initFunc = function(){
		//perform initialization
		if(dojo.render.html.ie){
			dojo.hostenv.makeWidgets();
		}
	};

	if(dojo.hostenv.inFlightCount == 0){
		initFunc();
		dojo.hostenv.modulesLoaded();
	}else{
		dojo.addOnLoad(initFunc);
	}
}

//	START DOMContentLoaded
// Mozilla and Opera 9 expose the event we could use
if(document.addEventListener){
	if(dojo.render.html.opera || (dojo.render.html.moz && !djConfig.delayMozLoadingFix)){
		document.addEventListener("DOMContentLoaded", dj_load_init, null);
	}

	//	mainly for Opera 8.5, won't be fired if DOMContentLoaded fired already.
	//  also used for Mozilla because of trac #1640
	window.addEventListener("load", dj_load_init, null);
}

// 	for Internet Explorer. readyState will not be achieved on init call, but dojo doesn't need it
//	however, we'll include it because we don't know if there are other functions added that might.
//	Note that this has changed because the build process strips all comments--including conditional
//		ones.
if(dojo.render.html.ie && dojo.render.os.win){
	document.attachEvent("onreadystatechange", function(e){
		if(document.readyState == "complete"){
			dj_load_init();
		}
	});
}

if (/(WebKit|khtml)/i.test(navigator.userAgent)) { // sniff
    var _timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            dj_load_init(); // call the onload handler
        }
    }, 10);
}
//	END DOMContentLoaded

// IE WebControl hosted in an application can fire "beforeunload" and "unload"
// events when control visibility changes, causing Dojo to unload too soon. The
// following code fixes the problem
// Reference: http://support.microsoft.com/default.aspx?scid=kb;en-us;199155
if(dojo.render.html.ie){
	dj_addNodeEvtHdlr(window, "beforeunload", function(){
		dojo.hostenv._unloading = true;
		window.setTimeout(function() {
			dojo.hostenv._unloading = false;
		}, 0);
	});
}

dj_addNodeEvtHdlr(window, "unload", function(){
	dojo.hostenv.unloaded();
	if((!dojo.render.html.ie)||(dojo.render.html.ie && dojo.hostenv._unloading)){
		dojo.hostenv.unloaded();
	}
});

dojo.hostenv.makeWidgets = function(){
	// you can put searchIds in djConfig and dojo.hostenv at the moment
	// we should probably eventually move to one or the other
	var sids = [];
	if(djConfig.searchIds && djConfig.searchIds.length > 0) {
		sids = sids.concat(djConfig.searchIds);
	}
	if(dojo.hostenv.searchIds && dojo.hostenv.searchIds.length > 0) {
		sids = sids.concat(dojo.hostenv.searchIds);
	}

	if((djConfig.parseWidgets)||(sids.length > 0)){
		if(dojo.evalObjPath("dojo.widget.Parse")){
			// we must do this on a delay to avoid:
			//	http://www.shaftek.org/blog/archives/000212.html
			// (IE bug)
				var parser = new dojo.xml.Parse();
				if(sids.length > 0){
					for(var x=0; x<sids.length; x++){
						var tmpNode = document.getElementById(sids[x]);
						if(!tmpNode){ continue; }
						var frag = parser.parseElement(tmpNode, null, true);
						dojo.widget.getParser().createComponents(frag);
					}
				}else if(djConfig.parseWidgets){
					var frag  = parser.parseElement(dojo.body(), null, true);
					dojo.widget.getParser().createComponents(frag);
				}
		}
	}
}

dojo.addOnLoad(function(){
	if(!dojo.render.html.ie) {
		dojo.hostenv.makeWidgets();
	}
});

try {
	if (dojo.render.html.ie) {
		document.namespaces.add("v","urn:schemas-microsoft-com:vml");
		document.createStyleSheet().addRule("v\\:*", "behavior:url(#default#VML)");
	}
} catch (e) { }

// stub, over-ridden by debugging code. This will at least keep us from
// breaking when it's not included
dojo.hostenv.writeIncludes = function(){}

//TODOC:  HOW TO DOC THIS?
// @global: dj_currentDocument
// summary:
//		Current document object. 'dj_currentDocument' can be modified for temporary context shifting.
// description:
//    dojo.doc() returns dojo.currentDocument.
//		Refer to dojo.doc() rather than referring to 'window.document' to ensure your
//		code runs correctly in managed contexts.
if(!dj_undef("document", this)){
	dj_currentDocument = this.document;
}

dojo.doc = function(){
	// summary:
	//		return the document object associated with the dojo.global()
	return dj_currentDocument;
}

dojo.body = function(){
	// summary:
	//		return the body object associated with dojo.doc()
	// Note: document.body is not defined for a strict xhtml document
	return dojo.doc().body || dojo.doc().getElementsByTagName("body")[0];
}

dojo.byId = function(id, doc){
	if((id)&&((typeof id == "string")||(id instanceof String))){
		if (!doc) { doc = dj_currentDocument; }
		var ele = doc.getElementById(id);
		// workaround bug in IE and Opera 8.2 where getElementById returns wrong element
		if (ele && (ele.id != id) && doc.all) {
			ele = null;
			// get all matching elements with this id
			eles = doc.all[id];
			if (eles) {
				// if more than 1, choose first with the correct id
				if (eles.length) {
					for (var i=0; i < eles.length; i++) {
						if (eles[i].id == id) {
							ele = eles[i];
							break;
						}
					}
				// return 1 and only element
				} else { ele = eles; }
			}
		}
		return ele;
	}
	return id; // assume it's a node
}

dojo.setContext = function(/*Object*/globalObject, /*Object*/ globalDocument){
	dj_currentContext = globalObject;
	dj_currentDocument = globalDocument;
};

dojo._fireCallback = function(callback, context, cbArguments) {
	if((context)&&((typeof callback == "string")||(callback instanceof String))){
		callback=context[callback];
	}
	return (context ? callback.apply(context, cbArguments || [ ]) : callback());
}

dojo.withGlobal = function(/*Object*/globalObject, /*Function*/callback, /*Object?*/thisObject, /*Array?*/cbArguments){
	// summary:
	//		Call callback with globalObject as dojo.global() and globalObject.document
	//		as dojo.doc(). If provided, globalObject will be executed in the context of
	//		object thisObject
	// description:
	//		When callback() returns or throws an error, the dojo.global() and dojo.doc() will
	//		be restored to its previous state.
	var rval;
	var oldGlob = dj_currentContext;
	var oldDoc = dj_currentDocument;
	try{
		dojo.setContext(globalObject, globalObject.document);
		rval = dojo._fireCallback(callback, thisObject, cbArguments);
	}finally{
		dojo.setContext(oldGlob, oldDoc);
	}
	return rval;
}

dojo.withDoc = function (/*Object*/documentObject, /*Function*/callback, /*Object?*/thisObject, /*Array?*/cbArguments) {
	// summary:
	//		Call callback with documentObject as dojo.doc(). If provided, callback will be executed
	//		in the context of object thisObject
	// description:
	//		When callback() returns or throws an error, the dojo.doc() will
	//		be restored to its previous state.
	var rval;
	var oldDoc = dj_currentDocument;
	try{
		dj_currentDocument = documentObject;
		rval = dojo._fireCallback(callback, thisObject, cbArguments);
	}finally{
		dj_currentDocument = oldDoc;
	}
	return rval;
}

} //if (typeof window != 'undefined')

//Semicolon is for when this file is integrated with a custom build on one line
//with some other file's contents. Sometimes that makes things not get defined
//properly, particularly with the using the closure below to do all the work.
;(function(){
	//Don't do this work if dojo.js has already done it.
	if(typeof dj_usingBootstrap != "undefined"){
		return;
	}

	var isRhino = false;
	var isSpidermonkey = false;
	var isDashboard = false;
	if((typeof this["load"] == "function")&&((typeof this["Packages"] == "function")||(typeof this["Packages"] == "object"))){
		isRhino = true;
	}else if(typeof this["load"] == "function"){
		isSpidermonkey  = true;
	}else if(window.widget){
		isDashboard = true;
	}

	var tmps = [];
	if((this["djConfig"])&&((djConfig["isDebug"])||(djConfig["debugAtAllCosts"]))){
		tmps.push("debug.js");
	}

	if((this["djConfig"])&&(djConfig["debugAtAllCosts"])&&(!isRhino)&&(!isDashboard)){
		tmps.push("browser_debug.js");
	}

	var loaderRoot = djConfig["baseScriptUri"];
	if((this["djConfig"])&&(djConfig["baseLoaderUri"])){
		loaderRoot = djConfig["baseLoaderUri"];
	}

	for(var x=0; x < tmps.length; x++){
		var spath = loaderRoot+"src/"+tmps[x];
		if(isRhino||isSpidermonkey){
			load(spath);
		} else {
			try {
				document.write("<scr"+"ipt type='text/javascript' src='"+spath+"'></scr"+"ipt>");
			} catch (e) {
				var script = document.createElement("script");
				script.src = spath;
				document.getElementsByTagName("head")[0].appendChild(script);
			}
		}
	}
})();

dojo.provide("dojo.string.common");

dojo.string.trim = function(/* string */str, /* integer? */wh){
	//	summary
	//	Trim whitespace from str.  If wh > 0, trim from start, if wh < 0, trim from end, else both
	if(!str.replace){ return str; }
	if(!str.length){ return str; }
	var re = (wh > 0) ? (/^\s+/) : (wh < 0) ? (/\s+$/) : (/^\s+|\s+$/g);
	return str.replace(re, "");	//	string
}

dojo.string.trimStart = function(/* string */str) {
	//	summary
	//	Trim whitespace at the beginning of 'str'
	return dojo.string.trim(str, 1);	//	string
}

dojo.string.trimEnd = function(/* string */str) {
	//	summary
	//	Trim whitespace at the end of 'str'
	return dojo.string.trim(str, -1);
}

dojo.string.repeat = function(/* string */str, /* integer */count, /* string? */separator) {
	//	summary
	//	Return 'str' repeated 'count' times, optionally placing 'separator' between each rep
	var out = "";
	for(var i = 0; i < count; i++) {
		out += str;
		if(separator && i < count - 1) {
			out += separator;
		}
	}
	return out;	//	string
}

dojo.string.pad = function(/* string */str, /* integer */len/*=2*/, /* string */ c/*='0'*/, /* integer */dir/*=1*/) {
	//	summary
	//	Pad 'str' to guarantee that it is at least 'len' length with the character 'c' at either the 
	//	start (dir=1) or end (dir=-1) of the string
	var out = String(str);
	if(!c) {
		c = '0';
	}
	if(!dir) {
		dir = 1;
	}
	while(out.length < len) {
		if(dir > 0) {
			out = c + out;
		} else {
			out += c;
		}
	}
	return out;	//	string
}

dojo.string.padLeft = function(/* string */str, /* integer */len, /* string */c) {
	//	summary
	//	same as dojo.string.pad(str, len, c, 1)
	return dojo.string.pad(str, len, c, 1);	//	string
}

dojo.string.padRight = function(/* string */str, /* integer */len, /* string */c) {
	//	summary
	//	same as dojo.string.pad(str, len, c, -1)
	return dojo.string.pad(str, len, c, -1);	//	string
}

dojo.provide("dojo.string");

dojo.provide("dojo.lang.common");

dojo.lang.inherits = function(/*Function*/ subclass, /*Function*/ superclass){
	// summary: Set up inheritance between two classes.
	if(typeof superclass != 'function'){ 
		dojo.raise("dojo.inherits: superclass argument ["+superclass+"] must be a function (subclass: ["+subclass+"']");
	}
	subclass.prototype = new superclass();
	subclass.prototype.constructor = subclass;
	subclass.superclass = superclass.prototype;
	// DEPRECATED: super is a reserved word, use 'superclass'
	subclass['super'] = superclass.prototype;
}

dojo.lang._mixin = function(/*Object*/ obj, /*Object*/ props){
	// summary:	Adds all properties and methods of props to obj.
	var tobj = {};
	for(var x in props){
		// the "tobj" condition avoid copying properties in "props"
		// inherited from Object.prototype.  For example, if obj has a custom
		// toString() method, don't overwrite it with the toString() method
		// that props inherited from Object.protoype
		if((typeof tobj[x] == "undefined") || (tobj[x] != props[x])){
			obj[x] = props[x];
		}
	}
	// IE doesn't recognize custom toStrings in for..in
	if(dojo.render.html.ie 
		&& (typeof(props["toString"]) == "function")
		&& (props["toString"] != obj["toString"])
		&& (props["toString"] != tobj["toString"]))
	{
		obj.toString = props.toString;
	}
	return obj; // Object
}

dojo.lang.mixin = function(/*Object*/ obj, /*Object...*/props){
	// summary:	Adds all properties and methods of props to obj.
	for(var i=1, l=arguments.length; i<l; i++){
		dojo.lang._mixin(obj, arguments[i]);
	}
	return obj; // Object
}

dojo.lang.extend = function(/*Object*/ constructor, /*Object...*/ props){
	// summary:	Adds all properties and methods of props to constructor's prototype,
	//			making them available to all instances created with constructor.
	for(var i=1, l=arguments.length; i<l; i++){
		dojo.lang._mixin(constructor.prototype, arguments[i]);
	}
	return constructor; // Object
}

// Promote to dojo module
dojo.inherits = dojo.lang.inherits;
//dojo.lang._mixin = dojo.lang._mixin;
dojo.mixin = dojo.lang.mixin;
dojo.extend = dojo.lang.extend;

dojo.lang.find = function(	/*Array*/		array, 
							/*Object*/		value,
							/*Boolean?*/	identity,
							/*Boolean?*/	findLast){
	// summary:	Return the index of value in array, returning -1 if not found.
	// identity: If true, matches with identity comparison (===).  
	//					 If false, uses normal comparison (==).
	// findLast: If true, returns index of last instance of value.
	
	// examples:
	//  find(array, value[, identity [findLast]]) // recommended
 	//  find(value, array[, identity [findLast]]) // deprecated
							
	// support both (array, value) and (value, array)
	if(!dojo.lang.isArrayLike(array) && dojo.lang.isArrayLike(value)) {
		dojo.deprecated('dojo.lang.find(value, array)', 'use dojo.lang.find(array, value) instead', "0.5");
		var temp = array;
		array = value;
		value = temp;
	}
	var isString = dojo.lang.isString(array);
	if(isString) { array = array.split(""); }

	if(findLast) {
		var step = -1;
		var i = array.length - 1;
		var end = -1;
	} else {
		var step = 1;
		var i = 0;
		var end = array.length;
	}
	if(identity){
		while(i != end) {
			if(array[i] === value){ return i; }
			i += step;
		}
	}else{
		while(i != end) {
			if(array[i] == value){ return i; }
			i += step;
		}
	}
	return -1;	// number
}

dojo.lang.indexOf = dojo.lang.find;

dojo.lang.findLast = function(/*Array*/ array, /*Object*/ value, /*boolean?*/ identity){
	// summary:	Return index of last occurance of value in array, returning -1 if not found.
	// identity: If true, matches with identity comparison (===). If false, uses normal comparison (==).
	return dojo.lang.find(array, value, identity, true); // number
}

dojo.lang.lastIndexOf = dojo.lang.findLast;

dojo.lang.inArray = function(array /*Array*/, value /*Object*/){
	// summary:	Return true if value is present in array.
	return dojo.lang.find(array, value) > -1; // boolean
}

/**
 * Partial implmentation of is* functions from
 * http://www.crockford.com/javascript/recommend.html
 * NOTE: some of these may not be the best thing to use in all situations
 * as they aren't part of core JS and therefore can't work in every case.
 * See WARNING messages inline for tips.
 *
 * The following is* functions are fairly "safe"
 */

dojo.lang.isObject = function(/*anything*/ it){
	// summary:	Return true if it is an Object, Array or Function.
	if(typeof it == "undefined"){ return false; }
	return (typeof it == "object" || it === null || dojo.lang.isArray(it) || dojo.lang.isFunction(it)); // Boolean
}

dojo.lang.isArray = function(/*anything*/ it){
	// summary:	Return true if it is an Array.
	return (it && it instanceof Array || typeof it == "array"); // Boolean
}

dojo.lang.isArrayLike = function(/*anything*/ it){
	// summary:	Return true if it can be used as an array (i.e. is an object with an integer length property).
	if((!it)||(dojo.lang.isUndefined(it))){ return false; }
	if(dojo.lang.isString(it)){ return false; }
	if(dojo.lang.isFunction(it)){ return false; } // keeps out built-in constructors (Number, String, ...) which have length properties
	if(dojo.lang.isArray(it)){ return true; }
	// form node itself is ArrayLike, but not always iterable. Use form.elements instead.
	if((it.tagName)&&(it.tagName.toLowerCase()=='form')){ return false; }
	if(dojo.lang.isNumber(it.length) && isFinite(it.length)){ return true; }
	return false; // Boolean
}

dojo.lang.isFunction = function(/*anything*/ it){
	// summary:	Return true if it is a Function.
	if(!it){ return false; }
	// webkit treats NodeList as a function, which is bad
	if((typeof(it) == "function") && (it == "[object NodeList]")) { return false; }
	return (it instanceof Function || typeof it == "function"); // Boolean
}

dojo.lang.isString = function(/*anything*/ it){
	// summary:	Return true if it is a String.
	return (typeof it == "string" || it instanceof String);
}

dojo.lang.isAlien = function(/*anything*/ it){
	// summary:	Return true if it is not a built-in function.
	if(!it){ return false; }
	return !dojo.lang.isFunction() && /\{\s*\[native code\]\s*\}/.test(String(it)); // Boolean
}

dojo.lang.isBoolean = function(/*anything*/ it){
	// summary:	Return true if it is a Boolean.
	return (it instanceof Boolean || typeof it == "boolean"); // Boolean
}

/**
 * The following is***() functions are somewhat "unsafe". Fortunately,
 * there are workarounds the the language provides and are mentioned
 * in the WARNING messages.
 *
 */
dojo.lang.isNumber = function(/*anything*/ it){
	// summary:	Return true if it is a number.
	// description: 
	//		WARNING - In most cases, isNaN(it) is sufficient to determine whether or not
	// 		something is a number or can be used as such. For example, a number or string
	// 		can be used interchangably when accessing array items (array["1"] is the same as
	// 		array[1]) and isNaN will return false for both values ("1" and 1). However,
	// 		isNumber("1")  will return false, which is generally not too useful.
	// 		Also, isNumber(NaN) returns true, again, this isn't generally useful, but there
	// 		are corner cases (like when you want to make sure that two things are really
	// 		the same type of thing). That is really where isNumber "shines".
	//
	// Recommendation - Use isNaN(it) when possible
	
	return (it instanceof Number || typeof it == "number"); // Boolean
}

/*
 * FIXME: Should isUndefined go away since it is error prone?
 */
dojo.lang.isUndefined = function(/*anything*/ it){
	// summary: Return true if it is not defined.
	// description: 
	//		WARNING - In some cases, isUndefined will not behave as you
	// 		might expect. If you do isUndefined(foo) and there is no earlier
	// 		reference to foo, an error will be thrown before isUndefined is
	// 		called. It behaves correctly if you scope yor object first, i.e.
	// 		isUndefined(foo.bar) where foo is an object and bar isn't a
	// 		property of the object.
	//
	// Recommendation - Use typeof foo == "undefined" when possible

	return ((typeof(it) == "undefined")&&(it == undefined)); // Boolean
}

// end Crockford functions

dojo.provide("dojo.lang.extras");


dojo.lang.setTimeout = function(/*Function*/func, /*int*/delay /*, ...*/){
	// summary:
	//	Sets a timeout in milliseconds to execute a function in a given context
	//	with optional arguments.
	//
	// usage:
	//	setTimeout (Object context, function func, number delay[, arg1[, ...]]);
	//	setTimeout (function func, number delay[, arg1[, ...]]);

	var context = window, argsStart = 2;
	if(!dojo.lang.isFunction(func)){
		context = func;
		func = delay;
		delay = arguments[2];
		argsStart++;
	}

	if(dojo.lang.isString(func)){
		func = context[func];
	}
	
	var args = [];
	for (var i = argsStart; i < arguments.length; i++){
		args.push(arguments[i]);
	}
	return dojo.global().setTimeout(function () { func.apply(context, args); }, delay); // int
}

dojo.lang.clearTimeout = function(/*int*/timer){
	// summary: clears timer by number from the execution queue
	dojo.global().clearTimeout(timer);
}

dojo.lang.getNameInObj = function(/*Object*/ns, /*unknown*/item){
	// summary: looks for a value in the object ns with a value matching item and returns the property name
	// ns: if null, dj_global is used
	// item: value to match
	if(!ns){ ns = dj_global; }

	for(var x in ns){
		if(ns[x] === item){
			return new String(x); // String
		}
	}
	return null; // null
}

dojo.lang.shallowCopy = function(/*Object*/obj, /*Boolean?*/deep){
	// summary: copies object obj one level deep, or full depth if deep is true
	var i, ret;	

	if(obj === null){ /*obj: null*/ return null; } // null
	
	if(dojo.lang.isObject(obj)){
		// obj: Object	
		ret = new obj.constructor();
		for(i in obj){
			if(dojo.lang.isUndefined(ret[i])){
				ret[i] = deep ? dojo.lang.shallowCopy(obj[i], deep) : obj[i];
			}
		}
	} else if(dojo.lang.isArray(obj)){
		// obj: Array
		ret = [];
		for(i=0; i<obj.length; i++){
			ret[i] = deep ? dojo.lang.shallowCopy(obj[i], deep) : obj[i];
		}
	} else {
		// obj: unknown
		ret = obj;
	}

	return ret; // unknown
}

dojo.lang.firstValued = function(/* ... */){
	// summary: Return the first argument that isn't undefined

	for(var i = 0; i < arguments.length; i++){
		if(typeof arguments[i] != "undefined"){
			return arguments[i]; // unknown
		}
	}
	return undefined; // undefined
}

dojo.lang.getObjPathValue = function(/*String*/objpath, /*Object?*/context, /*Boolean?*/create){
	// summary:
	//	Gets a value from a reference specified as a string descriptor,
	//	(e.g. "A.B") in the given context.
	//
	// context: if not specified, dj_global is used
	// create: if true, undefined objects in the path are created.

	with(dojo.parseObjPath(objpath, context, create)){
		return dojo.evalProp(prop, obj, create); // unknown
	}
}

dojo.lang.setObjPathValue = function(/*String*/objpath, /*unknown*/value, /*Object?*/context, /*Boolean?*/create){
	// summary:
	//	Sets a value on a reference specified as a string descriptor. 
	//	(e.g. "A.B") in the given context.
	//
	//	context: if not specified, dj_global is used
	//	create: if true, undefined objects in the path are created.

	if(arguments.length < 4){
		create = true;
	}
	with(dojo.parseObjPath(objpath, context, create)){
		if(obj && (create || (prop in obj))){
			obj[prop] = value;
		}
	}
}

dojo.provide("dojo.io.common");

/******************************************************************************
 *	Notes about dojo.io design:
 *	
 *	The dojo.io.* package has the unenviable task of making a lot of different
 *	types of I/O feel natural, despite a universal lack of good (or even
 *	reasonable!) I/O capability in the host environment. So lets pin this down
 *	a little bit further.
 *
 *	Rhino:
 *		perhaps the best situation anywhere. Access to Java classes allows you
 *		to do anything one might want in terms of I/O, both synchronously and
 *		async. Can open TCP sockets and perform low-latency client/server
 *		interactions. HTTP transport is available through Java HTTP client and
 *		server classes. Wish it were always this easy.
 *
 *	xpcshell:
 *		XPCOM for I/O.
 *
 *	spidermonkey:
 *		S.O.L.
 *
 *	Browsers:
 *		Browsers generally do not provide any useable filesystem access. We are
 *		therefore limited to HTTP for moving information to and from Dojo
 *		instances living in a browser.
 *
 *		XMLHTTP:
 *			Sync or async, allows reading of arbitrary text files (including
 *			JS, which can then be eval()'d), writing requires server
 *			cooperation and is limited to HTTP mechanisms (POST and GET).
 *
 *		<iframe> hacks:
 *			iframe document hacks allow browsers to communicate asynchronously
 *			with a server via HTTP POST and GET operations. With significant
 *			effort and server cooperation, low-latency data transit between
 *			client and server can be acheived via iframe mechanisms (repubsub).
 *
 *		SVG:
 *			Adobe's SVG viewer implements helpful primitives for XML-based
 *			requests, but receipt of arbitrary text data seems unlikely w/o
 *			<![CDATA[]]> sections.
 *
 *
 *	A discussion between Dylan, Mark, Tom, and Alex helped to lay down a lot
 *	the IO API interface. A transcript of it can be found at:
 *		http://dojotoolkit.org/viewcvs/viewcvs.py/documents/irc/irc_io_api_log.txt?rev=307&view=auto
 *	
 *	Also referenced in the design of the API was the DOM 3 L&S spec:
 *		http://www.w3.org/TR/2004/REC-DOM-Level-3-LS-20040407/load-save.html
 ******************************************************************************/

// a map of the available transport options. Transports should add themselves
// by calling add(name)
dojo.io.transports = [];
dojo.io.hdlrFuncNames = [ "load", "error", "timeout" ]; // we're omitting a progress() event for now

dojo.io.Request = function(/*String*/ url, /*String*/ mimetype, /*String*/ transport, /*String or Boolean*/ changeUrl){
// summary:
//		Constructs a Request object that is used by dojo.io.bind(). dojo.io.bind() will create one of these for you if
//		you call dojo.io.bind() with an plain object containing the bind parameters.
//		This method can either take the arguments specified, or an Object containing all of the parameters that you
//		want to use to create the dojo.io.Request (similar to how dojo.io.bind() is called.
//		The named parameters to this constructor represent the minimum set of parameters need
	if((arguments.length == 1)&&(arguments[0].constructor == Object)){
		this.fromKwArgs(arguments[0]);
	}else{
		this.url = url;
		if(mimetype){ this.mimetype = mimetype; }
		if(transport){ this.transport = transport; }
		if(arguments.length >= 4){ this.changeUrl = changeUrl; }
	}
}

dojo.lang.extend(dojo.io.Request, {

	/** The URL to hit */
	url: "",
	
	/** The mime type used to interrpret the response body */
	mimetype: "text/plain",
	
	/** The HTTP method to use */
	method: "GET",
	
	/** An Object containing key-value pairs to be included with the request */
	content: undefined, // Object
	
	/** The transport medium to use */
	transport: undefined, // String
	
	/** If defined the URL of the page is physically changed */
	changeUrl: undefined, // String
	
	/** A form node to use in the request */
	formNode: undefined, // HTMLFormElement
	
	/** Whether the request should be made synchronously */
	sync: false,
	
	bindSuccess: false,

	/** Cache/look for the request in the cache before attempting to request?
	 *  NOTE: this isn't a browser cache, this is internal and would only cache in-page
	 */
	useCache: false,

	/** Prevent the browser from caching this by adding a query string argument to the URL */
	preventCache: false,
	
	// events stuff
	load: function(/*String*/ type, /*Object*/ data, /*Object*/ transportImplementation, /*Object*/ kwArgs){
		// summary:
		//		Called on successful completion of a bind.
		//		type:
		//				A string with value "load"
		//		data:
		//				The object representing the result of the bind. The actual structure
		//				of the data object will depend on the mimetype that was given to bind
		//				in the bind arguments.
		//		transportImplementation:
		//				The object that implements a particular transport. Structure is depedent
		//				on the transport. For XMLHTTPTransport (dojo.io.BrowserIO), it will be the
		//				XMLHttpRequest object from the browser.
		//		kwArgs:
		//				Object that contains the request parameters that were given to the
		//				bind call. Useful for storing and retrieving state from when bind
		//				was called.
	},
	error: function(/*String*/ type, /*Object*/ error, /*Object*/ transportImplementation, /*Object*/ kwArgs){
		// summary:
		//		Called when there is an error with a bind.
		//		type:
		//				A string with value "error"
		//		error:
		//				The error object. Should be a dojo.io.Error object, but not guaranteed.
		//		transportImplementation:
		//				The object that implements a particular transport. Structure is depedent
		//				on the transport. For XMLHTTPTransport (dojo.io.BrowserIO), it will be the
		//				XMLHttpRequest object from the browser.
		//		kwArgs:
		//				Object that contains the request parameters that were given to the
		//				bind call. Useful for storing and retrieving state from when bind
		//				was called.
	},
	timeout: function(/*String*/ type, /*Object*/ empty, /*Object*/ transportImplementation, /*Object*/ kwArgs){
		// summary:
		//		Called when there is an error with a bind. Only implemented in certain transports at this time.
		//		type:
		//				A string with value "timeout"
		//		empty:
		//				Should be null. Just a spacer argument so that load, error, timeout and handle have the
		//				same signatures.
		//		transportImplementation:
		//				The object that implements a particular transport. Structure is depedent
		//				on the transport. For XMLHTTPTransport (dojo.io.BrowserIO), it will be the
		//				XMLHttpRequest object from the browser. May be null for the timeout case for
		//				some transports.
		//		kwArgs:
		//				Object that contains the request parameters that were given to the
		//				bind call. Useful for storing and retrieving state from when bind
		//				was called.
	},
	handle: function(/*String*/ type, /*Object*/ data, /*Object*/ transportImplementation, /*Object*/ kwArgs){
		// summary:
		//		The handle method can be defined instead of defining separate load, error and timeout
		//		callbacks.
		//		type:
		//				A string with the type of callback: "load", "error", or "timeout".
		//		data:
		//				See the above callbacks for what this parameter could be.
		//		transportImplementation:
		//				The object that implements a particular transport. Structure is depedent
		//				on the transport. For XMLHTTPTransport (dojo.io.BrowserIO), it will be the
		//				XMLHttpRequest object from the browser.
		//		kwArgs:
		//				Object that contains the request parameters that were given to the
		//				bind call. Useful for storing and retrieving state from when bind
		//				was called.	
	},

	//FIXME: change IframeIO.js to use timeouts?
	// The number of seconds to wait until firing a timeout callback.
	// If it is zero, that means, don't do a timeout check.
	timeoutSeconds: 0,
	
	// the abort method needs to be filled in by the transport that accepts the
	// bind() request
	abort: function(){ },
	
	// backButton: function(){ },
	// forwardButton: function(){ },

	fromKwArgs: function(/*Object*/ kwArgs){
		// summary:
		//		Creates a dojo.io.Request from a simple object (kwArgs object).

		// normalize args
		if(kwArgs["url"]){ kwArgs.url = kwArgs.url.toString(); }
		if(kwArgs["formNode"]) { kwArgs.formNode = dojo.byId(kwArgs.formNode); }
		if(!kwArgs["method"] && kwArgs["formNode"] && kwArgs["formNode"].method) {
			kwArgs.method = kwArgs["formNode"].method;
		}
		
		// backwards compatibility
		if(!kwArgs["handle"] && kwArgs["handler"]){ kwArgs.handle = kwArgs.handler; }
		if(!kwArgs["load"] && kwArgs["loaded"]){ kwArgs.load = kwArgs.loaded; }
		if(!kwArgs["changeUrl"] && kwArgs["changeURL"]) { kwArgs.changeUrl = kwArgs.changeURL; }

		// encoding fun!
		kwArgs.encoding = dojo.lang.firstValued(kwArgs["encoding"], djConfig["bindEncoding"], "");

		kwArgs.sendTransport = dojo.lang.firstValued(kwArgs["sendTransport"], djConfig["ioSendTransport"], false);

		var isFunction = dojo.lang.isFunction;
		for(var x=0; x<dojo.io.hdlrFuncNames.length; x++){
			var fn = dojo.io.hdlrFuncNames[x];
			if(kwArgs[fn] && isFunction(kwArgs[fn])){ continue; }
			if(kwArgs["handle"] && isFunction(kwArgs["handle"])){
				kwArgs[fn] = kwArgs.handle;
			}
			// handler is aliased above, shouldn't need this check
			/* else if(dojo.lang.isObject(kwArgs.handler)){
				if(isFunction(kwArgs.handler[fn])){
					kwArgs[fn] = kwArgs.handler[fn]||kwArgs.handler["handle"]||function(){};
				}
			}*/
		}
		dojo.lang.mixin(this, kwArgs);
	}

});

dojo.io.Error = function(/*String*/ msg, /*String*/ type, /*Number*/num){
	// summary:
	//		Constructs an object representing a bind error.
	this.message = msg;
	this.type =  type || "unknown"; // must be one of "io", "parse", "unknown"
	this.number = num || 0; // per-substrate error number, not normalized
}

dojo.io.transports.addTransport = function(name){
	// summary:
	//		Used to register transports that can support bind calls.
	this.push(name);
	// FIXME: do we need to handle things that aren't direct children of the
	// dojo.io module? (say, dojo.io.foo.fooTransport?)
	this[name] = dojo.io[name];
}

// binding interface, the various implementations register their capabilities
// and the bind() method dispatches
dojo.io.bind = function(/*Object*/ request){
	// summary:
	//		Binding interface for IO. Loading different IO transports, like
	//		dojo.io.BrowserIO or dojo.io.IframeIO will register with bind
	//		to handle particular types of bind calls.
	//		request:
	//				Object containing bind arguments. This object is converted to
	//				a dojo.io.Request object, and that request object is the return
	//				value for this method.
	if(!(request instanceof dojo.io.Request)){
		try{
			request = new dojo.io.Request(request);
		}catch(e){ dojo.debug(e); }
	}

	// if the request asks for a particular implementation, use it
	var tsName = "";
	if(request["transport"]){
		tsName = request["transport"];
		if(!this[tsName]){
			dojo.io.sendBindError(request, "No dojo.io.bind() transport with name '"
				+ request["transport"] + "'.");
			return request; //dojo.io.Request
		}
		if(!this[tsName].canHandle(request)){
			dojo.io.sendBindError(request, "dojo.io.bind() transport with name '"
				+ request["transport"] + "' cannot handle this type of request.");
			return request;	//dojo.io.Request
		}
	}else{
		// otherwise we do our best to auto-detect what available transports
		// will handle 
		for(var x=0; x<dojo.io.transports.length; x++){
			var tmp = dojo.io.transports[x];
			if((this[tmp])&&(this[tmp].canHandle(request))){
				tsName = tmp;
				break;
			}
		}
		if(tsName == ""){
			dojo.io.sendBindError(request, "None of the loaded transports for dojo.io.bind()"
				+ " can handle the request.");
			return request; //dojo.io.Request
		}
	}
	this[tsName].bind(request);
	request.bindSuccess = true;
	return request; //dojo.io.Request
}

dojo.io.sendBindError = function(request /* Object */, message /* String */){
	// summary:
	//		Used internally by dojo.io.bind() to return/raise a bind error.

	//Need to be careful since not all hostenvs support setTimeout.
	if((typeof request.error == "function" || typeof request.handle == "function")
		&& (typeof setTimeout == "function" || typeof setTimeout == "object")){
		var errorObject = new dojo.io.Error(message);
		setTimeout(function(){
			request[(typeof request.error == "function") ? "error" : "handle"]("error", errorObject, null, request);
		}, 50);
	}else{
		dojo.raise(message);
	}
}

dojo.io.queueBind = function(/* Object */ request){
	// summary:
	//		queueBind will use dojo.io.bind() but guarantee that only one bind
	//		call is handled at a time. If queueBind is called while a bind call
	//		is in process, it will queue up the other calls to bind and call them
	//		in order as bind calls complete.
	//		request:
	//			Same sort of request object as used for dojo.io.bind().
	if(!(request instanceof dojo.io.Request)){
		try{
			request = new dojo.io.Request(request);
		}catch(e){ dojo.debug(e); }
	}

	// make sure we get called if/when we get a response
	var oldLoad = request.load;
	request.load = function(){
		dojo.io._queueBindInFlight = false;
		var ret = oldLoad.apply(this, arguments);
		dojo.io._dispatchNextQueueBind();
		return ret;
	}

	var oldErr = request.error;
	request.error = function(){
		dojo.io._queueBindInFlight = false;
		var ret = oldErr.apply(this, arguments);
		dojo.io._dispatchNextQueueBind();
		return ret;
	}

	dojo.io._bindQueue.push(request);
	dojo.io._dispatchNextQueueBind();
	return request; //dojo.io.Request
}

dojo.io._dispatchNextQueueBind = function(){
	// summary:
	//	Private method used by dojo.io.queueBind().
	if(!dojo.io._queueBindInFlight){
		dojo.io._queueBindInFlight = true;
		if(dojo.io._bindQueue.length > 0){
			dojo.io.bind(dojo.io._bindQueue.shift());
		}else{
			dojo.io._queueBindInFlight = false;
		}
	}
}
dojo.io._bindQueue = [];
dojo.io._queueBindInFlight = false;

dojo.io.argsFromMap = function(/*Object*/ map, /*String*/ encoding, /*String*/ last){
	// summary:
	//		Converts name/values pairs in the map object to an URL-encoded string
	//		with format of name1=value1&name2=value2...
	//		map:
	//			Object that has the contains the names and values.
	//		encoding:
	//			String to specify how to encode the name and value. If the encoding string
	//			contains "utf" (case-insensitive), then encodeURIComponent is used. Otherwise
	//			dojo.string.encodeAscii is used.
	//		last:
	//			The last parameter in the list. Helps with final string formatting?
	var enc = /utf/i.test(encoding||"") ? encodeURIComponent : dojo.string.encodeAscii;
	var mapped = [];
	var control = new Object();
	for(var name in map){
		var domap = function(elt){
			var val = enc(name)+"="+enc(elt);
			mapped[(last == name) ? "push" : "unshift"](val);
		}
		if(!control[name]){
			var value = map[name];
			// FIXME: should be isArrayLike?
			if (dojo.lang.isArray(value)){
				dojo.lang.forEach(value, domap);
			}else{
				domap(value);
			}
		}
	}
	return mapped.join("&"); //String
}

dojo.io.setIFrameSrc = function(/*DOMNode*/ iframe, /*String*/ src, /*Boolean*/ replace){
	//summary:
	//		Sets the URL that is loaded in an IFrame. The replace parameter indicates whether
	//		location.replace() should be used when changing the location of the iframe.
	try{
		var r = dojo.render.html;
		// dojo.debug(iframe);
		if(!replace){
			if(r.safari){
				iframe.location = src;
			}else{
				frames[iframe.name].location = src;
			}
		}else{
			// Fun with DOM 0 incompatibilities!
			var idoc;
			if(r.ie){
				idoc = iframe.contentWindow.document;
			}else if(r.safari){
				idoc = iframe.document;
			}else{ //  if(r.moz){
				idoc = iframe.contentWindow;
			}

			//For Safari (at least 2.0.3) and Opera, if the iframe
			//has just been created but it doesn't have content
			//yet, then iframe.document may be null. In that case,
			//use iframe.location and return.
			if(!idoc){
				iframe.location = src;
				return;
			}else{
				idoc.location.replace(src);
			}
		}
	}catch(e){ 
		dojo.debug(e); 
		dojo.debug("setIFrameSrc: "+e); 
	}
}

/*
dojo.io.sampleTranport = new function(){
	this.canHandle = function(kwArgs){
		// canHandle just tells dojo.io.bind() if this is a good transport to
		// use for the particular type of request.
		if(	
			(
				(kwArgs["mimetype"] == "text/plain") ||
				(kwArgs["mimetype"] == "text/html") ||
				(kwArgs["mimetype"] == "text/javascript")
			)&&(
				(kwArgs["method"] == "get") ||
				( (kwArgs["method"] == "post") && (!kwArgs["formNode"]) )
			)
		){
			return true;
		}

		return false;
	}

	this.bind = function(kwArgs){
		var hdlrObj = {};

		// set up a handler object
		for(var x=0; x<dojo.io.hdlrFuncNames.length; x++){
			var fn = dojo.io.hdlrFuncNames[x];
			if(typeof kwArgs.handler == "object"){
				if(typeof kwArgs.handler[fn] == "function"){
					hdlrObj[fn] = kwArgs.handler[fn]||kwArgs.handler["handle"];
				}
			}else if(typeof kwArgs[fn] == "function"){
				hdlrObj[fn] = kwArgs[fn];
			}else{
				hdlrObj[fn] = kwArgs["handle"]||function(){};
			}
		}

		// build a handler function that calls back to the handler obj
		var hdlrFunc = function(evt){
			if(evt.type == "onload"){
				hdlrObj.load("load", evt.data, evt);
			}else if(evt.type == "onerr"){
				var errObj = new dojo.io.Error("sampleTransport Error: "+evt.msg);
				hdlrObj.error("error", errObj);
			}
		}

		// the sample transport would attach the hdlrFunc() when sending the
		// request down the pipe at this point
		var tgtURL = kwArgs.url+"?"+dojo.io.argsFromMap(kwArgs.content);
		// sampleTransport.sendRequest(tgtURL, hdlrFunc);
	}

	dojo.io.transports.addTransport("sampleTranport");
}
*/

dojo.provide("dojo.lang.array");


// FIXME: Is this worthless since you can do: if(name in obj)
// is this the right place for this?
dojo.lang.has = function(/*Object*/obj, /*String*/name){
	try{
		return typeof obj[name] != "undefined";
	}catch(e){ return false; }
}

dojo.lang.isEmpty = function(/*Object*/obj){
	if(dojo.lang.isObject(obj)){
		var tmp = {};
		var count = 0;
		for(var x in obj){
			if(obj[x] && (!tmp[x])){
				count++;
				break;
			} 
		}
		return count == 0;
	}else if(dojo.lang.isArrayLike(obj) || dojo.lang.isString(obj)){
		return obj.length == 0;
	}
}

dojo.lang.map = function(/*Array*/arr, /*Object|Function*/obj, /*Function?*/unary_func){
	var isString = dojo.lang.isString(arr);
	if(isString){
		// arr: String
		arr = arr.split("");
	}
	if(dojo.lang.isFunction(obj)&&(!unary_func)){
		unary_func = obj;
		obj = dj_global;
	}else if(dojo.lang.isFunction(obj) && unary_func){
		// ff 1.5 compat
		var tmpObj = obj;
		obj = unary_func;
		unary_func = tmpObj;
	}
	if(Array.map){
	 	var outArr = Array.map(arr, unary_func, obj);
	}else{
		var outArr = [];
		for(var i=0;i<arr.length;++i){
			outArr.push(unary_func.call(obj, arr[i]));
		}
	}
	if(isString) {
		return outArr.join(""); // String
	} else {
		return outArr; // Array
	}
}

dojo.lang.reduce = function(/*Array*/arr, initialValue, /*Object|null*/obj, /*Function*/binary_func){
	var reducedValue = initialValue;
	var ob = obj ? obj : dj_global;
	dojo.lang.map(arr, 
		function(val){
			reducedValue = binary_func.call(ob, reducedValue, val);
		}
	);
	return reducedValue;
}

// http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach
dojo.lang.forEach = function(/*Array*/anArray, /*Function*/callback, /*Object?*/thisObject){
	if(dojo.lang.isString(anArray)){
		// anArray: String
		anArray = anArray.split(""); 
	}
	if(Array.forEach){
		Array.forEach(anArray, callback, thisObject);
	}else{
		// FIXME: there are several ways of handilng thisObject. Is dj_global always the default context?
		if(!thisObject){
			thisObject=dj_global;
		}
		for(var i=0,l=anArray.length; i<l; i++){ 
			callback.call(thisObject, anArray[i], i, anArray);
		}
	}
}

dojo.lang._everyOrSome = function(/*Boolean*/every, /*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
	if(dojo.lang.isString(arr)){ 
		//arr: String
		arr = arr.split(""); 
	}
	if(Array.every){
		return Array[ every ? "every" : "some" ](arr, callback, thisObject);
	}else{
		if(!thisObject){
			thisObject = dj_global;
		}
		for(var i=0,l=arr.length; i<l; i++){
			var result = callback.call(thisObject, arr[i], i, arr);
			if(every && !result){
				return false; // Boolean
			}else if((!every)&&(result)){
				return true; // Boolean
			}
		}
		return Boolean(every); // Boolean
	}
}

dojo.lang.every = function(/*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
	return this._everyOrSome(true, arr, callback, thisObject); // Boolean
}

dojo.lang.some = function(/*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
	return this._everyOrSome(false, arr, callback, thisObject); // Boolean
}

dojo.lang.filter = function(/*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
	var isString = dojo.lang.isString(arr);
	if(isString){ /*arr: String*/arr = arr.split(""); }
	var outArr;
	if(Array.filter){
		outArr = Array.filter(arr, callback, thisObject);
	} else {
		if(!thisObject){
			if(arguments.length >= 3){ dojo.raise("thisObject doesn't exist!"); }
			thisObject = dj_global;
		}

		outArr = [];
		for(var i = 0; i < arr.length; i++){
			if(callback.call(thisObject, arr[i], i, arr)){
				outArr.push(arr[i]);
			}
		}
	}
	if(isString){
		return outArr.join(""); // String
	} else {
		return outArr; // Array
	}
}

dojo.lang.unnest = function(/* ... */){
	// summary:
	//	Creates a 1-D array out of all the arguments passed,
	//	unravelling any array-like objects in the process
	//
	// usage:
	//	unnest(1, 2, 3) ==> [1, 2, 3]
	//	unnest(1, [2, [3], [[[4]]]]) ==> [1, 2, 3, 4]

	var out = [];
	for(var i = 0; i < arguments.length; i++){
		if(dojo.lang.isArrayLike(arguments[i])){
			var add = dojo.lang.unnest.apply(this, arguments[i]);
			out = out.concat(add);
		}else{
			out.push(arguments[i]);
		}
	}
	return out; // Array
}

dojo.lang.toArray = function(/*Object*/arrayLike, /*Number*/startOffset){
	// summary:
	//	Converts an array-like object (i.e. arguments, DOMCollection)
	//	to an array
	var array = [];
	for(var i = startOffset||0; i < arrayLike.length; i++){
		array.push(arrayLike[i]);
	}
	return array; // Array
}

dojo.provide("dojo.lang.func");


/**
 * Runs a function in a given scope (thisObject), can
 * also be used to preserve scope.
 *
 * hitch(foo, "bar"); // runs foo.bar() in the scope of foo
 * hitch(foo, myFunction); // runs myFunction in the scope of foo
 */
dojo.lang.hitch = function(thisObject, method){
	var fcn = (dojo.lang.isString(method) ? thisObject[method] : method) || function(){};

	return function() {
		return fcn.apply(thisObject, arguments);
	};
}

dojo.lang.anonCtr = 0;
dojo.lang.anon = {};
dojo.lang.nameAnonFunc = function(anonFuncPtr, namespaceObj, searchForNames){
	var nso = (namespaceObj || dojo.lang.anon);
	if( (searchForNames) ||
		((dj_global["djConfig"])&&(djConfig["slowAnonFuncLookups"] == true)) ){
		for(var x in nso){
			try{
				if(nso[x] === anonFuncPtr){
					return x;
				}
			}catch(e){} // window.external fails in IE embedded in Eclipse (Eclipse bug #151165)
		}
	}
	var ret = "__"+dojo.lang.anonCtr++;
	while(typeof nso[ret] != "undefined"){
		ret = "__"+dojo.lang.anonCtr++;
	}
	nso[ret] = anonFuncPtr;
	return ret;
}

dojo.lang.forward = function(funcName){
	// Returns a function that forwards a method call to this.func(...)
	return function(){
		return this[funcName].apply(this, arguments);
	};
}

dojo.lang.curry = function(ns, func /* args ... */){
	var outerArgs = [];
	ns = ns||dj_global;
	if(dojo.lang.isString(func)){
		func = ns[func];
	}
	for(var x=2; x<arguments.length; x++){
		outerArgs.push(arguments[x]);
	}
	// since the event system replaces the original function with a new
	// join-point runner with an arity of 0, we check to see if it's left us
	// any clues about the original arity in lieu of the function's actual
	// length property
	var ecount = (func["__preJoinArity"]||func.length) - outerArgs.length;
	// borrowed from svend tofte
	function gather(nextArgs, innerArgs, expected){
		var texpected = expected;
		var totalArgs = innerArgs.slice(0); // copy
		for(var x=0; x<nextArgs.length; x++){
			totalArgs.push(nextArgs[x]);
		}
		// check the list of provided nextArgs to see if it, plus the
		// number of innerArgs already supplied, meets the total
		// expected.
		expected = expected-nextArgs.length;
		if(expected<=0){
			var res = func.apply(ns, totalArgs);
			expected = texpected;
			return res;
		}else{
			return function(){
				return gather(arguments,// check to see if we've been run
										// with enough args
							totalArgs,	// a copy
							expected);	// how many more do we need to run?;
			};
		}
	}
	return gather([], outerArgs, ecount);
}

dojo.lang.curryArguments = function(ns, func, args, offset){
	var targs = [];
	var x = offset||0;
	for(x=offset; x<args.length; x++){
		targs.push(args[x]); // ensure that it's an arr
	}
	return dojo.lang.curry.apply(dojo.lang, [ns, func].concat(targs));
}

dojo.lang.tryThese = function(){
	for(var x=0; x<arguments.length; x++){
		try{
			if(typeof arguments[x] == "function"){
				var ret = (arguments[x]());
				if(ret){
					return ret;
				}
			}
		}catch(e){
			dojo.debug(e);
		}
	}
}

dojo.lang.delayThese = function(farr, cb, delay, onend){
	/**
	 * alternate: (array funcArray, function callback, function onend)
	 * alternate: (array funcArray, function callback)
	 * alternate: (array funcArray)
	 */
	if(!farr.length){ 
		if(typeof onend == "function"){
			onend();
		}
		return;
	}
	if((typeof delay == "undefined")&&(typeof cb == "number")){
		delay = cb;
		cb = function(){};
	}else if(!cb){
		cb = function(){};
		if(!delay){ delay = 0; }
	}
	setTimeout(function(){
		(farr.shift())();
		cb();
		dojo.lang.delayThese(farr, cb, delay, onend);
	}, delay);
}

dojo.provide("dojo.string.extras");


//TODO: should we use ${} substitution syntax instead, like widgets do?
dojo.string.substituteParams = function(/*string*/template, /* object - optional or ... */hash){
// summary:
//	Performs parameterized substitutions on a string. Throws an exception if any parameter is unmatched.
//
// description:
//	For example,
//		dojo.string.substituteParams("File '%{0}' is not found in directory '%{1}'.","foo.html","/temp");
//	returns
//		"File 'foo.html' is not found in directory '/temp'."
//
// template: the original string template with %{values} to be replaced
// hash: name/value pairs (type object) to provide substitutions.  Alternatively, substitutions may be
//	included as arguments 1..n to this function, corresponding to template parameters 0..n-1

	var map = (typeof hash == 'object') ? hash : dojo.lang.toArray(arguments, 1);

	return template.replace(/\%\{(\w+)\}/g, function(match, key){
		if(typeof(map[key]) != "undefined" && map[key] != null){
			return map[key];
		}
		dojo.raise("Substitution not found: " + key);
	}); // string
};

dojo.string.capitalize = function(/*string*/str){
// summary:
//	Uppercases the first letter of each word

	if(!dojo.lang.isString(str)){ return ""; }
	if(arguments.length == 0){ str = this; }

	var words = str.split(' ');
	for(var i=0; i<words.length; i++){
		words[i] = words[i].charAt(0).toUpperCase() + words[i].substring(1);
	}
	return words.join(" "); // string
}

dojo.string.isBlank = function(/*string*/str){
// summary:
//	Return true if the entire string is whitespace characters

	if(!dojo.lang.isString(str)){ return true; }
	return (dojo.string.trim(str).length == 0); // boolean
}

//FIXME: not sure exactly what encodeAscii is trying to do, or if it's working right
dojo.string.encodeAscii = function(/*string*/str){
	if(!dojo.lang.isString(str)){ return str; } // unknown
	var ret = "";
	var value = escape(str);
	var match, re = /%u([0-9A-F]{4})/i;
	while((match = value.match(re))){
		var num = Number("0x"+match[1]);
		var newVal = escape("&#" + num + ";");
		ret += value.substring(0, match.index) + newVal;
		value = value.substring(match.index+match[0].length);
	}
	ret += value.replace(/\+/g, "%2B");
	return ret; // string
}

dojo.string.escape = function(/*string*/type, /*string*/str){
// summary:
//	Adds escape sequences for special characters according to the convention of 'type'
//
// type: one of xml|html|xhtml|sql|regexp|regex|javascript|jscript|js|ascii
// str: the string to be escaped

	var args = dojo.lang.toArray(arguments, 1);
	switch(type.toLowerCase()){
		case "xml":
		case "html":
		case "xhtml":
			return dojo.string.escapeXml.apply(this, args); // string
		case "sql":
			return dojo.string.escapeSql.apply(this, args); // string
		case "regexp":
		case "regex":
			return dojo.string.escapeRegExp.apply(this, args); // string
		case "javascript":
		case "jscript":
		case "js":
			return dojo.string.escapeJavaScript.apply(this, args); // string
		case "ascii":
			// so it's encode, but it seems useful
			return dojo.string.encodeAscii.apply(this, args); // string
		default:
			return str; // string
	}
}

dojo.string.escapeXml = function(/*string*/str, /*boolean*/noSingleQuotes){
//summary:
//	Adds escape sequences for special characters in XML: &<>"'
//  Optionally skips escapes for single quotes

	str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
		.replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
	if(!noSingleQuotes){ str = str.replace(/'/gm, "&#39;"); }
	return str; // string
}

dojo.string.escapeSql = function(/*string*/str){
//summary:
//	Adds escape sequences for single quotes in SQL expressions

	return str.replace(/'/gm, "''"); //string
}

dojo.string.escapeRegExp = function(/*string*/str){
//summary:
//	Adds escape sequences for special characters in regular expressions

	return str.replace(/\\/gm, "\\\\").replace(/([\f\b\n\t\r[\^$|?*+(){}])/gm, "\\$1"); // string
}

//FIXME: should this one also escape backslash?
dojo.string.escapeJavaScript = function(/*string*/str){
//summary:
//	Adds escape sequences for single and double quotes as well
//	as non-visible characters in JavaScript string literal expressions

	return str.replace(/(["'\f\b\n\t\r])/gm, "\\$1"); // string
}

//FIXME: looks a lot like escapeJavaScript, just adds quotes? deprecate one?
dojo.string.escapeString = function(/*string*/str){
//summary:
//	Adds escape sequences for non-visual characters, double quote and backslash
//	and surrounds with double quotes to form a valid string literal.
	return ('"' + str.replace(/(["\\])/g, '\\$1') + '"'
		).replace(/[\f]/g, "\\f"
		).replace(/[\b]/g, "\\b"
		).replace(/[\n]/g, "\\n"
		).replace(/[\t]/g, "\\t"
		).replace(/[\r]/g, "\\r"); // string
}

// TODO: make an HTML version
dojo.string.summary = function(/*string*/str, /*number*/len){
// summary:
//	Truncates 'str' after 'len' characters and appends periods as necessary so that it ends with "..."

	if(!len || str.length <= len){
		return str; // string
	}

	return str.substring(0, len).replace(/\.+$/, "") + "..."; // string
}

dojo.string.endsWith = function(/*string*/str, /*string*/end, /*boolean*/ignoreCase){
// summary:
//	Returns true if 'str' ends with 'end'

	if(ignoreCase){
		str = str.toLowerCase();
		end = end.toLowerCase();
	}
	if((str.length - end.length) < 0){
		return false; // boolean
	}
	return str.lastIndexOf(end) == str.length - end.length; // boolean
}

dojo.string.endsWithAny = function(/*string*/str /* , ... */){
// summary:
//	Returns true if 'str' ends with any of the arguments[2 -> n]

	for(var i = 1; i < arguments.length; i++) {
		if(dojo.string.endsWith(str, arguments[i])) {
			return true; // boolean
		}
	}
	return false; // boolean
}

dojo.string.startsWith = function(/*string*/str, /*string*/start, /*boolean*/ignoreCase){
// summary:
//	Returns true if 'str' starts with 'start'

	if(ignoreCase) {
		str = str.toLowerCase();
		start = start.toLowerCase();
	}
	return str.indexOf(start) == 0; // boolean
}

dojo.string.startsWithAny = function(/*string*/str /* , ... */){
// summary:
//	Returns true if 'str' starts with any of the arguments[2 -> n]

	for(var i = 1; i < arguments.length; i++) {
		if(dojo.string.startsWith(str, arguments[i])) {
			return true; // boolean
		}
	}
	return false; // boolean
}

dojo.string.has = function(/*string*/str /* , ... */) {
// summary:
//	Returns true if 'str' contains any of the arguments 2 -> n

	for(var i = 1; i < arguments.length; i++) {
		if(str.indexOf(arguments[i]) > -1){
			return true; // boolean
		}
	}
	return false; // boolean
}

dojo.string.normalizeNewlines = function(/*string*/text, /*string? (\n or \r)*/newlineChar){
// summary:
//	Changes occurences of CR and LF in text to CRLF, or if newlineChar is provided as '\n' or '\r',
//	substitutes newlineChar for occurrences of CR/LF and CRLF

	if (newlineChar == "\n"){
		text = text.replace(/\r\n/g, "\n");
		text = text.replace(/\r/g, "\n");
	} else if (newlineChar == "\r"){
		text = text.replace(/\r\n/g, "\r");
		text = text.replace(/\n/g, "\r");
	}else{
		text = text.replace(/([^\r])\n/g, "$1\r\n").replace(/\r([^\n])/g, "\r\n$1");
	}
	return text; // string
}

dojo.string.splitEscaped = function(/*string*/str, /*string of length=1*/charac){
// summary:
//	Splits 'str' into an array separated by 'charac', but skips characters escaped with a backslash

	var components = [];
	for (var i = 0, prevcomma = 0; i < str.length; i++){
		if (str.charAt(i) == '\\'){ i++; continue; }
		if (str.charAt(i) == charac){
			components.push(str.substring(prevcomma, i));
			prevcomma = i + 1;
		}
	}
	components.push(str.substr(prevcomma));
	return components; // array
}

dojo.provide("dojo.dom");

dojo.dom.ELEMENT_NODE                  = 1;
dojo.dom.ATTRIBUTE_NODE                = 2;
dojo.dom.TEXT_NODE                     = 3;
dojo.dom.CDATA_SECTION_NODE            = 4;
dojo.dom.ENTITY_REFERENCE_NODE         = 5;
dojo.dom.ENTITY_NODE                   = 6;
dojo.dom.PROCESSING_INSTRUCTION_NODE   = 7;
dojo.dom.COMMENT_NODE                  = 8;
dojo.dom.DOCUMENT_NODE                 = 9;
dojo.dom.DOCUMENT_TYPE_NODE            = 10;
dojo.dom.DOCUMENT_FRAGMENT_NODE        = 11;
dojo.dom.NOTATION_NODE                 = 12;
	
dojo.dom.dojoml = "http://www.dojotoolkit.org/2004/dojoml";

/**
 *	comprehensive list of XML namespaces
**/
dojo.dom.xmlns = {
	//	summary
	//	aliases for various common XML namespaces
	svg : "http://www.w3.org/2000/svg",
	smil : "http://www.w3.org/2001/SMIL20/",
	mml : "http://www.w3.org/1998/Math/MathML",
	cml : "http://www.xml-cml.org",
	xlink : "http://www.w3.org/1999/xlink",
	xhtml : "http://www.w3.org/1999/xhtml",
	xul : "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul",
	xbl : "http://www.mozilla.org/xbl",
	fo : "http://www.w3.org/1999/XSL/Format",
	xsl : "http://www.w3.org/1999/XSL/Transform",
	xslt : "http://www.w3.org/1999/XSL/Transform",
	xi : "http://www.w3.org/2001/XInclude",
	xforms : "http://www.w3.org/2002/01/xforms",
	saxon : "http://icl.com/saxon",
	xalan : "http://xml.apache.org/xslt",
	xsd : "http://www.w3.org/2001/XMLSchema",
	dt: "http://www.w3.org/2001/XMLSchema-datatypes",
	xsi : "http://www.w3.org/2001/XMLSchema-instance",
	rdf : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
	rdfs : "http://www.w3.org/2000/01/rdf-schema#",
	dc : "http://purl.org/dc/elements/1.1/",
	dcq: "http://purl.org/dc/qualifiers/1.0",
	"soap-env" : "http://schemas.xmlsoap.org/soap/envelope/",
	wsdl : "http://schemas.xmlsoap.org/wsdl/",
	AdobeExtensions : "http://ns.adobe.com/AdobeSVGViewerExtensions/3.0/"
};

dojo.dom.isNode = function(/* object */wh){
	//	summary
	//	checks to see if wh is actually a node.
	if(typeof Element == "function") {
		try {
			return wh instanceof Element;	//	boolean
		} catch(E) {}
	} else {
		// best-guess
		return wh && !isNaN(wh.nodeType);	//	boolean
	}
}

dojo.dom.getUniqueId = function(){
	//	summary
	//	returns a unique string for use with any DOM element
	var _document = dojo.doc();
	do {
		var id = "dj_unique_" + (++arguments.callee._idIncrement);
	}while(_document.getElementById(id));
	return id;	//	string
}
dojo.dom.getUniqueId._idIncrement = 0;

dojo.dom.firstElement = dojo.dom.getFirstChildElement = function(/* Element */parentNode, /* string? */tagName){
	//	summary
	//	returns the first child element matching tagName
	var node = parentNode.firstChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE){
		node = node.nextSibling;
	}
	if(tagName && node && node.tagName && node.tagName.toLowerCase() != tagName.toLowerCase()) {
		node = dojo.dom.nextElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.lastElement = dojo.dom.getLastChildElement = function(/* Element */parentNode, /* string? */tagName){
	//	summary
	//	returns the last child element matching tagName
	var node = parentNode.lastChild;
	while(node && node.nodeType != dojo.dom.ELEMENT_NODE) {
		node = node.previousSibling;
	}
	if(tagName && node && node.tagName && node.tagName.toLowerCase() != tagName.toLowerCase()) {
		node = dojo.dom.prevElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.nextElement = dojo.dom.getNextSiblingElement = function(/* Node */node, /* string? */tagName){
	//	summary
	//	returns the next sibling element matching tagName
	if(!node) { return null; }
	do {
		node = node.nextSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);

	if(node && tagName && tagName.toLowerCase() != node.tagName.toLowerCase()) {
		return dojo.dom.nextElement(node, tagName);
	}
	return node;	//	Element
}

dojo.dom.prevElement = dojo.dom.getPreviousSiblingElement = function(/* Node */node, /* string? */tagName){
	//	summary
	//	returns the previous sibling element matching tagName
	if(!node) { return null; }
	if(tagName) { tagName = tagName.toLowerCase(); }
	do {
		node = node.previousSibling;
	} while(node && node.nodeType != dojo.dom.ELEMENT_NODE);

	if(node && tagName && tagName.toLowerCase() != node.tagName.toLowerCase()) {
		return dojo.dom.prevElement(node, tagName);
	}
	return node;	//	Element
}

// TODO: hmph
/*this.forEachChildTag = function(node, unaryFunc) {
	var child = this.getFirstChildTag(node);
	while(child) {
		if(unaryFunc(child) == "break") { break; }
		child = this.getNextSiblingTag(child);
	}
}*/

dojo.dom.moveChildren = function(/* Element */srcNode, /* Element */destNode, /* boolean? */trim){
	//	summary
	//	Moves children from srcNode to destNode and returns the count of children moved; 
	//		will trim off text nodes if trim == true
	var count = 0;
	if(trim) {
		while(srcNode.hasChildNodes() &&
			srcNode.firstChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.firstChild);
		}
		while(srcNode.hasChildNodes() &&
			srcNode.lastChild.nodeType == dojo.dom.TEXT_NODE) {
			srcNode.removeChild(srcNode.lastChild);
		}
	}
	while(srcNode.hasChildNodes()){
		destNode.appendChild(srcNode.firstChild);
		count++;
	}
	return count;	//	number
}

dojo.dom.copyChildren = function(/* Element */srcNode, /* Element */destNode, /* boolean? */trim){
	//	summary
	//	Copies children from srcNde to destNode and returns the count of children copied;
	//		will trim off text nodes if trim == true
	var clonedNode = srcNode.cloneNode(true);
	return this.moveChildren(clonedNode, destNode, trim);	//	number
}

dojo.dom.removeChildren = function(/* Element */node){
	//	summary
	//	removes all children from node and returns the count of children removed.
	var count = node.childNodes.length;
	while(node.hasChildNodes()){ node.removeChild(node.firstChild); }
	return count;	//	number
}

dojo.dom.replaceChildren = function(/* Element */node, /* Node */newChild){
	//	summary
	//	Removes all children of node and appends newChild
	// FIXME: what if newChild is an array-like object?
	dojo.dom.removeChildren(node);
	node.appendChild(newChild);
}

dojo.dom.removeNode = function(/* Node */node){
	//	summary
	//	if node has a parent, removes node from parent and returns a reference to the removed child.
	if(node && node.parentNode){
		// return a ref to the removed child
		return node.parentNode.removeChild(node);	//	Node
	}
}

dojo.dom.getAncestors = function(/* Node */node, /* function? */filterFunction, /* boolean? */returnFirstHit) {
	//	summary
	//	returns all ancestors matching optional filterFunction; will return only the first if returnFirstHit
	var ancestors = [];
	var isFunction = (filterFunction && (filterFunction instanceof Function || typeof filterFunction == "function"));
	while(node) {
		if (!isFunction || filterFunction(node)) {
			ancestors.push(node);
		}
		if (returnFirstHit && ancestors.length > 0) { 
			return ancestors[0]; 	//	Node
		}
		
		node = node.parentNode;
	}
	if (returnFirstHit) { return null; }
	return ancestors;	//	array
}

dojo.dom.getAncestorsByTag = function(/* Node */node, /* string */tag, /* boolean? */returnFirstHit) {
	//	summary
	//	returns all ancestors matching tag (as tagName), will only return first one if returnFirstHit
	tag = tag.toLowerCase();
	return dojo.dom.getAncestors(node, function(el){
		return ((el.tagName)&&(el.tagName.toLowerCase() == tag));
	}, returnFirstHit);	//	Node || array
}

dojo.dom.getFirstAncestorByTag = function(/* Node */node, /* string */tag) {
	//	summary
	//	Returns first ancestor of node with tag tagName
	return dojo.dom.getAncestorsByTag(node, tag, true);	//	Node
}

dojo.dom.isDescendantOf = function(/* Node */node, /* Node */ancestor, /* boolean? */guaranteeDescendant){
	//	summary
	//	Returns boolean if node is a descendant of ancestor
	// guaranteeDescendant allows us to be a "true" isDescendantOf function
	if(guaranteeDescendant && node) { node = node.parentNode; }
	while(node) {
		if(node == ancestor){ 
			return true; 	//	boolean
		}
		node = node.parentNode;
	}
	return false;	//	boolean
}

dojo.dom.innerXML = function(/* Node */node){
	//	summary
	//	Implementation of MS's innerXML function.
	if(node.innerXML){
		return node.innerXML;	//	string
	}else if (node.xml){
		return node.xml;		//	string
	}else if(typeof XMLSerializer != "undefined"){
		return (new XMLSerializer()).serializeToString(node);	//	string
	}
}

dojo.dom.createDocument = function(){
	//	summary
	//	cross-browser implementation of creating an XML document object.
	var doc = null;
	var _document = dojo.doc();

	if(!dj_undef("ActiveXObject")){
		var prefixes = [ "MSXML2", "Microsoft", "MSXML", "MSXML3" ];
		for(var i = 0; i<prefixes.length; i++){
			try{
				doc = new ActiveXObject(prefixes[i]+".XMLDOM");
			}catch(e){ /* squelch */ };

			if(doc){ break; }
		}
	}else if((_document.implementation)&&
		(_document.implementation.createDocument)){
		doc = _document.implementation.createDocument("", "", null);
	}
	
	return doc;	//	DOMDocument
}

dojo.dom.createDocumentFromText = function(/* string */str, /* string? */mimetype){
	//	summary
	//	attempts to create a Document object based on optional mime-type, using str as the contents of the document
	if(!mimetype){ mimetype = "text/xml"; }
	if(!dj_undef("DOMParser")){
		var parser = new DOMParser();
		return parser.parseFromString(str, mimetype);	//	DOMDocument
	}else if(!dj_undef("ActiveXObject")){
		var domDoc = dojo.dom.createDocument();
		if(domDoc){
			domDoc.async = false;
			domDoc.loadXML(str);
			return domDoc;	//	DOMDocument
		}else{
			dojo.debug("toXml didn't work?");
		}
	/*
	}else if((dojo.render.html.capable)&&(dojo.render.html.safari)){
		// FIXME: this doesn't appear to work!
		// from: http://web-graphics.com/mtarchive/001606.php
		// var xml = '<?xml version="1.0"?>'+str;
		var mtype = "text/xml";
		var xml = '<?xml version="1.0"?>'+str;
		var url = "data:"+mtype+";charset=utf-8,"+encodeURIComponent(xml);
		var req = new XMLHttpRequest();
		req.open("GET", url, false);
		req.overrideMimeType(mtype);
		req.send(null);
		return req.responseXML;
	*/
	}else{
		var _document = dojo.doc();
		if(_document.createElement){
			// FIXME: this may change all tags to uppercase!
			var tmp = _document.createElement("xml");
			tmp.innerHTML = str;
			if(_document.implementation && _document.implementation.createDocument) {
				var xmlDoc = _document.implementation.createDocument("foo", "", null);
				for(var i = 0; i < tmp.childNodes.length; i++) {
					xmlDoc.importNode(tmp.childNodes.item(i), true);
				}
				return xmlDoc;	//	DOMDocument
			}
			// FIXME: probably not a good idea to have to return an HTML fragment
			// FIXME: the tmp.doc.firstChild is as tested from IE, so it may not
			// work that way across the board
			return ((tmp.document)&&
				(tmp.document.firstChild ?  tmp.document.firstChild : tmp));	//	DOMDocument
		}
	}
	return null;
}

dojo.dom.prependChild = function(/* Element */node, /* Element */parent) {
	// summary
	//	prepends node to parent's children nodes
	if(parent.firstChild) {
		parent.insertBefore(node, parent.firstChild);
	} else {
		parent.appendChild(node);
	}
	return true;	//	boolean
}

dojo.dom.insertBefore = function(/* Node */node, /* Node */ref, /* boolean? */force){
	//	summary
	//	Try to insert node before ref
	if (force != true &&
		(node === ref || node.nextSibling === ref)){ return false; }
	var parent = ref.parentNode;
	parent.insertBefore(node, ref);
	return true;	//	boolean
}

dojo.dom.insertAfter = function(/* Node */node, /* Node */ref, /* boolean? */force){
	//	summary
	//	Try to insert node after ref
	var pn = ref.parentNode;
	if(ref == pn.lastChild){
		if((force != true)&&(node === ref)){
			return false;	//	boolean
		}
		pn.appendChild(node);
	}else{
		return this.insertBefore(node, ref.nextSibling, force);	//	boolean
	}
	return true;	//	boolean
}

dojo.dom.insertAtPosition = function(/* Node */node, /* Node */ref, /* string */position){
	//	summary
	//	attempt to insert node in relation to ref based on position
	if((!node)||(!ref)||(!position)){ 
		return false;	//	boolean 
	}
	switch(position.toLowerCase()){
		case "before":
			return dojo.dom.insertBefore(node, ref);	//	boolean
		case "after":
			return dojo.dom.insertAfter(node, ref);		//	boolean
		case "first":
			if(ref.firstChild){
				return dojo.dom.insertBefore(node, ref.firstChild);	//	boolean
			}else{
				ref.appendChild(node);
				return true;	//	boolean
			}
			break;
		default: // aka: last
			ref.appendChild(node);
			return true;	//	boolean
	}
}

dojo.dom.insertAtIndex = function(/* Node */node, /* Element */containingNode, /* number */insertionIndex){
	//	summary
	//	insert node into child nodes nodelist of containingNode at insertionIndex.
	var siblingNodes = containingNode.childNodes;

	// if there aren't any kids yet, just add it to the beginning

	if (!siblingNodes.length){
		containingNode.appendChild(node);
		return true;	//	boolean
	}

	// otherwise we need to walk the childNodes
	// and find our spot

	var after = null;

	for(var i=0; i<siblingNodes.length; i++){

		var sibling_index = siblingNodes.item(i)["getAttribute"] ? parseInt(siblingNodes.item(i).getAttribute("dojoinsertionindex")) : -1;

		if (sibling_index < insertionIndex){
			after = siblingNodes.item(i);
		}
	}

	if (after){
		// add it after the node in {after}

		return dojo.dom.insertAfter(node, after);	//	boolean
	}else{
		// add it to the start

		return dojo.dom.insertBefore(node, siblingNodes.item(0));	//	boolean
	}
}
	
dojo.dom.textContent = function(/* Node */node, /* string */text){
	//	summary
	//	implementation of the DOM Level 3 attribute; scan node for text
	if (arguments.length>1) {
		var _document = dojo.doc();
		dojo.dom.replaceChildren(node, _document.createTextNode(text));
		return text;	//	string
	} else {
		if(node.textContent != undefined){ //FF 1.5
			return node.textContent;	//	string
		}
		var _result = "";
		if (node == null) { return _result; }
		for (var i = 0; i < node.childNodes.length; i++) {
			switch (node.childNodes[i].nodeType) {
				case 1: // ELEMENT_NODE
				case 5: // ENTITY_REFERENCE_NODE
					_result += dojo.dom.textContent(node.childNodes[i]);
					break;
				case 3: // TEXT_NODE
				case 2: // ATTRIBUTE_NODE
				case 4: // CDATA_SECTION_NODE
					_result += node.childNodes[i].nodeValue;
					break;
				default:
					break;
			}
		}
		return _result;	//	string
	}
}

dojo.dom.hasParent = function (/* Node */node) {
	//	summary
	//	returns whether or not node is a child of another node.
	return node && node.parentNode && dojo.dom.isNode(node.parentNode);	//	boolean
}

/**
 * Examples:
 *
 * myFooNode = <foo />
 * isTag(myFooNode, "foo"); // returns "foo"
 * isTag(myFooNode, "bar"); // returns ""
 * isTag(myFooNode, "FOO"); // returns ""
 * isTag(myFooNode, "hey", "foo", "bar"); // returns "foo"
**/
dojo.dom.isTag = function(/* Node */node /* ... */) {
	//	summary
	//	determines if node has any of the provided tag names and returns the tag name that matches, empty string otherwise.
	if(node && node.tagName) {
		for(var i=1; i<arguments.length; i++){
			if(node.tagName==String(arguments[i])){
				return String(arguments[i]);	//	string
			}
		}
	}
	return "";	//	string
}

dojo.dom.setAttributeNS = function(/* Element */elem, /* string */namespaceURI, /* string */attrName, /* string */attrValue){
	//	summary
	//	implementation of DOM2 setAttributeNS that works cross browser.
	if(elem == null || ((elem == undefined)&&(typeof elem == "undefined"))){
		dojo.raise("No element given to dojo.dom.setAttributeNS");
	}
	
	if(!((elem.setAttributeNS == undefined)&&(typeof elem.setAttributeNS == "undefined"))){ // w3c
		elem.setAttributeNS(namespaceURI, attrName, attrValue);
	}else{ // IE
		// get a root XML document
		var ownerDoc = elem.ownerDocument;
		var attribute = ownerDoc.createNode(
			2, // node type
			attrName,
			namespaceURI
		);
		
		// set value
		attribute.nodeValue = attrValue;
		
		// attach to element
		elem.setAttributeNode(attribute);
	}
}

dojo.provide("dojo.undo.browser");

try{
	if((!djConfig["preventBackButtonFix"])&&(!dojo.hostenv.post_load_)){
		document.write("<iframe style='border: 0px; width: 1px; height: 1px; position: absolute; bottom: 0px; right: 0px; visibility: visible;' name='djhistory' id='djhistory' src='"+(dojo.hostenv.getBaseScriptUri()+'iframe_history.html')+"'></iframe>");
	}
}catch(e){/* squelch */}

if(dojo.render.html.opera){
	dojo.debug("Opera is not supported with dojo.undo.browser, so back/forward detection will not work.");
}

/* NOTES:
 *  Safari 1.2: 
 *	back button "works" fine, however it's not possible to actually
 *	DETECT that you've moved backwards by inspecting window.location.
 *	Unless there is some other means of locating.
 *	FIXME: perhaps we can poll on history.length?
 *  Safari 2.0.3+ (and probably 1.3.2+):
 *	works fine, except when changeUrl is used. When changeUrl is used,
 *	Safari jumps all the way back to whatever page was shown before
 *	the page that uses dojo.undo.browser support.
 *  IE 5.5 SP2:
 *	back button behavior is macro. It does not move back to the
 *	previous hash value, but to the last full page load. This suggests
 *	that the iframe is the correct way to capture the back button in
 *	these cases.
 *	Don't test this page using local disk for MSIE. MSIE will not create 
 *	a history list for iframe_history.html if served from a file: URL. 
 *	The XML served back from the XHR tests will also not be properly 
 *	created if served from local disk. Serve the test pages from a web 
 *	server to test in that browser.
 *  IE 6.0:
 *	same behavior as IE 5.5 SP2
 * Firefox 1.0+:
 *	the back button will return us to the previous hash on the same
 *	page, thereby not requiring an iframe hack, although we do then
 *	need to run a timer to detect inter-page movement.
 */

dojo.undo.browser = {
	initialHref: window.location.href,
	initialHash: window.location.hash,

	moveForward: false,
	historyStack: [],
	forwardStack: [],
	historyIframe: null,
	bookmarkAnchor: null,
	locationTimer: null,

	/**
	 * setInitialState sets the state object and back callback for the very first page that is loaded.
	 * It is recommended that you call this method as part of an event listener that is registered via
	 * dojo.addOnLoad().
	 */
	setInitialState: function(args){
		this.initialState = this._createState(this.initialHref, args, this.initialHash);
	},

	//FIXME: Would like to support arbitrary back/forward jumps. Have to rework iframeLoaded among other things.
	//FIXME: is there a slight race condition in moz using change URL with the timer check and when
	//       the hash gets set? I think I have seen a back/forward call in quick succession, but not consistent.
	/**
	 * addToHistory takes one argument, and it is an object that defines the following functions:
	 * - To support getting back button notifications, the object argument should implement a
	 *   function called either "back", "backButton", or "handle". The string "back" will be
	 *   passed as the first and only argument to this callback.
	 * - To support getting forward button notifications, the object argument should implement a
	 *   function called either "forward", "forwardButton", or "handle". The string "forward" will be
	 *   passed as the first and only argument to this callback.
	 * - If you want the browser location string to change, define "changeUrl" on the object. If the
	 *   value of "changeUrl" is true, then a unique number will be appended to the URL as a fragment
	 *   identifier (http://some.domain.com/path#uniquenumber). If it is any other value that does
	 *   not evaluate to false, that value will be used as the fragment identifier. For example,
	 *   if changeUrl: 'page1', then the URL will look like: http://some.domain.com/path#page1
	 *   
	 * Full example:
	 * 
	 * dojo.undo.browser.addToHistory({
	 *   back: function() { alert('back pressed'); },
	 *   forward: function() { alert('forward pressed'); },
	 *   changeUrl: true
	 * });
	 */
	addToHistory: function(args){
		//If addToHistory is called, then that means we prune the
		//forward stack -- the user went back, then wanted to
		//start a new forward path.
		this.forwardStack = []; 

		var hash = null;
		var url = null;
		if(!this.historyIframe){
			this.historyIframe = window.frames["djhistory"];
		}
		if(!this.bookmarkAnchor){
			this.bookmarkAnchor = document.createElement("a");
			dojo.body().appendChild(this.bookmarkAnchor);
			this.bookmarkAnchor.style.display = "none";
		}
		if(args["changeUrl"]){
			hash = "#"+ ((args["changeUrl"]!==true) ? args["changeUrl"] : (new Date()).getTime());
			
			//If the current hash matches the new one, just replace the history object with
			//this new one. It doesn't make sense to track different state objects for the same
			//logical URL. This matches the browser behavior of only putting in one history
			//item no matter how many times you click on the same #hash link, at least in Firefox
			//and Safari, and there is no reliable way in those browsers to know if a #hash link
			//has been clicked on multiple times. So making this the standard behavior in all browsers
			//so that dojo.undo.browser's behavior is the same in all browsers.
			if(this.historyStack.length == 0 && this.initialState.urlHash == hash){
				this.initialState = this._createState(url, args, hash);
				return;
			}else if(this.historyStack.length > 0 && this.historyStack[this.historyStack.length - 1].urlHash == hash){
				this.historyStack[this.historyStack.length - 1] = this._createState(url, args, hash);
				return;
			}

			this.changingUrl = true;
			setTimeout("window.location.href = '"+hash+"'; dojo.undo.browser.changingUrl = false;", 1);
			this.bookmarkAnchor.href = hash;
			
			if(dojo.render.html.ie){
				url = this._loadIframeHistory();

				var oldCB = args["back"]||args["backButton"]||args["handle"];

				//The function takes handleName as a parameter, in case the
				//callback we are overriding was "handle". In that case,
				//we will need to pass the handle name to handle.
				var tcb = function(handleName){
					if(window.location.hash != ""){
						setTimeout("window.location.href = '"+hash+"';", 1);
					}
					//Use apply to set "this" to args, and to try to avoid memory leaks.
					oldCB.apply(this, [handleName]);
				}
		
				//Set interceptor function in the right place.
				if(args["back"]){
					args.back = tcb;
				}else if(args["backButton"]){
					args.backButton = tcb;
				}else if(args["handle"]){
					args.handle = tcb;
				}
		
				var oldFW = args["forward"]||args["forwardButton"]||args["handle"];
		
				//The function takes handleName as a parameter, in case the
				//callback we are overriding was "handle". In that case,
				//we will need to pass the handle name to handle.
				var tfw = function(handleName){
					if(window.location.hash != ""){
						window.location.href = hash;
					}
					if(oldFW){ // we might not actually have one
						//Use apply to set "this" to args, and to try to avoid memory leaks.
						oldFW.apply(this, [handleName]);
					}
				}

				//Set interceptor function in the right place.
				if(args["forward"]){
					args.forward = tfw;
				}else if(args["forwardButton"]){
					args.forwardButton = tfw;
				}else if(args["handle"]){
					args.handle = tfw;
				}

			}else if(dojo.render.html.moz){
				// start the timer
				if(!this.locationTimer){
					this.locationTimer = setInterval("dojo.undo.browser.checkLocation();", 200);
				}
			}
		}else{
			url = this._loadIframeHistory();
		}

		this.historyStack.push(this._createState(url, args, hash));
	},

	checkLocation: function(){
		if (!this.changingUrl){
			var hsl = this.historyStack.length;

			if((window.location.hash == this.initialHash||window.location.href == this.initialHref)&&(hsl == 1)){
				// FIXME: could this ever be a forward button?
				// we can't clear it because we still need to check for forwards. Ugg.
				// clearInterval(this.locationTimer);
				this.handleBackButton();
				return;
			}
			
			// first check to see if we could have gone forward. We always halt on
			// a no-hash item.
			if(this.forwardStack.length > 0){
				if(this.forwardStack[this.forwardStack.length-1].urlHash == window.location.hash){
					this.handleForwardButton();
					return;
				}
			}
	
			// ok, that didn't work, try someplace back in the history stack
			if((hsl >= 2)&&(this.historyStack[hsl-2])){
				if(this.historyStack[hsl-2].urlHash==window.location.hash){
					this.handleBackButton();
					return;
				}
			}
		}
	},

	iframeLoaded: function(evt, ifrLoc){
		if(!dojo.render.html.opera){
			var query = this._getUrlQuery(ifrLoc.href);
			if(query == null){ 
				// alert("iframeLoaded");
				// we hit the end of the history, so we should go back
				if(this.historyStack.length == 1){
					this.handleBackButton();
				}
				return;
			}
			if(this.moveForward){
				// we were expecting it, so it's not either a forward or backward movement
				this.moveForward = false;
				return;
			}
	
			//Check the back stack first, since it is more likely.
			//Note that only one step back or forward is supported.
			if(this.historyStack.length >= 2 && query == this._getUrlQuery(this.historyStack[this.historyStack.length-2].url)){
				this.handleBackButton();
			}
			else if(this.forwardStack.length > 0 && query == this._getUrlQuery(this.forwardStack[this.forwardStack.length-1].url)){
				this.handleForwardButton();
			}
		}
	},

	handleBackButton: function(){
		//The "current" page is always at the top of the history stack.
		var current = this.historyStack.pop();
		if(!current){ return; }
		var last = this.historyStack[this.historyStack.length-1];
		if(!last && this.historyStack.length == 0){
			last = this.initialState;
		}
		if (last){
			if(last.kwArgs["back"]){
				last.kwArgs["back"]();
			}else if(last.kwArgs["backButton"]){
				last.kwArgs["backButton"]();
			}else if(last.kwArgs["handle"]){
				last.kwArgs.handle("back");
			}
		}
		this.forwardStack.push(current);
	},

	handleForwardButton: function(){
		var last = this.forwardStack.pop();
		if(!last){ return; }
		if(last.kwArgs["forward"]){
			last.kwArgs.forward();
		}else if(last.kwArgs["forwardButton"]){
			last.kwArgs.forwardButton();
		}else if(last.kwArgs["handle"]){
			last.kwArgs.handle("forward");
		}
		this.historyStack.push(last);
	},

	_createState: function(url, args, hash){
		return {"url": url, "kwArgs": args, "urlHash": hash};	
	},

	_getUrlQuery: function(url){
		var segments = url.split("?");
		if (segments.length < 2){
			return null;
		}
		else{
			return segments[1];
		}
	},
	
	_loadIframeHistory: function(){
		var url = dojo.hostenv.getBaseScriptUri()+"iframe_history.html?"+(new Date()).getTime();
		this.moveForward = true;
		dojo.io.setIFrameSrc(this.historyIframe, url, false);	
		return url;
	}
}

dojo.provide("dojo.io.BrowserIO");


dojo.io.checkChildrenForFile = function(node){
	var hasFile = false;
	var inputs = node.getElementsByTagName("input");
	dojo.lang.forEach(inputs, function(input){
		if(hasFile){ return; }
		if(input.getAttribute("type")=="file"){
			hasFile = true;
		}
	});
	return hasFile;
}

dojo.io.formHasFile = function(formNode){
	return dojo.io.checkChildrenForFile(formNode);
}

dojo.io.updateNode = function(node, urlOrArgs){
	node = dojo.byId(node);
	var args = urlOrArgs;
	if(dojo.lang.isString(urlOrArgs)){
		args = { url: urlOrArgs };
	}
	args.mimetype = "text/html";
	args.load = function(t, d, e){
		while(node.firstChild){
			if(dojo["event"]){
				try{
					dojo.event.browser.clean(node.firstChild);
				}catch(e){}
			}
			node.removeChild(node.firstChild);
		}
		node.innerHTML = d;
	};
	dojo.io.bind(args);
}

dojo.io.formFilter = function(node) {
	var type = (node.type||"").toLowerCase();
	return !node.disabled && node.name
		&& !dojo.lang.inArray(["file", "submit", "image", "reset", "button"], type);
}

// TODO: Move to htmlUtils
dojo.io.encodeForm = function(formNode, encoding, formFilter){
	if((!formNode)||(!formNode.tagName)||(!formNode.tagName.toLowerCase() == "form")){
		dojo.raise("Attempted to encode a non-form element.");
	}
	if(!formFilter) { formFilter = dojo.io.formFilter; }
	var enc = /utf/i.test(encoding||"") ? encodeURIComponent : dojo.string.encodeAscii;
	var values = [];

	for(var i = 0; i < formNode.elements.length; i++){
		var elm = formNode.elements[i];
		if(!elm || elm.tagName.toLowerCase() == "fieldset" || !formFilter(elm)) { continue; }
		var name = enc(elm.name);
		var type = elm.type.toLowerCase();

		if(type == "select-multiple"){
			for(var j = 0; j < elm.options.length; j++){
				if(elm.options[j].selected) {
					values.push(name + "=" + enc(elm.options[j].value));
				}
			}
		}else if(dojo.lang.inArray(["radio", "checkbox"], type)){
			if(elm.checked){
				values.push(name + "=" + enc(elm.value));
			}
		}else{
			values.push(name + "=" + enc(elm.value));
		}
	}

	// now collect input type="image", which doesn't show up in the elements array
	var inputs = formNode.getElementsByTagName("input");
	for(var i = 0; i < inputs.length; i++) {
		var input = inputs[i];
		if(input.type.toLowerCase() == "image" && input.form == formNode
			&& formFilter(input)) {
			var name = enc(input.name);
			values.push(name + "=" + enc(input.value));
			values.push(name + ".x=0");
			values.push(name + ".y=0");
		}
	}
	return values.join("&") + "&";
}

dojo.io.FormBind = function(args) {
	this.bindArgs = {};

	if(args && args.formNode) {
		this.init(args);
	} else if(args) {
		this.init({formNode: args});
	}
}
dojo.lang.extend(dojo.io.FormBind, {
	form: null,

	bindArgs: null,

	clickedButton: null,

	init: function(args) {
		var form = dojo.byId(args.formNode);

		if(!form || !form.tagName || form.tagName.toLowerCase() != "form") {
			throw new Error("FormBind: Couldn't apply, invalid form");
		} else if(this.form == form) {
			return;
		} else if(this.form) {
			throw new Error("FormBind: Already applied to a form");
		}

		dojo.lang.mixin(this.bindArgs, args);
		this.form = form;

		this.connect(form, "onsubmit", "submit");

		for(var i = 0; i < form.elements.length; i++) {
			var node = form.elements[i];
			if(node && node.type && dojo.lang.inArray(["submit", "button"], node.type.toLowerCase())) {
				this.connect(node, "onclick", "click");
			}
		}

		var inputs = form.getElementsByTagName("input");
		for(var i = 0; i < inputs.length; i++) {
			var input = inputs[i];
			if(input.type.toLowerCase() == "image" && input.form == form) {
				this.connect(input, "onclick", "click");
			}
		}
	},

	onSubmit: function(form) {
		return true;
	},

	submit: function(e) {
		e.preventDefault();
		if(this.onSubmit(this.form)) {
			dojo.io.bind(dojo.lang.mixin(this.bindArgs, {
				formFilter: dojo.lang.hitch(this, "formFilter")
			}));
		}
	},

	click: function(e) {
		var node = e.currentTarget;
		if(node.disabled) { return; }
		this.clickedButton = node;
	},

	formFilter: function(node) {
		var type = (node.type||"").toLowerCase();
		var accept = false;
		if(node.disabled || !node.name) {
			accept = false;
		} else if(dojo.lang.inArray(["submit", "button", "image"], type)) {
			if(!this.clickedButton) { this.clickedButton = node; }
			accept = node == this.clickedButton;
		} else {
			accept = !dojo.lang.inArray(["file", "submit", "reset", "button"], type);
		}
		return accept;
	},

	// in case you don't have dojo.event.* pulled in
	connect: function(srcObj, srcFcn, targetFcn) {
		if(dojo.evalObjPath("dojo.event.connect")) {
			dojo.event.connect(srcObj, srcFcn, this, targetFcn);
		} else {
			var fcn = dojo.lang.hitch(this, targetFcn);
			srcObj[srcFcn] = function(e) {
				if(!e) { e = window.event; }
				if(!e.currentTarget) { e.currentTarget = e.srcElement; }
				if(!e.preventDefault) { e.preventDefault = function() { window.event.returnValue = false; } }
				fcn(e);
			}
		}
	}
});

dojo.io.XMLHTTPTransport = new function(){
	var _this = this;

	var _cache = {}; // FIXME: make this public? do we even need to?
	this.useCache = false; // if this is true, we'll cache unless kwArgs.useCache = false
	this.preventCache = false; // if this is true, we'll always force GET requests to cache

	// FIXME: Should this even be a function? or do we just hard code it in the next 2 functions?
	function getCacheKey(url, query, method) {
		return url + "|" + query + "|" + method.toLowerCase();
	}

	function addToCache(url, query, method, http) {
		_cache[getCacheKey(url, query, method)] = http;
	}

	function getFromCache(url, query, method) {
		return _cache[getCacheKey(url, query, method)];
	}

	this.clearCache = function() {
		_cache = {};
	}

	// moved successful load stuff here
	function doLoad(kwArgs, http, url, query, useCache) {
		if(	((http.status>=200)&&(http.status<300))|| 	// allow any 2XX response code
			(http.status==304)|| 						// get it out of the cache
			(location.protocol=="file:" && (http.status==0 || http.status==undefined))||
			(location.protocol=="chrome:" && (http.status==0 || http.status==undefined))
		){
			var ret;
			if(kwArgs.method.toLowerCase() == "head"){
				var headers = http.getAllResponseHeaders();
				ret = {};
				ret.toString = function(){ return headers; }
				var values = headers.split(/[\r\n]+/g);
				for(var i = 0; i < values.length; i++) {
					var pair = values[i].match(/^([^:]+)\s*:\s*(.+)$/i);
					if(pair) {
						ret[pair[1]] = pair[2];
					}
				}
			}else if(kwArgs.mimetype == "text/javascript"){
				try{
					ret = dj_eval(http.responseText);
				}catch(e){
					dojo.debug(e);
					dojo.debug(http.responseText);
					ret = null;
				}
			}else if(kwArgs.mimetype == "text/json" || kwArgs.mimetype == "application/json"){
				try{
					ret = dj_eval("("+http.responseText+")");
				}catch(e){
					dojo.debug(e);
					dojo.debug(http.responseText);
					ret = false;
				}
			}else if((kwArgs.mimetype == "application/xml")||
						(kwArgs.mimetype == "text/xml")){
				ret = http.responseXML;
				if(!ret || typeof ret == "string" || !http.getResponseHeader("Content-Type")) {
					ret = dojo.dom.createDocumentFromText(http.responseText);
				}
			}else{
				ret = http.responseText;
			}

			if(useCache){ // only cache successful responses
				addToCache(url, query, kwArgs.method, http);
			}
			kwArgs[(typeof kwArgs.load == "function") ? "load" : "handle"]("load", ret, http, kwArgs);
		}else{
			var errObj = new dojo.io.Error("XMLHttpTransport Error: "+http.status+" "+http.statusText);
			kwArgs[(typeof kwArgs.error == "function") ? "error" : "handle"]("error", errObj, http, kwArgs);
		}
	}

	// set headers (note: Content-Type will get overriden if kwArgs.contentType is set)
	function setHeaders(http, kwArgs){
		if(kwArgs["headers"]) {
			for(var header in kwArgs["headers"]) {
				if(header.toLowerCase() == "content-type" && !kwArgs["contentType"]) {
					kwArgs["contentType"] = kwArgs["headers"][header];
				} else {
					http.setRequestHeader(header, kwArgs["headers"][header]);
				}
			}
		}
	}

	this.inFlight = [];
	this.inFlightTimer = null;

	this.startWatchingInFlight = function(){
		if(!this.inFlightTimer){
			// setInterval broken in mozilla x86_64 in some circumstances, see
			// https://bugzilla.mozilla.org/show_bug.cgi?id=344439
			// using setTimeout instead
			this.inFlightTimer = setTimeout("dojo.io.XMLHTTPTransport.watchInFlight();", 10);
		}
	}

	this.watchInFlight = function(){
		var now = null;
		// make sure sync calls stay thread safe, if this callback is called during a sync call
		// and this results in another sync call before the first sync call ends the browser hangs
		if(!dojo.hostenv._blockAsync && !_this._blockAsync){
			for(var x=this.inFlight.length-1; x>=0; x--){
				try{
					var tif = this.inFlight[x];
					if(!tif || tif.http._aborted || !tif.http.readyState){
						this.inFlight.splice(x, 1); continue; 
					}
					if(4==tif.http.readyState){
						// remove it so we can clean refs
						this.inFlight.splice(x, 1);
						doLoad(tif.req, tif.http, tif.url, tif.query, tif.useCache);
					}else if (tif.startTime){
						//See if this is a timeout case.
						if(!now){
							now = (new Date()).getTime();
						}
						if(tif.startTime + (tif.req.timeoutSeconds * 1000) < now){
							//Stop the request.
							if(typeof tif.http.abort == "function"){
								tif.http.abort();
							}
		
							// remove it so we can clean refs
							this.inFlight.splice(x, 1);
							tif.req[(typeof tif.req.timeout == "function") ? "timeout" : "handle"]("timeout", null, tif.http, tif.req);
						}
					}
				}catch(e){
					try{
						var errObj = new dojo.io.Error("XMLHttpTransport.watchInFlight Error: " + e);
						tif.req[(typeof tif.req.error == "function") ? "error" : "handle"]("error", errObj, tif.http, tif.req);
					}catch(e2){
						dojo.debug("XMLHttpTransport error callback failed: " + e2);
					}
				}
			}
		}

		clearTimeout(this.inFlightTimer);
		if(this.inFlight.length == 0){
			this.inFlightTimer = null;
			return;
		}
		this.inFlightTimer = setTimeout("dojo.io.XMLHTTPTransport.watchInFlight();", 10);
	}

	var hasXmlHttp = dojo.hostenv.getXmlhttpObject() ? true : false;
	this.canHandle = function(kwArgs){
		// canHandle just tells dojo.io.bind() if this is a good transport to
		// use for the particular type of request.

		// FIXME: we need to determine when form values need to be
		// multi-part mime encoded and avoid using this transport for those
		// requests.
		return hasXmlHttp
			&& dojo.lang.inArray(["text/plain", "text/html", "application/xml", "text/xml", "text/javascript", "text/json", "application/json"], (kwArgs["mimetype"].toLowerCase()||""))
			&& !( kwArgs["formNode"] && dojo.io.formHasFile(kwArgs["formNode"]) );
	}

	this.multipartBoundary = "45309FFF-BD65-4d50-99C9-36986896A96F";	// unique guid as a boundary value for multipart posts

	this.bind = function(kwArgs){
		if(!kwArgs["url"]){
			// are we performing a history action?
			if( !kwArgs["formNode"]
				&& (kwArgs["backButton"] || kwArgs["back"] || kwArgs["changeUrl"] || kwArgs["watchForURL"])
				&& (!djConfig.preventBackButtonFix)) {
        dojo.deprecated("Using dojo.io.XMLHTTPTransport.bind() to add to browser history without doing an IO request",
        				"Use dojo.undo.browser.addToHistory() instead.", "0.4");
				dojo.undo.browser.addToHistory(kwArgs);
				return true;
			}
		}

		// build this first for cache purposes
		var url = kwArgs.url;
		var query = "";
		if(kwArgs["formNode"]){
			var ta = kwArgs.formNode.getAttribute("action");
			if((ta)&&(!kwArgs["url"])){ url = ta; }
			var tp = kwArgs.formNode.getAttribute("method");
			if((tp)&&(!kwArgs["method"])){ kwArgs.method = tp; }
			query += dojo.io.encodeForm(kwArgs.formNode, kwArgs.encoding, kwArgs["formFilter"]);
		}

		if(url.indexOf("#") > -1) {
			dojo.debug("Warning: dojo.io.bind: stripping hash values from url:", url);
			url = url.split("#")[0];
		}

		if(kwArgs["file"]){
			// force post for file transfer
			kwArgs.method = "post";
		}

		if(!kwArgs["method"]){
			kwArgs.method = "get";
		}

		// guess the multipart value
		if(kwArgs.method.toLowerCase() == "get"){
			// GET cannot use multipart
			kwArgs.multipart = false;
		}else{
			if(kwArgs["file"]){
				// enforce multipart when sending files
				kwArgs.multipart = true;
			}else if(!kwArgs["multipart"]){
				// default 
				kwArgs.multipart = false;
			}
		}

		if(kwArgs["backButton"] || kwArgs["back"] || kwArgs["changeUrl"]){
			dojo.undo.browser.addToHistory(kwArgs);
		}

		var content = kwArgs["content"] || {};

		if(kwArgs.sendTransport) {
			content["dojo.transport"] = "xmlhttp";
		}

		do { // break-block
			if(kwArgs.postContent){
				query = kwArgs.postContent;
				break;
			}

			if(content) {
				query += dojo.io.argsFromMap(content, kwArgs.encoding);
			}
			
			if(kwArgs.method.toLowerCase() == "get" || !kwArgs.multipart){
				break;
			}

			var	t = [];
			if(query.length){
				var q = query.split("&");
				for(var i = 0; i < q.length; ++i){
					if(q[i].length){
						var p = q[i].split("=");
						t.push(	"--" + this.multipartBoundary,
								"Content-Disposition: form-data; name=\"" + p[0] + "\"", 
								"",
								p[1]);
					}
				}
			}

			if(kwArgs.file){
				if(dojo.lang.isArray(kwArgs.file)){
					for(var i = 0; i < kwArgs.file.length; ++i){
						var o = kwArgs.file[i];
						t.push(	"--" + this.multipartBoundary,
								"Content-Disposition: form-data; name=\"" + o.name + "\"; filename=\"" + ("fileName" in o ? o.fileName : o.name) + "\"",
								"Content-Type: " + ("contentType" in o ? o.contentType : "application/octet-stream"),
								"",
								o.content);
					}
				}else{
					var o = kwArgs.file;
					t.push(	"--" + this.multipartBoundary,
							"Content-Disposition: form-data; name=\"" + o.name + "\"; filename=\"" + ("fileName" in o ? o.fileName : o.name) + "\"",
							"Content-Type: " + ("contentType" in o ? o.contentType : "application/octet-stream"),
							"",
							o.content);
				}
			}

			if(t.length){
				t.push("--"+this.multipartBoundary+"--", "");
				query = t.join("\r\n");
			}
		}while(false);

		// kwArgs.Connection = "close";

		var async = kwArgs["sync"] ? false : true;

		var preventCache = kwArgs["preventCache"] ||
			(this.preventCache == true && kwArgs["preventCache"] != false);
		var useCache = kwArgs["useCache"] == true ||
			(this.useCache == true && kwArgs["useCache"] != false );

		// preventCache is browser-level (add query string junk), useCache
		// is for the local cache. If we say preventCache, then don't attempt
		// to look in the cache, but if useCache is true, we still want to cache
		// the response
		if(!preventCache && useCache){
			var cachedHttp = getFromCache(url, query, kwArgs.method);
			if(cachedHttp){
				doLoad(kwArgs, cachedHttp, url, query, false);
				return;
			}
		}

		// much of this is from getText, but reproduced here because we need
		// more flexibility
		var http = dojo.hostenv.getXmlhttpObject(kwArgs);	
		var received = false;

		// build a handler function that calls back to the handler obj
		if(async){
			var startTime = 
			// FIXME: setting up this callback handler leaks on IE!!!
			this.inFlight.push({
				"req":		kwArgs,
				"http":		http,
				"url":	 	url,
				"query":	query,
				"useCache":	useCache,
				"startTime": kwArgs.timeoutSeconds ? (new Date()).getTime() : 0
			});
			this.startWatchingInFlight();
		}else{
			// block async callbacks until sync is in, needed in khtml, others?
			_this._blockAsync = true;
		}

		if(kwArgs.method.toLowerCase() == "post"){
			// FIXME: need to hack in more flexible Content-Type setting here!
			if (!kwArgs.user) {
				http.open("POST", url, async);
			}else{
        http.open("POST", url, async, kwArgs.user, kwArgs.password);
			}
			setHeaders(http, kwArgs);
			http.setRequestHeader("Content-Type", kwArgs.multipart ? ("multipart/form-data; boundary=" + this.multipartBoundary) : 
				(kwArgs.contentType || "application/x-www-form-urlencoded"));
			try{
				http.send(query);
			}catch(e){
				if(typeof http.abort == "function"){
					http.abort();
				}
				doLoad(kwArgs, {status: 404}, url, query, useCache);
			}
		}else{
			var tmpUrl = url;
			if(query != "") {
				tmpUrl += (tmpUrl.indexOf("?") > -1 ? "&" : "?") + query;
			}
			if(preventCache) {
				tmpUrl += (dojo.string.endsWithAny(tmpUrl, "?", "&")
					? "" : (tmpUrl.indexOf("?") > -1 ? "&" : "?")) + "dojo.preventCache=" + new Date().valueOf();
			}
			if (!kwArgs.user) {
				http.open(kwArgs.method.toUpperCase(), tmpUrl, async);
			}else{
				http.open(kwArgs.method.toUpperCase(), tmpUrl, async, kwArgs.user, kwArgs.password);
			}
			setHeaders(http, kwArgs);
			try {
				http.send(null);
			}catch(e)	{
				if(typeof http.abort == "function"){
					http.abort();
				}
				doLoad(kwArgs, {status: 404}, url, query, useCache);
			}
		}

		if( !async ) {
			doLoad(kwArgs, http, url, query, useCache);
			_this._blockAsync = false;
		}

		kwArgs.abort = function(){
			try{// khtml doesent reset readyState on abort, need this workaround
				http._aborted = true; 
			}catch(e){/*squelsh*/}
			return http.abort();
		}

		return;
	}
	dojo.io.transports.addTransport("XMLHTTPTransport");
}

dojo.provide("dojo.io.cookie");

dojo.io.cookie.setCookie = function(name, value, days, path, domain, secure) {
	var expires = -1;
	if(typeof days == "number" && days >= 0) {
		var d = new Date();
		d.setTime(d.getTime()+(days*24*60*60*1000));
		expires = d.toGMTString();
	}
	value = escape(value);
	document.cookie = name + "=" + value + ";"
		+ (expires != -1 ? " expires=" + expires + ";" : "")
		+ (path ? "path=" + path : "")
		+ (domain ? "; domain=" + domain : "")
		+ (secure ? "; secure" : "");
}

dojo.io.cookie.set = dojo.io.cookie.setCookie;

dojo.io.cookie.getCookie = function(name) {
	// FIXME: Which cookie should we return?
	//        If there are cookies set for different sub domains in the current
	//        scope there could be more than one cookie with the same name.
	//        I think taking the last one in the list takes the one from the
	//        deepest subdomain, which is what we're doing here.
	var idx = document.cookie.lastIndexOf(name+'=');
	if(idx == -1) { return null; }
	var value = document.cookie.substring(idx+name.length+1);
	var end = value.indexOf(';');
	if(end == -1) { end = value.length; }
	value = value.substring(0, end);
	value = unescape(value);
	return value;
}

dojo.io.cookie.get = dojo.io.cookie.getCookie;

dojo.io.cookie.deleteCookie = function(name) {
	dojo.io.cookie.setCookie(name, "-", 0);
}

dojo.io.cookie.setObjectCookie = function(name, obj, days, path, domain, secure, clearCurrent) {
	if(arguments.length == 5) { // for backwards compat
		clearCurrent = domain;
		domain = null;
		secure = null;
	}
	var pairs = [], cookie, value = "";
	if(!clearCurrent) { cookie = dojo.io.cookie.getObjectCookie(name); }
	if(days >= 0) {
		if(!cookie) { cookie = {}; }
		for(var prop in obj) {
			if(prop == null) {
				delete cookie[prop];
			} else if(typeof obj[prop] == "string" || typeof obj[prop] == "number") {
				cookie[prop] = obj[prop];
			}
		}
		prop = null;
		for(var prop in cookie) {
			pairs.push(escape(prop) + "=" + escape(cookie[prop]));
		}
		value = pairs.join("&");
	}
	dojo.io.cookie.setCookie(name, value, days, path, domain, secure);
}

dojo.io.cookie.getObjectCookie = function(name) {
	var values = null, cookie = dojo.io.cookie.getCookie(name);
	if(cookie) {
		values = {};
		var pairs = cookie.split("&");
		for(var i = 0; i < pairs.length; i++) {
			var pair = pairs[i].split("=");
			var value = pair[1];
			if( isNaN(value) ) { value = unescape(pair[1]); }
			values[ unescape(pair[0]) ] = value;
		}
	}
	return values;
}

dojo.io.cookie.isSupported = function() {
	if(typeof navigator.cookieEnabled != "boolean") {
		dojo.io.cookie.setCookie("__TestingYourBrowserForCookieSupport__",
			"CookiesAllowed", 90, null);
		var cookieVal = dojo.io.cookie.getCookie("__TestingYourBrowserForCookieSupport__");
		navigator.cookieEnabled = (cookieVal == "CookiesAllowed");
		if(navigator.cookieEnabled) {
			// FIXME: should we leave this around?
			this.deleteCookie("__TestingYourBrowserForCookieSupport__");
		}
	}
	return navigator.cookieEnabled;
}

// need to leave this in for backwards-compat from 0.1 for when it gets pulled in by dojo.io.*
if(!dojo.io.cookies) { dojo.io.cookies = dojo.io.cookie; }

dojo.provide("dojo.io.*");

dojo.provide("dojo.io");

dojo.deprecated("dojo.io", "replaced by dojo.io.*", "0.5");

dojo.provide("dojo.event.common");


// TODO: connection filter functions
//			these are functions that accept a method invocation (like around
//			advice) and return a boolean based on it. That value determines
//			whether or not the connection proceeds. It could "feel" like around
//			advice for those who know what it is (calling proceed() or not),
//			but I think presenting it as a "filter" and/or calling it with the
//			function args and not the MethodInvocation might make it more
//			palletable to "normal" users than around-advice currently is
// TODO: execution scope mangling
//			YUI's event facility by default executes listeners in the context
//			of the source object. This is very odd, but should probably be
//			supported as an option (both for the source and for the dest). It
//			can be thought of as a connection-specific hitch().
// TODO: more resiliency for 4+ arguments to connect()

dojo.event = new function(){
	this._canTimeout = dojo.lang.isFunction(dj_global["setTimeout"])||dojo.lang.isAlien(dj_global["setTimeout"]);

	// FIXME: where should we put this method (not here!)?
	function interpolateArgs(args, searchForNames){
		var dl = dojo.lang;
		var ao = {
			srcObj: dj_global,
			srcFunc: null,
			adviceObj: dj_global,
			adviceFunc: null,
			aroundObj: null,
			aroundFunc: null,
			adviceType: (args.length>2) ? args[0] : "after",
			precedence: "last",
			once: false,
			delay: null,
			rate: 0,
			adviceMsg: false
		};

		switch(args.length){
			case 0: return;
			case 1: return;
			case 2:
				ao.srcFunc = args[0];
				ao.adviceFunc = args[1];
				break;
			case 3:
				if((dl.isObject(args[0]))&&(dl.isString(args[1]))&&(dl.isString(args[2]))){
					ao.adviceType = "after";
					ao.srcObj = args[0];
					ao.srcFunc = args[1];
					ao.adviceFunc = args[2];
				}else if((dl.isString(args[1]))&&(dl.isString(args[2]))){
					ao.srcFunc = args[1];
					ao.adviceFunc = args[2];
				}else if((dl.isObject(args[0]))&&(dl.isString(args[1]))&&(dl.isFunction(args[2]))){
					ao.adviceType = "after";
					ao.srcObj = args[0];
					ao.srcFunc = args[1];
					var tmpName  = dl.nameAnonFunc(args[2], ao.adviceObj, searchForNames);
					ao.adviceFunc = tmpName;
				}else if((dl.isFunction(args[0]))&&(dl.isObject(args[1]))&&(dl.isString(args[2]))){
					ao.adviceType = "after";
					ao.srcObj = dj_global;
					var tmpName  = dl.nameAnonFunc(args[0], ao.srcObj, searchForNames);
					ao.srcFunc = tmpName;
					ao.adviceObj = args[1];
					ao.adviceFunc = args[2];
				}
				break;
			case 4:
				if((dl.isObject(args[0]))&&(dl.isObject(args[2]))){
					// we can assume that we've got an old-style "connect" from
					// the sigslot school of event attachment. We therefore
					// assume after-advice.
					ao.adviceType = "after";
					ao.srcObj = args[0];
					ao.srcFunc = args[1];
					ao.adviceObj = args[2];
					ao.adviceFunc = args[3];
				}else if((dl.isString(args[0]))&&(dl.isString(args[1]))&&(dl.isObject(args[2]))){
					ao.adviceType = args[0];
					ao.srcObj = dj_global;
					ao.srcFunc = args[1];
					ao.adviceObj = args[2];
					ao.adviceFunc = args[3];
				}else if((dl.isString(args[0]))&&(dl.isFunction(args[1]))&&(dl.isObject(args[2]))){
					ao.adviceType = args[0];
					ao.srcObj = dj_global;
					var tmpName  = dl.nameAnonFunc(args[1], dj_global, searchForNames);
					ao.srcFunc = tmpName;
					ao.adviceObj = args[2];
					ao.adviceFunc = args[3];
				}else if((dl.isString(args[0]))&&(dl.isObject(args[1]))&&(dl.isString(args[2]))&&(dl.isFunction(args[3]))){
					ao.srcObj = args[1];
					ao.srcFunc = args[2];
					var tmpName  = dl.nameAnonFunc(args[3], dj_global, searchForNames);
					ao.adviceObj = dj_global;
					ao.adviceFunc = tmpName;
				}else if(dl.isObject(args[1])){
					ao.srcObj = args[1];
					ao.srcFunc = args[2];
					ao.adviceObj = dj_global;
					ao.adviceFunc = args[3];
				}else if(dl.isObject(args[2])){
					ao.srcObj = dj_global;
					ao.srcFunc = args[1];
					ao.adviceObj = args[2];
					ao.adviceFunc = args[3];
				}else{
					ao.srcObj = ao.adviceObj = ao.aroundObj = dj_global;
					ao.srcFunc = args[1];
					ao.adviceFunc = args[2];
					ao.aroundFunc = args[3];
				}
				break;
			case 6:
				ao.srcObj = args[1];
				ao.srcFunc = args[2];
				ao.adviceObj = args[3]
				ao.adviceFunc = args[4];
				ao.aroundFunc = args[5];
				ao.aroundObj = dj_global;
				break;
			default:
				ao.srcObj = args[1];
				ao.srcFunc = args[2];
				ao.adviceObj = args[3]
				ao.adviceFunc = args[4];
				ao.aroundObj = args[5];
				ao.aroundFunc = args[6];
				ao.once = args[7];
				ao.delay = args[8];
				ao.rate = args[9];
				ao.adviceMsg = args[10];
				break;
		}

		if(dl.isFunction(ao.aroundFunc)){
			var tmpName  = dl.nameAnonFunc(ao.aroundFunc, ao.aroundObj, searchForNames);
			ao.aroundFunc = tmpName;
		}

		if(dl.isFunction(ao.srcFunc)){
			ao.srcFunc = dl.getNameInObj(ao.srcObj, ao.srcFunc);
		}

		if(dl.isFunction(ao.adviceFunc)){
			ao.adviceFunc = dl.getNameInObj(ao.adviceObj, ao.adviceFunc);
		}

		if((ao.aroundObj)&&(dl.isFunction(ao.aroundFunc))){
			ao.aroundFunc = dl.getNameInObj(ao.aroundObj, ao.aroundFunc);
		}

		if(!ao.srcObj){
			dojo.raise("bad srcObj for srcFunc: "+ao.srcFunc);
		}
		if(!ao.adviceObj){
			dojo.raise("bad adviceObj for adviceFunc: "+ao.adviceFunc);
		}
		
		if(!ao.adviceFunc){
			dojo.debug("bad adviceFunc for srcFunc: "+ao.srcFunc);
			dojo.debugShallow(ao);
		} 
		
		return ao;
	}

	this.connect = function(/*...*/){
		// summary:
		//		dojo.event.connect is the glue that holds most Dojo-based
		//		applications together. Most combinations of arguments are
		//		supported, with the connect() method attempting to disambiguate
		//		the implied types of positional parameters. The following will
		//		all work:
		//			dojo.event.connect("globalFunctionName1", "globalFunctionName2");
		//			dojo.event.connect(functionReference1, functionReference2);
		//			dojo.event.connect("globalFunctionName1", functionReference2);
		//			dojo.event.connect(functionReference1, "globalFunctionName2");
		//			dojo.event.connect(scope1, "functionName1", "globalFunctionName2");
		//			dojo.event.connect("globalFunctionName1", scope2, "functionName2");
		//			dojo.event.connect(scope1, "functionName1", scope2, "functionName2");
		//			dojo.event.connect("after", scope1, "functionName1", scope2, "functionName2");
		//			dojo.event.connect("before", scope1, "functionName1", scope2, "functionName2");
		//			dojo.event.connect("around", 	scope1, "functionName1", 
		//											scope2, "functionName2",
		//											aroundFunctionReference);
		//			dojo.event.connect("around", 	scope1, "functionName1", 
		//											scope2, "functionName2",
		//											scope3, "aroundFunctionName");
		//			dojo.event.connect("before-around", 	scope1, "functionName1", 
		//													scope2, "functionName2",
		//													aroundFunctionReference);
		//			dojo.event.connect("after-around", 		scope1, "functionName1", 
		//													scope2, "functionName2",
		//													aroundFunctionReference);
		//			dojo.event.connect("after-around", 		scope1, "functionName1", 
		//													scope2, "functionName2",
		//													scope3, "aroundFunctionName");
		//			dojo.event.connect("around", 	scope1, "functionName1", 
		//											scope2, "functionName2",
		//											scope3, "aroundFunctionName", true, 30);
		//			dojo.event.connect("around", 	scope1, "functionName1", 
		//											scope2, "functionName2",
		//											scope3, "aroundFunctionName", null, null, 10);
		// adviceType: 
		//		Optional. String. One of "before", "after", "around",
		//		"before-around", or "after-around". FIXME
		// srcObj:
		//		the scope in which to locate/execute the named srcFunc. Along
		//		with srcFunc, this creates a way to dereference the function to
		//		call. So if the function in question is "foo.bar", the
		//		srcObj/srcFunc pair would be foo and "bar", where "bar" is a
		//		string and foo is an object reference.
		// srcFunc:
		//		the name of the function to connect to. When it is executed,
		//		the listener being registered with this call will be called.
		//		The adviceType defines the call order between the source and
		//		the target functions.
		// adviceObj:
		//		the scope in which to locate/execute the named adviceFunc.
		// adviceFunc:
		//		the name of the function being conected to srcObj.srcFunc
		// aroundObj:
		//		the scope in which to locate/execute the named aroundFunc.
		// aroundFunc:
		//		the name of, or a reference to, the function that will be used
		//		to mediate the advice call. Around advice requires a special
		//		unary function that will be passed a "MethodInvocation" object.
		//		These objects have several important properties, namely:
		//			- args
		//				a mutable array of arguments to be passed into the
		//				wrapped function
		//			- proceed
		//				a function that "continues" the invocation. The result
		//				of this function is the return of the wrapped function.
		//				You can then manipulate this return before passing it
		//				back out (or take further action based on it).
		// once:
		//		boolean that determines whether or not this connect() will
		//		create a new connection if an identical connect() has already
		//		been made. Defaults to "false".
		// delay:
		//		an optional delay (in ms), as an integer, for dispatch of a
		//		listener after the source has been fired.
		// rate:
		//		an optional rate throttling parameter (integer, in ms). When
		//		specified, this particular connection will not fire more than
		//		once in the interval specified by the rate
		// adviceMsg:
		//		boolean. Should the listener have all the parameters passed in
		//		as a single argument?

		/*
				ao.adviceType = args[0];
				ao.srcObj = args[1];
				ao.srcFunc = args[2];
				ao.adviceObj = args[3]
				ao.adviceFunc = args[4];
				ao.aroundObj = args[5];
				ao.aroundFunc = args[6];
				ao.once = args[7];
				ao.delay = args[8];
				ao.rate = args[9];
				ao.adviceMsg = args[10];
		*/
		if(arguments.length == 1){
			var ao = arguments[0];
		}else{
			var ao = interpolateArgs(arguments, true);
		}
		if(dojo.lang.isString(ao.srcFunc) && (ao.srcFunc.toLowerCase() == "onkey") ){
			if(dojo.render.html.ie){
				ao.srcFunc = "onkeydown";
				this.connect(ao);
			}
			ao.srcFunc = "onkeypress";
		}


		if(dojo.lang.isArray(ao.srcObj) && ao.srcObj!=""){
			var tmpAO = {};
			for(var x in ao){
				tmpAO[x] = ao[x];
			}
			var mjps = [];
			dojo.lang.forEach(ao.srcObj, function(src){
				if((dojo.render.html.capable)&&(dojo.lang.isString(src))){
					src = dojo.byId(src);
					// dojo.debug(src);
				}
				tmpAO.srcObj = src;
				// dojo.debug(tmpAO.srcObj, tmpAO.srcFunc);
				// dojo.debug(tmpAO.adviceObj, tmpAO.adviceFunc);
				mjps.push(dojo.event.connect.call(dojo.event, tmpAO));
			});
			return mjps;
		}

		// FIXME: just doing a "getForMethod()" seems to be enough to put this into infinite recursion!!
		var mjp = dojo.event.MethodJoinPoint.getForMethod(ao.srcObj, ao.srcFunc);
		if(ao.adviceFunc){
			var mjp2 = dojo.event.MethodJoinPoint.getForMethod(ao.adviceObj, ao.adviceFunc);
		}

		mjp.kwAddAdvice(ao);

		// advanced users might want to fsck w/ the join point manually
		return mjp; // a MethodJoinPoint object
	}

	this.log = function(/*object or funcName*/ a1, /*funcName*/ a2){
		// summary:
		//		a function that will wrap and log all calls to the specified
		//		a1.a2() function. If only a1 is passed, it'll be used as a
		//		function or function name on the global context. Logging will
		//		be sent to dojo.debug
		// a1:
		//		if a2 is passed, this should be an object. If not, it can be a
		//		function or function name.
		// a2:
		//		a function name
		var kwArgs;
		if((arguments.length == 1)&&(typeof a1 == "object")){
			kwArgs = a1;
		}else{
			kwArgs = {
				srcObj: a1,
				srcFunc: a2
			};
		}
		kwArgs.adviceFunc = function(){
			var argsStr = [];
			for(var x=0; x<arguments.length; x++){
				argsStr.push(arguments[x]);
			}
			dojo.debug("("+kwArgs.srcObj+")."+kwArgs.srcFunc, ":", argsStr.join(", "));
		}
		this.kwConnect(kwArgs);
	}

	this.connectBefore = function(){
		// summary:
		//	 	takes the same parameters as dojo.event.connect(), except that
		//	 	the advice type will always be "before"
		var args = ["before"];
		for(var i = 0; i < arguments.length; i++){ args.push(arguments[i]); }
		return this.connect.apply(this, args); // a MethodJoinPoint object
	}

	this.connectAround = function(){
		// summary:
		//	 	takes the same parameters as dojo.event.connect(), except that
		//	 	the advice type will always be "around"
		var args = ["around"];
		for(var i = 0; i < arguments.length; i++){ args.push(arguments[i]); }
		return this.connect.apply(this, args); // a MethodJoinPoint object
	}

	this.connectOnce = function(){
		// summary:
		//	 	takes the same parameters as dojo.event.connect(), except that
		//	 	the "once" flag will always be set to "true"
		var ao = interpolateArgs(arguments, true);
		ao.once = true;
		return this.connect(ao); // a MethodJoinPoint object
	}

	this._kwConnectImpl = function(kwArgs, disconnect){
		var fn = (disconnect) ? "disconnect" : "connect";
		if(typeof kwArgs["srcFunc"] == "function"){
			kwArgs.srcObj = kwArgs["srcObj"]||dj_global;
			var tmpName  = dojo.lang.nameAnonFunc(kwArgs.srcFunc, kwArgs.srcObj, true);
			kwArgs.srcFunc = tmpName;
		}
		if(typeof kwArgs["adviceFunc"] == "function"){
			kwArgs.adviceObj = kwArgs["adviceObj"]||dj_global;
			var tmpName  = dojo.lang.nameAnonFunc(kwArgs.adviceFunc, kwArgs.adviceObj, true);
			kwArgs.adviceFunc = tmpName;
		}
		kwArgs.srcObj = kwArgs["srcObj"]||dj_global;
		kwArgs.adviceObj = kwArgs["adviceObj"]||kwArgs["targetObj"]||dj_global;
		kwArgs.adviceFunc = kwArgs["adviceFunc"]||kwArgs["targetFunc"];
		// pass kwargs to avoid unrolling/repacking
		return dojo.event[fn](kwArgs);
	}

	this.kwConnect = function(/*Object*/ kwArgs){
		// summary:
		//		A version of dojo.event.connect() that takes a map of named
		//		parameters instead of the positional parameters that
		//		dojo.event.connect() uses. For many advanced connection types,
		//		this can be a much more readable (and potentially faster)
		//		alternative.
		// kwArgs:
		// 		An object that can have the following properties:
		//			- adviceType
		//			- srcObj
		//			- srcFunc
		//			- adviceObj
		//			- adviceFunc 
		//			- aroundObj
		//			- aroundFunc
		//			- once
		//			- delay
		//			- rate
		//			- adviceMsg
		//		As with connect, only srcFunc and adviceFunc are generally
		//		required

		return this._kwConnectImpl(kwArgs, false); // a MethodJoinPoint object

	}

	this.disconnect = function(){
		// summary:
		//		Takes the same parameters as dojo.event.connect() but destroys
		//		an existing connection instead of building a new one. For
		//		multiple identical connections, multiple disconnect() calls
		//		will unroll one each time it's called.
		if(arguments.length == 1){
			var ao = arguments[0];
		}else{
			var ao = interpolateArgs(arguments, true);
		}
		if(!ao.adviceFunc){ return; } // nothing to disconnect
		if(dojo.lang.isString(ao.srcFunc) && (ao.srcFunc.toLowerCase() == "onkey") ){
			if(dojo.render.html.ie){
				ao.srcFunc = "onkeydown";
				this.disconnect(ao);
			}
			ao.srcFunc = "onkeypress";
		}
		var mjp = dojo.event.MethodJoinPoint.getForMethod(ao.srcObj, ao.srcFunc);
		return mjp.removeAdvice(ao.adviceObj, ao.adviceFunc, ao.adviceType, ao.once); // a MethodJoinPoint object
	}

	this.kwDisconnect = function(kwArgs){
		// summary:
		//		Takes the same parameters as dojo.event.kwConnect() but
		//		destroys an existing connection instead of building a new one.
		return this._kwConnectImpl(kwArgs, true);
	}
}

// exactly one of these is created whenever a method with a joint point is run,
// if there is at least one 'around' advice.
dojo.event.MethodInvocation = function(/*dojo.event.MethodJoinPoint*/join_point, /*Object*/obj, /*Array*/args){
	// summary:
	//		a class the models the call into a function. This is used under the
	//		covers for all method invocations on both ends of a
	//		connect()-wrapped function dispatch. This allows us to "pickle"
	//		calls, such as in the case of around advice.
	// join_point:
	//		a dojo.event.MethodJoinPoint object that represents a connection
	// obj:
	//		the scope the call will execute in
	// args:
	//		an array of parameters that will get passed to the callee
	this.jp_ = join_point;
	this.object = obj;
	this.args = [];
	// make sure we don't lock into a mutable object which can change under us.
	// It's ok if the individual items change, though.
	for(var x=0; x<args.length; x++){
		this.args[x] = args[x];
	}
	// the index of the 'around' that is currently being executed.
	this.around_index = -1;
}

dojo.event.MethodInvocation.prototype.proceed = function(){
	// summary:
	//		proceed with the method call that's represented by this invocation
	//		object
	this.around_index++;
	if(this.around_index >= this.jp_.around.length){
		return this.jp_.object[this.jp_.methodname].apply(this.jp_.object, this.args);
		// return this.jp_.run_before_after(this.object, this.args);
	}else{
		var ti = this.jp_.around[this.around_index];
		var mobj = ti[0]||dj_global;
		var meth = ti[1];
		return mobj[meth].call(mobj, this);
	}
} 


dojo.event.MethodJoinPoint = function(/*Object*/obj, /*String*/funcName){
	this.object = obj||dj_global;
	this.methodname = funcName;
	this.methodfunc = this.object[funcName];
	this.squelch = false;
	// this.before = [];
	// this.after = [];
	// this.around = [];
}

dojo.event.MethodJoinPoint.getForMethod = function(/*Object*/obj, /*String*/funcName){
	// summary:
	//		"static" class function for returning a MethodJoinPoint from a
	//		scoped function. If one doesn't exist, one is created.
	// obj:
	//		the scope to search for the function in
	// funcName:
	//		the name of the function to return a MethodJoinPoint for
	if(!obj){ obj = dj_global; }
	if(!obj[funcName]){
		// supply a do-nothing method implementation
		obj[funcName] = function(){};
		if(!obj[funcName]){
			// e.g. cannot add to inbuilt objects in IE6
			dojo.raise("Cannot set do-nothing method on that object "+funcName);
		}
	}else if((!dojo.lang.isFunction(obj[funcName]))&&(!dojo.lang.isAlien(obj[funcName]))){
		// FIXME: should we throw an exception here instead?
		return null; 
	}
	// we hide our joinpoint instance in obj[funcName + '$joinpoint']
	var jpname = funcName + "$joinpoint";
	var jpfuncname = funcName + "$joinpoint$method";
	var joinpoint = obj[jpname];
	if(!joinpoint){
		var isNode = false;
		if(dojo.event["browser"]){
			if( (obj["attachEvent"])||
				(obj["nodeType"])||
				(obj["addEventListener"]) ){
				isNode = true;
				dojo.event.browser.addClobberNodeAttrs(obj, [jpname, jpfuncname, funcName]);
			}
		}
		var origArity = obj[funcName].length;
		obj[jpfuncname] = obj[funcName];
		// joinpoint = obj[jpname] = new dojo.event.MethodJoinPoint(obj, funcName);
		joinpoint = obj[jpname] = new dojo.event.MethodJoinPoint(obj, jpfuncname);
		obj[funcName] = function(){ 
			var args = [];

			if((isNode)&&(!arguments.length)){
				var evt = null;
				try{
					if(obj.ownerDocument){
						evt = obj.ownerDocument.parentWindow.event;
					}else if(obj.documentElement){
						evt = obj.documentElement.ownerDocument.parentWindow.event;
					}else if(obj.event){ //obj is a window
						evt = obj.event;
					}else{
						evt = window.event;
					}
				}catch(e){
					evt = window.event;
				}

				if(evt){
					args.push(dojo.event.browser.fixEvent(evt, this));
				}
			}else{
				for(var x=0; x<arguments.length; x++){
					if((x==0)&&(isNode)&&(dojo.event.browser.isEvent(arguments[x]))){
						args.push(dojo.event.browser.fixEvent(arguments[x], this));
					}else{
						args.push(arguments[x]);
					}
				}
			}
			// return joinpoint.run.apply(joinpoint, arguments); 
			return joinpoint.run.apply(joinpoint, args); 
		}
		obj[funcName].__preJoinArity = origArity;
	}
	return joinpoint; // dojo.event.MethodJoinPoint
}

dojo.lang.extend(dojo.event.MethodJoinPoint, {
	unintercept: function(){
		// summary: 
		//		destroy the connection to all listeners that may have been
		//		registered on this joinpoint
		this.object[this.methodname] = this.methodfunc;
		this.before = [];
		this.after = [];
		this.around = [];
	},

	disconnect: dojo.lang.forward("unintercept"),

	run: function(){
		// summary:
		//		execute the connection represented by this join point. The
		//		arguments passed to run() will be passed to the function and
		//		its listeners.
		var obj = this.object||dj_global;
		var args = arguments;

		// optimization. We only compute once the array version of the arguments
		// pseudo-arr in order to prevent building it each time advice is unrolled.
		var aargs = [];
		for(var x=0; x<args.length; x++){
			aargs[x] = args[x];
		}

		var unrollAdvice  = function(marr){ 
			if(!marr){
				dojo.debug("Null argument to unrollAdvice()");
				return;
			}
		  
			var callObj = marr[0]||dj_global;
			var callFunc = marr[1];
			
			if(!callObj[callFunc]){
				dojo.raise("function \"" + callFunc + "\" does not exist on \"" + callObj + "\"");
			}
			
			var aroundObj = marr[2]||dj_global;
			var aroundFunc = marr[3];
			var msg = marr[6];
			var undef;

			var to = {
				args: [],
				jp_: this,
				object: obj,
				proceed: function(){
					return callObj[callFunc].apply(callObj, to.args);
				}
			};
			to.args = aargs;

			var delay = parseInt(marr[4]);
			var hasDelay = ((!isNaN(delay))&&(marr[4]!==null)&&(typeof marr[4] != "undefined"));
			if(marr[5]){
				var rate = parseInt(marr[5]);
				var cur = new Date();
				var timerSet = false;
				if((marr["last"])&&((cur-marr.last)<=rate)){
					if(dojo.event._canTimeout){
						if(marr["delayTimer"]){
							clearTimeout(marr.delayTimer);
						}
						var tod = parseInt(rate*2); // is rate*2 naive?
						var mcpy = dojo.lang.shallowCopy(marr);
						marr.delayTimer = setTimeout(function(){
							// FIXME: on IE at least, event objects from the
							// browser can go out of scope. How (or should?) we
							// deal with it?
							mcpy[5] = 0;
							unrollAdvice(mcpy);
						}, tod);
					}
					return;
				}else{
					marr.last = cur;
				}
			}

			// FIXME: need to enforce rates for a connection here!

			if(aroundFunc){
				// NOTE: around advice can't delay since we might otherwise depend
				// on execution order!
				aroundObj[aroundFunc].call(aroundObj, to);
			}else{
				// var tmjp = dojo.event.MethodJoinPoint.getForMethod(obj, methname);
				if((hasDelay)&&((dojo.render.html)||(dojo.render.svg))){  // FIXME: the render checks are grotty!
					dj_global["setTimeout"](function(){
						if(msg){
							callObj[callFunc].call(callObj, to); 
						}else{
							callObj[callFunc].apply(callObj, args); 
						}
					}, delay);
				}else{ // many environments can't support delay!
					if(msg){
						callObj[callFunc].call(callObj, to); 
					}else{
						callObj[callFunc].apply(callObj, args); 
					}
				}
			}
		}

		var unRollSquelch = function(){
			if(this.squelch){
				try{
					return unrollAdvice.apply(this, arguments);
				}catch(e){ 
					dojo.debug(e);
				}
			}else{
				return unrollAdvice.apply(this, arguments);
			}
		}

		if((this["before"])&&(this.before.length>0)){
			// pass a cloned array, if this event disconnects this event forEach on this.before wont work
			dojo.lang.forEach(this.before.concat(new Array()), unRollSquelch);
		}

		var result;
		try{
			if((this["around"])&&(this.around.length>0)){
				var mi = new dojo.event.MethodInvocation(this, obj, args);
				result = mi.proceed();
			}else if(this.methodfunc){
				result = this.object[this.methodname].apply(this.object, args);
			}
		}catch(e){ if(!this.squelch){ dojo.raise(e); } }

		if((this["after"])&&(this.after.length>0)){
			// see comment on this.before above
			dojo.lang.forEach(this.after.concat(new Array()), unRollSquelch);
		}

		return (this.methodfunc) ? result : null;
	},

	getArr: function(/*String*/kind){
		// summary: return a list of listeners of the past "kind"
		// kind:
		//		can be one of: "before", "after", "around", "before-around", or
		//		"after-around"
		var type = "after";
		// FIXME: we should be able to do this through props or Array.in()
		if((typeof kind == "string")&&(kind.indexOf("before")!=-1)){
			type = "before";
		}else if(kind=="around"){
			type = "around";
		}
		if(!this[type]){ this[type] = []; }
		return this[type]; // Array
	},

	kwAddAdvice: function(/*Object*/args){
		// summary:
		//		adds advice to the joinpoint with arguments in a map
		// args:
		// 		An object that can have the following properties:
		//			- adviceType
		//			- adviceObj
		//			- adviceFunc 
		//			- aroundObj
		//			- aroundFunc
		//			- once
		//			- delay
		//			- rate
		//			- adviceMsg
		this.addAdvice(	args["adviceObj"], args["adviceFunc"], 
						args["aroundObj"], args["aroundFunc"], 
						args["adviceType"], args["precedence"], 
						args["once"], args["delay"], args["rate"], 
						args["adviceMsg"]);
	},

	addAdvice: function(	thisAdviceObj, thisAdvice, 
							thisAroundObj, thisAround, 
							adviceType, precedence, 
							once, delay, rate, asMessage){
		// summary:
		//		add advice to this joinpoint using positional parameters
		// thisAdviceObj:
		//		the scope in which to locate/execute the named adviceFunc.
		// thisAdviceFunc:
		//		the name of the function being conected
		// thisAroundObj:
		//		the scope in which to locate/execute the named aroundFunc.
		// thisAroundFunc:
		//		the name of the function that will be used to mediate the
		//		advice call.
		// adviceType: 
		//		Optional. String. One of "before", "after", "around",
		//		"before-around", or "after-around". FIXME
		// once:
		//		boolean that determines whether or not this advice will create
		//		a new connection if an identical advice set has already been
		//		provided. Defaults to "false".
		// delay:
		//		an optional delay (in ms), as an integer, for dispatch of a
		//		listener after the source has been fired.
		// rate:
		//		an optional rate throttling parameter (integer, in ms). When
		//		specified, this particular connection will not fire more than
		//		once in the interval specified by the rate
		// adviceMsg:
		//		boolean. Should the listener have all the parameters passed in
		//		as a single argument?
		var arr = this.getArr(adviceType);
		if(!arr){
			dojo.raise("bad this: " + this);
		}

		var ao = [thisAdviceObj, thisAdvice, thisAroundObj, thisAround, delay, rate, asMessage];
		
		if(once){
			if(this.hasAdvice(thisAdviceObj, thisAdvice, adviceType, arr) >= 0){
				return;
			}
		}

		if(precedence == "first"){
			arr.unshift(ao);
		}else{
			arr.push(ao);
		}
	},

	hasAdvice: function(thisAdviceObj, thisAdvice, adviceType, arr){
		// summary:
		//		returns the array index of the first existing connection
		//		betweened the passed advice and this joinpoint. Will be -1 if
		//		none exists.
		// thisAdviceObj:
		//		the scope in which to locate/execute the named adviceFunc.
		// thisAdviceFunc:
		//		the name of the function being conected
		// adviceType: 
		//		Optional. String. One of "before", "after", "around",
		//		"before-around", or "after-around". FIXME
		// arr:
		//		Optional. The list of advices to search. Will be found via
		//		adviceType if not passed
		if(!arr){ arr = this.getArr(adviceType); }
		var ind = -1;
		for(var x=0; x<arr.length; x++){
			var aao = (typeof thisAdvice == "object") ? (new String(thisAdvice)).toString() : thisAdvice;
			var a1o = (typeof arr[x][1] == "object") ? (new String(arr[x][1])).toString() : arr[x][1];
			if((arr[x][0] == thisAdviceObj)&&(a1o == aao)){
				ind = x;
			}
		}
		return ind; // Integer
	},

	removeAdvice: function(thisAdviceObj, thisAdvice, adviceType, once){
		// summary:
		//		returns the array index of the first existing connection
		//		betweened the passed advice and this joinpoint. Will be -1 if
		//		none exists.
		// thisAdviceObj:
		//		the scope in which to locate/execute the named adviceFunc.
		// thisAdviceFunc:
		//		the name of the function being conected
		// adviceType: 
		//		Optional. String. One of "before", "after", "around",
		//		"before-around", or "after-around". FIXME
		// once:
		//		Optional. Should this only remove the first occurance of the
		//		connection?
		var arr = this.getArr(adviceType);
		var ind = this.hasAdvice(thisAdviceObj, thisAdvice, adviceType, arr);
		if(ind == -1){
			return false;
		}
		while(ind != -1){
			arr.splice(ind, 1);
			if(once){ break; }
			ind = this.hasAdvice(thisAdviceObj, thisAdvice, adviceType, arr);
		}
		return true;
	}
});

dojo.provide("dojo.event.topic");

dojo.event.topic = new function(){
	this.topics = {};

	this.getTopic = function(/*String*/topic){
		// summary:
		//		returns a topic implementation object of type
		//		dojo.event.topic.TopicImpl
		// topic:
		//		a unique, opaque string that names the topic
		if(!this.topics[topic]){
			this.topics[topic] = new this.TopicImpl(topic);
		}
		return this.topics[topic]; // a dojo.event.topic.TopicImpl object
	}

	this.registerPublisher = function(/*String*/topic, /*Object*/obj, /*String*/funcName){
		// summary:
		//		registers a function as a publisher on a topic. Subsequent
		//		calls to the function will cause a publish event on the topic
		//		with the arguments passed to the function passed to registered
		//		listeners.
		// topic: 
		//		a unique, opaque string that names the topic
		// obj:
		//		the scope to locate the function in
		// funcName:
		//		the name of the function to register
		var topic = this.getTopic(topic);
		topic.registerPublisher(obj, funcName);
	}

	this.subscribe = function(/*String*/topic, /*Object*/obj, /*String*/funcName){
		// summary:
		//		susbscribes the function to the topic. Subsequent events
		//		dispached to the topic will create a function call for the
		//		obj.funcName() function.
		// topic: 
		//		a unique, opaque string that names the topic
		// obj:
		//		the scope to locate the function in
		// funcName:
		//		the name of the function to being registered as a listener
		var topic = this.getTopic(topic);
		topic.subscribe(obj, funcName);
	}

	this.unsubscribe = function(/*String*/topic, /*Object*/obj, /*String*/funcName){
		// summary:
		//		unsubscribes the obj.funcName() from the topic
		// topic: 
		//		a unique, opaque string that names the topic
		// obj:
		//		the scope to locate the function in
		// funcName:
		//		the name of the function to being unregistered as a listener
		var topic = this.getTopic(topic);
		topic.unsubscribe(obj, funcName);
	}

	this.destroy = function(/*String*/topic){
		// summary: 
		//		destroys the topic and unregisters all listeners
		// topic:
		//		a unique, opaque string that names the topic
		this.getTopic(topic).destroy();
		delete this.topics[topic];
	}

	this.publishApply = function(/*String*/topic, /*Array*/args){
		// summary: 
		//		dispatches an event to the topic using the args array as the
		//		source for the call arguments to each listener. This is similar
		//		to JavaScript's built-in Function.apply()
		// topic:
		//		a unique, opaque string that names the topic
		// args:
		//		the arguments to be passed into listeners of the topic
		var topic = this.getTopic(topic);
		topic.sendMessage.apply(topic, args);
	}

	this.publish = function(/*String*/topic, /*Object*/message){
		// summary: 
		//		manually "publish" to the passed topic
		// topic:
		//		a unique, opaque string that names the topic
		// message:
		//		can be an array of parameters (similar to publishApply), or
		//		will be treated as one of many arguments to be passed along in
		//		a "flat" unrolling
		var topic = this.getTopic(topic);
		// if message is an array, we treat it as a set of arguments,
		// otherwise, we just pass on the arguments passed in as-is
		var args = [];
		// could we use concat instead here?
		for(var x=1; x<arguments.length; x++){
			args.push(arguments[x]);
		}
		topic.sendMessage.apply(topic, args);
	}
}

dojo.event.topic.TopicImpl = function(topicName){
	// summary: a class to represent topics

	this.topicName = topicName;

	this.subscribe = function(/*Object*/listenerObject, /*Function or String*/listenerMethod){
		// summary:
		//		use dojo.event.connect() to attach the passed listener to the
		//		topic represented by this object
		// listenerObject:
		//		if a string and listenerMethod is ommitted, this is treated as
		//		the name of a function in the global namespace. If
		//		listenerMethod is provided, this is the scope to find/execute
		//		the function in.
		// listenerMethod:
		//		Optional. The function to register.
		var tf = listenerMethod||listenerObject;
		var to = (!listenerMethod) ? dj_global : listenerObject;
		return dojo.event.kwConnect({ // dojo.event.MethodJoinPoint
			srcObj:		this, 
			srcFunc:	"sendMessage", 
			adviceObj:	to,
			adviceFunc: tf
		});
	}

	this.unsubscribe = function(/*Object*/listenerObject, /*Function or String*/listenerMethod){
		// summary:
		//		use dojo.event.disconnect() to attach the passed listener to the
		//		topic represented by this object
		// listenerObject:
		//		if a string and listenerMethod is ommitted, this is treated as
		//		the name of a function in the global namespace. If
		//		listenerMethod is provided, this is the scope to find the
		//		function in.
		// listenerMethod:
		//		Optional. The function to unregister.
		var tf = (!listenerMethod) ? listenerObject : listenerMethod;
		var to = (!listenerMethod) ? null : listenerObject;
		return dojo.event.kwDisconnect({ // dojo.event.MethodJoinPoint
			srcObj:		this, 
			srcFunc:	"sendMessage", 
			adviceObj:	to,
			adviceFunc: tf
		});
	}

	this._getJoinPoint = function(){
		return dojo.event.MethodJoinPoint.getForMethod(this, "sendMessage");
	}

	this.setSquelch = function(/*Boolean*/shouldSquelch){
		// summary: 
		//		determine whether or not exceptions in the calling of a
		//		listener in the chain should stop execution of the chain.
		this._getJoinPoint().squelch = shouldSquelch;
	}

	this.destroy = function(){
		// summary: disconnects all listeners from this topic
		this._getJoinPoint().disconnect();
	}

	this.registerPublisher = function(	/*Object*/publisherObject, 
										/*Function or String*/publisherMethod){
		// summary:
		//		registers the passed function as a publisher on this topic.
		//		Each time the function is called, an event will be published on
		//		this topic.
		// publisherObject:
		//		if a string and listenerMethod is ommitted, this is treated as
		//		the name of a function in the global namespace. If
		//		listenerMethod is provided, this is the scope to find the
		//		function in.
		// publisherMethod:
		//		Optional. The function to register.
		dojo.event.connect(publisherObject, publisherMethod, this, "sendMessage");
	}

	this.sendMessage = function(message){
		// summary: a stub to be called when a message is sent to the topic.

		// The message has been propagated
	}
}


dojo.provide("dojo.event.browser");

// FIXME: any particular reason this is in the global scope?
dojo._ie_clobber = new function(){
	this.clobberNodes = [];

	function nukeProp(node, prop){
		// try{ node.removeAttribute(prop); 	}catch(e){ /* squelch */ }
		try{ node[prop] = null; 			}catch(e){ /* squelch */ }
		try{ delete node[prop]; 			}catch(e){ /* squelch */ }
		// FIXME: JotLive needs this, but I'm not sure if it's too slow or not
		try{ node.removeAttribute(prop);	}catch(e){ /* squelch */ }
	}

	this.clobber = function(nodeRef){
		var na;
		var tna;
		if(nodeRef){
			tna = nodeRef.all || nodeRef.getElementsByTagName("*");
			na = [nodeRef];
			for(var x=0; x<tna.length; x++){
				// if we're gonna be clobbering the thing, at least make sure
				// we aren't trying to do it twice
				if(tna[x]["__doClobber__"]){
					na.push(tna[x]);
				}
			}
		}else{
			try{ window.onload = null; }catch(e){}
			na = (this.clobberNodes.length) ? this.clobberNodes : document.all;
		}
		tna = null;
		var basis = {};
		for(var i = na.length-1; i>=0; i=i-1){
			var el = na[i];
			try{
				if(el && el["__clobberAttrs__"]){
					for(var j=0; j<el.__clobberAttrs__.length; j++){
						nukeProp(el, el.__clobberAttrs__[j]);
					}
					nukeProp(el, "__clobberAttrs__");
					nukeProp(el, "__doClobber__");
				}
			}catch(e){ /* squelch! */};
		}
		na = null;
	}
}

if(dojo.render.html.ie){
	dojo.addOnUnload(function(){
		dojo._ie_clobber.clobber();
		try{
			if((dojo["widget"])&&(dojo.widget["manager"])){
				dojo.widget.manager.destroyAll();
			}
		}catch(e){}
		try{ window.onload = null; }catch(e){}
		try{ window.onunload = null; }catch(e){}
		dojo._ie_clobber.clobberNodes = [];
		// CollectGarbage();
	});
}

dojo.event.browser = new function(){

	var clobberIdx = 0;

	this.normalizedEventName = function(/*String*/eventName){
		switch(eventName){
			case "CheckboxStateChange":
			case "DOMAttrModified":
			case "DOMMenuItemActive":
			case "DOMMenuItemInactive":
			case "DOMMouseScroll":
			case "DOMNodeInserted":
			case "DOMNodeRemoved":
			case "RadioStateChange":
				return eventName;
				break;
			default:
				return eventName.toLowerCase();
				break;
		}
	}
	
	this.clean = function(/*DOMNode*/node){
		// summary:
		//		removes native event handlers so that destruction of the node
		//		will not leak memory. On most browsers this is a no-op, but
		//		it's critical for manual node removal on IE.
		// node:
		//		A DOM node. All of it's children will also be cleaned.
		if(dojo.render.html.ie){ 
			dojo._ie_clobber.clobber(node);
		}
	}

	this.addClobberNode = function(/*DOMNode*/node){
		// summary:
		//		register the passed node to support event stripping
		// node:
		//		A DOM node
		if(!dojo.render.html.ie){ return; }
		if(!node["__doClobber__"]){
			node.__doClobber__ = true;
			dojo._ie_clobber.clobberNodes.push(node);
			// this might not be the most efficient thing to do, but it's
			// much less error prone than other approaches which were
			// previously tried and failed
			node.__clobberAttrs__ = [];
		}
	}

	this.addClobberNodeAttrs = function(/*DOMNode*/node, /*Array*/props){
		// summary:
		//		register the passed node to support event stripping
		// node:
		//		A DOM node to stip properties from later
		// props:
		//		A list of propeties to strip from the node
		if(!dojo.render.html.ie){ return; }
		this.addClobberNode(node);
		for(var x=0; x<props.length; x++){
			node.__clobberAttrs__.push(props[x]);
		}
	}

	this.removeListener = function(	/*DOMNode*/ node, 
									/*String*/	evtName, 
									/*Function*/fp, 
									/*Boolean*/	capture){
		// summary:
		//		clobbers the listener from the node
		// evtName:
		//		the name of the handler to remove the function from
		// node:
		//		DOM node to attach the event to
		// fp:
		//		the function to register
		// capture:
		//		Optional. should this listener prevent propigation?
		if(!capture){ var capture = false; }
		evtName = dojo.event.browser.normalizedEventName(evtName);
		if( (evtName == "onkey") || (evtName == "key") ){
			if(dojo.render.html.ie){
				this.removeListener(node, "onkeydown", fp, capture);
			}
			evtName = "onkeypress";
		}
		if(evtName.substr(0,2)=="on"){ evtName = evtName.substr(2); }
		// FIXME: this is mostly a punt, we aren't actually doing anything on IE
		if(node.removeEventListener){
			node.removeEventListener(evtName, fp, capture);
		}
	}

	this.addListener = function(/*DOMNode*/node, /*String*/evtName, /*Function*/fp, /*Boolean*/capture, /*Boolean*/dontFix){
		// summary:
		//		adds a listener to the node
		// evtName:
		//		the name of the handler to add the listener to can be either of
		//		the form "onclick" or "click"
		// node:
		//		DOM node to attach the event to
		// fp:
		//		the function to register
		// capture:
		//		Optional. Should this listener prevent propigation?
		// dontFix:
		//		Optional. Should we avoid registering a new closure around the
		//		listener to enable fixEvent for dispatch of the registered
		//		function?
		if(!node){ return; } // FIXME: log and/or bail?
		if(!capture){ var capture = false; }
		evtName = dojo.event.browser.normalizedEventName(evtName);
		if( (evtName == "onkey") || (evtName == "key") ){
			if(dojo.render.html.ie){
				this.addListener(node, "onkeydown", fp, capture, dontFix);
			}
			evtName = "onkeypress";
		}
		if(evtName.substr(0,2)!="on"){ evtName = "on"+evtName; }

		if(!dontFix){
			// build yet another closure around fp in order to inject fixEvent
			// around the resulting event
			var newfp = function(evt){
				if(!evt){ evt = window.event; }
				var ret = fp(dojo.event.browser.fixEvent(evt, this));
				if(capture){
					dojo.event.browser.stopEvent(evt);
				}
				return ret;
			}
		}else{
			newfp = fp;
		}

		if(node.addEventListener){ 
			node.addEventListener(evtName.substr(2), newfp, capture);
			return newfp;
		}else{
			if(typeof node[evtName] == "function" ){
				var oldEvt = node[evtName];
				node[evtName] = function(e){
					oldEvt(e);
					return newfp(e);
				}
			}else{
				node[evtName]=newfp;
			}
			if(dojo.render.html.ie){
				this.addClobberNodeAttrs(node, [evtName]);
			}
			return newfp;
		}
	}

	this.isEvent = function(/*Object*/obj){
		// summary: 
		//		Tries to determine whether or not the object is a DOM event.

		// FIXME: event detection hack ... could test for additional attributes
		// if necessary
		return (typeof obj != "undefined")&&(typeof Event != "undefined")&&(obj.eventPhase); // Boolean
		// Event does not support instanceof in Opera, otherwise:
		//return (typeof Event != "undefined")&&(obj instanceof Event);
	}

	this.currentEvent = null;
	
	this.callListener = function(/*Function*/listener, /*DOMNode*/curTarget){
		// summary:
		//		calls the specified listener in the context of the passed node
		//		with the current DOM event object as the only parameter
		// listener:
		//		the function to call
		// curTarget:
		//		the Node to call the function in the scope of
		if(typeof listener != 'function'){
			dojo.raise("listener not a function: " + listener);
		}
		dojo.event.browser.currentEvent.currentTarget = curTarget;
		return listener.call(curTarget, dojo.event.browser.currentEvent);
	}

	this._stopPropagation = function(){
		dojo.event.browser.currentEvent.cancelBubble = true; 
	}

	this._preventDefault = function(){
		dojo.event.browser.currentEvent.returnValue = false;
	}

	this.keys = {
		KEY_BACKSPACE: 8,
		KEY_TAB: 9,
		KEY_CLEAR: 12,
		KEY_ENTER: 13,
		KEY_SHIFT: 16,
		KEY_CTRL: 17,
		KEY_ALT: 18,
		KEY_PAUSE: 19,
		KEY_CAPS_LOCK: 20,
		KEY_ESCAPE: 27,
		KEY_SPACE: 32,
		KEY_PAGE_UP: 33,
		KEY_PAGE_DOWN: 34,
		KEY_END: 35,
		KEY_HOME: 36,
		KEY_LEFT_ARROW: 37,
		KEY_UP_ARROW: 38,
		KEY_RIGHT_ARROW: 39,
		KEY_DOWN_ARROW: 40,
		KEY_INSERT: 45,
		KEY_DELETE: 46,
		KEY_HELP: 47,
		KEY_LEFT_WINDOW: 91,
		KEY_RIGHT_WINDOW: 92,
		KEY_SELECT: 93,
		KEY_NUMPAD_0: 96,
		KEY_NUMPAD_1: 97,
		KEY_NUMPAD_2: 98,
		KEY_NUMPAD_3: 99,
		KEY_NUMPAD_4: 100,
		KEY_NUMPAD_5: 101,
		KEY_NUMPAD_6: 102,
		KEY_NUMPAD_7: 103,
		KEY_NUMPAD_8: 104,
		KEY_NUMPAD_9: 105,
		KEY_NUMPAD_MULTIPLY: 106,
		KEY_NUMPAD_PLUS: 107,
		KEY_NUMPAD_ENTER: 108,
		KEY_NUMPAD_MINUS: 109,
		KEY_NUMPAD_PERIOD: 110,
		KEY_NUMPAD_DIVIDE: 111,
		KEY_F1: 112,
		KEY_F2: 113,
		KEY_F3: 114,
		KEY_F4: 115,
		KEY_F5: 116,
		KEY_F6: 117,
		KEY_F7: 118,
		KEY_F8: 119,
		KEY_F9: 120,
		KEY_F10: 121,
		KEY_F11: 122,
		KEY_F12: 123,
		KEY_F13: 124,
		KEY_F14: 125,
		KEY_F15: 126,
		KEY_NUM_LOCK: 144,
		KEY_SCROLL_LOCK: 145
	};

	// reverse lookup
	this.revKeys = [];
	for(var key in this.keys){
		this.revKeys[this.keys[key]] = key;
	}

	this.fixEvent = function(/*Event*/evt, /*DOMNode*/sender){
		// summary:
		//		normalizes properties on the event object including event
		//		bubbling methods, keystroke normalization, and x/y positions
		// evt: the native event object
		// sender: the node to treat as "currentTarget"
		if(!evt){
			if(window["event"]){
				evt = window.event;
			}
		}
		
		if((evt["type"])&&(evt["type"].indexOf("key") == 0)){ // key events
			evt.keys = this.revKeys;
			// FIXME: how can we eliminate this iteration?
			for(var key in this.keys){
				evt[key] = this.keys[key];
			}
			if(evt["type"] == "keydown" && dojo.render.html.ie){
				switch(evt.keyCode){
					case evt.KEY_SHIFT:
					case evt.KEY_CTRL:
					case evt.KEY_ALT:
					case evt.KEY_CAPS_LOCK:
					case evt.KEY_LEFT_WINDOW:
					case evt.KEY_RIGHT_WINDOW:
					case evt.KEY_SELECT:
					case evt.KEY_NUM_LOCK:
					case evt.KEY_SCROLL_LOCK:
					// I'll get these in keypress after the OS munges them based on numlock
					case evt.KEY_NUMPAD_0:
					case evt.KEY_NUMPAD_1:
					case evt.KEY_NUMPAD_2:
					case evt.KEY_NUMPAD_3:
					case evt.KEY_NUMPAD_4:
					case evt.KEY_NUMPAD_5:
					case evt.KEY_NUMPAD_6:
					case evt.KEY_NUMPAD_7:
					case evt.KEY_NUMPAD_8:
					case evt.KEY_NUMPAD_9:
					case evt.KEY_NUMPAD_PERIOD:
						break; // just ignore the keys that can morph
					case evt.KEY_NUMPAD_MULTIPLY:
					case evt.KEY_NUMPAD_PLUS:
					case evt.KEY_NUMPAD_ENTER:
					case evt.KEY_NUMPAD_MINUS:
					case evt.KEY_NUMPAD_DIVIDE:
						break; // I could handle these but just pick them up in keypress
					case evt.KEY_PAUSE:
					case evt.KEY_TAB:
					case evt.KEY_BACKSPACE:
					case evt.KEY_ENTER:
					case evt.KEY_ESCAPE:
					case evt.KEY_PAGE_UP:
					case evt.KEY_PAGE_DOWN:
					case evt.KEY_END:
					case evt.KEY_HOME:
					case evt.KEY_LEFT_ARROW:
					case evt.KEY_UP_ARROW:
					case evt.KEY_RIGHT_ARROW:
					case evt.KEY_DOWN_ARROW:
					case evt.KEY_INSERT:
					case evt.KEY_DELETE:
					case evt.KEY_F1:
					case evt.KEY_F2:
					case evt.KEY_F3:
					case evt.KEY_F4:
					case evt.KEY_F5:
					case evt.KEY_F6:
					case evt.KEY_F7:
					case evt.KEY_F8:
					case evt.KEY_F9:
					case evt.KEY_F10:
					case evt.KEY_F11:
					case evt.KEY_F12:
					case evt.KEY_F12:
					case evt.KEY_F13:
					case evt.KEY_F14:
					case evt.KEY_F15:
					case evt.KEY_CLEAR:
					case evt.KEY_HELP:
						evt.key = evt.keyCode;
						break;
					default:
						if(evt.ctrlKey || evt.altKey){
							var unifiedCharCode = evt.keyCode;
							// if lower case but keycode is uppercase, convert it
							if(unifiedCharCode >= 65 && unifiedCharCode <= 90 && evt.shiftKey == false){
								unifiedCharCode += 32;
							}
							if(unifiedCharCode >= 1 && unifiedCharCode <= 26 && evt.ctrlKey){
								unifiedCharCode += 96; // 001-032 = ctrl+[a-z]
							}
							evt.key = String.fromCharCode(unifiedCharCode);
						}
				}
			} else if(evt["type"] == "keypress"){
				if(dojo.render.html.opera){
					if(evt.which == 0){
						evt.key = evt.keyCode;
					}else if(evt.which > 0){
						switch(evt.which){
							case evt.KEY_SHIFT:
							case evt.KEY_CTRL:
							case evt.KEY_ALT:
							case evt.KEY_CAPS_LOCK:
							case evt.KEY_NUM_LOCK:
							case evt.KEY_SCROLL_LOCK:
								break;
							case evt.KEY_PAUSE:
							case evt.KEY_TAB:
							case evt.KEY_BACKSPACE:
							case evt.KEY_ENTER:
							case evt.KEY_ESCAPE:
								evt.key = evt.which;
								break;
							default:
								var unifiedCharCode = evt.which;
								if((evt.ctrlKey || evt.altKey || evt.metaKey) && (evt.which >= 65 && evt.which <= 90 && evt.shiftKey == false)){
									unifiedCharCode += 32;
								}
								evt.key = String.fromCharCode(unifiedCharCode);
						}
					}
				}else if(dojo.render.html.ie){ // catch some IE keys that are hard to get in keyDown
					// key combinations were handled in onKeyDown
					if(!evt.ctrlKey && !evt.altKey && evt.keyCode >= evt.KEY_SPACE){
						evt.key = String.fromCharCode(evt.keyCode);
					}
				}else if(dojo.render.html.safari){
					switch(evt.keyCode){
						case 63232: evt.key = evt.KEY_UP_ARROW; break;
						case 63233: evt.key = evt.KEY_DOWN_ARROW; break;
						case 63234: evt.key = evt.KEY_LEFT_ARROW; break;
						case 63235: evt.key = evt.KEY_RIGHT_ARROW; break;
						default: 
							evt.key = evt.charCode > 0 ? String.fromCharCode(evt.charCode) : evt.keyCode;
					}
				}else{
					evt.key = evt.charCode > 0 ? String.fromCharCode(evt.charCode) : evt.keyCode;
				}
			}
		}
		if(dojo.render.html.ie){
			if(!evt.target){ evt.target = evt.srcElement; }
			if(!evt.currentTarget){ evt.currentTarget = (sender ? sender : evt.srcElement); }
			if(!evt.layerX){ evt.layerX = evt.offsetX; }
			if(!evt.layerY){ evt.layerY = evt.offsetY; }
			// FIXME: scroll position query is duped from dojo.html to avoid dependency on that entire module
			// DONOT replace the following to use dojo.body(), in IE, document.documentElement should be used
			// here rather than document.body
			var doc = (evt.srcElement && evt.srcElement.ownerDocument) ? evt.srcElement.ownerDocument : document;
			var docBody = ((dojo.render.html.ie55)||(doc["compatMode"] == "BackCompat")) ? doc.body : doc.documentElement;
			if(!evt.pageX){ evt.pageX = evt.clientX + (docBody.scrollLeft || 0) }
			if(!evt.pageY){ evt.pageY = evt.clientY + (docBody.scrollTop || 0) }
			// mouseover
			if(evt.type == "mouseover"){ evt.relatedTarget = evt.fromElement; }
			// mouseout
			if(evt.type == "mouseout"){ evt.relatedTarget = evt.toElement; }
			this.currentEvent = evt;
			evt.callListener = this.callListener;
			evt.stopPropagation = this._stopPropagation;
			evt.preventDefault = this._preventDefault;
		}
		return evt; // Event
	}

	this.stopEvent = function(/*Event*/evt){
		// summary:
		//		prevents propigation and clobbers the default action of the
		//		passed event
		// evt: Optional for IE. The native event object.
		if(window.event){
			evt.returnValue = false;
			evt.cancelBubble = true;
		}else{
			evt.preventDefault();
			evt.stopPropagation();
		}
	}
}

dojo.provide("dojo.event.*");

dojo.provide("dojo.gfx.color");

// TODO: rewrite the "x2y" methods to take advantage of the parsing
//       abilities of the Color object. Also, beef up the Color
//       object (as possible) to parse most common formats

// takes an r, g, b, a(lpha) value, [r, g, b, a] array, "rgb(...)" string, hex string (#aaa, #aaaaaa, aaaaaaa)
dojo.gfx.color.Color = function(r, g, b, a) {
	// dojo.debug("r:", r[0], "g:", r[1], "b:", r[2]);
	if(dojo.lang.isArray(r)){
		this.r = r[0];
		this.g = r[1];
		this.b = r[2];
		this.a = r[3]||1.0;
	}else if(dojo.lang.isString(r)){
		var rgb = dojo.gfx.color.extractRGB(r);
		this.r = rgb[0];
		this.g = rgb[1];
		this.b = rgb[2];
		this.a = g||1.0;
	}else if(r instanceof dojo.gfx.color.Color){
		// why does this create a new instance if we were passed one?
		this.r = r.r;
		this.b = r.b;
		this.g = r.g;
		this.a = r.a;
	}else{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

dojo.gfx.color.Color.fromArray = function(arr) {
	return new dojo.gfx.color.Color(arr[0], arr[1], arr[2], arr[3]);
}

dojo.extend(dojo.gfx.color.Color, {
	toRgb: function(includeAlpha) {
		if(includeAlpha) {
			return this.toRgba();
		} else {
			return [this.r, this.g, this.b];
		}
	},
	toRgba: function() {
		return [this.r, this.g, this.b, this.a];
	},
	toHex: function() {
		return dojo.gfx.color.rgb2hex(this.toRgb());
	},
	toCss: function() {
		return "rgb(" + this.toRgb().join() + ")";
	},
	toString: function() {
		return this.toHex(); // decent default?
	},
	blend: function(color, weight){
		var rgb = null;
		if(dojo.lang.isArray(color)){
			rgb = color;
		}else if(color instanceof dojo.gfx.color.Color){
			rgb = color.toRgb();
		}else{
			rgb = new dojo.gfx.color.Color(color).toRgb();
		}
		return dojo.gfx.color.blend(this.toRgb(), rgb, weight);
	}
});

dojo.gfx.color.named = {
	white:      [255,255,255],
	black:      [0,0,0],
	red:        [255,0,0],
	green:	    [0,255,0],
	lime:	    [0,255,0],
	blue:       [0,0,255],
	navy:       [0,0,128],
	gray:       [128,128,128],
	silver:     [192,192,192]
};

dojo.gfx.color.blend = function(a, b, weight){
	// summary: 
	//		blend colors a and b (both as RGB array or hex strings) with weight
	//		from -1 to +1, 0 being a 50/50 blend
	if(typeof a == "string"){
		return dojo.gfx.color.blendHex(a, b, weight);
	}
	if(!weight){
		weight = 0;
	}
	weight = Math.min(Math.max(-1, weight), 1);

	// alex: this interface blows.
	// map -1 to 1 to the range 0 to 1
	weight = ((weight + 1)/2);
	
	var c = [];

	// var stop = (1000*weight);
	for(var x = 0; x < 3; x++){
		c[x] = parseInt( b[x] + ( (a[x] - b[x]) * weight) );
	}
	return c;
}

// very convenient blend that takes and returns hex values
// (will get called automatically by blend when blend gets strings)
dojo.gfx.color.blendHex = function(a, b, weight) {
	return dojo.gfx.color.rgb2hex(dojo.gfx.color.blend(dojo.gfx.color.hex2rgb(a), dojo.gfx.color.hex2rgb(b), weight));
}

// get RGB array from css-style color declarations
dojo.gfx.color.extractRGB = function(color) {
	var hex = "0123456789abcdef";
	color = color.toLowerCase();
	if( color.indexOf("rgb") == 0 ) {
		var matches = color.match(/rgba*\((\d+), *(\d+), *(\d+)/i);
		var ret = matches.splice(1, 3);
		return ret;
	} else {
		var colors = dojo.gfx.color.hex2rgb(color);
		if(colors) {
			return colors;
		} else {
			// named color (how many do we support?)
			return dojo.gfx.color.named[color] || [255, 255, 255];
		}
	}
}

dojo.gfx.color.hex2rgb = function(hex) {
	var hexNum = "0123456789ABCDEF";
	var rgb = new Array(3);
	if( hex.indexOf("#") == 0 ) { hex = hex.substring(1); }
	hex = hex.toUpperCase();
	if(hex.replace(new RegExp("["+hexNum+"]", "g"), "") != "") {
		return null;
	}
	if( hex.length == 3 ) {
		rgb[0] = hex.charAt(0) + hex.charAt(0)
		rgb[1] = hex.charAt(1) + hex.charAt(1)
		rgb[2] = hex.charAt(2) + hex.charAt(2);
	} else {
		rgb[0] = hex.substring(0, 2);
		rgb[1] = hex.substring(2, 4);
		rgb[2] = hex.substring(4);
	}
	for(var i = 0; i < rgb.length; i++) {
		rgb[i] = hexNum.indexOf(rgb[i].charAt(0)) * 16 + hexNum.indexOf(rgb[i].charAt(1));
	}
	return rgb;
}

dojo.gfx.color.rgb2hex = function(r, g, b) {
	if(dojo.lang.isArray(r)) {
		g = r[1] || 0;
		b = r[2] || 0;
		r = r[0] || 0;
	}
	var ret = dojo.lang.map([r, g, b], function(x) {
		x = new Number(x);
		var s = x.toString(16);
		while(s.length < 2) { s = "0" + s; }
		return s;
	});
	ret.unshift("#");
	return ret.join("");
}

dojo.provide("dojo.lfx.Animation");


/*
	Animation package based on Dan Pupius' work: http://pupius.co.uk/js/Toolkit.Drawing.js
*/
dojo.lfx.Line = function(/*int*/ start, /*int*/ end){
	// summary: dojo.lfx.Line is the object used to generate values
	//			from a start value to an end value
	this.start = start;
	this.end = end;
	if(dojo.lang.isArray(start)){
		/* start: Array
		   end: Array
		   pId: a */
		var diff = [];
		dojo.lang.forEach(this.start, function(s,i){
			diff[i] = this.end[i] - s;
		}, this);
		
		this.getValue = function(/*float*/ n){
			var res = [];
			dojo.lang.forEach(this.start, function(s, i){
				res[i] = (diff[i] * n) + s;
			}, this);
			return res; // Array
		}
	}else{
		var diff = end - start;
			
		this.getValue = function(/*float*/ n){
			//	summary: returns the point on the line
			//	n: a floating point number greater than 0 and less than 1
			return (diff * n) + this.start; // Decimal
		}
	}
}

dojo.lfx.easeDefault = function(/*Decimal?*/ n){
	//	summary: Returns the point for point n on a sin wave.
	if(dojo.render.html.khtml){
		// the cool kids are obviously not using konqueror...
		// found a very wierd bug in floats constants, 1.5 evals as 1
		// seems somebody mixed up ints and floats in 3.5.4 ??
		// FIXME: investigate more and post a KDE bug (Fredrik)
		return (parseFloat("0.5")+((Math.sin( (n+parseFloat("1.5")) * Math.PI))/2));
	}else{
		return (0.5+((Math.sin( (n+1.5) * Math.PI))/2));
	}
}

dojo.lfx.easeIn = function(/*Decimal?*/ n){
	//	summary: returns the point on an easing curve
	//	n: a floating point number greater than 0 and less than 1
	return Math.pow(n, 3);
}

dojo.lfx.easeOut = function(/*Decimal?*/ n){
	//	summary: returns the point on the line
	//	n: a floating point number greater than 0 and less than 1
	return ( 1 - Math.pow(1 - n, 3) );
}

dojo.lfx.easeInOut = function(/*Decimal?*/ n){
	//	summary: returns the point on the line
	//	n: a floating point number greater than 0 and less than 1
	return ( (3 * Math.pow(n, 2)) - (2 * Math.pow(n, 3)) );
}

dojo.lfx.IAnimation = function(){
	// summary: dojo.lfx.IAnimation is an interface that implements
	//			commonly used functions of animation objects
}
dojo.lang.extend(dojo.lfx.IAnimation, {
	// public properties
	curve: null,
	duration: 1000,
	easing: null,
	repeatCount: 0,
	rate: 25,
	
	// events
	handler: null,
	beforeBegin: null,
	onBegin: null,
	onAnimate: null,
	onEnd: null,
	onPlay: null,
	onPause: null,
	onStop: null,
	
	// public methods
	play: null,
	pause: null,
	stop: null,
	
	connect: function(/*Event*/ evt, /*Object*/ scope, /*Function*/ newFunc){
		// summary: Convenience function.  Quickly connect to an event
		//			of this object and save the old functions connected to it.
		// evt: The name of the event to connect to.
		// scope: the scope in which to run newFunc.
		// newFunc: the function to run when evt is fired.
		if(!newFunc){
			/* scope: Function
			   newFunc: null
			   pId: f */
			newFunc = scope;
			scope = this;
		}
		newFunc = dojo.lang.hitch(scope, newFunc);
		var oldFunc = this[evt]||function(){};
		this[evt] = function(){
			var ret = oldFunc.apply(this, arguments);
			newFunc.apply(this, arguments);
			return ret;
		}
		return this; // dojo.lfx.IAnimation
	},

	fire: function(/*Event*/ evt, /*Array*/ args){
		// summary: Convenience function.  Fire event "evt" and pass it
		//			the arguments specified in "args".
		// evt: The event to fire.
		// args: The arguments to pass to the event.
		if(this[evt]){
			this[evt].apply(this, (args||[]));
		}
		return this; // dojo.lfx.IAnimation
	},
	
	repeat: function(/*int*/ count){
		// summary: Set the repeat count of this object.
		// count: How many times to repeat the animation.
		this.repeatCount = count;
		return this; // dojo.lfx.IAnimation
	},

	// private properties
	_active: false,
	_paused: false
});

dojo.lfx.Animation = function(	/*Object*/ handlers, 
								/*int*/ duration, 
								/*dojo.lfx.Line*/ curve, 
								/*function*/ easing, 
								/*int*/ repeatCount, 
								/*int*/ rate){
	//	summary
	//		a generic animation object that fires callbacks into it's handlers
	//		object at various states
	//	handlers: { handler: Function?, onstart: Function?, onstop: Function?, onanimate: Function? }
	dojo.lfx.IAnimation.call(this);
	if(dojo.lang.isNumber(handlers)||(!handlers && duration.getValue)){
		// no handlers argument:
		rate = repeatCount;
		repeatCount = easing;
		easing = curve;
		curve = duration;
		duration = handlers;
		handlers = null;
	}else if(handlers.getValue||dojo.lang.isArray(handlers)){
		// no handlers or duration:
		rate = easing;
		repeatCount = curve;
		easing = duration;
		curve = handlers;
		duration = null;
		handlers = null;
	}
	if(dojo.lang.isArray(curve)){
		/* curve: Array
		   pId: a */
		this.curve = new dojo.lfx.Line(curve[0], curve[1]);
	}else{
		this.curve = curve;
	}
	if(duration != null && duration > 0){ this.duration = duration; }
	if(repeatCount){ this.repeatCount = repeatCount; }
	if(rate){ this.rate = rate; }
	if(handlers){
		dojo.lang.forEach([
				"handler", "beforeBegin", "onBegin", 
				"onEnd", "onPlay", "onStop", "onAnimate"
			], function(item){
				if(handlers[item]){
					this.connect(item, handlers[item]);
				}
			}, this);
	}
	if(easing && dojo.lang.isFunction(easing)){
		this.easing=easing;
	}
}
dojo.inherits(dojo.lfx.Animation, dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Animation, {
	// "private" properties
	_startTime: null,
	_endTime: null,
	_timer: null,
	_percent: 0,
	_startRepeatCount: 0,

	// public methods
	play: function(/*int?*/ delay, /*bool?*/ gotoStart){
		// summary: Start the animation.
		// delay: How many milliseconds to delay before starting.
		// gotoStart: If true, starts the animation from the beginning; otherwise,
		//            starts it from its current position.
		if(gotoStart){
			clearTimeout(this._timer);
			this._active = false;
			this._paused = false;
			this._percent = 0;
		}else if(this._active && !this._paused){
			return this; // dojo.lfx.Animation
		}
		
		this.fire("handler", ["beforeBegin"]);
		this.fire("beforeBegin");

		if(delay > 0){
			setTimeout(dojo.lang.hitch(this, function(){ this.play(null, gotoStart); }), delay);
			return this; // dojo.lfx.Animation
		}
		
		this._startTime = new Date().valueOf();
		if(this._paused){
			this._startTime -= (this.duration * this._percent / 100);
		}
		this._endTime = this._startTime + this.duration;

		this._active = true;
		this._paused = false;
		
		var step = this._percent / 100;
		var value = this.curve.getValue(step);
		if(this._percent == 0 ){
			if(!this._startRepeatCount){
				this._startRepeatCount = this.repeatCount;
			}
			this.fire("handler", ["begin", value]);
			this.fire("onBegin", [value]);
		}

		this.fire("handler", ["play", value]);
		this.fire("onPlay", [value]);

		this._cycle();
		return this; // dojo.lfx.Animation
	},

	pause: function(){
		// summary: Pauses a running animation.
		clearTimeout(this._timer);
		if(!this._active){ return this; /*dojo.lfx.Animation*/}
		this._paused = true;
		var value = this.curve.getValue(this._percent / 100);
		this.fire("handler", ["pause", value]);
		this.fire("onPause", [value]);
		return this; // dojo.lfx.Animation
	},

	gotoPercent: function(/*Decimal*/ pct, /*bool?*/ andPlay){
		// summary: Sets the progress of the animation.
		// pct: A percentage in decimal notation (between and including 0.0 and 1.0).
		// andPlay: If true, play the animation after setting the progress.
		clearTimeout(this._timer);
		this._active = true;
		this._paused = true;
		this._percent = pct;
		if(andPlay){ this.play(); }
		return this; // dojo.lfx.Animation
	},

	stop: function(/*bool?*/ gotoEnd){
		// summary: Stops a running animation.
		// gotoEnd: If true, the animation will end.
		clearTimeout(this._timer);
		var step = this._percent / 100;
		if(gotoEnd){
			step = 1;
		}
		var value = this.curve.getValue(step);
		this.fire("handler", ["stop", value]);
		this.fire("onStop", [value]);
		this._active = false;
		this._paused = false;
		return this; // dojo.lfx.Animation
	},

	status: function(){
		// summary: Returns a string representation of the status of
		//			the animation.
		if(this._active){
			return this._paused ? "paused" : "playing"; // String
		}else{
			return "stopped"; // String
		}
		return this;
	},

	// "private" methods
	_cycle: function(){
		clearTimeout(this._timer);
		if(this._active){
			var curr = new Date().valueOf();
			var step = (curr - this._startTime) / (this._endTime - this._startTime);

			if(step >= 1){
				step = 1;
				this._percent = 100;
			}else{
				this._percent = step * 100;
			}
			
			// Perform easing
			if((this.easing)&&(dojo.lang.isFunction(this.easing))){
				step = this.easing(step);
			}

			var value = this.curve.getValue(step);
			this.fire("handler", ["animate", value]);
			this.fire("onAnimate", [value]);

			if( step < 1 ){
				this._timer = setTimeout(dojo.lang.hitch(this, "_cycle"), this.rate);
			}else{
				this._active = false;
				this.fire("handler", ["end"]);
				this.fire("onEnd");

				if(this.repeatCount > 0){
					this.repeatCount--;
					this.play(null, true);
				}else if(this.repeatCount == -1){
					this.play(null, true);
				}else{
					if(this._startRepeatCount){
						this.repeatCount = this._startRepeatCount;
						this._startRepeatCount = 0;
					}
				}
			}
		}
		return this; // dojo.lfx.Animation
	}
});

dojo.lfx.Combine = function(/*dojo.lfx.IAnimation...*/ animations){
	// summary: An animation object to play animations passed to it at the same time.
	dojo.lfx.IAnimation.call(this);
	this._anims = [];
	this._animsEnded = 0;
	
	var anims = arguments;
	if(anims.length == 1 && (dojo.lang.isArray(anims[0]) || dojo.lang.isArrayLike(anims[0]))){
		/* animations: dojo.lfx.IAnimation[]
		   pId: a */
		anims = anims[0];
	}
	
	dojo.lang.forEach(anims, function(anim){
		this._anims.push(anim);
		anim.connect("onEnd", dojo.lang.hitch(this, "_onAnimsEnded"));
	}, this);
}
dojo.inherits(dojo.lfx.Combine, dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Combine, {
	// private members
	_animsEnded: 0,
	
	// public methods
	play: function(/*int?*/ delay, /*bool?*/ gotoStart){
		// summary: Start the animations.
		// delay: How many milliseconds to delay before starting.
		// gotoStart: If true, starts the animations from the beginning; otherwise,
		//            starts them from their current position.
		if( !this._anims.length ){ return this; /*dojo.lfx.Combine*/}

		this.fire("beforeBegin");

		if(delay > 0){
			setTimeout(dojo.lang.hitch(this, function(){ this.play(null, gotoStart); }), delay);
			return this; // dojo.lfx.Combine
		}
		
		if(gotoStart || this._anims[0].percent == 0){
			this.fire("onBegin");
		}
		this.fire("onPlay");
		this._animsCall("play", null, gotoStart);
		return this; // dojo.lfx.Combine
	},
	
	pause: function(){
		// summary: Pauses the running animations.
		this.fire("onPause");
		this._animsCall("pause"); 
		return this; // dojo.lfx.Combine
	},
	
	stop: function(/*bool?*/ gotoEnd){
		// summary: Stops the running animations.
		// gotoEnd: If true, the animations will end.
		this.fire("onStop");
		this._animsCall("stop", gotoEnd);
		return this; // dojo.lfx.Combine
	},
	
	// private methods
	_onAnimsEnded: function(){
		this._animsEnded++;
		if(this._animsEnded >= this._anims.length){
			this.fire("onEnd");
		}
		return this; // dojo.lfx.Combine
	},
	
	_animsCall: function(/*String*/ funcName){
		var args = [];
		if(arguments.length > 1){
			for(var i = 1 ; i < arguments.length ; i++){
				args.push(arguments[i]);
			}
		}
		var _this = this;
		dojo.lang.forEach(this._anims, function(anim){
			anim[funcName](args);
		}, _this);
		return this; // dojo.lfx.Combine
	}
});

dojo.lfx.Chain = function(/*dojo.lfx.IAnimation...*/ animations) {
	// summary: An animation object to play animations passed to it
	//			one after another.
	dojo.lfx.IAnimation.call(this);
	this._anims = [];
	this._currAnim = -1;
	
	var anims = arguments;
	if(anims.length == 1 && (dojo.lang.isArray(anims[0]) || dojo.lang.isArrayLike(anims[0]))){
		/* animations: dojo.lfx.IAnimation[]
		   pId: a */
		anims = anims[0];
	}
	
	var _this = this;
	dojo.lang.forEach(anims, function(anim, i, anims_arr){
		this._anims.push(anim);
		if(i < anims_arr.length - 1){
			anim.connect("onEnd", dojo.lang.hitch(this, "_playNext") );
		}else{
			anim.connect("onEnd", dojo.lang.hitch(this, function(){ this.fire("onEnd"); }) );
		}
	}, this);
}
dojo.inherits(dojo.lfx.Chain, dojo.lfx.IAnimation);
dojo.lang.extend(dojo.lfx.Chain, {
	// private members
	_currAnim: -1,
	
	// public methods
	play: function(/*int?*/ delay, /*bool?*/ gotoStart){
		// summary: Start the animation sequence.
		// delay: How many milliseconds to delay before starting.
		// gotoStart: If true, starts the sequence from the beginning; otherwise,
		//            starts it from its current position.
		if( !this._anims.length ) { return this; /*dojo.lfx.Chain*/}
		if( gotoStart || !this._anims[this._currAnim] ) {
			this._currAnim = 0;
		}

		var currentAnimation = this._anims[this._currAnim];

		this.fire("beforeBegin");
		if(delay > 0){
			setTimeout(dojo.lang.hitch(this, function(){ this.play(null, gotoStart); }), delay);
			return this; // dojo.lfx.Chain
		}
		
		if(currentAnimation){
			if(this._currAnim == 0){
				this.fire("handler", ["begin", this._currAnim]);
				this.fire("onBegin", [this._currAnim]);
			}
			this.fire("onPlay", [this._currAnim]);
			currentAnimation.play(null, gotoStart);
		}
		return this; // dojo.lfx.Chain
	},
	
	pause: function(){
		// summary: Pauses the running animation sequence.
		if( this._anims[this._currAnim] ) {
			this._anims[this._currAnim].pause();
			this.fire("onPause", [this._currAnim]);
		}
		return this; // dojo.lfx.Chain
	},
	
	playPause: function(){
		// summary: If the animation sequence is playing, pause it; otherwise,
		//			play it.
		if(this._anims.length == 0){ return this; }
		if(this._currAnim == -1){ this._currAnim = 0; }
		var currAnim = this._anims[this._currAnim];
		if( currAnim ) {
			if( !currAnim._active || currAnim._paused ) {
				this.play();
			} else {
				this.pause();
			}
		}
		return this; // dojo.lfx.Chain
	},
	
	stop: function(){
		// summary: Stops the running animations.
		var currAnim = this._anims[this._currAnim];
		if(currAnim){
			currAnim.stop();
			this.fire("onStop", [this._currAnim]);
		}
		return currAnim; // dojo.lfx.IAnimation
	},
	
	// private methods
	_playNext: function(){
		if( this._currAnim == -1 || this._anims.length == 0 ) { return this; }
		this._currAnim++;
		if( this._anims[this._currAnim] ){
			this._anims[this._currAnim].play(null, true);
		}
		return this; // dojo.lfx.Chain
	}
});

dojo.lfx.combine = function(/*dojo.lfx.IAnimation...*/ animations){
	// summary: Convenience function.  Returns a dojo.lfx.Combine created
	//			using the animations passed in.
	var anims = arguments;
	if(dojo.lang.isArray(arguments[0])){
		/* animations: dojo.lfx.IAnimation[]
		   pId: a */
		anims = arguments[0];
	}
	if(anims.length == 1){ return anims[0]; }
	return new dojo.lfx.Combine(anims); // dojo.lfx.Combine
}

dojo.lfx.chain = function(/*dojo.lfx.IAnimation...*/ animations){
	// summary: Convenience function.  Returns a dojo.lfx.Chain created
	//			using the animations passed in.
	var anims = arguments;
	if(dojo.lang.isArray(arguments[0])){
		/* animations: dojo.lfx.IAnimation[]
		   pId: a */
		anims = arguments[0];
	}
	if(anims.length == 1){ return anims[0]; }
	return new dojo.lfx.Chain(anims); // dojo.lfx.Combine
}

dojo.provide("dojo.uri.Uri");

dojo.uri = new function() {
	this.dojoUri = function (/*dojo.uri.Uri||String*/uri) {
		// summary: returns a Uri object resolved relative to the dojo root
		return new dojo.uri.Uri(dojo.hostenv.getBaseScriptUri(), uri);
	}
	
	this.moduleUri = function(/*String*/module, /*dojo.uri.Uri||String*/uri){
		// summary: returns a Uri object relative to a (top-level) module
		// description: Examples: dojo.uri.moduleUri("dojo","Editor"), or dojo.uri.moduleUri("acme","someWidget")
		var loc = dojo.hostenv.getModulePrefix(module);
		if(!loc){return null;}
		if(loc.lastIndexOf("/") != loc.length-1){loc += "/";}
		return new dojo.uri.Uri(dojo.hostenv.getBaseScriptUri()+loc,uri);
	}

	this.Uri = function (/*dojo.uri.Uri||String...*/) {
		// summary: Constructor to create an object representing a URI.
		// description: 
		//  Each argument is evaluated in order relative to the next until
		//  a canonical uri is produced. To get an absolute Uri relative
		//  to the current document use
		//      new dojo.uri.Uri(document.baseURI, uri)

		// TODO: support for IPv6, see RFC 2732

		// resolve uri components relative to each other
		var uri = arguments[0];
		for (var i = 1; i < arguments.length; i++) {
			if(!arguments[i]) { continue; }

			// Safari doesn't support this.constructor so we have to be explicit
			var relobj = new dojo.uri.Uri(arguments[i].toString());
			var uriobj = new dojo.uri.Uri(uri.toString());

			if ((relobj.path=="")&&(relobj.scheme==null)&&(relobj.authority==null)&&(relobj.query==null)) {
				if (relobj.fragment != null) { uriobj.fragment = relobj.fragment; }
				relobj = uriobj;
			} else if (relobj.scheme == null) {
				relobj.scheme = uriobj.scheme;
			
				if (relobj.authority == null) {
					relobj.authority = uriobj.authority;
					
					if (relobj.path.charAt(0) != "/") {
						var path = uriobj.path.substring(0,
							uriobj.path.lastIndexOf("/") + 1) + relobj.path;

						var segs = path.split("/");
						for (var j = 0; j < segs.length; j++) {
							if (segs[j] == ".") {
								if (j == segs.length - 1) { segs[j] = ""; }
								else { segs.splice(j, 1); j--; }
							} else if (j > 0 && !(j == 1 && segs[0] == "") &&
								segs[j] == ".." && segs[j-1] != "..") {

								if (j == segs.length - 1) { segs.splice(j, 1); segs[j - 1] = ""; }
								else { segs.splice(j - 1, 2); j -= 2; }
							}
						}
						relobj.path = segs.join("/");
					}
				}
			}

			uri = "";
			if (relobj.scheme != null) { uri += relobj.scheme + ":"; }
			if (relobj.authority != null) { uri += "//" + relobj.authority; }
			uri += relobj.path;
			if (relobj.query != null) { uri += "?" + relobj.query; }
			if (relobj.fragment != null) { uri += "#" + relobj.fragment; }
		}

		this.uri = uri.toString();

		// break the uri into its main components
		var regexp = "^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?$";
	  var r = this.uri.match(new RegExp(regexp));

		this.scheme = r[2] || (r[1] ? "" : null);
		this.authority = r[4] || (r[3] ? "" : null);
		this.path = r[5]; // can never be undefined
		this.query = r[7] || (r[6] ? "" : null);
		this.fragment  = r[9] || (r[8] ? "" : null);
		
		if (this.authority != null) {
			// server based naming authority
			regexp = "^((([^:]+:)?([^@]+))@)?([^:]*)(:([0-9]+))?$";
			r = this.authority.match(new RegExp(regexp));
			
			this.user = r[3] || null;
			this.password = r[4] || null;
			this.host = r[5];
			this.port = r[7] || null;
		}
	
		this.toString = function(){ return this.uri; }
	}
};

dojo.provide("dojo.html.style");

dojo.html.getClass = function(/* HTMLElement */node){
	//	summary
	//	Returns the string value of the list of CSS classes currently assigned directly 
	//	to the node in question. Returns an empty string if no class attribute is found;
	node = dojo.byId(node);
	if(!node){ return ""; }
	var cs = "";
	if(node.className){
		cs = node.className;
	}else if(dojo.html.hasAttribute(node, "class")){
		cs = dojo.html.getAttribute(node, "class");
	}
	return cs.replace(/^\s+|\s+$/g, "");	//	string
}

dojo.html.getClasses = function(/* HTMLElement */node) {
	//	summary
	//	Returns an array of CSS classes currently assigned directly to the node in question. 
	//	Returns an empty array if no classes are found;
	var c = dojo.html.getClass(node);
	return (c == "") ? [] : c.split(/\s+/g);	//	array
}

dojo.html.hasClass = function(/* HTMLElement */node, /* string */classname){
	//	summary
	//	Returns whether or not the specified classname is a portion of the
	//	class list currently applied to the node. Does not cover cascaded
	//	styles, only classes directly applied to the node.
	return (new RegExp('(^|\\s+)'+classname+'(\\s+|$)')).test(dojo.html.getClass(node))	//	boolean
}

dojo.html.prependClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Adds the specified class to the beginning of the class list on the
	//	passed node. This gives the specified class the highest precidence
	//	when style cascading is calculated for the node. Returns true or
	//	false; indicating success or failure of the operation, respectively.
	classStr += " " + dojo.html.getClass(node);
	return dojo.html.setClass(node, classStr);	//	boolean
}

dojo.html.addClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Adds the specified class to the end of the class list on the
	//	passed &node;. Returns &true; or &false; indicating success or failure.
	if (dojo.html.hasClass(node, classStr)) {
	  return false;
	}
	classStr = (dojo.html.getClass(node) + " " + classStr).replace(/^\s+|\s+$/g,"");
	return dojo.html.setClass(node, classStr);	//	boolean
}

dojo.html.setClass = function(/* HTMLElement */node, /* string */classStr){
	//	summary
	//	Clobbers the existing list of classes for the node, replacing it with
	//	the list given in the 2nd argument. Returns true or false
	//	indicating success or failure.
	node = dojo.byId(node);
	var cs = new String(classStr);
	try{
		if(typeof node.className == "string"){
			node.className = cs;
		}else if(node.setAttribute){
			node.setAttribute("class", classStr);
			node.className = cs;
		}else{
			return false;
		}
	}catch(e){
		dojo.debug("dojo.html.setClass() failed", e);
	}
	return true;
}

dojo.html.removeClass = function(/* HTMLElement */node, /* string */classStr, /* boolean? */allowPartialMatches){
	//	summary
	//	Removes the className from the node;. Returns true or false indicating success or failure.
	try{
		if (!allowPartialMatches) {
			var newcs = dojo.html.getClass(node).replace(new RegExp('(^|\\s+)'+classStr+'(\\s+|$)'), "$1$2");
		} else {
			var newcs = dojo.html.getClass(node).replace(classStr,'');
		}
		dojo.html.setClass(node, newcs);
	}catch(e){
		dojo.debug("dojo.html.removeClass() failed", e);
	}
	return true;	//	boolean
}

dojo.html.replaceClass = function(/* HTMLElement */node, /* string */newClass, /* string */oldClass) {
	//	summary
	//	Replaces 'oldClass' and adds 'newClass' to node
	dojo.html.removeClass(node, oldClass);
	dojo.html.addClass(node, newClass);
}

// Enum type for getElementsByClass classMatchType arg:
dojo.html.classMatchType = {
	ContainsAll : 0, // all of the classes are part of the node's class (default)
	ContainsAny : 1, // any of the classes are part of the node's class
	IsOnly : 2 // only all of the classes are part of the node's class
}


dojo.html.getElementsByClass = function(
	/* string */classStr, 
	/* HTMLElement? */parent, 
	/* string? */nodeType, 
	/* integer? */classMatchType, 
	/* boolean? */useNonXpath
){
	//	summary
	//	Returns an array of nodes for the given classStr, children of a
	//	parent, and optionally of a certain nodeType
	// FIXME: temporarily set to false because of several dojo tickets related
	// to the xpath version not working consistently in firefox.
	useNonXpath = false;
	var _document = dojo.doc();
	parent = dojo.byId(parent) || _document;
	var classes = classStr.split(/\s+/g);
	var nodes = [];
	if( classMatchType != 1 && classMatchType != 2 ) classMatchType = 0; // make it enum
	var reClass = new RegExp("(\\s|^)((" + classes.join(")|(") + "))(\\s|$)");
	var srtLength = classes.join(" ").length;
	var candidateNodes = [];
	
	if(!useNonXpath && _document.evaluate) { // supports dom 3 xpath
		var xpath = ".//" + (nodeType || "*") + "[contains(";
		if(classMatchType != dojo.html.classMatchType.ContainsAny){
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ') and contains(concat(' ',@class,' '), ' ") +
			" ')";
			if (classMatchType == 2) {
				xpath += " and string-length(@class)="+srtLength+"]";
			}else{
				xpath += "]";
			}
		}else{
			xpath += "concat(' ',@class,' '), ' " +
			classes.join(" ') or contains(concat(' ',@class,' '), ' ") +
			" ')]";
		}
		var xpathResult = _document.evaluate(xpath, parent, null, XPathResult.ANY_TYPE, null);
		var result = xpathResult.iterateNext();
		while(result){
			try{
				candidateNodes.push(result);
				result = xpathResult.iterateNext();
			}catch(e){ break; }
		}
		return candidateNodes;	//	NodeList
	}else{
		if(!nodeType){
			nodeType = "*";
		}
		candidateNodes = parent.getElementsByTagName(nodeType);

		var node, i = 0;
		outer:
		while(node = candidateNodes[i++]){
			var nodeClasses = dojo.html.getClasses(node);
			if(nodeClasses.length == 0){ continue outer; }
			var matches = 0;
	
			for(var j = 0; j < nodeClasses.length; j++){
				if(reClass.test(nodeClasses[j])){
					if(classMatchType == dojo.html.classMatchType.ContainsAny){
						nodes.push(node);
						continue outer;
					}else{
						matches++;
					}
				}else{
					if(classMatchType == dojo.html.classMatchType.IsOnly){
						continue outer;
					}
				}
			}
	
			if(matches == classes.length){
				if(	(classMatchType == dojo.html.classMatchType.IsOnly)&&
					(matches == nodeClasses.length)){
					nodes.push(node);
				}else if(classMatchType == dojo.html.classMatchType.ContainsAll){
					nodes.push(node);
				}
			}
		}
		return nodes;	//	NodeList
	}
}
dojo.html.getElementsByClassName = dojo.html.getElementsByClass;

dojo.html.toCamelCase = function(/* string */selector){
	//	summary
	//	Translates a CSS selector string to a camel-cased one.
	var arr = selector.split('-'), cc = arr[0];
	for(var i = 1; i < arr.length; i++) {
		cc += arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
	}
	return cc;	//	string
}

dojo.html.toSelectorCase = function(/* string */selector){
	//	summary
	//	Translates a camel cased string to a selector cased one.
	return selector.replace(/([A-Z])/g, "-$1" ).toLowerCase();	//	string
}

dojo.html.getComputedStyle = function(/* HTMLElement */node, /* string */cssSelector, /* integer? */inValue){
	//	summary
	//	Returns the computed style of cssSelector on node.
	node = dojo.byId(node);
	// cssSelector may actually be in camel case, so force selector version
	var cssSelector = dojo.html.toSelectorCase(cssSelector);
	var property = dojo.html.toCamelCase(cssSelector);
	if(!node || !node.style){
		return inValue;			
	} else if (document.defaultView && dojo.html.isDescendantOf(node, node.ownerDocument)){ // W3, gecko, KHTML
		try{
			// mozilla segfaults when margin-* and node is removed from doc
			// FIXME: need to figure out a if there is quicker workaround
			var cs = document.defaultView.getComputedStyle(node, "");
			if(cs){
				return cs.getPropertyValue(cssSelector);	//	integer
			} 
		}catch(e){ // reports are that Safari can throw an exception above
			if(node.style.getPropertyValue){ // W3
				return node.style.getPropertyValue(cssSelector);	//	integer
			} else {
				return inValue;	//	integer
			}
		}
	} else if(node.currentStyle){ // IE
		return node.currentStyle[property];	//	integer
	}
	
	if(node.style.getPropertyValue){ // W3
		return node.style.getPropertyValue(cssSelector);	//	integer
	}else{
		return inValue;	//	integer
	}
}

dojo.html.getStyleProperty = function(/* HTMLElement */node, /* string */cssSelector){
	//	summary
	//	Returns the value of the passed style
	node = dojo.byId(node);
	return (node && node.style ? node.style[dojo.html.toCamelCase(cssSelector)] : undefined);	//	string
}

dojo.html.getStyle = function(/* HTMLElement */node, /* string */cssSelector){
	//	summary
	//	Returns the computed value of the passed style
	var value = dojo.html.getStyleProperty(node, cssSelector);
	return (value ? value : dojo.html.getComputedStyle(node, cssSelector));	//	string || integer
}

dojo.html.setStyle = function(/* HTMLElement */node, /* string */cssSelector, /* string */value){
	//	summary
	//	Set the value of passed style on node
	node = dojo.byId(node);
	if(node && node.style){
		var camelCased = dojo.html.toCamelCase(cssSelector);
		node.style[camelCased] = value;
	}
}

dojo.html.setStyleText = function (/* HTMLElement */target, /* string */text) {
	//	summary
	//	Try to set the entire cssText property of the passed target; equiv of setting style attribute.
	try {
	 	target.style.cssText = text;
	} catch (e) {
		target.setAttribute("style", text);
	}
}

dojo.html.copyStyle = function(/* HTMLElement */target, /* HTMLElement */source){
	//	summary
	// work around for opera which doesn't have cssText, and for IE which fails on setAttribute 
	if(!source.style.cssText){ 
		target.setAttribute("style", source.getAttribute("style")); 
	}else{
		target.style.cssText = source.style.cssText; 
	}
	dojo.html.addClass(target, dojo.html.getClass(source));
}

dojo.html.getUnitValue = function(/* HTMLElement */node, /* string */cssSelector, /* boolean? */autoIsZero){
	//	summary
	//	Get the value of passed selector, with the specific units used
	var s = dojo.html.getComputedStyle(node, cssSelector);
	if((!s)||((s == 'auto')&&(autoIsZero))){ 
		return { value: 0, units: 'px' };	//	object 
	}
	// FIXME: is regex inefficient vs. parseInt or some manual test? 
	var match = s.match(/(\-?[\d.]+)([a-z%]*)/i);
	if (!match){return dojo.html.getUnitValue.bad;}
	return { value: Number(match[1]), units: match[2].toLowerCase() };	//	object
}
dojo.html.getUnitValue.bad = { value: NaN, units: '' };

dojo.html.getPixelValue = function(/* HTMLElement */node, /* string */cssSelector, /* boolean? */autoIsZero){
	//	summary
	//	Get the value of passed selector in pixels.
	var result = dojo.html.getUnitValue(node, cssSelector, autoIsZero);
	// FIXME: there is serious debate as to whether or not this is the right solution
	if(isNaN(result.value)){ 
		return 0; //	integer 
	}	
	// FIXME: code exists for converting other units to px (see Dean Edward's IE7) 
	// but there are cross-browser complexities
	if((result.value)&&(result.units != 'px')){ 
		return NaN;	//	integer 
	}
	return result.value;	//	integer
}

dojo.html.setPositivePixelValue = function(/* HTMLElement */node, /* string */selector, /* integer */value){
	//	summary
	//	Attempt to set the value of selector on node as a positive pixel value.
	if(isNaN(value)){return false;}
	node.style[selector] = Math.max(0, value) + 'px'; 
	return true;	//	boolean
}

dojo.html.styleSheet = null;

// FIXME: this is a really basic stub for adding and removing cssRules, but
// it assumes that you know the index of the cssRule that you want to add 
// or remove, making it less than useful.  So we need something that can 
// search for the selector that you you want to remove.
dojo.html.insertCssRule = function(/* string */selector, /* string */declaration, /* integer? */index) {
	//	summary
	//	Attempt to insert declaration as selector on the internal stylesheet; if index try to set it there.
	if (!dojo.html.styleSheet) {
		if (document.createStyleSheet) { // IE
			dojo.html.styleSheet = document.createStyleSheet();
		} else if (document.styleSheets[0]) { // rest
			// FIXME: should create a new style sheet here
			// fall back on an exsiting style sheet
			dojo.html.styleSheet = document.styleSheets[0];
		} else { 
			return null;	//	integer 
		} // fail
	}

	if (arguments.length < 3) { // index may == 0
		if (dojo.html.styleSheet.cssRules) { // W3
			index = dojo.html.styleSheet.cssRules.length;
		} else if (dojo.html.styleSheet.rules) { // IE
			index = dojo.html.styleSheet.rules.length;
		} else { 
			return null;	//	integer 
		} // fail
	}

	if (dojo.html.styleSheet.insertRule) { // W3
		var rule = selector + " { " + declaration + " }";
		return dojo.html.styleSheet.insertRule(rule, index);	//	integer
	} else if (dojo.html.styleSheet.addRule) { // IE
		return dojo.html.styleSheet.addRule(selector, declaration, index);	//	integer
	} else { 
		return null; // integer
	} // fail
}

dojo.html.removeCssRule = function(/* integer? */index){
	//	summary
	//	Attempt to remove the rule at index.
	if(!dojo.html.styleSheet){
		dojo.debug("no stylesheet defined for removing rules");
		return false;
	}
	if(dojo.render.html.ie){
		if(!index){
			index = dojo.html.styleSheet.rules.length;
			dojo.html.styleSheet.removeRule(index);
		}
	}else if(document.styleSheets[0]){
		if(!index){
			index = dojo.html.styleSheet.cssRules.length;
		}
		dojo.html.styleSheet.deleteRule(index);
	}
	return true;	//	boolean
}

dojo.html._insertedCssFiles = []; // cache container needed because IE reformats cssText when added to DOM
dojo.html.insertCssFile = function(/* string */URI, /* HTMLDocument? */doc, /* boolean? */checkDuplicates, /* boolean */fail_ok){
	//	summary
	// calls css by XmlHTTP and inserts it into DOM as <style [widgetType="widgetType"]> *downloaded cssText*</style>
	if(!URI){ return; }
	if(!doc){ doc = document; }
	var cssStr = dojo.hostenv.getText(URI, false, fail_ok);
  if(cssStr===null){ return; } 
	cssStr = dojo.html.fixPathsInCssText(cssStr, URI);

	if(checkDuplicates){
		var idx = -1, node, ent = dojo.html._insertedCssFiles;
		for(var i = 0; i < ent.length; i++){
			if((ent[i].doc == doc) && (ent[i].cssText == cssStr)){
				idx = i; node = ent[i].nodeRef;
				break;
			}
		}
		// make sure we havent deleted our node
		if(node){
			var styles = doc.getElementsByTagName("style");
			for(var i = 0; i < styles.length; i++){
				if(styles[i] == node){
					return;
				}
			}
			// delete this entry
			dojo.html._insertedCssFiles.shift(idx, 1);
		}
	}

	var style = dojo.html.insertCssText(cssStr);
	dojo.html._insertedCssFiles.push({'doc': doc, 'cssText': cssStr, 'nodeRef': style});

	// insert custom attribute ex dbgHref="../foo.css" usefull when debugging in DOM inspectors, no?
	if(style && djConfig.isDebug){
		style.setAttribute("dbgHref", URI);
	}
	return style;	//	HTMLStyleElement
}

dojo.html.insertCssText = function(/* string */cssStr, /* HTMLDocument? */doc, /* string? */URI){
	//	summary
	//	Attempt to insert CSS rules into the document through inserting a style element
	// DomNode Style  = insertCssText(String ".dojoMenu {color: green;}"[, DomDoc document, dojo.uri.Uri Url ])
	if(!cssStr){ 
		return; //	HTMLStyleElement
	}
	if(!doc){ doc = document; }
	if(URI){// fix paths in cssStr
		cssStr = dojo.html.fixPathsInCssText(cssStr, URI);
	}
	var style = doc.createElement("style");
	style.setAttribute("type", "text/css");
	// IE is b0rken enough to require that we add the element to the doc
	// before changing it's properties
	var head = doc.getElementsByTagName("head")[0];
	if(!head){ // must have a head tag 
		dojo.debug("No head tag in document, aborting styles");
		return;	//	HTMLStyleElement
	}else{
		head.appendChild(style);
	}
	if(style.styleSheet){// IE
		style.styleSheet.cssText = cssStr;
	}else{ // w3c
		var cssText = doc.createTextNode(cssStr);
		style.appendChild(cssText);
	}
	return style;	//	HTMLStyleElement
}

dojo.html.fixPathsInCssText = function(/* string */cssStr, /* string */URI){
	//	summary
	// usage: cssText comes from dojoroot/src/widget/templates/Foobar.css
	// 	it has .dojoFoo { background-image: url(images/bar.png);} then uri should point to dojoroot/src/widget/templates/
	function iefixPathsInCssText() {
		var regexIe = /AlphaImageLoader\(src\=['"]([\t\s\w()\/.\\'"-:#=&?~]*)['"]/;
		while(match = regexIe.exec(cssStr)){
			url = match[1].replace(regexTrim, "$2");
			if(!regexProtocol.exec(url)){
				url = (new dojo.uri.Uri(URI, url).toString());
			}
			str += cssStr.substring(0, match.index) + "AlphaImageLoader(src='" + url + "'";
			cssStr = cssStr.substr(match.index + match[0].length);
		}
		return str + cssStr;
	}

	if(!cssStr || !URI){ return; }
	var match, str = "", url = "";
	var regex = /url\(\s*([\t\s\w()\/.\\'"-:#=&?]+)\s*\)/;
	var regexProtocol = /(file|https?|ftps?):\/\//;
	var regexTrim = /^[\s]*(['"]?)([\w()\/.\\'"-:#=&?]*)\1[\s]*?$/;
	if (dojo.render.html.ie55 || dojo.render.html.ie60) {
		cssStr = iefixPathsInCssText();
	}
	while(match = regex.exec(cssStr)){
		url = match[1].replace(regexTrim, "$2");
		if(!regexProtocol.exec(url)){
			url = (new dojo.uri.Uri(URI, url).toString());
		}
		str += cssStr.substring(0, match.index) + "url(" + url + ")";
		cssStr = cssStr.substr(match.index + match[0].length);
	}
	return str + cssStr;	//	string
}

dojo.html.setActiveStyleSheet = function(/* string */title){
	//	summary
	//	Activate style sheet with specified title.
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1 && a.getAttribute("title")){
			a.disabled = true;
			if (a.getAttribute("title") == title) { a.disabled = false; }
		}
	}
}

dojo.html.getActiveStyleSheet = function(){
	//	summary
	//	return the title of the currently active stylesheet
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if (a.getAttribute("rel").indexOf("style") != -1 
			&& a.getAttribute("title") 
			&& !a.disabled
		){
			return a.getAttribute("title");	//	string 
		}
	}
	return null;	//	string
}

dojo.html.getPreferredStyleSheet = function(){
	//	summary
	//	Return the preferred stylesheet title (i.e. link without alt attribute)
	var i = 0, a, els = dojo.doc().getElementsByTagName("link");
	while (a = els[i++]) {
		if(a.getAttribute("rel").indexOf("style") != -1
			&& a.getAttribute("rel").indexOf("alt") == -1
			&& a.getAttribute("title")
		){ 
			return a.getAttribute("title"); 	//	string
		}
	}
	return null;	//	string
}

dojo.html.applyBrowserClass = function(/* HTMLElement */node){
	//	summary
	//	Applies pre-set class names based on browser & version to the passed node.
	//	Modified version of Morris' CSS hack.
	var drh=dojo.render.html;
	var classes = {
		dj_ie: drh.ie,
		dj_ie55: drh.ie55,
		dj_ie6: drh.ie60,
		dj_ie7: drh.ie70,
		dj_iequirks: drh.ie && drh.quirks,
		dj_opera: drh.opera,
		dj_opera8: drh.opera && (Math.floor(dojo.render.version)==8),
		dj_opera9: drh.opera && (Math.floor(dojo.render.version)==9),
		dj_khtml: drh.khtml,
		dj_safari: drh.safari,
		dj_gecko: drh.mozilla
	}; // no dojo unsupported browsers
	for(var p in classes){
		if(classes[p]){
			dojo.html.addClass(node, p);
		}
	}
};

dojo.provide("dojo.html.display");

dojo.html._toggle = function(node, tester, setter){
	node = dojo.byId(node);
	setter(node, !tester(node));
	return tester(node);
}

dojo.html.show = function(/* HTMLElement */node){
	//	summary
	//	Show the passed element by reverting display property set by dojo.html.hide
	node = dojo.byId(node);
	if(dojo.html.getStyleProperty(node, 'display')=='none'){
		dojo.html.setStyle(node, 'display', (node.dojoDisplayCache||''));
		node.dojoDisplayCache = undefined;	// cannot use delete on a node in IE6
	}
}

dojo.html.hide = function(/* HTMLElement */node){
	//	summary
	//	Hide the passed element by setting display:none
	node = dojo.byId(node);
	if(typeof node["dojoDisplayCache"] == "undefined"){ // it could == '', so we cannot say !node.dojoDisplayCount
		var d = dojo.html.getStyleProperty(node, 'display')
		if(d!='none'){
			node.dojoDisplayCache = d;
		}
	}
	dojo.html.setStyle(node, 'display', 'none');
}

dojo.html.setShowing = function(/* HTMLElement */node, /* boolean? */showing){
	//	summary
	// Calls show() if showing is true, hide() otherwise
	dojo.html[(showing ? 'show' : 'hide')](node);
}

dojo.html.isShowing = function(/* HTMLElement */node){
	//	summary
	//	Returns whether the element is displayed or not.
	// FIXME: returns true if node is bad, isHidden would be easier to make correct
	return (dojo.html.getStyleProperty(node, 'display') != 'none');	//	boolean
}

dojo.html.toggleShowing = function(/* HTMLElement */node){
	//	summary
	// Call setShowing() on node with the complement of isShowing(), then return the new value of isShowing()
	return dojo.html._toggle(node, dojo.html.isShowing, dojo.html.setShowing);	//	boolean
}

// Simple mapping of tag names to display values
// FIXME: simplistic 
dojo.html.displayMap = { tr: '', td: '', th: '', img: 'inline', span: 'inline', input: 'inline', button: 'inline' };

dojo.html.suggestDisplayByTagName = function(/* HTMLElement */node){
	//	summary
	// Suggest a value for the display property that will show 'node' based on it's tag
	node = dojo.byId(node);
	if(node && node.tagName){
		var tag = node.tagName.toLowerCase();
		return (tag in dojo.html.displayMap ? dojo.html.displayMap[tag] : 'block');	//	string
	}
}

dojo.html.setDisplay = function(/* HTMLElement */node, /* string */display){
	//	summary
	// 	Sets the value of style.display to value of 'display' parameter if it is a string.
	// 	Otherwise, if 'display' is false, set style.display to 'none'.
	// 	Finally, set 'display' to a suggested display value based on the node's tag
	dojo.html.setStyle(node, 'display', ((display instanceof String || typeof display == "string") ? display : (display ? dojo.html.suggestDisplayByTagName(node) : 'none')));
}

dojo.html.isDisplayed = function(/* HTMLElement */node){
	//	summary
	// 	Is true if the the computed display style for node is not 'none'
	// 	FIXME: returns true if node is bad, isNotDisplayed would be easier to make correct
	return (dojo.html.getComputedStyle(node, 'display') != 'none');	//	boolean
}

dojo.html.toggleDisplay = function(/* HTMLElement */node){
	//	summary
	// 	Call setDisplay() on node with the complement of isDisplayed(), then
	// 	return the new value of isDisplayed()
	return dojo.html._toggle(node, dojo.html.isDisplayed, dojo.html.setDisplay);	//	boolean
}

dojo.html.setVisibility = function(/* HTMLElement */node, /* string */visibility){
	//	summary
	// 	Sets the value of style.visibility to value of 'visibility' parameter if it is a string.
	// 	Otherwise, if 'visibility' is false, set style.visibility to 'hidden'. Finally, set style.visibility to 'visible'.
	dojo.html.setStyle(node, 'visibility', ((visibility instanceof String || typeof visibility == "string") ? visibility : (visibility ? 'visible' : 'hidden')));
}

dojo.html.isVisible = function(/* HTMLElement */node){
	//	summary
	// 	Returns true if the the computed visibility style for node is not 'hidden'
	// 	FIXME: returns true if node is bad, isInvisible would be easier to make correct
	return (dojo.html.getComputedStyle(node, 'visibility') != 'hidden');	//	boolean
}

dojo.html.toggleVisibility = function(node){
	//	summary
	// Call setVisibility() on node with the complement of isVisible(), then return the new value of isVisible()
	return dojo.html._toggle(node, dojo.html.isVisible, dojo.html.setVisibility);	//	boolean
}

dojo.html.setOpacity = function(/* HTMLElement */node, /* float */opacity, /* boolean? */dontFixOpacity){
	//	summary
	//	Sets the opacity of node in a cross-browser way.
	//	float between 0.0 (transparent) and 1.0 (opaque)
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(!dontFixOpacity){
		if( opacity >= 1.0){
			if(h.ie){
				dojo.html.clearOpacity(node);
				return;
			}else{
				opacity = 0.999999;
			}
		}else if( opacity < 0.0){ opacity = 0; }
	}
	if(h.ie){
		if(node.nodeName.toLowerCase() == "tr"){
			// FIXME: is this too naive? will we get more than we want?
			var tds = node.getElementsByTagName("td");
			for(var x=0; x<tds.length; x++){
				tds[x].style.filter = "Alpha(Opacity="+opacity*100+")";
			}
		}
		node.style.filter = "Alpha(Opacity="+opacity*100+")";
	}else if(h.moz){
		node.style.opacity = opacity; // ffox 1.0 directly supports "opacity"
		node.style.MozOpacity = opacity;
	}else if(h.safari){
		node.style.opacity = opacity; // 1.3 directly supports "opacity"
		node.style.KhtmlOpacity = opacity;
	}else{
		node.style.opacity = opacity;
	}
}

dojo.html.clearOpacity = function(/* HTMLElement */node){
	//	summary
	//	Clears any opacity setting on the passed element.
	node = dojo.byId(node);
	var ns = node.style;
	var h = dojo.render.html;
	if(h.ie){
		try {
			if( node.filters && node.filters.alpha ){
				ns.filter = ""; // FIXME: may get rid of other filter effects
			}
		} catch(e) {
			/*
			 * IE7 gives error if node.filters not set;
			 * don't know why or how to workaround (other than this)
			 */
		}
	}else if(h.moz){
		ns.opacity = 1;
		ns.MozOpacity = 1;
	}else if(h.safari){
		ns.opacity = 1;
		ns.KhtmlOpacity = 1;
	}else{
		ns.opacity = 1;
	}
}

dojo.html.getOpacity = function(/* HTMLElement */node){
	//	summary
	//	Returns the opacity of the passed element
	node = dojo.byId(node);
	var h = dojo.render.html;
	if(h.ie){
		var opac = (node.filters && node.filters.alpha &&
			typeof node.filters.alpha.opacity == "number"
			? node.filters.alpha.opacity : 100) / 100;
	}else{
		var opac = node.style.opacity || node.style.MozOpacity ||
			node.style.KhtmlOpacity || 1;
	}
	return opac >= 0.999999 ? 1.0 : Number(opac);	//	float
}

dojo.provide("dojo.html.color");


dojo.html.getBackgroundColor = function(/* HTMLElement */node){
	//	summary
	//	returns the background color of the passed node as a 32-bit color (RGBA)
	node = dojo.byId(node);
	var color;
	do{
		color = dojo.html.getStyle(node, "background-color");
		// Safari doesn't say "transparent"
		if(color.toLowerCase() == "rgba(0, 0, 0, 0)") { color = "transparent"; }
		if(node == document.getElementsByTagName("body")[0]) { node = null; break; }
		node = node.parentNode;
	}while(node && dojo.lang.inArray(["transparent", ""], color));
	if(color == "transparent"){
		color = [255, 255, 255, 0];
	}else{
		color = dojo.gfx.color.extractRGB(color);
	}
	return color;	//	array
}

dojo.provide("dojo.html.common");

dojo.lang.mixin(dojo.html, dojo.dom);

dojo.html.body = function(){
	dojo.deprecated("dojo.html.body() moved to dojo.body()", "0.5");
	return dojo.body();
}

// FIXME: we are going to assume that we can throw any and every rendering
// engine into the IE 5.x box model. In Mozilla, we do this w/ CSS.
// Need to investigate for KHTML and Opera

dojo.html.getEventTarget = function(/* DOMEvent */evt){
	//	summary
	//	Returns the target of an event
	if(!evt) { evt = dojo.global().event || {} };
	var t = (evt.srcElement ? evt.srcElement : (evt.target ? evt.target : null));
	while((t)&&(t.nodeType!=1)){ t = t.parentNode; }
	return t;	//	HTMLElement
}

dojo.html.getViewport = function(){
	//	summary
	//	Returns the dimensions of the viewable area of a browser window
	var _window = dojo.global();
	var _document = dojo.doc();
	var w = 0;
	var h = 0;

	if(dojo.render.html.mozilla){
		// mozilla
		w = _document.documentElement.clientWidth;
		h = _window.innerHeight;
	}else if(!dojo.render.html.opera && _window.innerWidth){
		//in opera9, dojo.body().clientWidth should be used, instead
		//of window.innerWidth/document.documentElement.clientWidth
		//so we have to check whether it is opera
		w = _window.innerWidth;
		h = _window.innerHeight;
	} else if (!dojo.render.html.opera && dojo.exists(_document, "documentElement.clientWidth")){
		// IE6 Strict
		var w2 = _document.documentElement.clientWidth;
		// this lets us account for scrollbars
		if(!w || w2 && w2 < w) {
			w = w2;
		}
		h = _document.documentElement.clientHeight;
	} else if (dojo.body().clientWidth){
		// IE, Opera
		w = dojo.body().clientWidth;
		h = dojo.body().clientHeight;
	}
	return { width: w, height: h };	//	object
}

dojo.html.getScroll = function(){
	//	summary
	//	Returns the scroll position of the document
	var _window = dojo.global();
	var _document = dojo.doc();
	var top = _window.pageYOffset || _document.documentElement.scrollTop || dojo.body().scrollTop || 0;
	var left = _window.pageXOffset || _document.documentElement.scrollLeft || dojo.body().scrollLeft || 0;
	return { 
		top: top, 
		left: left, 
		offset:{ x: left, y: top }	//	note the change, NOT an Array with added properties. 
	};	//	object
}

dojo.html.getParentByType = function(/* HTMLElement */node, /* string */type) {
	//	summary
	//	Returns the first ancestor of node with tagName type.
	var _document = dojo.doc();
	var parent = dojo.byId(node);
	type = type.toLowerCase();
	while((parent)&&(parent.nodeName.toLowerCase()!=type)){
		if(parent==(_document["body"]||_document["documentElement"])){
			return null;
		}
		parent = parent.parentNode;
	}
	return parent;	//	HTMLElement
}

dojo.html.getAttribute = function(/* HTMLElement */node, /* string */attr){
	//	summary
	//	Returns the value of attribute attr from node.
	node = dojo.byId(node);
	// FIXME: need to add support for attr-specific accessors
	if((!node)||(!node.getAttribute)){
		// if(attr !== 'nwType'){
		//	alert("getAttr of '" + attr + "' with bad node"); 
		// }
		return null;
	}
	var ta = typeof attr == 'string' ? attr : new String(attr);

	// first try the approach most likely to succeed
	var v = node.getAttribute(ta.toUpperCase());
	if((v)&&(typeof v == 'string')&&(v!="")){ 
		return v;	//	string 
	}

	// try returning the attributes value, if we couldn't get it as a string
	if(v && v.value){ 
		return v.value;	//	string 
	}

	// this should work on Opera 7, but it's a little on the crashy side
	if((node.getAttributeNode)&&(node.getAttributeNode(ta))){
		return (node.getAttributeNode(ta)).value;	//	string
	}else if(node.getAttribute(ta)){
		return node.getAttribute(ta);	//	string
	}else if(node.getAttribute(ta.toLowerCase())){
		return node.getAttribute(ta.toLowerCase());	//	string
	}
	return null;	//	string
}
	
dojo.html.hasAttribute = function(/* HTMLElement */node, /* string */attr){
	//	summary
	//	Determines whether or not the specified node carries a value for the attribute in question.
	return dojo.html.getAttribute(dojo.byId(node), attr) ? true : false;	//	boolean
}
	
dojo.html.getCursorPosition = function(/* DOMEvent */e){
	//	summary
	//	Returns the mouse position relative to the document (not the viewport).
	//	For example, if you have a document that is 10000px tall,
	//	but your browser window is only 100px tall,
	//	if you scroll to the bottom of the document and call this function it
	//	will return {x: 0, y: 10000}
	//	NOTE: for events delivered via dojo.event.connect() and/or dojoAttachEvent (for widgets),
	//	you can just access evt.pageX and evt.pageY, rather than calling this function.
	e = e || dojo.global().event;
	var cursor = {x:0, y:0};
	if(e.pageX || e.pageY){
		cursor.x = e.pageX;
		cursor.y = e.pageY;
	}else{
		var de = dojo.doc().documentElement;
		var db = dojo.body();
		cursor.x = e.clientX + ((de||db)["scrollLeft"]) - ((de||db)["clientLeft"]);
		cursor.y = e.clientY + ((de||db)["scrollTop"]) - ((de||db)["clientTop"]);
	}
	return cursor;	//	object
}

dojo.html.isTag = function(/* HTMLElement */node) {
	//	summary
	//	Like dojo.dom.isTag, except case-insensitive
	node = dojo.byId(node);
	if(node && node.tagName) {
		for (var i=1; i<arguments.length; i++){
			if (node.tagName.toLowerCase()==String(arguments[i]).toLowerCase()){
				return String(arguments[i]).toLowerCase();	//	string
			}
		}
	}
	return "";	//	string
}

//define dojo.html.createExternalElement for IE to workaround the annoying activation "feature" in new IE
//details: http://msdn.microsoft.com/library/default.asp?url=/workshop/author/dhtml/overview/activating_activex.asp
if(dojo.render.html.ie && !dojo.render.html.ie70){
	//only define createExternalElement for IE in none https to avoid "mixed content" warning dialog
	if(window.location.href.substr(0,6).toLowerCase() != "https:"){
		(function(){
			// FIXME: this seems not to work correctly on IE 7!!

			//The trick is to define a function in a script.src property:
			// <script src="javascript:'function createExternalElement(){...}'"></script>,
			//which will be treated as an external javascript file in IE
			var xscript = dojo.doc().createElement('script');
			xscript.src = "javascript:'dojo.html.createExternalElement=function(doc, tag){ return doc.createElement(tag); }'";
			dojo.doc().getElementsByTagName("head")[0].appendChild(xscript);
		})();
	}
}else{
	//for other browsers, simply use document.createElement
	//is enough
	dojo.html.createExternalElement = function(/* HTMLDocument */doc, /* string */tag){
		//	summary
		//	Creates an element in the HTML document, here for ActiveX activation workaround.
		return doc.createElement(tag);	//	HTMLElement
	}
}

dojo.html._callDeprecated = function(inFunc, replFunc, args, argName, retValue){
	dojo.deprecated("dojo.html." + inFunc,
					"replaced by dojo.html." + replFunc + "(" + (argName ? "node, {"+ argName + ": " + argName + "}" : "" ) + ")" + (retValue ? "." + retValue : ""), "0.5");
	var newArgs = [];
	if(argName){ var argsIn = {}; argsIn[argName] = args[1]; newArgs.push(args[0]); newArgs.push(argsIn); }
	else { newArgs = args }
	var ret = dojo.html[replFunc].apply(dojo.html, args);
	if(retValue){ return ret[retValue]; }
	else { return ret; }
}

dojo.html.getViewportWidth = function(){
	return dojo.html._callDeprecated("getViewportWidth", "getViewport", arguments, null, "width");
}
dojo.html.getViewportHeight = function(){
	return dojo.html._callDeprecated("getViewportHeight", "getViewport", arguments, null, "height");
}
dojo.html.getViewportSize = function(){
	return dojo.html._callDeprecated("getViewportSize", "getViewport", arguments);
}
dojo.html.getScrollTop = function(){
	return dojo.html._callDeprecated("getScrollTop", "getScroll", arguments, null, "top");
}
dojo.html.getScrollLeft = function(){
	return dojo.html._callDeprecated("getScrollLeft", "getScroll", arguments, null, "left");
}
dojo.html.getScrollOffset = function(){
	return dojo.html._callDeprecated("getScrollOffset", "getScroll", arguments, null, "offset");
}

dojo.provide("dojo.html.layout");


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

dojo.provide("dojo.lfx.html");


dojo.lfx.html._byId = function(nodes){
	if(!nodes){ return []; }
	if(dojo.lang.isArrayLike(nodes)){
		if(!nodes.alreadyChecked){
			var n = [];
			dojo.lang.forEach(nodes, function(node){
				n.push(dojo.byId(node));
			});
			n.alreadyChecked = true;
			return n;
		}else{
			return nodes;
		}
	}else{
		var n = [];
		n.push(dojo.byId(nodes));
		n.alreadyChecked = true;
		return n;
	}
}

dojo.lfx.html.propertyAnimation = function(	/*DOMNode[]*/ nodes, 
											/*Object[]*/ propertyMap, 
											/*int*/ duration,
											/*function*/ easing,
											/*Object*/ handlers){
	// summary: Returns an animation that will transition the properties of "nodes"
	//			depending how they are defined in "propertyMap".
	// nodes: An array of DOMNodes or one DOMNode.
	// propertyMap: { property: String, start: Decimal?, end: Decimal?, units: String? }
	//				An array of objects defining properties to change.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// handlers: { handler: Function?, onstart: Function?, onstop: Function?, onanimate: Function? }
	nodes = dojo.lfx.html._byId(nodes);

	var targs = {
		"propertyMap": propertyMap,
		"nodes": nodes,
		"duration": duration,
		"easing": easing||dojo.lfx.easeDefault
	};
	
	var setEmUp = function(args){
		if(args.nodes.length==1){
			// FIXME: we're only supporting start-value filling when one node is
			// passed
			
			var pm = args.propertyMap;
			if(!dojo.lang.isArray(args.propertyMap)){
				// it's stupid to have to pack an array with a set of objects
				// when you can just pass in an object list
				var parr = [];
				for(var pname in pm){
					pm[pname].property = pname;
					parr.push(pm[pname]);
				}
				pm = args.propertyMap = parr;
			}
			dojo.lang.forEach(pm, function(prop){
				if(dj_undef("start", prop)){
					if(prop.property != "opacity"){
						prop.start = parseInt(dojo.html.getComputedStyle(args.nodes[0], prop.property));
					}else{
						prop.start = dojo.html.getOpacity(args.nodes[0]);
					}
				}
			});
		}
	}

	var coordsAsInts = function(coords){
		var cints = [];
		dojo.lang.forEach(coords, function(c){ 
			cints.push(Math.round(c));
		});
		return cints;
	}

	var setStyle = function(n, style){
		n = dojo.byId(n);
		if(!n || !n.style){ return; }
		for(var s in style){
			if(s == "opacity"){
				dojo.html.setOpacity(n, style[s]);
			}else{
				n.style[s] = style[s];
			}
		}
	}

	var propLine = function(properties){
		this._properties = properties;
		this.diffs = new Array(properties.length);
		dojo.lang.forEach(properties, function(prop, i){
			// calculate the end - start to optimize a bit
			if(dojo.lang.isFunction(prop.start)){
				prop.start = prop.start(prop, i);
			}
			if(dojo.lang.isFunction(prop.end)){
				prop.end = prop.end(prop, i);
			}
			if(dojo.lang.isArray(prop.start)){
				// don't loop through the arrays
				this.diffs[i] = null;
			}else if(prop.start instanceof dojo.gfx.color.Color){
				// save these so we don't have to call toRgb() every getValue() call
				prop.startRgb = prop.start.toRgb();
				prop.endRgb = prop.end.toRgb();
			}else{
				this.diffs[i] = prop.end - prop.start;
			}
		}, this);

		this.getValue = function(n){
			var ret = {};
			dojo.lang.forEach(this._properties, function(prop, i){
				var value = null;
				if(dojo.lang.isArray(prop.start)){
					// FIXME: what to do here?
				}else if(prop.start instanceof dojo.gfx.color.Color){
					value = (prop.units||"rgb") + "(";
					for(var j = 0 ; j < prop.startRgb.length ; j++){
						value += Math.round(((prop.endRgb[j] - prop.startRgb[j]) * n) + prop.startRgb[j]) + (j < prop.startRgb.length - 1 ? "," : "");
					}
					value += ")";
				}else{
					value = ((this.diffs[i]) * n) + prop.start + (prop.property != "opacity" ? prop.units||"px" : "");
				}
				ret[dojo.html.toCamelCase(prop.property)] = value;
			}, this);
			return ret;
		}
	}
	
	var anim = new dojo.lfx.Animation({
			beforeBegin: function(){ 
				setEmUp(targs); 
				anim.curve = new propLine(targs.propertyMap);
			},
			onAnimate: function(propValues){
				dojo.lang.forEach(targs.nodes, function(node){
					setStyle(node, propValues);
				});
			}
		},
		targs.duration, 
		null,
		targs.easing
	);
	if(handlers){
		for(var x in handlers){
			if(dojo.lang.isFunction(handlers[x])){
				anim.connect(x, anim, handlers[x]);
			}
		}
	}
	
	return anim; // dojo.lfx.Animation
}

dojo.lfx.html._makeFadeable = function(nodes){
	var makeFade = function(node){
		if(dojo.render.html.ie){
			// only set the zoom if the "tickle" value would be the same as the
			// default
			if( (node.style.zoom.length == 0) &&
				(dojo.html.getStyle(node, "zoom") == "normal") ){
				// make sure the node "hasLayout"
				// NOTE: this has been tested with larger and smaller user-set text
				// sizes and works fine
				node.style.zoom = "1";
				// node.style.zoom = "normal";
			}
			// don't set the width to auto if it didn't already cascade that way.
			// We don't want to f anyones designs
			if(	(node.style.width.length == 0) &&
				(dojo.html.getStyle(node, "width") == "auto") ){
				node.style.width = "auto";
			}
		}
	}
	if(dojo.lang.isArrayLike(nodes)){
		dojo.lang.forEach(nodes, makeFade);
	}else{
		makeFade(nodes);
	}
}

dojo.lfx.html.fade = function(/*DOMNode[]*/ nodes,
							  /*Object*/values,
							  /*int?*/ duration,
							  /*Function?*/ easing,
							  /*Function?*/ callback){
	// summary:Returns an animation that will fade the "nodes" from the start to end values passed.
	// nodes: An array of DOMNodes or one DOMNode.
	// values: { start: Decimal?, end: Decimal? }
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var props = { property: "opacity" };
	if(!dj_undef("start", values)){
		props.start = values.start;
	}else{
		props.start = function(){ return dojo.html.getOpacity(nodes[0]); };
	}

	if(!dj_undef("end", values)){
		props.end = values.end;
	}else{
		dojo.raise("dojo.lfx.html.fade needs an end value");
	}

	var anim = dojo.lfx.propertyAnimation(nodes, [ props ], duration, easing);
	anim.connect("beforeBegin", function(){
		dojo.lfx.html._makeFadeable(nodes);
	});
	if(callback){
		anim.connect("onEnd", function(){ callback(nodes, anim); });
	}

	return anim; // dojo.lfx.Animation
}

dojo.lfx.html.fadeIn = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will fade "nodes" from its current opacity to fully opaque.
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	return dojo.lfx.html.fade(nodes, { end: 1 }, duration, easing, callback); // dojo.lfx.Animation
}

dojo.lfx.html.fadeOut = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will fade "nodes" from its current opacity to fully transparent.
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.	
	return dojo.lfx.html.fade(nodes, { end: 0 }, duration, easing, callback); // dojo.lfx.Animation
}

dojo.lfx.html.fadeShow = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will fade "nodes" from transparent to opaque and shows
	//			"nodes" at the end if it is hidden.
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.	
	nodes=dojo.lfx.html._byId(nodes);
	dojo.lang.forEach(nodes, function(node){
		dojo.html.setOpacity(node, 0.0);
	});

	var anim = dojo.lfx.html.fadeIn(nodes, duration, easing, callback);
	anim.connect("beforeBegin", function(){ 
		if(dojo.lang.isArrayLike(nodes)){
			dojo.lang.forEach(nodes, dojo.html.show);
		}else{
			dojo.html.show(nodes);
		}
	});

	return anim; // dojo.lfx.Animation
}

dojo.lfx.html.fadeHide = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will fade "nodes" from its current opacity to opaque and hides
	//			"nodes" at the end.
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	var anim = dojo.lfx.html.fadeOut(nodes, duration, easing, function(){
		if(dojo.lang.isArrayLike(nodes)){
			dojo.lang.forEach(nodes, dojo.html.hide);
		}else{
			dojo.html.hide(nodes);
		}
		if(callback){ callback(nodes, anim); }
	});
	
	return anim; // dojo.lfx.Animation
}

dojo.lfx.html.wipeIn = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will show and wipe in "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var oprop = {  };	// old properties of node (before we mucked w/them)
		
		// get node height, either it's natural height or it's height specified via style or class attributes
		// (for FF, the node has to be (temporarily) rendered to measure height)
		dojo.html.show(node);
		var height = dojo.html.getBorderBox(node).height;
		dojo.html.hide(node);

		var anim = dojo.lfx.propertyAnimation(node,
			{	"height": {
					start: 1, // 0 causes IE to display the whole panel
					end: function(){ return height; } 
				}
			}, 
			duration, 
			easing);
	
		anim.connect("beforeBegin", function(){
			oprop.overflow = node.style.overflow;
			oprop.height = node.style.height;
			with(node.style){
				overflow = "hidden";
				height = "1px"; // 0 causes IE to display the whole panel
			}
			dojo.html.show(node);
		});
		
		anim.connect("onEnd", function(){ 
			with(node.style){
				overflow = oprop.overflow;
				height = oprop.height;
			}
			if(callback){ callback(node, anim); }
		});
		anims.push(anim);
	});
	
	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lfx.html.wipeOut = function(/*DOMNode[]*/ nodes, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will wipe out and hide "nodes".
	// nodes: An array of DOMNodes or one DOMNode.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];
	
	dojo.lang.forEach(nodes, function(node){
		var oprop = {  };	// old properties of node (before we mucked w/them)
		var anim = dojo.lfx.propertyAnimation(node,
			{	"height": {
					start: function(){ return dojo.html.getContentBox(node).height; },
					end: 1 // 0 causes IE to display the whole panel
				} 
			},
			duration,
			easing,
			{
				"beforeBegin": function(){
					oprop.overflow = node.style.overflow;
					oprop.height = node.style.height;
					with(node.style){
						overflow = "hidden";
					}
					dojo.html.show(node);
				},
				
				"onEnd": function(){ 
					dojo.html.hide(node);
					with(node.style){
						overflow = oprop.overflow;
						height = oprop.height;
					}
					if(callback){ callback(node, anim); }
				}
			}
		);
		anims.push(anim);
	});

	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lfx.html.slideTo = function(/*DOMNode*/ nodes,
								 /*Object*/ coords,
								 /*int?*/ duration,
								 /*Function?*/ easing,
								 /*Function?*/ callback){
	// summary: Returns an animation that will slide "nodes" from its current position to
	//			the position defined in "coords".
	// nodes: An array of DOMNodes or one DOMNode.
	// coords: { top: Decimal?, left: Decimal? }
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];
	var compute = dojo.html.getComputedStyle;
	
	if(dojo.lang.isArray(coords)){
		/* coords: Array
		   pId: a */
		dojo.deprecated('dojo.lfx.html.slideTo(node, array)', 'use dojo.lfx.html.slideTo(node, {top: value, left: value});', '0.5');
		coords = { top: coords[0], left: coords[1] };
	}
	dojo.lang.forEach(nodes, function(node){
		var top = null;
		var left = null;
		
		var init = (function(){
			var innerNode = node;
			return function(){
				var pos = compute(innerNode, 'position');
				top = (pos == 'absolute' ? node.offsetTop : parseInt(compute(node, 'top')) || 0);
				left = (pos == 'absolute' ? node.offsetLeft : parseInt(compute(node, 'left')) || 0);

				if (!dojo.lang.inArray(['absolute', 'relative'], pos)) {
					var ret = dojo.html.abs(innerNode, true);
					dojo.html.setStyleAttributes(innerNode, "position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
					top = ret.y;
					left = ret.x;
				}
			}
		})();
		init();
		
		var anim = dojo.lfx.propertyAnimation(node,
			{	"top": { start: top, end: (coords.top||0) },
				"left": { start: left, end: (coords.left||0)  }
			},
			duration,
			easing,
			{ "beforeBegin": init }
		);

		if(callback){
			anim.connect("onEnd", function(){ callback(nodes, anim); });
		}

		anims.push(anim);
	});
	
	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lfx.html.slideBy = function(/*DOMNode*/ nodes, /*Object*/ coords, /*int?*/ duration, /*Function?*/ easing, /*Function?*/ callback){
	// summary: Returns an animation that will slide "nodes" from its current position
	//			to its current position plus the numbers defined in "coords".
	// nodes: An array of DOMNodes or one DOMNode.
	// coords: { top: Decimal?, left: Decimal? }
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];
	var compute = dojo.html.getComputedStyle;

	if(dojo.lang.isArray(coords)){
		/* coords: Array
		   pId: a */
		dojo.deprecated('dojo.lfx.html.slideBy(node, array)', 'use dojo.lfx.html.slideBy(node, {top: value, left: value});', '0.5');
		coords = { top: coords[0], left: coords[1] };
	}

	dojo.lang.forEach(nodes, function(node){
		var top = null;
		var left = null;
		
		var init = (function(){
			var innerNode = node;
			return function(){
				var pos = compute(innerNode, 'position');
				top = (pos == 'absolute' ? node.offsetTop : parseInt(compute(node, 'top')) || 0);
				left = (pos == 'absolute' ? node.offsetLeft : parseInt(compute(node, 'left')) || 0);

				if (!dojo.lang.inArray(['absolute', 'relative'], pos)) {
					var ret = dojo.html.abs(innerNode, true);
					dojo.html.setStyleAttributes(innerNode, "position:absolute;top:"+ret.y+"px;left:"+ret.x+"px;");
					top = ret.y;
					left = ret.x;
				}
			}
		})();
		init();
		
		var anim = dojo.lfx.propertyAnimation(node,
			{
				"top": { start: top, end: top+(coords.top||0) },
				"left": { start: left, end: left+(coords.left||0) }
			},
			duration,
			easing).connect("beforeBegin", init);

		if(callback){
			anim.connect("onEnd", function(){ callback(nodes, anim); });
		}

		anims.push(anim);
	});

	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lfx.html.explode = function(/*DOMNode*/ start,
								 /*DOMNode*/ endNode,
								 /*int?*/ duration,
								 /*Function?*/ easing,
								 /*Function?*/ callback){
	// summary: Returns an animation that will 
	// start:
	// endNode:
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	var h = dojo.html;
	start = dojo.byId(start);
	endNode = dojo.byId(endNode);
	var startCoords = h.toCoordinateObject(start, true);
	var outline = document.createElement("div");
	h.copyStyle(outline, endNode);
	if (endNode.explodeClassName) { outline.className = endNode.explodeClassName; }
	with(outline.style){
		position = "absolute";
		display = "none";
		// border = "1px solid black";
	}
	dojo.body().appendChild(outline);

	with(endNode.style){
		visibility = "hidden";
		display = "block";
	}
	var endCoords = h.toCoordinateObject(endNode, true);
	with(endNode.style){
		display = "none";
		visibility = "visible";
	}

	var props = { opacity: { start: 0.5, end: 1.0 } };
	dojo.lang.forEach(["height", "width", "top", "left"], function(type){
		props[type] = { start: startCoords[type], end: endCoords[type] }
	});
	
	var anim = new dojo.lfx.propertyAnimation(outline, 
		props,
		duration,
		easing,
		{
			"beforeBegin": function(){
				h.setDisplay(outline, "block");
			},
			"onEnd": function(){
				h.setDisplay(endNode, "block");
				outline.parentNode.removeChild(outline);
			}
		}
	);

	if(callback){
		anim.connect("onEnd", function(){ callback(endNode, anim); });
	}
	return anim; // dojo.lfx.Animation
}

dojo.lfx.html.implode = function(/*DOMNode*/ startNode,
								 /*DOMNode*/ end,
								 /*int?*/ duration,
								 /*Function?*/ easing,
								 /*Function?*/ callback){
	// summary: Returns an animation that will 
	// startNode:
	// end:
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	var h = dojo.html;
	startNode = dojo.byId(startNode);
	end = dojo.byId(end);
	var startCoords = dojo.html.toCoordinateObject(startNode, true);
	var endCoords = dojo.html.toCoordinateObject(end, true);

	var outline = document.createElement("div");
	dojo.html.copyStyle(outline, startNode);
	if (startNode.explodeClassName) { outline.className = startNode.explodeClassName; }
	dojo.html.setOpacity(outline, 0.3);
	with(outline.style){
		position = "absolute";
		display = "none";
		backgroundColor = h.getStyle(startNode, "background-color").toLowerCase();
	}
	dojo.body().appendChild(outline);

	var props = { opacity: { start: 1.0, end: 0.5 } };
	dojo.lang.forEach(["height", "width", "top", "left"], function(type){
		props[type] = { start: startCoords[type], end: endCoords[type] }
	});
	
	var anim = new dojo.lfx.propertyAnimation(outline,
		props,
		duration,
		easing,
		{
			"beforeBegin": function(){
				dojo.html.hide(startNode);
				dojo.html.show(outline);
			},
			"onEnd": function(){
				outline.parentNode.removeChild(outline);
			}
		}
	);

	if(callback){
		anim.connect("onEnd", function(){ callback(startNode, anim); });
	}
	return anim; // dojo.lfx.Animation
}

dojo.lfx.html.highlight = function(/*DOMNode[]*/ nodes,
								   /*dojo.gfx.color.Color*/ startColor,
								   /*int?*/ duration,
								   /*Function?*/ easing,
								   /*Function?*/ callback){
	// summary: Returns an animation that will set the background color
	//			of "nodes" to startColor and transition it to "nodes"
	//			original color.
	// startColor: Color to transition from.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var color = dojo.html.getBackgroundColor(node);
		var bg = dojo.html.getStyle(node, "background-color").toLowerCase();
		var bgImage = dojo.html.getStyle(node, "background-image");
		var wasTransparent = (bg == "transparent" || bg == "rgba(0, 0, 0, 0)");
		while(color.length > 3) { color.pop(); }

		var rgb = new dojo.gfx.color.Color(startColor);
		var endRgb = new dojo.gfx.color.Color(color);

		var anim = dojo.lfx.propertyAnimation(node, 
			{ "background-color": { start: rgb, end: endRgb } }, 
			duration, 
			easing,
			{
				"beforeBegin": function(){ 
					if(bgImage){
						node.style.backgroundImage = "none";
					}
					node.style.backgroundColor = "rgb(" + rgb.toRgb().join(",") + ")";
				},
				"onEnd": function(){ 
					if(bgImage){
						node.style.backgroundImage = bgImage;
					}
					if(wasTransparent){
						node.style.backgroundColor = "transparent";
					}
					if(callback){
						callback(node, anim);
					}
				}
			}
		);

		anims.push(anim);
	});
	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lfx.html.unhighlight = function(/*DOMNode[]*/ nodes,
									 /*dojo.gfx.color.Color*/ endColor,
									 /*int?*/ duration,
									 /*Function?*/ easing,
									 /*Function?*/ callback){
	// summary: Returns an animation that will transition "nodes" background color
	//			from its current color to "endColor".
	// endColor: Color to transition to.
	// duration: Duration of the animation in milliseconds.
	// easing: An easing function.
	// callback: Function to run at the end of the animation.
	nodes = dojo.lfx.html._byId(nodes);
	var anims = [];

	dojo.lang.forEach(nodes, function(node){
		var color = new dojo.gfx.color.Color(dojo.html.getBackgroundColor(node));
		var rgb = new dojo.gfx.color.Color(endColor);

		var bgImage = dojo.html.getStyle(node, "background-image");
		
		var anim = dojo.lfx.propertyAnimation(node, 
			{ "background-color": { start: color, end: rgb } },
			duration, 
			easing,
			{
				"beforeBegin": function(){ 
					if(bgImage){
						node.style.backgroundImage = "none";
					}
					node.style.backgroundColor = "rgb(" + color.toRgb().join(",") + ")";
				},
				"onEnd": function(){ 
					if(callback){
						callback(node, anim);
					}
				}
			}
		);
		anims.push(anim);
	});
	return dojo.lfx.combine(anims); // dojo.lfx.Combine
}

dojo.lang.mixin(dojo.lfx, dojo.lfx.html);

dojo.provide("dojo.lfx.*");
