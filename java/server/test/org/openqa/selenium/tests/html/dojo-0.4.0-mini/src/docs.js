/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.docs");
dojo.require("dojo.io.*");
dojo.require("dojo.event.topic");
dojo.require("dojo.rpc.JotService");
dojo.require("dojo.dom");
dojo.require("dojo.uri.Uri");
dojo.require("dojo.Deferred");
dojo.require("dojo.DeferredList");

/*
 * TODO:
 *
 * Package summary needs to compensate for "is"
 * Handle host environments
 * Deal with dojo.widget weirdness
 * Parse parameters
 * Limit function parameters to only the valid ones (Involves packing parameters onto meta during rewriting)
 *
 */

dojo.docs = new function() {
	this._url = dojo.uri.dojoUri("docscripts");
	this._rpc = new dojo.rpc.JotService;
	this._rpc.serviceUrl = dojo.uri.dojoUri("docscripts/jsonrpc.php");
};
dojo.lang.mixin(dojo.docs, {
	_count: 0,
	_callbacks: {function_names: []},
	_cache: {}, // Saves the JSON objects in cache
	require: function(/*String*/ require, /*bool*/ sync) {
		dojo.debug("require(): " + require);
		var parts = require.split("/");
		var size = parts.length;
		var deferred = new dojo.Deferred;
		var args = {
			mimetype: "text/json",
			load: function(type, data){
				dojo.debug("require(): loaded");
				
				if(parts[0] != "function_names") {
					for(var i = 0, part; part = parts[i]; i++){
						data = data[part];
					}
				}
				deferred.callback(data);
			},
			error: function(){
				deferred.errback();
			}
		};
		
		if (sync) {
			args.sync = true;
		}

		if(location.protocol == "file:"){
			if(size){
				if(parts[0] == "function_names"){
					args.url = [this._url, "local_json", "function_names"].join("/");
				}else{
					var dirs = parts[0].split(".");
					args.url = [this._url, "local_json", dirs[0]].join("/");
					if(dirs.length > 1){
						args.url = [args.url, dirs[1]].join(".");
					}
				}
			}
		}
		
		dojo.io.bind(args);
		return deferred;
	},
	getFunctionNames: function(){
		return this.require("function_names"); // dojo.Deferred
	},
	unFormat: function(/*String*/ string){
		var fString = string;
		if(string.charAt(string.length - 1) == "_"){
			fString = [string.substring(0, string.length - 1), "*"].join("");
		}
		return fString;
	},
	getMeta: function(/*mixed*/ selectKey, /*String*/ pkg, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets information about a function in regards to its meta data
		if(typeof name == "function"){
			// pId: a
			// pkg: ignore
			id = callback;
			callback = name;
			name = pkg;
			pkg = null;
			dojo.debug("getMeta(" + name + ")");
		}else{
			dojo.debug("getMeta(" + pkg + "/" + name + ")");
		}
		
		if(!id){
			id = "_";
		}

		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input;
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}else{
			input = {};
		}

		dojo.docs._buildCache({
			type: "meta",
			callbacks: [dojo.docs._gotMeta, callback],
			pkg: pkg,
			name: name,
			id: id,
			selectKey: selectKey,
			input: input
		});
	},
	_withPkg: function(/*String*/ type, /*Object*/ data, /*Object*/ evt, /*Object*/ input, /*String*/ newType){
		dojo.debug("_withPkg(" + evt.name + ") has package: " + data[0]);
		evt.pkg = data[0];
		if("load" == type && evt.pkg){
			evt.type = newType;
			dojo.docs._buildCache(evt);
		}else{
			if(evt.callbacks && evt.callbacks.length){
				evt.callbacks.shift()("error", {}, evt, evt.input);
			}
		}
	},
	_gotMeta: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_gotMeta(" + evt.name + ")");

		var cached = dojo.docs._getCache(evt.pkg, evt.name, "meta", "functions", evt.id);
		if(cached.summary){
			data.summary = cached.summary;
		}
		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, data, evt, evt.input);
		}
	},
	getSrc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets src file (created by the doc parser)
		dojo.debug("getSrc(" + name + ")");
		if(!id){
			id = "_";
		}
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		
		var input;
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}else{
			input = {};
		}
		
		dojo.docs._buildCache({
			type: "src",
			callbacks: [callback],
			name: name,
			id: id,
			input: input,
			selectKey: selectKey
		});
	},
	getDoc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*String?*/ id){
		// summary: Gets external documentation stored on Jot for a given function
		dojo.debug("getDoc(" + name  + ")");

		if(!id){
			id = "_";
		}

		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input = {};
		if(typeof selectKey == "object" && selectKey.selectKey){
			input.input = selectKey;
			selectKey = selectKey.selectKey;
		}

		input.type = "doc";
		input.name = name;
		input.selectKey = selectKey;
		input.callbacks = [callback];
		input.selectKey = selectKey;

		dojo.docs._buildCache(input);
	},
	_gotDoc: function(/*String*/ type, /*Array*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_gotDoc(" + evt.type + ")");
		
		evt[evt.type] = data;
		if(evt.expects && evt.expects.doc){
			for(var i = 0, expect; expect = evt.expects.doc[i]; i++){
				if(!(expect in evt)){
					dojo.debug("_gotDoc() waiting for more data");
					return;
				}
			}
		}
		
		var cache = dojo.docs._getCache(evt.pkg, "meta", "functions", evt.name, evt.id, "meta");

		var description = evt.fn.description;
		cache.description = description;
		data = {
			returns: evt.fn.returns,
			id: evt.id,
			variables: [],
			selectKey: evt.selectKey
		}
		if(!cache.parameters){
			cache.parameters = {};
		}
		for(var i = 0, param; param = evt.param[i]; i++){
			var fName = param["DocParamForm/name"];
			if(!cache.parameters[fName]){
				cache.parameters[fName] = {};
			}
			cache.parameters[fName].description = param["DocParamForm/desc"]
		}

		data.description = cache.description;
		data.parameters = cache.parameters;
		
		evt.type = "doc";
	
		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()("load", data, evt, input);
		}
	},
	getPkgDoc: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		// summary: Gets external documentation stored on Jot for a given package
		dojo.debug("getPkgDoc(" + name + ")");
		var input = {};
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		dojo.docs._buildCache({
			type: "pkgdoc",
			callbacks: [callback],
			name: name,
			selectKey: selectKey,
			input: input
		});
	},
	getPkgInfo: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		// summary: Gets a combination of the metadata and external documentation for a given package
		dojo.debug("getPkgInfo(" + name + ")");
		if(!selectKey){
			selectKey = ++dojo.docs._count;
		}

		var input = {
			selectKey: selectKey,
			expects: {
				pkginfo: ["pkgmeta", "pkgdoc"]
			},
			callback: callback
		};
		dojo.docs.getPkgMeta(input, name, dojo.docs._getPkgInfo);
		dojo.docs.getPkgDoc(input, name, dojo.docs._getPkgInfo);
	},
	_getPkgInfo: function(/*String*/ type, /*Object*/ data, /*Object*/ evt){
		dojo.debug("_getPkgInfo() for " + evt.type);
		var key = evt.selectKey;
		var input = {};
		var results = {};
		if(typeof key == "object"){
			input = key;
			key = key.selectKey;
			input[evt.type] = data;
			if(input.expects && input.expects.pkginfo){
				for(var i = 0, expect; expect = input.expects.pkginfo[i]; i++){
					if(!(expect in input)){
						dojo.debug("_getPkgInfo() waiting for more data");
						return;
					}
				}
			}
			results = input.pkgmeta;
			results.description = input.pkgdoc;
		}

		if(input.callback){
			input.callback("load", results, evt);
		}
	},
	getInfo: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		dojo.debug("getInfo(" + name + ")");
		var input = {
			expects: {
				"info": ["meta", "doc"]
			},
			selectKey: selectKey,
			callback: callback
		}
		dojo.docs.getMeta(input, name, dojo.docs._getInfo);
		dojo.docs.getDoc(input, name, dojo.docs._getInfo);
	},
	_getInfo: function(/*String*/ type, /*String*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_getInfo(" + evt.type + ")");
		if(input && input.expects && input.expects.info){
			input[evt.type] = data;
			for(var i = 0, expect; expect = input.expects.info[i]; i++){
				if(!(expect in input)){
					dojo.debug("_getInfo() waiting for more data");
					return;
				}
			}
		}

		if(input.callback){
			input.callback("load", dojo.docs._getCache(evt.pkg, "meta", "functions", evt.name, evt.id, "meta"), evt, input);
		}
	},
	_getMainText: function(/*String*/ text){
		// summary: Grabs the innerHTML from a Jot Rech Text node
		dojo.debug("_getMainText()");
		return text.replace(/^<html[^<]*>/, "").replace(/<\/html>$/, "").replace(/<\w+\s*\/>/g, "");
	},
	getPackageMeta: function(/*Object*/ input){
		dojo.debug("getPackageMeta(): " + input.pkg);
		return this.require(input.pkg + "/meta", input.sync);
	},
	OLDgetPkgMeta: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback){
		dojo.debug("getPkgMeta(" + name + ")");
		var input = {};
		if(typeof selectKey == "object" && selectKey.selectKey){
			input = selectKey;
			selectKey = selectKey.selectKey;
		}else if(!selectKey){
			selectKey = ++dojo.docs._count;
		}
		dojo.docs._buildCache({
			type: "pkgmeta",
			callbacks: [callback],
			name: name,
			selectKey: selectKey,
			input: input
		});
	},
	OLD_getPkgMeta: function(/*Object*/ input){
		dojo.debug("_getPkgMeta(" + input.name + ")");
		input.type = "pkgmeta";
		dojo.docs._buildCache(input);
	},
	_onDocSearch: function(/*Object*/ input){
		var _this = this;
		var name = input.name.toLowerCase();
		if(!name) return;

		this.getFunctionNames().addCallback(function(data){
			dojo.debug("_onDocSearch(): function names loaded for " + name);

			var output = [];
			var list = [];
			var closure = function(pkg, fn) {
				return function(data){
					dojo.debug("_onDocSearch(): package meta loaded for: " + pkg);
					if(data.functions){
						var functions = data.functions;
						for(var key in functions){
							if(fn == key){
								var ids = functions[key];
								for(var id in ids){
									var fnMeta = ids[id];
									output.push({
										package: pkg,
										name: fn,
										id: id,
										summary: fnMeta.summary
									});
								}
							}
						}
					}
					return output;
				}
			}

			pkgLoop:
			for(var pkg in data){
				if(pkg.toLowerCase() == name){
					name = pkg;
					dojo.debug("_onDocSearch found a package");
					//dojo.docs._onDocSelectPackage(input);
					return;
				}
				for(var i = 0, fn; fn = data[pkg][i]; i++){
					if(fn.toLowerCase().indexOf(name) != -1){
						dojo.debug("_onDocSearch(): Search matched " + fn);
						var meta = _this.getPackageMeta({pkg: pkg});
						meta.addCallback(closure(pkg, fn));
						list.push(meta);

						// Build a list of all packages that need to be loaded and their loaded state.
						continue pkgLoop;
					}
				}
			}
			
			list = new dojo.DeferredList(list);
			list.addCallback(function(results){
				dojo.debug("_onDocSearch(): All packages loaded");
				_this._printFunctionResults(results[0][1]);
			});
		});
	},
	_onDocSearchFn: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_onDocSearchFn(" + evt.name + ")");

		var name = evt.name || evt.pkg;

		dojo.debug("_onDocSearchFn found a function");

		evt.pkgs = packages;
		evt.pkg = name;
		evt.loaded = 0;
		for(var i = 0, pkg; pkg = packages[i]; i++){
			dojo.docs.getPkgMeta(evt, pkg, dojo.docs._onDocResults);
		}
	},
	_onPkgResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_onPkgResults(" + evt.type + ")");
		var description = "";
		var path = "";
		var methods = {};
		var requires = {};
		if(input){
			input[evt.type] = data;
			if(input.expects && input.expects.pkgresults){
				for(var i = 0, expect; expect = input.expects.pkgresults[i]; i++){
					if(!(expect in input)){
						dojo.debug("_onPkgResults() waiting for more data");
						return;
					}
				}
			}
			path = input.pkgdoc.path;
			description = input.pkgdoc.description;
			methods = input.pkgmeta.methods;
			requires = input.pkgmeta.requires;
		}
		var pkg = evt.name.replace("_", "*");
		var results = {
			path: path,
			description: description,
			size: 0,
			methods: [],
			pkg: pkg,
			selectKey: evt.selectKey,
			requires: requires
		}
		var rePrivate = /_[^.]+$/;
		for(var method in methods){
			if(!rePrivate.test(method)){
				for(var pId in methods[method]){
					results.methods.push({
						pkg: pkg,
						name: method,
						id: pId,
						summary: methods[method][pId].summary
					})
				}
			}
		}
		results.size = results.methods.length;
		dojo.docs._printPkgResult(results);
	},
	_onDocResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_onDocResults(" + evt.name + "/" + input.pkg + ") " + type);
		++input.loaded;

		if(input.loaded == input.pkgs.length){
			var pkgs = input.pkgs;
			var name = input.pkg;
			var results = {selectKey: evt.selectKey, methods: []};
			var rePrivate = /_[^.]+$/;
			data = dojo.docs._cache;

			for(var i = 0, pkg; pkg = pkgs[i]; i++){
				var methods = dojo.docs._getCache(pkg, "meta", "methods");
				for(var fn in methods){
					if(fn.toLowerCase().indexOf(name) == -1){
						continue;
					}
					if(fn != "requires" && !rePrivate.test(fn)){
						for(var pId in methods[fn]){
							var result = {
								pkg: pkg,
								name: fn,
								id: "_",
								summary: ""
							}
							if(methods[fn][pId].summary){
								result.summary = methods[fn][pId].summary;
							}
							results.methods.push(result);
						}
					}
				}
			}

			dojo.debug("Publishing docResults");
			dojo.docs._printFnResults(results);
		}
	},
	_printFunctionResults: function(results){
		dojo.debug("_printFnResults(): called");
		// summary: Call this function to send the /docs/function/results topic
	},
	_printPkgResult: function(results){
		dojo.debug("_printPkgResult(): called");
	},
	_onDocSelectFunction: function(/*Object*/ input){
		// summary: Get doc, meta, and src
		var name = input.name;
		var pkg = input.pkg;
		dojo.debug("_onDocSelectFunction(" + name + ")");
		if(!name){
			return false;
		}
		if(!input.selectKey){
			input.selectKey = ++dojo.docs._count;
		}
		input.expects = {
			"docresults": ["meta", "doc", "pkgmeta"]
		}
		dojo.docs.getMeta(input, pkg, name, dojo.docs._onDocSelectResults);
		dojo.docs.getDoc(input, pkg, name, dojo.docs._onDocSelectResults);
	},
	_onDocSelectPackage: function(/*Object*/ input){
		dojo.debug("_onDocSelectPackage(" + input.name + ")")
		input.expects = {
			"pkgresults": ["pkgmeta", "pkgdoc"]
		};
		if(!input.selectKey){
			input.selectKey = ++dojo.docs._count;
		}
		dojo.docs.getPkgMeta(input, input.name, dojo.docs._onPkgResults);
		dojo.docs.getPkgDoc(input, input.name, dojo.docs._onPkgResults);
	},
	_onDocSelectResults: function(/*String*/ type, /*Object*/ data, /*Object*/ evt, /*Object*/ input){
		dojo.debug("_onDocSelectResults(" + evt.type + ", " + evt.name + ")");
		if(evt.type == "meta"){
			dojo.docs.getPkgMeta(input, evt.pkg, dojo.docs._onDocSelectResults);
		}
		if(input){
			input[evt.type] = data;
			if(input.expects && input.expects.docresults){
				for(var i = 0, expect; expect = input.expects.docresults[i]; i++){
					if(!(expect in input)){
						dojo.debug("_onDocSelectResults() waiting for more data");
						return;
					}
				}
			}
		}

		dojo.docs._printFunctionDetail(input);
	},
	
	_printFunctionDetail: function(results) {
		// summary: Call this function to send the /docs/function/detail topic event
	},

	_buildCache: function(/*Object*/ input){
		dojo.debug("_buildCache(" + input.type + ", " + input.name + ")");
		// Get stuff from the input object
		var type = input.type;
		var pkg = input.pkg;
		var callbacks = input.callbacks;
		var id = input.id;
		if(!id){
			id = input.id = "_";
		}
		var name = input.name;
		var selectKey = input.selectKey;

		var META = "meta";
		var METHODS = "methods";
		var SRC = "src";
		var DESCRIPTION = "description";
		var INPUT = "input";
		var LOAD = "load";
		var ERROR = "error";
		
		var docs = dojo.docs;
		var getCache = docs._getCache;
		
		// Stuff to pass to RPC
		var search = [];
	
		if(type == "doc"){
			if(!pkg){
				docs.functionPackages(selectKey, name, function(){ var a = arguments; docs._withPkg.call(this, a[0], a[1], a[2], a[3], "doc"); }, input);
				return;
			}else{
				var cached = getCache(pkg, META, METHODS, name, id, META);
			
				if(cached[DESCRIPTION]){
					callbacks.shift()(LOAD, cached[DESCRIPTION], input, input[INPUT]);
					return;
				}

				var obj = {};
				obj.forFormName = "DocFnForm";
				obj.limit = 1;

				obj.filter = "it/DocFnForm/require = '" + pkg + "' and it/DocFnForm/name = '" + name + "' and ";
				if(id == "_"){
					obj.filter += " not(it/DocFnForm/id)";
				}else{
					obj.filter += " it/DocFnForm/id = '" + id + "'";
				}

				obj.load = function(data){
					var cached = getCache(pkg, META, METHODS, name, id, META);

					var description = "";
					var returns = "";
					if(data.list && data.list.length){
						description = docs._getMainText(data.list[0]["main/text"]);
						returns = data.list[0]["DocFnForm/returns"];
					}

					cached[DESCRIPTION]  = description;
					if(!cached.returns){
						cached.returns = {};
					}
					cached.returns.summary = returns;

					input.type = "fn";
					docs._gotDoc(LOAD, cached, input, input[INPUT]);				
				}
				obj.error = function(data){
					input.type = "fn";
					docs._gotDoc(ERROR, {}, input, input[INPUT]);
				}
				search.push(obj);

				obj = {};
				obj.forFormName = "DocParamForm";

				obj.filter = "it/DocParamForm/fns = '" + pkg + "=>" + name;
				if(id != "_"){
					obj.filter += "=>" + id;
				}
				obj.filter += "'";
			
				obj.load = function(data){
					var cache = getCache(pkg, META, METHODS, name, id, META);
					for(var i = 0, param; param = data.list[i]; i++){
						var pName = param["DocParamForm/name"];
						if(!cache.parameters[pName]){
							cache.parameters[pName] = {};
						}
						cache.parameters[pName].summary = param["DocParamForm/desc"];
					}
					input.type = "param";
					docs._gotDoc(LOAD, cache.parameters, input);
				}
				obj.error = function(data){
					input.type = "param";
					docs._gotDoc(ERROR, {}, input);
				}
				search.push(obj);
			}
		}else if(type == "pkgdoc"){
			var cached = getCache(name, META);

			if(cached[DESCRIPTION]){
				callbacks.shift()(LOAD, {description: cached[DESCRIPTION], path: cached.path}, input, input.input);
				return;
			}

			var obj = {};
			obj.forFormName = "DocPkgForm";
			obj.limit = 1;
			obj.filter = "it/DocPkgForm/require = '" + name + "'";
			
			obj.load = function(data){
				var description = "";
				var list = data.list;
				if(list && list.length && list[0]["main/text"]){
					description = docs._getMainText(list[0]["main/text"]);
					cached[DESCRIPTION] = description;
					cached.path = list[0].name;
				}

				if(callbacks && callbacks.length){
					callbacks.shift()(LOAD, {description: description, path: cached.path}, input, input.input);
				}
			}
			obj.error = function(data){
				if(callbacks && callbacks.length){
					callbacks.shift()(ERROR, "", input, input.input);
				}
			}
			search.push(obj);
		}else if(type == "function_names"){
			var cached = getCache();
			if(!cached.function_names){
				dojo.debug("_buildCache() new cache");
				if(callbacks && callbacks.length){
					docs._callbacks.function_names.push([input, callbacks.shift()]);
				}
				cached.function_names = {loading: true};
				
				var obj = {};
				obj.url = "function_names";
				obj.load = function(type, data, evt){
					cached.function_names = data;
					while(docs._callbacks.function_names.length){
						var parts = docs._callbacks.function_names.pop();
						parts[1](LOAD, data, parts[0]);
					}
				}
				obj.error = function(type, data, evt){
					while(docs._callbacks.function_names.length){
						var parts = docs._callbacks.function_names.pop();
						parts[1](LOAD, {}, parts[0]);
					}
				}
				search.push(obj);
			}else if(cached.function_names.loading){
				dojo.debug("_buildCache() loading cache, adding to callback list");
				if(callbacks && callbacks.length){
					docs._callbacks.function_names.push([input, callbacks.shift()]);
				}
				return;
			}else{
				dojo.debug("_buildCache() loading from cache");
				if(callbacks && callbacks.length){
					callbacks.shift()(LOAD, cached.function_names, input);
				}
				return;
			}
		}else if(type == META || type == SRC){
			if(!pkg){
				if(type == META){
					docs.functionPackages(selectKey, name, function(){ var a = arguments; docs._withPkg.call(this, a[0], a[1], a[2], a[3], META); }, input);
					return;
				}else{
					docs.functionPackages(selectKey, name, function(){ var a = arguments; docs._withPkg.call(this, a[0], a[1], a[2], a[3], SRC); }, input);
					return;
				}
			}else{
				var cached = getCache(pkg, META, METHODS, name, id);

				if(cached[type] && cached[type].returns){
					if(callbacks && callbacks.length){
						callbacks.shift()(LOAD, cached[type], input);
						return;
					}
				}

				dojo.debug("Finding " + type + " for: " + pkg + ", function: " + name + ", id: " + id);

				var obj = {};

				if(type == SRC){
					obj.mimetype = "text/plain"
				}
				obj.url = pkg + "/" + name + "/" + id + "/" + type;
				obj.load = function(type, data, evt){
					dojo.debug("_buildCache() loaded " + input.type);

					if(input.type == SRC){
						getCache(pkg, META, METHODS, name, id).src = data;
						if(callbacks && callbacks.length){
							callbacks.shift()(LOAD, data, input, input[INPUT]);
						}
					}else{
						var cache = getCache(pkg, META, METHODS, name, id, META);
						if(!cache.parameters){
							cache.parameters = {};
						}
						for(var i = 0, param; param = data.parameters[i]; i++){
							if(!cache.parameters[param[1]]){
								cache.parameters[param[1]] = {};
							}
							cache.parameters[param[1]].type = param[0];
						}
						if(!cache.returns){
							cache.returns = {};
						}
						cache.returns.type = data.returns;
					}

					if(callbacks && callbacks.length){
						callbacks.shift()(LOAD, cache, input, input[INPUT]);
					}
				}
				obj.error = function(type, data, evt){
					if(callbacks && callbacks.length){
						callbacks.shift()(ERROR, {}, input, input[INPUT]);
					}
				}
			}

			search.push(obj);
		}else if(type == "pkgmeta"){
			var cached = getCache(name, "meta");

			if(cached.requires){
				if(callbacks && callbacks.length){
					callbacks.shift()(LOAD, cached, input, input[INPUT]);
					return;
				}
			}

			dojo.debug("Finding package meta for: " + name);

			var obj = {};

			obj.url = name + "/meta";
			obj.load = function(type, data, evt){
				dojo.debug("_buildCache() loaded for: " + name);
		
				var methods = data.methods;
				if(methods){
					for(var method in methods){
						if (method == "is") {
							continue;
						}
						for(var pId in methods[method]){
							getCache(name, META, METHODS, method, pId, META).summary = methods[method][pId];
						}
					}
				}

				var requires = data.requires;
				var cache = getCache(name, META);
				if(requires){
					cache.requires = requires;
				}
				if(callbacks && callbacks.length){
					callbacks.shift()(LOAD, cache, input, input[INPUT]);
				}
			}
			obj.error = function(type, data, evt){
				if(callbacks && callbacks.length){
					callbacks.shift()(ERROR, {}, input, input[INPUT]);
				}
			}
			search.push(obj);
		}
		
		for(var i = 0, obj; obj = search[i]; i++){
			var load = obj.load;
			var error = obj.error;
			delete obj.load;
			delete obj.error;
			var mimetype = obj.mimetype;
			if(!mimetype){
				mimetype = "text/json"
			}
			if(obj.url){
				dojo.io.bind({
					url: new dojo.uri.Uri(docs._url, obj.url),
					input: input,
					mimetype: mimetype,
					error: error,
					load: load
				});
			}else{
				docs._rpc.callRemote("search", obj).addCallbacks(load, error);
			}
		}
	},
	selectFunction: function(/*String*/ name, /*String?*/ id){
		// summary: The combined information
	},
	savePackage: function(/*Object*/ callbackObject, /*String*/ callback, /*Object*/ parameters){
		dojo.event.kwConnect({
			srcObj: dojo.docs,
			srcFunc: "_savedPkgRpc",
			targetObj: callbackObject,
			targetFunc: callback,
			once: true
		});
		
		var props = {};
		var cache = dojo.docs._getCache(parameters.pkg, "meta");

		var i = 1;

		if(!cache.path){
			var path = "id";
			props[["pname", i].join("")] = "DocPkgForm/require";
			props[["pvalue", i++].join("")] = parameters.pkg;
		}else{
			var path = cache.path;
		}

		props.form = "//DocPkgForm";
		props.path = ["/WikiHome/DojoDotDoc/", path].join("");

		if(parameters.description){
			props[["pname", i].join("")] = "main/text";
			props[["pvalue", i++].join("")] = parameters.description;
		}
		
		dojo.docs._rpc.callRemote("saveForm",	props).addCallbacks(dojo.docs._pkgRpc, dojo.docs._pkgRpc);
	},
	_pkgRpc: function(data){
		if(data.name){
			dojo.docs._getCache(data["DocPkgForm/require"], "meta").path = data.name;
			dojo.docs._savedPkgRpc("load");
		}else{
			dojo.docs._savedPkgRpc("error");
		}
	},
	_savedPkgRpc: function(type){
	},
	functionPackages: function(/*mixed*/ selectKey, /*String*/ name, /*Function*/ callback, /*Object*/ input){
		// summary: Gets the package associated with a function and stores it in the .pkg value of input
		dojo.debug("functionPackages() name: " + name);

		if(!input){
			input = {};
		}
		if(!input.callbacks){
			input.callbacks = [];
		}

		input.type = "function_names";
		input.name = name;
		input.callbacks.unshift(callback);
		input.callbacks.unshift(dojo.docs._functionPackages);
		dojo.docs._buildCache(input);
	},
	_functionPackages: function(/*String*/ type, /*Array*/ data, /*Object*/ evt){
		dojo.debug("_functionPackages() name: " + evt.name);
		evt.pkg = '';

		var results = [];
		var data = dojo.docs._cache['function_names'];
		for(var key in data){
			if(dojo.lang.inArray(data[key], evt.name)){
				dojo.debug("_functionPackages() package: " + key);
				results.push(key);
			}
		}

		if(evt.callbacks && evt.callbacks.length){
			evt.callbacks.shift()(type, results, evt, evt.input);
		}
	},
	setUserName: function(/*String*/ name){
		dojo.docs._userName = name;
		if(name && dojo.docs._password){
			dojo.docs._logIn();
		}
	},
	setPassword: function(/*String*/ password){
		dojo.docs._password = password;
		if(password && dojo.docs._userName){
			dojo.docs._logIn();
		}
	},
	_logIn: function(){
		dojo.io.bind({
			url: dojo.docs._rpc.serviceUrl.toString(),
			method: "post",
			mimetype: "text/json",
			content: {
				username: dojo.docs._userName,
				password: dojo.docs._password
			},
			load: function(type, data){
				if(data.error){
					dojo.docs.logInSuccess();
				}else{
					dojo.docs.logInFailure();
				}
			},
			error: function(){
				dojo.docs.logInFailure();
			}
		});
	},
	logInSuccess: function(){},
	logInFailure: function(){},
	_set: function(/*Object*/ base, /*String...*/ keys, /*String*/ value){
		var args = [];
		for(var i = 0, arg; arg = arguments[i]; i++){
			args.push(arg);
		}

		if(args.length < 3) return;
		base = args.shift();
		value = args.pop();
		var key = args.pop();
		for(var i = 0, arg; arg = args[i]; i++){
			if(typeof base[arg] != "object"){
				base[arg] = {};
			}
			base = base[arg];
		}
		base[key] = value;
	},
	_getCache: function(/*String...*/ keys){
		var obj = dojo.docs._cache;
		for(var i = 0; i < arguments.length; i++){
			var arg = arguments[i];
			if(!obj[arg]){
				obj[arg] = {};
			}
			obj = obj[arg];
		}
		return obj;
	}
});

dojo.event.topic.subscribe("/docs/search", dojo.docs, "_onDocSearch");
dojo.event.topic.subscribe("/docs/function/select", dojo.docs, "_onDocSelectFunction");
dojo.event.topic.subscribe("/docs/package/select", dojo.docs, "_onDocSelectPackage");

dojo.event.topic.registerPublisher("/docs/function/results", dojo.docs, "_printFunctionResults");
dojo.event.topic.registerPublisher("/docs/function/detail", dojo.docs, "_printFunctionDetail");
dojo.event.topic.registerPublisher("/docs/package/detail", dojo.docs, "_printPkgResult");