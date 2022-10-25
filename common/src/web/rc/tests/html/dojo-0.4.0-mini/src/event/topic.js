/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.require("dojo.event.common");
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

