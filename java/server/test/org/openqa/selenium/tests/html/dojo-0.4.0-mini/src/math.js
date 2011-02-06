/*
	Copyright (c) 2004-2006, The Dojo Foundation
	All Rights Reserved.

	Licensed under the Academic Free License version 2.1 or above OR the
	modified BSD license. For more information on Dojo licensing, see:

		http://dojotoolkit.org/community/licensing.shtml
*/

dojo.provide("dojo.math");

dojo.math.degToRad = function(/* float */x) {
	//	summary
	//	Converts degrees to radians.
	return (x*Math.PI) / 180; 	//	float
}
dojo.math.radToDeg = function(/* float */x) { 
	//	summary
	//	Converts radians to degrees.
	return (x*180) / Math.PI; 	//	float
}

dojo.math.factorial = function(/* integer */n){
	//	summary
	//	Returns n!
	if(n<1){ return 0; }
	var retVal = 1;
	for(var i=1;i<=n;i++){ retVal *= i; }
	return retVal;	//	integer
}

dojo.math.permutations = function(/* integer */n, /* integer */k) {
	//	summary
	//	The number of ways of obtaining an ordered subset of k elements from a set of n elements
	if(n==0 || k==0) return 1;
	return (dojo.math.factorial(n) / dojo.math.factorial(n-k));	//	float
}

dojo.math.combinations = function (/* integer */n, /* integer */r) {
	//	summary
	//	The number of ways of picking n unordered outcomes from r possibilities
	if(n==0 || r==0) return 1;
	return (dojo.math.factorial(n) / (dojo.math.factorial(n-r) * dojo.math.factorial(r)));	//	float
}

dojo.math.bernstein = function(/* float */t, /* float */n, /* float */i) {
	//	summary
	//	Calculates a weighted average based on the Bernstein theorem.
	return (dojo.math.combinations(n,i) * Math.pow(t,i) * Math.pow(1-t,n-i));	//	float
}

dojo.math.gaussianRandom = function(){
	//	summary
	//	Returns random numbers with a Gaussian distribution, with the mean set at 0 and the variance set at 1.
	var k = 2;
	do {
		var i = 2 * Math.random() - 1;
		var j = 2 * Math.random() - 1;
		k = i * i + j * j;
	} while (k >= 1);
	k = Math.sqrt((-2 * Math.log(k)) / k);
	return i * k;	//	float
}

dojo.math.mean = function() {
	//	summary
	//	Calculates the mean of an Array of numbers.
	var array = dojo.lang.isArray(arguments[0]) ? arguments[0] : arguments;
	var mean = 0;
	for (var i = 0; i < array.length; i++) { mean += array[i]; }
	return mean / array.length;	//	float
}

dojo.math.round = function(/* float */number, /* integer */places) {
	//	summary
	//	Extends Math.round by adding a second argument specifying the number of decimal places to round to.
	// TODO: add support for significant figures
	if (!places) { var shift = 1; }
	else { var shift = Math.pow(10, places); }
	return Math.round(number * shift) / shift;	//	float
}

dojo.math.sd = dojo.math.standardDeviation = function(/* array */){
	//	summary
	//	Calculates the standard deviation of an Array of numbers
	var array = dojo.lang.isArray(arguments[0]) ? arguments[0] : arguments;
	return Math.sqrt(dojo.math.variance(array));	//	float
}

dojo.math.variance = function(/* array */) {
	//	summary
	//	Calculates the variance of an Array of numbers
	var array = dojo.lang.isArray(arguments[0]) ? arguments[0] : arguments;
	var mean = 0, squares = 0;
	for (var i = 0; i < array.length; i++) {
		mean += array[i];
		squares += Math.pow(array[i], 2);
	}
	return (squares / array.length) - Math.pow(mean / array.length, 2);	//	float
}

dojo.math.range = function(/* integer */a, /* integer */b, /* integer */step) {
	//	summary
	//	implementation of Python's range()
    if(arguments.length < 2) {
        b = a;
        a = 0;
    }
    if(arguments.length < 3) {
        step = 1;
    }

    var range = [];
    if(step > 0) {
        for(var i = a; i < b; i += step) {
            range.push(i);
        }
    } else if(step < 0) {
        for(var i = a; i > b; i += step) {
            range.push(i);
        }
    } else {
        throw new Error("dojo.math.range: step must be non-zero");
    }
    return range;	//	array
}
