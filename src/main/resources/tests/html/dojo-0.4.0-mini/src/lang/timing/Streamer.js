/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.lang.timing.Streamer");
dojo.require("dojo.lang.timing.Timer");

dojo.lang.timing.Streamer = function(
	/* function */input, 
	/* function */output, 
	/* int */interval, 
	/* int */minimum,
	/* array */initialData
){
	//	summary
	//	Streamer will take an input function that pushes N datapoints into a
	//		queue, and will pass the next point in that queue out to an
	//		output function at the passed interval; this way you can emulate
	//		a constant buffered stream of data.
	//	input: the function executed when the internal queue reaches minimumSize
	//	output: the function executed on internal tick
	//	interval: the interval in ms at which the output function is fired.
	//	minimum: the minimum number of elements in the internal queue.

	var self = this;
	var queue = [];

	//	public properties
	this.interval = interval || 1000;
	this.minimumSize = minimum || 10;	//	latency usually == interval * minimumSize
	this.inputFunction = input || function(q){ };
	this.outputFunction = output || function(point){ };

	//	more setup
	var timer = new dojo.lang.timing.Timer(this.interval);
	var tick = function(){
		self.onTick(self);

		if(queue.length < self.minimumSize){
			self.inputFunction(queue);
		}

		var obj = queue.shift();
		while(typeof(obj) == "undefined" && queue.length > 0){
			obj = queue.shift();
		}
		
		//	check to see if the input function needs to be fired
		//	stop before firing the output function
		//	TODO: relegate this to the output function?
		if(typeof(obj) == "undefined"){
			self.stop();
			return;
		}

		//	call the output function.
		self.outputFunction(obj);
	};

	this.setInterval = function(/* int */ms){
		//	summary
		//	sets the interval in milliseconds of the internal timer
		this.interval = ms;
		timer.setInterval(ms);
	};

	this.onTick = function(/* dojo.lang.timing.Streamer */obj){ };
	// wrap the timer functions so that we can connect to them if needed.
	this.start = function(){
		//	summary
		//	starts the Streamer
		if(typeof(this.inputFunction) == "function" && typeof(this.outputFunction) == "function"){
			timer.start();
			return;
		}
		dojo.raise("You cannot start a Streamer without an input and an output function.");
	};
	this.onStart = function(){ };
	this.stop = function(){
		//	summary
		//	stops the Streamer
		timer.stop();
	};
	this.onStop = function(){ };

	//	finish initialization
	timer.onTick = this.tick;
	timer.onStart = this.onStart;
	timer.onStop = this.onStop;
	if(initialData){
		queue.concat(initialData);
	}
};
