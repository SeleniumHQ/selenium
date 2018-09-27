/*
 * Format for Selenium Remote Control Java client.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);

this.name = "groovy-rc";

/**
 * Combines commands involving waits into single *AndWait commands, using the
 * hook provided in filterForRemoteControl(). Returns the modified list.
 *
 * @param commands
 */
function postFilter(filteredCommands) {
    var i = 1;
    
    while (i < filteredCommands.length) {
        var command = filteredCommands[i];
        if (command.command == 'waitForPageToLoad') {
            filteredCommands[i-1].command += 'AndWait';
            filteredCommands.splice(i, 1);
        }
        else {
            ++i;
        }
    }
    return filteredCommands;
}
    
function testMethodName(testName) {
    return "test" + capitalize(testName);
}

function assertTrue(expression) {
    return "assertTrue(" + expression.toString() + ")";
}

function verifyTrue(expression) {
    return "verifyTrue(" + expression.toString() + ")";
}

function assertFalse(expression) {
    return "assertFalse(" + expression.toString() + ")";
}

function verifyFalse(expression) {
    return "verifyFalse(" + expression.toString() + ")";
}

function assignToVariable(type, variable, expression) {
    return type + " " + variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
    return 'if (' + expression.toString() + ") {\n"
        + indents(1) + callback() + "\n"
        + '}';
}

function joinExpression(expression) {
    return expression.toString() + ".join(',')";
}

function waitFor(expression) {
    return "waitFor {\n"
        + indents(1) + expression.toString() + "\n"
        + '}';
}

function assertOrVerifyFailure(line, isAssert) {
    var message = '"expected failure"';
    var failStatement = "fail(" + message + ")";
    return "try {\n"
        + indents(1) + line + "\n"
        + indents(1) + failStatement + "\n"
        + "}\n"
        + 'catch (e) {}';
}

Equals.prototype.toString = function() {
    if (this.e1.toString().match(/^\d+$/)) {
        // int
        return this.e1.toString() + " == " + this.e2.toString();
    } else {
        // string
        return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
    }
};

Equals.prototype.assert = function() {
    return "assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

Equals.prototype.verify = function() {
    return "verifyEquals(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

NotEquals.prototype.toString = function() {
    return "! " + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
};

NotEquals.prototype.assert = function() {
    return "assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

NotEquals.prototype.verify = function() {
    return "verifyNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ")";
};

RegexpMatch.prototype.toString = function() {
    if (this.pattern.match(/^\^/) && this.pattern.match(/\$$/)) {
        return this.expression + ".matches(" + string(this.pattern) + ")";
    } else {
        return "(" + string(this.pattern) + " =~ " + this.expression + ").find()";
    }
};

function pause(milliseconds) {
    return "sleep(" + parseInt(milliseconds, 10) + ")";
}

function echo(message) {
    return "println(" + xlateArgument(message) + ")";
}

function statement(expression, command) {
    expression.command = command ? command.command : "";
    return expression.toString();
}

function array(value) {
    var str = '[ ';
    for (var i = 0; i < value.length; i++) {
        str += string(value[i]);
        if (i < value.length - 1) str += ", ";
    }
    str += ' ]';
    return str;
}

CallSelenium.prototype.toString = function() {
    var result = '';
    
    if (this.negative) {
        result += '! ';
    }
    if (options.receiver) {
        result += options.receiver + '.';
    }
    if (/AndWait$/.test(this.command)) {
        result += this.command;
    }
    else {
        result += this.message;
    }
    result += '(';
    
    for (var i = 0; i < this.args.length; i++) {
        result += this.args[i];
        if (i < this.args.length - 1) {
            result += ', ';
        }
    }
    
    result += ')';
    return result;
};

function formatComment(comment) {
    return comment.comment.replace(/.+/mg, function(str) {
            return "// " + str;
        });
}

this.options = {
    receiver: "selenium",
    environment: "*chrome",
    packageName: "com.example.tests",
    superClass: "GroovySeleneseTestCase",
    indent: '4',
    initialIndents: '2'
};

options.getHeader = function() {
    var timeout = options['global.timeout'] || '30000';
    return "package ${packageName}\n"
        + "\n"
        + "import com.thoughtworks.selenium.*\n"
        + "\n"
        + "class ${className} extends ${superClass} {\n\n" 
        + indents(1) + "@Override\n"
        + indents(1) + "void setUp() throws Exception {\n"
        + indents(2) + "super.setUp('${baseURL}', '${environment}')\n"
        + indents(2) + "setDefaultTimeout(" + timeout + ")\n"
        + indents(2) + "setCaptureScreenshotOnFailure(false)\n"
        + indents(1) + "}\n\n"
        + indents(1) + "void ${methodName}() throws Exception {\n";
};

options.footer = indents(1) + "}\n"
    + "}\n";

this.configForm = 
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Environment</description>' +
	'<textbox id="options_environment" />' +
	'<description>Package</description>' +
	'<textbox id="options_packageName" />' +
	'<description>Superclass</description>' +
	'<textbox id="options_superClass" />' +
    '<description>Indent</description>' +
    '<menulist id="options_indent"><menupopup>' +
    '<menuitem label="Tab" value="tab" />' +
    '<menuitem label="2 spaces" value="2" />' +
    '<menuitem label="4 spaces" value="4" />' +
    '<menuitem label="8 spaces" value="8" />' +
    '</menupopup></menulist>';

