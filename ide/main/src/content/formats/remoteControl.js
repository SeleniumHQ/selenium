/*
 * Common classes / functions for Selenium RC format.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/formatCommandOnlyAdapter.js', this);

function formatHeader(testCase) {
    var className = testCase.getTitle();
	if (!className) {
		className = "NewTest";
	}

	var formatLocal = testCase.formatLocal(this.name);
	methodName = testMethodName(className.replace(/Test$/, "").replace(/^Test/, "").
								replace(/^[A-Z]/, function(str) { return str.toLowerCase(); }));
	var header = (options.getHeader ? options.getHeader() : options.header).
		replace(/\$\{className\}/g, className).
		replace(/\$\{methodName\}/g, methodName).
		replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
		replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) { return options[name]; });
	this.lastIndent = indents(parseInt(options.initialIndents, 10));
	formatLocal.header = header;
	return formatLocal.header;
}

function formatFooter(testCase) {
	var formatLocal = testCase.formatLocal(this.name);
	formatLocal.footer = options.footer;
	return formatLocal.footer;
}

function indents(num) {
	function repeat(c, n) {
		var str = "";
		for (var i = 0; i < n; i++) {
			str += c;
		}
		return str;
	}

    try {        
    	var indent = options.indent;
    	if ('tab' == indent) {
    		return repeat("\t", num);
    	} else {
    		return repeat(" ", num * parseInt(options.indent, 10));
    	}
    } catch (error) {
        return repeat(" ", 0);
    }
}

function capitalize(string) {
	return string.replace(/^[a-z]/, function(str) { return str.toUpperCase(); });
}

function underscore(text) {
	return text.replace(/[A-Z]/g, function(str) {
			return '_' + str.toLowerCase();
		});
}

function notOperator() {
	return "!";
}

function logicalAnd(conditions) {
    return conditions.join(" && ");
}

function equals(e1, e2) {
	return new Equals(e1, e2);
}

function Equals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
}

Equals.prototype.invert = function() {
	return new NotEquals(this.e1, this.e2);
};

function NotEquals(e1, e2) {
	this.e1 = e1;
	this.e2 = e2;
	this.negative = true;
}

NotEquals.prototype.invert = function() {
	return new Equals(this.e1, this.e2);
};

function RegexpMatch(pattern, expression) {
	this.pattern = pattern;
	this.expression = expression;
}

RegexpMatch.prototype.invert = function() {
	return new RegexpNotMatch(this.pattern, this.expression);
};

RegexpMatch.prototype.assert = function() {
	return assertTrue(this.toString());
};

RegexpMatch.prototype.verify = function() {
	return verifyTrue(this.toString());
};

function RegexpNotMatch(pattern, expression) {
	this.pattern = pattern;
	this.expression = expression;
	this.negative = true;
}

RegexpNotMatch.prototype.invert = function() {
	return new RegexpMatch(this.pattern, this.expression);
};

RegexpNotMatch.prototype.toString = function() {
	return notOperator() + RegexpMatch.prototype.toString.call(this);
};

RegexpNotMatch.prototype.assert = function() {
	return assertFalse(this.invert());
};

RegexpNotMatch.prototype.verify = function() {
	return verifyFalse(this.invert());
};

function seleniumEquals(type, pattern, expression) {
	if (type == 'String[]') {
		return seleniumEquals('String', pattern.replace(/\\,/g, ',') , joinExpression(expression));
	} else if (type == 'String' && pattern.match(/^regexp:/)) {
		return new RegexpMatch(pattern.substring(7), expression);
	} else if (type == 'String' && pattern.match(/^regex:/)) {
		return new RegexpMatch(pattern.substring(6), expression);
	} else if (type == 'String' && (pattern.match(/^glob:/) || pattern.match(/[\*\?]/))) {
		pattern = pattern.replace(/^glob:/, '');
		pattern = pattern.replace(/([\]\[\\\{\}\$\(\).])/g, "\\$1");
		pattern = pattern.replace(/\?/g, "[\\s\\S]");
		pattern = pattern.replace(/\*/g, "[\\s\\S]*");
		return new RegexpMatch("^" + pattern + "$", expression);
	} else {
		pattern = pattern.replace(/^exact:/, '');
		return new Equals(xlateValue(type, pattern), expression);
	}
}

function xlateArgument(value) {
	value = value.replace(/^\s+/, '');
	value = value.replace(/\s+$/, '');
	var r;
	var r2;
	var parts = [];
	if ((r = /^javascript\{([\d\D]*)\}$/.exec(value))) {
		var js = r[1];
		var prefix = "";
		while ((r2 = /storedVars\['(.*?)'\]/.exec(js))) {
			parts.push(string(prefix + js.substring(0, r2.index) + "'"));
			parts.push(variableName(r2[1]));
			js = js.substring(r2.index + r2[0].length);
			prefix = "'";
		}
		parts.push(string(prefix + js));
		return new CallSelenium("getEval", [concatString(parts)]);
	} else if ((r = /\$\{/.exec(value))) {
		var regexp = /\$\{(.*?)\}/g;
		var lastIndex = 0;
		while (r2 = regexp.exec(value)) {
		    if (this.declaredVars && this.declaredVars[r2[1]]) {
    			if (r2.index - lastIndex > 0) {
    				parts.push(string(value.substring(lastIndex, r2.index)));
    			}
    			parts.push(variableName(r2[1]));
    			lastIndex = regexp.lastIndex;
    		} else if (r2[1] == "nbsp") {
    		    if (r2.index - lastIndex > 0) {
    				parts.push(string(value.substring(lastIndex, r2.index)));
    			}
    			parts.push(nonBreakingSpace());
    			lastIndex = regexp.lastIndex;
    		}
		}
		if (lastIndex < value.length) {
			parts.push(string(value.substring(lastIndex, value.length)));
		}
		return concatString(parts);
	} else {
		return string(value);
	}
}

function addDeclaredVar(variable) {
	if (this.declaredVars == null) {
		this.declaredVars = {};
	}
	this.declaredVars[variable] = true;
}

function newVariable(prefix, index) {
	if (index == null) index = 1;
	if (this.declaredVars && this.declaredVars[prefix + index]) {
		return newVariable(prefix, index + 1);
	} else {
		addDeclaredVar(prefix + index);
		return prefix + index;
	}
}

function variableName(value) {
	return value;
}

function concatString(array) {
	return array.join(" + ");
}

function string(value) {
	if (value != null) {
		//value = value.replace(/^\s+/, '');
		//value = value.replace(/\s+$/, '');
		value = value.replace(/\\/g, '\\\\');
		value = value.replace(/\"/g, '\\"');
		value = value.replace(/\r/g, '\\r');
		value = value.replace(/\n/g, '\\n');
		return '"' + value + '"';
	} else {
		return '""';
	}
}

function CallSelenium(message, args) {
	this.message = message;
	if (args) {
		this.args = args;
	} else {
		this.args = [];
	}
}

CallSelenium.prototype.invert = function() {
	var call = new CallSelenium(this.message);
	call.args = this.args;
	call.negative = !this.negative;
	return call;
};

function xlateArrayElement(value) {
	return value.replace(/\\(.)/g, "$1");
}

function parseArray(value) {
	var start = 0;
	var list = [];
	for (var i = 0; i < value.length; i++) {
		if (value.charAt(i) == ',') {
			list.push(xlateArrayElement(value.substring(start, i)));
			start = i + 1;
		} else if (value.charAt(i) == '\\') {
			i++;
		}
	}
	list.push(xlateArrayElement(value.substring(start, value.length)));
	return list;
}

function xlateValue(type, value) {
	if (type == 'String[]') {
		return array(parseArray(value));
	} else {
		return xlateArgument(value);
	}
}

function formatCommand(command) {
	var line = null;
	if (command.type == 'command') {
		var def = command.getDefinition();
		if (def && def.isAccessor) {
			var call = new CallSelenium(def.name);
			for (var i = 0; i < def.params.length; i++) {
				call.args.push(xlateArgument(command.getParameterAt(i)));
			}
			var extraArg = command.getParameterAt(def.params.length);
			if (def.name.match(/^is/)) { // isXXX
				if (command.command.match(/^assert/) ||
					(this.assertOrVerifyFailureOnNext && command.command.match(/^verify/))) {
					line = (def.negative ? assertFalse : assertTrue)(call);
				} else if (command.command.match(/^verify/)) {
					line = (def.negative ? verifyFalse : verifyTrue)(call);
				} else if (command.command.match(/^store/)) {
					addDeclaredVar(extraArg);
					line = statement(assignToVariable('boolean', extraArg, call));
				} else if (command.command.match(/^waitFor/)) {
					line = waitFor(def.negative ? call.invert() : call);
				}
			} else { // getXXX
				if (command.command.match(/^(verify|assert)/)) {
					var eq = seleniumEquals(def.returnType, extraArg, call);
					if (def.negative) eq = eq.invert();
					var method = (!this.assertOrVerifyFailureOnNext && command.command.match(/^verify/)) ? 'verify' : 'assert';
					line = eq[method]();
				} else if (command.command.match(/^store/)) {
					addDeclaredVar(extraArg);
					line = statement(assignToVariable(def.returnType, extraArg, call));
				} else if (command.command.match(/^waitFor/)) {
					var eq = seleniumEquals(def.returnType, extraArg, call);
					if (def.negative) eq = eq.invert();
					line = waitFor(eq);
				}
			}
		} else if (this.pause && 'pause' == command.command) {
			line = pause(command.target);
		} else if (this.echo && 'echo' == command.command) {
			line = echo(command.target);
		} else if ('store' == command.command) {
			addDeclaredVar(command.value);
			line = statement(assignToVariable('String', command.value, xlateArgument(command.target)));
	    } else if (this.set && command.command.match(/^set/)) {
	        line = set(command.command, command.target);
		} else if (command.command.match(/^(assert|verify)Selected$/)) {
			var optionLocator = command.value;
			var flavor = 'Label';
			var value = optionLocator;
			var r = /^(index|label|value|id)=(.*)$/.exec(optionLocator);
			if (r) {
				flavor = r[1].replace(/^[a-z]/, function(str) { return str.toUpperCase() });
				value = r[2];
			}
			var method = (!this.assertOrVerifyFailureOnNext && command.command.match(/^verify/)) ? 'verify' : 'assert';
			var call = new CallSelenium("getSelected" + flavor);
			call.args.push(xlateArgument(command.target));
			var eq = seleniumEquals('String', value, call);
			line = statement(eq[method]());
		} else if (def) {
			if (def.name.match(/^(assert|verify)(Error|Failure)OnNext$/)) {
				this.assertOrVerifyFailureOnNext = true;
				this.assertFailureOnNext = def.name.match(/^assert/);
				this.verifyFailureOnNext = def.name.match(/^verify/);
			} else {
				var call = new CallSelenium(def.name);
                if ("open" == def.name && options.urlSuffix && !command.target.match(/^\w+:\/\//)) {
                    // urlSuffix is used to translate core-based test
                    call.args.push(xlateArgument(options.urlSuffix + command.target));
                } else {
                    for (var i = 0; i < def.params.length; i++) {
                        call.args.push(xlateArgument(command.getParameterAt(i)));
                    }
                }
				line = statement(call, command);
			}
		} else {
			this.log.info("unknown command: <" + command.command + ">");
			// TODO
			var call = new CallSelenium(command.command);
			if ((command.target != null && command.target.length > 0)
				|| (command.value != null && command.value.length > 0)) {
				call.args.push(string(command.target));
				if (command.value != null && command.value.length > 0) {
					call.args.push(string(command.value));
				}
			}
			line = formatComment(new Comment(statement(call)));
		}
	}
	if (line && this.assertOrVerifyFailureOnNext) {
		line = assertOrVerifyFailure(line, this.assertFailureOnNext);
		this.assertOrVerifyFailureOnNext = false;
		this.assertFailureOnNext = false;
		this.verifyFailureOnNext = false;
	}
	return line;
}

this.remoteControl = true;
this.playable = false;

