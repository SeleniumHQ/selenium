/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.event.common");

dojo.require("dojo.lang.array");
dojo.require("dojo.lang.extras");
dojo.require("dojo.lang.func");

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
