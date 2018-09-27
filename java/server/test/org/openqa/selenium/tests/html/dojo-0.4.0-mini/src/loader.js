/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

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
