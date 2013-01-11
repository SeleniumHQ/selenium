/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.ns");

dojo.ns = {
	// summary: private object that implements widget namespace management
	namespaces: {},
	failed: {},
	loading: {},
	loaded: {},
	register: function(/*String*/name, /*String*/module, /*Function?*/resolver, /*Boolean?*/noOverride){
		// summary: creates and registers a dojo.ns.Ns object
		if(!noOverride || !this.namespaces[name]){
			this.namespaces[name] = new dojo.ns.Ns(name, module, resolver);
		}
	},
	allow: function(/*String*/name){
		// summary: Returns false if 'name' is filtered by configuration or has failed to load, true otherwise
		if(this.failed[name]){return false;} // Boolean
		if((djConfig.excludeNamespace)&&(dojo.lang.inArray(djConfig.excludeNamespace, name))){return false;} // Boolean
		// If the namespace is "dojo", or the user has not specified allowed namespaces return true.
		// Otherwise, if the user has specifically allowed this namespace, return true, otherwise false.
		return((name==this.dojo)||(!djConfig.includeNamespace)||(dojo.lang.inArray(djConfig.includeNamespace, name))); // Boolean
	},
	get: function(/*String*/name){
		// summary
		//  Return Ns object registered to 'name', if any
		return this.namespaces[name]; // Ns
	},
	require: function(/*String*/name){
		// summary
  	//  Try to ensure that 'name' is registered, loading a namespace manifest if necessary
		var ns = this.namespaces[name];
		if((ns)&&(this.loaded[name])){return ns;} // Ns
		if(!this.allow(name)){return false;} // Boolean
 		if(this.loading[name]){
			// FIXME: do we really ever have re-entrancy situation? this would appear to be really bad
			// original code did not throw an exception, although that seems the only course
			// adding debug output here to track if this occurs.
			dojo.debug('dojo.namespace.require: re-entrant request to load namespace "' + name + '" must fail.'); 
			return false; // Boolean
		}
		// workaround so we don't break the build system
		var req = dojo.require;
		this.loading[name] = true;
		try {
			//dojo namespace file is always in the Dojo namespaces folder, not any custom folder
			if(name=="dojo"){
				req("dojo.namespaces.dojo");
			}else{
				// if no registered module prefix, use ../<name> by convention
				if(!dojo.hostenv.moduleHasPrefix(name)){
					dojo.registerModulePath(name, "../" + name);
				}
				req([name, 'manifest'].join('.'), false, true);
			}
			if(!this.namespaces[name]){
				this.failed[name] = true; //only look for a namespace once
			}
		}finally{
			this.loading[name]=false;
		}
		return this.namespaces[name]; // Ns
	}
}

dojo.ns.Ns = function(/*String*/name, /*String*/module, /*Function?*/resolver){
	// summary: this object simply encapsulates namespace data
	this.name = name;
	this.module = module;
	this.resolver = resolver;
	this._loaded = [ ];
	this._failed = [ ];
}

dojo.ns.Ns.prototype.resolve = function(/*String*/name, /*String*/domain, /*Boolean?*/omitModuleCheck){
	//summary: map component with 'name' and 'domain' to a module via namespace resolver, if specified
	if(!this.resolver || djConfig["skipAutoRequire"]){return false;} // Boolean
	var fullName = this.resolver(name, domain);
	//only load a widget once. This is a quicker check than dojo.require does
	if((fullName)&&(!this._loaded[fullName])&&(!this._failed[fullName])){
		//workaround so we don't break the build system
		var req = dojo.require;
		req(fullName, false, true); //omit the module check, we'll do it ourselves.
		if(dojo.hostenv.findModule(fullName, false)){
			this._loaded[fullName] = true;
		}else{
			if(!omitModuleCheck){dojo.raise("dojo.ns.Ns.resolve: module '" + fullName + "' not found after loading via namespace '" + this.name + "'");} 
			this._failed[fullName] = true;
		}
	}
	return Boolean(this._loaded[fullName]); // Boolean
}

dojo.registerNamespace = function(/*String*/name, /*String*/module, /*Function?*/resolver){
	// summary: maps a module name to a namespace for widgets, and optionally maps widget names to modules for auto-loading
	// description: An unregistered namespace is mapped to an eponymous module.
	//	For example, namespace acme is mapped to module acme, and widgets are
	//	assumed to belong to acme.widget. If you want to use a different widget
	//	module, use dojo.registerNamespace.
	dojo.ns.register.apply(dojo.ns, arguments);
}

dojo.registerNamespaceResolver = function(/*String*/name, /*Function*/resolver){
	// summary: a resolver function maps widget names to modules, so the
	//	widget manager can auto-load needed widget implementations
	//
	// description: The resolver provides information to allow Dojo
	//	to load widget modules on demand. When a widget is created,
	//	a namespace resolver can tell Dojo what module to require
	//	to ensure that the widget implementation code is loaded.
	//
	// name: will always be lower-case.
	//
	// example:
	//  dojo.registerNamespaceResolver("acme",
	//    function(name){ 
	//      return "acme.widget."+dojo.string.capitalize(name);
	//    }
	//  );
	var n = dojo.ns.namespaces[name];
	if(n){
		n.resolver = resolver;
	}
}

dojo.registerNamespaceManifest = function(/*String*/module, /*String*/path, /*String*/name, /*String*/widgetModule, /*Function?*/resolver){
	// summary: convenience function to register a module path, a namespace, and optionally a resolver all at once.
	dojo.registerModulePath(name, path);
	dojo.registerNamespace(name, widgetModule, resolver);
}

// NOTE: rather put this in dojo.widget.Widget, but that fubars debugAtAllCosts
dojo.registerNamespace("dojo", "dojo.widget");
