
strands.compiler.options.debug = true;

// by default, debugMode is private.  overriding the strands.errorWrapper to forcibly enable debug mode
strands.errorWrapper = function(func) {
	var newFunc = function() {
		func.apply(this,arguments);			
	}
	newFunc.noTryCatch = func;
	return newFunc;
}

strands.compiler.eval = function(script) {
    eval(this.compile(script));
}

// simple function to wait until the specified function returns true
Selenium.prototype.pollForDecoratedCondition = function(condition) { while (!condition()) {sleep(10);} };
strands.compiler.eval("Selenium.prototype.pollForDecoratedCondition = " + Selenium.prototype.pollForDecoratedCondition.toString());

// replace all of the doBlah functions with blah functions
for (var functionName in Selenium.prototype) {
    var match = /^do([A-Z].+)$/.exec(functionName);
    if (match) {
        var shortName = match[1];
        // lowercase first character
        var shortName = shortName.charAt(0).toLowerCase() + shortName.substr(1);
        // replace waitFor functions with functions that automatically wait
        if (/^waitFor/.test(shortName) || "open" == shortName) {
            var evalString = "Selenium.prototype."+shortName+"=function() {\n" +
                "this.pollForDecoratedCondition(this."+ functionName +
                ".apply(this,arguments));\n};";
            strands.compiler.eval(evalString);
        } else {
            Selenium.prototype[shortName] = Selenium.prototype[functionName];
        }
    }
    // TODO blahAndWait functions
}

Selenium.prototype.bustCache = function(url) {
    // DGF this function didn't compile correctly, not sure why
    url += (url.indexOf("?") == -1 ? "?" : "&");
    url += "cacheBuster=" + new Date().getTime();
    return url;
}

Selenium.prototype.loadAndRunTest = function(testUrl) {
    testUrl = this.bustCache(testUrl);
    var testScript = strands.request(testUrl);
    var evalString = "selenium.runTest = function() { with (this) { " + testScript + " } }";
    strands.compiler.eval(evalString);
    this.runTest();
}
strands.compiler.eval("Selenium.prototype.loadAndRunTest = " + Selenium.prototype.loadAndRunTest.toString());
