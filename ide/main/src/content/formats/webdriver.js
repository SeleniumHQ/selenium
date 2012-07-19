/*
 * Common classes / functions for Selenium RC format.
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/formatCommandOnlyAdapter.js', this);

/* @override
 * This function filters the command list and strips away the commands we no longer need
 */
this.postFilter = function(originalCommands) {
  var commands = [];
  var commandsToSkip = {
    'waitForPageToLoad' : 1,
    'pause': 1
  };
  for (var i = 0; i < originalCommands.length; i++) {
    var c = originalCommands[i];
    if (c.type == 'command') {
      if (commandsToSkip[c.command] && commandsToSkip[c.command] == 1) {
        //Skip
      } else {
        commands.push(c);
      }
    } else {
      commands.push(c);
    }
  }
  return commands;
};

function formatHeader(testCase) {
  var className = testCase.getTitle();
  if (!className) {
    className = "NewTest";
  }
  className = testClassName(className);
  var formatLocal = testCase.formatLocal(this.name);
  methodName = testMethodName(className.replace(/Test$/i, "").replace(/^Test/i, "").
      replace(/^[A-Z]/, function(str) {
        return str.toLowerCase();
      }));
  var header = (options.getHeader ? options.getHeader() : options.header).
      replace(/\$\{className\}/g, className).
      replace(/\$\{methodName\}/g, methodName).
      replace(/\$\{baseURL\}/g, testCase.getBaseURL()).
      replace(/\$\{([a-zA-Z0-9_]+)\}/g, function(str, name) {
        return options[name];
      });
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
  return string.replace(/^[a-z]/, function(str) {
    return str.toUpperCase();
  });
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
    return seleniumEquals('String', pattern.replace(/\\,/g, ','), joinExpression(expression));
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

function concatString(array) {
  return array.join(" + ");
}

function xlateArgument(value, type) {
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
  } else if (type && type.toLowerCase() == 'number') {
    return value;
  } else {
    return string(value);
  }
}

function xlateArrayElement(value) {
  return value.replace(/\\(.)/g, "$1");
}

function xlateValue(type, value) {
  if (type == 'String[]') {
    return array(parseArray(value));
  } else {
    return xlateArgument(value, type);
  }
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

function CallSelenium(message, args, rawArgs) {
  this.message = message;
  if (args) {
    this.args = args;
  } else {
    this.args = [];
  }
  if (rawArgs) {
    this.rawArgs = rawArgs;
  } else {
    this.rawArgs = [];
  }
}

CallSelenium.prototype.invert = function() {
  var call = new CallSelenium(this.message);
  call.args = this.args;
  call.rawArgs = this.rawArgs;
  call.negative = !this.negative;
  return call;
};

CallSelenium.prototype.toString = function() {
  log.info('Processing ' + this.message);
  if (this.message == 'waitForPageToLoad') {
    return '';
  }
  var result = '';
  var adaptor = new SeleniumWebDriverAdaptor(this.rawArgs);
  if (adaptor[this.message]) {
    var codeBlock = adaptor[this.message].call(adaptor);
    if (adaptor.negative) {
      this.negative = !this.negative;
    }
    if (this.negative) {
      result += notOperator();
    }
    result += codeBlock;
  } else {
    //unsupported
    throw 'ERROR: Unsupported command [' + this.message + ']';
  }
  return result;
};

function formatCommand(command) {
  var line = null;
  try {
    var call;
    var i;
    var eq;
    var method;
    if (command.type == 'command') {
      var def = command.getDefinition();
      if (def && def.isAccessor) {
        call = new CallSelenium(def.name);
        for (i = 0; i < def.params.length; i++) {
          call.rawArgs.push(command.getParameterAt(i));
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
            eq = seleniumEquals(def.returnType, extraArg, call);
            if (def.negative) eq = eq.invert();
            method = (!this.assertOrVerifyFailureOnNext && command.command.match(/^verify/)) ? 'verify' : 'assert';
            line = eq[method]();
          } else if (command.command.match(/^store/)) {
            addDeclaredVar(extraArg);
            line = statement(assignToVariable(def.returnType, extraArg, call));
          } else if (command.command.match(/^waitFor/)) {
            eq = seleniumEquals(def.returnType, extraArg, call);
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
          flavor = r[1].replace(/^[a-z]/, function(str) {
            return str.toUpperCase()
          });
          value = r[2];
        }
        method = (!this.assertOrVerifyFailureOnNext && command.command.match(/^verify/)) ? 'verify' : 'assert';
        call = new CallSelenium("getSelected" + flavor);
        call.rawArgs.push(command.target);
        call.args.push(xlateArgument(command.target));
        eq = seleniumEquals('String', value, call);
        line = statement(eq[method]());
      } else if (def) {
        if (def.name.match(/^(assert|verify)(Error|Failure)OnNext$/)) {
          this.assertOrVerifyFailureOnNext = true;
          this.assertFailureOnNext = def.name.match(/^assert/);
          this.verifyFailureOnNext = def.name.match(/^verify/);
        } else {
          call = new CallSelenium(def.name);
          if ("open" == def.name && options.urlSuffix && !command.target.match(/^\w+:\/\//)) {
            // urlSuffix is used to translate core-based test
            call.rawArgs.push(options.urlSuffix + command.target);
            call.args.push(xlateArgument(options.urlSuffix + command.target));
          } else {
            for (i = 0; i < def.params.length; i++) {
              call.rawArgs.push(command.getParameterAt(i));
              call.args.push(xlateArgument(command.getParameterAt(i)));
            }
          }
          line = statement(call, command);
        }
      } else {
        this.log.info("unknown command: <" + command.command + ">");
        throw 'unknown command [' + command.command + ']';
      }
    }
  } catch(e) {
    this.log.error("Caught exception: [" + e + "]");
    // TODO
//    var call = new CallSelenium(command.command);
//    if ((command.target != null && command.target.length > 0)
//        || (command.value != null && command.value.length > 0)) {
//      call.rawArgs.push(command.target);
//      call.args.push(string(command.target));
//      if (command.value != null && command.value.length > 0) {
//        call.rawArgs.push(command.value);
//        call.args.push(string(command.value));
//      }
//    }
//    line = formatComment(new Comment(statement(call)));
    line = formatComment(new Comment('ERROR: Caught exception [' + e + ']'));
  }
  if (line && this.assertOrVerifyFailureOnNext) {
    line = assertOrVerifyFailure(line, this.assertFailureOnNext);
    this.assertOrVerifyFailureOnNext = false;
    this.assertFailureOnNext = false;
    this.verifyFailureOnNext = false;
  }
  //TODO: convert array to newline separated string -> if(array) return array.join"\n"
  if (command.type == 'command' && options.showSelenese && options.showSelenese == 'true') {
    line = formatComment(new Comment(command.command + ' | ' + command.target + ' | ' + command.value)) + "\n" + line;
  }
  return line;
}

this.remoteControl = true;
this.playable = false;

function SeleniumWebDriverAdaptor(rawArgs) {
  this.rawArgs = rawArgs;
  this.negative = false;
}

// Returns locator.type and locator.string
SeleniumWebDriverAdaptor.prototype._elementLocator = function(sel1Locator) {
  var locator = parse_locator(sel1Locator);
  if (sel1Locator.match(/^\/\//) || locator.type == 'xpath') {
    locator.type = 'xpath';
    return locator;
  }
  if (locator.type == 'css') {
    return locator;
  }
  if (locator.type == 'id') {
    return locator;
  }
  if (locator.type == 'link') {
    return locator;
  }
  if (locator.type == 'name') {
    return locator;
  }
  if (sel1Locator.match(/^document/) || locator.type == 'dom') {
    throw 'Error: Dom locators are not implemented yet!';
  }
  if (locator.type == 'ui') {
    throw 'Error: UI locators are not supported!';
  }
  if (locator.type == 'identifier') {
    throw 'Error: locator strategy [identifier] has been deprecated. To rectify specify the correct locator strategy id or name explicitly.';
  }
  if (locator.type == 'implicit') {
    throw 'Error: locator strategy either id or name must be specified explicitly.';
  }
  throw 'Error: unknown strategy [' + locator.type + '] for locator [' + sel1Locator + ']';
};

// Returns locator.elementLocator and locator.attributeName
SeleniumWebDriverAdaptor.prototype._attributeLocator = function(sel1Locator) {
  var attributePos = sel1Locator.lastIndexOf("@");
  var elementLocator = sel1Locator.slice(0, attributePos);
  var attributeName = sel1Locator.slice(attributePos + 1);
  return {elementLocator: elementLocator, attributeName: attributeName};
};

SeleniumWebDriverAdaptor.prototype._selectLocator = function(sel1Locator) {
  //Figure out which strategy to use
  var locator = {type: 'label', string: sel1Locator};
  // If there is a locator prefix, use the specified strategy
  var result = sel1Locator.match(/^([a-zA-Z]+)=(.*)/);
  if (result) {
    locator.type = result[1];
    locator.string = result[2];
  }
  //alert(locatorType + ' [' + locatorValue + ']');
  if (locator.type == 'index') {
    return locator;
  }
  if (locator.type == 'label') {
    return locator;
  }
  if (locator.type == 'value') {
    return locator;
  }
  throw 'Error: unknown or unsupported strategy [' + locator.type + '] for locator [' + sel1Locator + ']';
};

// Returns an object with a toString method
SeleniumWebDriverAdaptor.SimpleExpression = function(expressionString) {
  this.str = expressionString;
};

SeleniumWebDriverAdaptor.SimpleExpression.prototype.toString = function() {
  return this.str;
};

//helper method to simplify the ifCondition
SeleniumWebDriverAdaptor.ifCondition = function(conditionString, stmtString) {
  return ifCondition(new SeleniumWebDriverAdaptor.SimpleExpression(conditionString), function() {
    return statement(new SeleniumWebDriverAdaptor.SimpleExpression(stmtString)) + "\n";
  });
};

SeleniumWebDriverAdaptor.prototype.check = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return SeleniumWebDriverAdaptor.ifCondition(notOperator() + webElement.isSelected(),
    indents(1) + webElement.click()
  );
};

SeleniumWebDriverAdaptor.prototype.click = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).click();
};

SeleniumWebDriverAdaptor.prototype.close = function() {
  var driver = new WDAPI.Driver();
  return driver.close();
};

SeleniumWebDriverAdaptor.prototype.getAttribute = function(attributeLocator) {
  var attrLocator = this._attributeLocator(this.rawArgs[0]);
  var locator = this._elementLocator(attrLocator.elementLocator);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return webElement.getAttribute(attrLocator.attributeName);
};

SeleniumWebDriverAdaptor.prototype.getBodyText = function() {
  var driver = new WDAPI.Driver();
  return driver.findElement('tag_name', 'BODY').getText();
};

SeleniumWebDriverAdaptor.prototype.getCssCount = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElements(locator.type, locator.string).getSize();
};

SeleniumWebDriverAdaptor.prototype.getLocation = function() {
  var driver = new WDAPI.Driver();
  return driver.getCurrentUrl();
};

SeleniumWebDriverAdaptor.prototype.getText = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getText();
};

SeleniumWebDriverAdaptor.prototype.getTitle = function() {
  var driver = new WDAPI.Driver();
  return driver.getTitle();
};

SeleniumWebDriverAdaptor.prototype.getValue = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).getAttribute('value');
};

SeleniumWebDriverAdaptor.prototype.getXpathCount = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElements(locator.type, locator.string).getSize();
};

SeleniumWebDriverAdaptor.prototype.goBack = function() {
  var driver = new WDAPI.Driver();
  return driver.back();
};

SeleniumWebDriverAdaptor.prototype.isChecked = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).isSelected();
};

SeleniumWebDriverAdaptor.prototype.isElementPresent = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  //var driver = new WDAPI.Driver();
  //TODO: enough to just find element, but since this is an accessor, we will need to make a not null comparison
  //return driver.findElement(locator.type, locator.string);
  return WDAPI.Utils.isElementPresent(locator.type, locator.string);
};

SeleniumWebDriverAdaptor.prototype.isVisible = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).isDisplayed();
};

SeleniumWebDriverAdaptor.prototype.open = function(url) {
  //TODO process the relative and absolute urls
  var absUrl = xlateArgument(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.get(absUrl);
};

SeleniumWebDriverAdaptor.prototype.refresh = function() {
  var driver = new WDAPI.Driver();
  return driver.refresh();
};

SeleniumWebDriverAdaptor.prototype.submit = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).submit();
};

SeleniumWebDriverAdaptor.prototype.type = function(elementLocator, text) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return statement(new SeleniumWebDriverAdaptor.SimpleExpression(webElement.clear())) + "\n" + webElement.sendKeys(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.sendKeys = function(elementLocator, text) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).sendKeys(this.rawArgs[1]);
};

SeleniumWebDriverAdaptor.prototype.uncheck = function(elementLocator) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  var webElement = driver.findElement(locator.type, locator.string);
  return SeleniumWebDriverAdaptor.ifCondition(webElement.isSelected(),
    indents(1) + webElement.click()
  );
};

SeleniumWebDriverAdaptor.prototype.select = function(elementLocator, label) {
  var locator = this._elementLocator(this.rawArgs[0]);
  var driver = new WDAPI.Driver();
  return driver.findElement(locator.type, locator.string).select(this.rawArgs[1].substring("label=".length, this.rawArgs[1].length));
};

//SeleniumWebDriverAdaptor.prototype.isSomethingSelected = function(elementLocator) {
////  var locator = this._elementLocator(this.rawArgs[0]);
////  var driver = new WDAPI.Driver();
////  var webElement = driver.findElement(locator.type, locator.string);
////  return ifCondition(new SeleniumWebDriverAdaptor.SimpleExpression(webElement.isSelected()), function() { return indents(1) + webElement.click() + "\n";} );
////  if (this.args.length != 1) {
////    alert("Arguments for " + this.message + " is not 1, received " + this.args.length);
////    //TODO show the arguments
////  } else {
////    result += 'findElement(';
////    result += this.elementLocator();
////    result += ')';
////    var sel = 'new Select(' + result + ')';
////    result = sel + '.getAllSelectedOptions().isEmpty()';
////    return '!' + result;
////  }
//};
//
//SeleniumWebDriverAdaptor.prototype.isSomethingSelected = function(elementLocator) {
////  var locator = this._elementLocator(this.rawArgs[0]);
////  var driver = new WDAPI.Driver();
////  var webElement = driver.findElement(locator.type, locator.string);
////  return ifCondition(new SeleniumWebDriverAdaptor.SimpleExpression(webElement.isSelected()), function() { return indents(1) + webElement.click() + "\n";} );
////  if (this.args.length != 2) {
////    alert("Arguments for " + this.message + " is not 2, received " + this.args.length);
////    //TODO show the arguments
////  } else {
////    result += 'findElement(';
////    result += this.elementLocator();
////    result += ')';
////    var sel = 'new Select(' + result + ')';
////    result = sel + '.deselectAll();\n';
////    result += sel + this.selectLocator();
////    return result;
////  }
//};

function WDAPI() {
}

