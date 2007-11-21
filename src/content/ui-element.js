//******************************************************************************
// contants

var XHTML_DOCTYPE = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" '
    + '"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">';
var XHTML_XMLNS = 'http://www.w3.org/1999/xhtml';

//******************************************************************************
// globals

var GLOBAL = {
    rollupManager: {}
    , uiMap: {}
};

//******************************************************************************
// hacks

// we use ajaxslt in UI-Element, whose Log object creates a conflict with the
// one defined in the IDE's tools.js . Actually, there would be no conflict if
// every call to Log.write() in xpath.js were couched within an
// "if (xpathdebug)" condition; unfortunately there are some notable exceptions.
// For now, I'm just going to attach a dummy write() method to the Log object
// as a workaround.
try {
    Log.write = function() { }
}
catch (e) {
    // no problem
}

//******************************************************************************
// modifications to built-in objects

String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, '');
};

/**
 * Given a string literal that would appear in an XPath, puts it in quotes and
 * returns it. Special consideration is given to literals who themselves
 * contain quotes. It's possible for a concat() expression to be returned.
 */
String.prototype.quoteForXPath = function()
{
    if (/\'/.test(this)) {
        if (/\"/.test(this)) {
            // concat scenario
            var pieces = [];
            var a = "'", b = '"', c;
            for (var i = 0, j = 0; i < this.length;) {
                if (this[i] == a) {
                    // encountered a quote that cannot be contained in current
                    // quote, so need to flip-flop quoting scheme
                    if (j < i) {
                        pieces.push(a + this.substring(j, i) + a);
                        j = i;
                    }
                    c = a;
                    a = b;
                    b = c;
                }
                else {
                    ++i;
                }
            }
            pieces.push(a + this.substring(j) + a);
            return 'concat(' + pieces.join(', ') + ')';
        }
        else {
            // quote with doubles
            return '"' + this + '"';
        }
    }
    // quote with singles
    return "'" + this + "'";
};

/**
 * Escape the special regular expression characters when the regular expression
 * is specified as a string.
 *
 * Based on: http://simonwillison.net/2006/Jan/20/escape/
 */
RegExp.escape = (function() {
    var specials = [
        '/', '.', '*', '+', '?', '|',
        '(', ')', '[', ']', '{', '}', '\\'
    ];
    
    var sRE = new RegExp(
        '(\\' + specials.join('|\\') + ')', 'g'
    );
  
    return function(text) {
        return text.replace(sRE, '\\$1');
    }
})();

//******************************************************************************
// functions directly related to the IDE

function is_IDE()
{
    return (typeof(SeleniumIDE) != 'undefined');
}

/**
 * Displays a warning message to the user appropriate to the context under which
 * the issue is encountered. This is primarily used to avoid popping up alert
 * dialogs that might pause an automated test suite.
 *
 * @param msg  the warning message to display
 */
function smart_alert(msg)
{
    if (is_IDE()) {
        alert(msg);
    }
}

function smart_log(level, msg)
{
    try {
        LOG[level](msg);
    }
    catch (e) {
        // couldn't log!
    }
}

//******************************************************************************
// xpath functionality ... modified from ajaxslt

TokenExpr.prototype.toString = function(infoObj) {
  return this.value;
}

LocationExpr.prototype.toString = function(infoObj) {
  var ret = "";
  for (var i = 0; i < this.steps.length; ++i) {
    ret += this.steps[i].toString(infoObj || {});
  }
  return ret;
}

StepExpr.prototype.toString = function(infoObj) {
  var ret;
  if (this.axis == xpathAxis.DESCENDANT_OR_SELF) {
    if (infoObj.isTopStepInPredicate) {
      infoObj.isTopStepInPredicate = false;
    }
    ret = '//';
  }
  else if (this.axis == xpathAxis.CHILD) {
    if (infoObj.isTopStepInPredicate) {
      infoObj.isTopStepInPredicate = false;
      ret = "";
    }
    else {
      ret = '/';
    }
  }
  else if (this.axis == xpathAxis.ATTRIBUTE) {
    if (infoObj.isTopStepInPredicate) {
      infoObj.isTopStepInPredicate = false;
      ret = "";
    }
    else {
      ret = '/';
    }
    ret += '@';
  }
  else {
    if (infoObj.isTopStepInPredicate) {
      infoObj.isTopStepInPredicate = false;
      ret = ""
    }
    else {
      ret = '/';
    }
    ret += this.axis + '::';
  }
  infoObj.axis = this.axis;
  var infoObj2 = clone(infoObj);
  ret += this.nodetest.toString(infoObj2)
    
  for (var i = 0; i < this.predicate.length; ++i) {
    infoObj2 = clone(infoObj);
    ret += this.predicate[i].toString(infoObj2);
  }
  return ret;
}

NodeTestAny.prototype.toString = function(infoObj) {
  return 'node()';
}

// this is changed between ajaxslt 0.6 and 0.7 . Since the version used by the
// IDE and by the RC may be different, try to accommodate either.
try {
    NodeTestElement.prototype.toString = function(infoObj) {
      return '*';
    }
}
catch (e) {
    NodeTestElementOrAttribute.prototype.toString = function(infoObj) {
      return '*';
    }
}

NodeTestText.prototype.toString = function(infoObj) {
  return 'text()';
}

NodeTestComment.prototype.toString = function(infoObj) {
  return 'comment()';
}

NodeTestPI.prototype.toString = function(infoObj) {
  return 'processing-instruction()';
}

NodeTestNC.prototype.toString = function(infoObj) {
  return this.nsprefix + ':*';
}

NodeTestName.prototype.toString = function(infoObj) {
    var ret = "";
    if (infoObj.axis != xpathAxis.ATTRIBUTE) {
        var matches = /^(?:([^:]+):)?(.+)$/.exec(this.name);
        if (matches) {
            var ns =
                (infoObj.transform && infoObj.transform.NodeTestNameNamespace)
                ? infoObj.transform.NodeTestNameNamespace(matches[1])
                : matches[1];
            if (ns) {
                ret += ns + ':';
            }
            ret += (
                (infoObj.transform && infoObj.transform.NodeTestNameElement)
                ? infoObj.transform.NodeTestNameElement(matches[2])
                : matches[2]);
        }
        else {
            ret += (
                (infoObj.transform && infoObj.transform.NodeTestNameElement)
                ? infoObj.transform.NodeTestNameElement(this.name)
                : this.name);
        }
    }
    return ret || this.name;
}

PredicateExpr.prototype.toString = function(infoObj) {
  // needed to add special isTopStepInPredicate logic, because the syntax of
  // the top step expression within a predicate is a little tricky.
  infoObj.isTopStepInPredicate = true;
  var ret = '[' + this.expr.toString(infoObj) + ']';
  return ret;
}

FunctionCallExpr.prototype.toString = function(infoObj) {
  var ret = this.name.value + '(';
  for (var i = 0; i < this.args.length; ++i) {
    if (i > 0) {
      ret += ', ';
    }
    var infoObj2 = clone(infoObj);
    ret += this.args[i].toString(infoObj2);
  }
  ret += ')';
  return ret;
}

UnionExpr.prototype.toString = function(infoObj) {
  var infoObj2 = clone(infoObj);
  return this.expr1.toString(infoObj) + ' | ' + this.expr2.toString(infoObj2);
}

PathExpr.prototype.toString = function(infoObj) {
  var infoObj2 = clone(infoObj);
  var ret = this.filter.toString(infoObj) + this.rel.toString(infoObj2);
  return ret;
}

FilterExpr.prototype.toString = function(infoObj) {
  var infoObj2 = clone(infoObj);
  var ret = this.expr.toString(infoObj2);
  for (var i = 0; i < this.predicate.length; ++i) {
    infoObj2 = clone(infoObj);
    ret += this.predicate[i].toString(infoObj2);
  }
  return ret;
}

UnaryMinusExpr.prototype.toString = function(infoObj) {
  return '-' + this.expr.toString(infoObj);
}

BinaryExpr.prototype.toString = function(infoObj) {
  var space = (this.op.value == '=' ? "" : ' ');
  var infoObj2 = clone(infoObj);
  return this.expr1.toString(infoObj) + space + this.op.value + space
    + this.expr2.toString(infoObj2);
}

LiteralExpr.prototype.toString = function(infoObj) {
  return this.value.quoteForXPath();
}

NumberExpr.prototype.toString = function(infoObj) {
  return '' + this.value;
}

VariableExpr.prototype.toString = function(infoObj) {
  return '$' + this.name;
}

XNode.prototype.toString = function(infoObj) {
  return this.nodeName;
}

ExprContext.prototype.toString = function(infoObj) {
  return '[' + this.position + '/' + this.nodelist.length + '] ' + 
  this.node.nodeName;
}

function Value_toString(infoObj) {
  return this.type + ': ' + this.value;
}

StringValue.prototype.toString = Value_toString;
NumberValue.prototype.toString = Value_toString;
BooleanValue.prototype.toString = Value_toString;
NodeSetValue.prototype.toString = Value_toString;

/**
 * Wrapper around the XPath expressions' toString() functions for implementing
 * syntax simplifications.
 *
 * @param xpath      the XPath string to transform
 * @param transform  an object mapping names of XPath expression types to their
 *                   transformation functions, if any
 */
function xpathTransform(xpath, transform)
{
    var xpathObj = xpathParse(xpath);
    xpath = xpathObj.toString({
        transform: transform
    });
    xpath = xpath.replace(/\/\/(?:\/)?node\(\)\//g, '//');
    xpath = xpath.replace(/parent::node\(\)/g, '..');
    return xpath;
}

/**
 * Converts all element node test names in an XPath to uppercase.
 *
 * @param xpath  the XPath whose element names to convert to uppercase
 * @throws       parse error if the XPath is malformed
 * @return       the uppercased XPath
 */
function xpathToUpperCase(xpath)
{
    // String.toUpperCase is not defined for IE, so wrap the function
    return xpathTransform(xpath, { NodeTestNameElement:
        function(s) { return s.toUpperCase(); }
    });
}

/**
 * The symmetric lowercase function for xpathToUpperCase().
 *
 * @param xpath  the XPath whose element names to convert to lowercase
 * @throws       parse error if the XPath is malformed
 * @return       the lowercased XPath
 */
function xpathToLowerCase(xpath)
{
    return xpathTransform(xpath, { NodeTestNameElement:
        function(s) { return s.toLowerCase(); }
    });
}
 
/**
 * Adds a namespace prefix to all element node test name in an XPath expression.
 *
 * @param xpath      XPath expression
 * @param namespace  namespace to add
 * @throws           parse error if the XPath is malformed
 * @return           the modified XPath
 */
function xpathSetNamespace(xpath, namespace)
{
    return xpathTransform(xpath, { NodeTestNameNamespace:
        function(ns) { return namespace; }
    });
}

//******************************************************************************
// extensions to Selenium API

/**
 * Saves the entire contents of the current window canvas to a PNG file.
 * Currently this only works in Mozilla and when running in chrome mode.
 * Implementation mostly borrowed from the Screengrab! Firefox extension.
 * Please see http://www.screengrab.org for details.
 *
 * @param path  the path to the file to persist the screenshot as. No filename
 *              extension will be appended by default. Directories will not
 *              be created if they do not exist, and an exception will be
 *              thrown, possibly by native code.
 */
Selenium.prototype.doTakeScreenshot = function(path) {
    // can only take screenshots in Mozilla chrome mode
    if (!browserVersion.isChrome) {
        throw new SeleniumError('takeScreenshot is only implemented for ' +
            'chrome browsers, but the current browser is not chrome.');
    }
    
    // do or do not ... there is no try
    
    var grabber = {
        prepareCanvas: function(width, height) {
            var styleWidth = width + 'px';
            var styleHeight = height + 'px';
            
            var grabCanvas = document.getElementById('screenshot_canvas');
            if (!grabCanvas) {
                // create the canvas
                var ns = 'http://www.w3.org/1999/xhtml';
                grabCanvas = document.createElementNS(ns, 'html:canvas');
                grabCanvas.id = 'screenshot_canvas';
                grabCanvas.style.display = 'none';
                document.documentElement.appendChild(grabCanvas);
            }
            
            grabCanvas.width = width;
            grabCanvas.style.width = styleWidth;
            grabCanvas.style.maxWidth = styleWidth;
            grabCanvas.height = height;
            grabCanvas.style.height = styleHeight;
            grabCanvas.style.maxHeight = styleHeight;
        
            return grabCanvas;
        },
        
        prepareContext: function(canvas, box) {
            var context = canvas.getContext('2d');
            context.clearRect(box.x, box.y, box.width, box.height);
            context.save();
            return context;
        }
    };
    
    var SGNsUtils = {
        dataUrlToBinaryInputStream: function(dataUrl) {
            var nsIoService = Components.classes["@mozilla.org/network/io-service;1"]
                .getService(Components.interfaces.nsIIOService);
            var channel = nsIoService
                .newChannelFromURI(nsIoService.newURI(dataUrl, null, null));
            var binaryInputStream = Components.classes["@mozilla.org/binaryinputstream;1"]
                .createInstance(Components.interfaces.nsIBinaryInputStream);
            
            binaryInputStream.setInputStream(channel.open());
            return binaryInputStream;
        },
        
        newFileOutputStream: function(nsFile) {
            var writeFlag = 0x02; // write only
            var createFlag = 0x08; // create
            var truncateFlag = 0x20; // truncate
            var fileOutputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                .createInstance(Components.interfaces.nsIFileOutputStream);
                
            fileOutputStream.init(nsFile,
                writeFlag | createFlag | truncateFlag, 0664, null);
            return fileOutputStream;
        },
        
        writeBinaryInputStreamToFileOutputStream:
        function(binaryInputStream, fileOutputStream) {
            var numBytes = binaryInputStream.available();
            var bytes = binaryInputStream.readBytes(numBytes);
            fileOutputStream.write(bytes, numBytes);
        }
    };
    
    // compute dimensions
    var window = this.browserbot.getCurrentWindow();
    var doc = window.document.documentElement;
    var box = {
        x: 0,
        y: 0,
        width: doc.scrollWidth,
        height: doc.scrollHeight
    };
    LOG.debug('computed dimensions');
    
    // grab
    var format = 'png';
    var canvas = grabber.prepareCanvas(box.width, box.height);
    var context = grabber.prepareContext(canvas, box);
    context.drawWindow(window, box.x, box.y, box.width, box.height,
        'rgb(0, 0, 0)');
    context.restore();
    var dataUrl = canvas.toDataURL("image/" + format);
    LOG.debug('grabbed to canvas');
    
    // save to file
    var nsFile = Components.classes["@mozilla.org/file/local;1"]
        .createInstance(Components.interfaces.nsILocalFile);
    nsFile.initWithPath(path);
    var binaryInputStream = SGNsUtils.dataUrlToBinaryInputStream(dataUrl);
    var fileOutputStream = SGNsUtils.newFileOutputStream(nsFile);
    SGNsUtils.writeBinaryInputStreamToFileOutputStream(binaryInputStream,
        fileOutputStream);
    fileOutputStream.close();
    LOG.debug('saved to file');
};



/**
 * Executes a command rollup, which is a set of commands with a unique name,
 * and optionally arguments that control the generation of the set of commands.
 * If any one of the rolled-up commands fails, the rollup is considered to have
 * failed. Rollups may also contain nested rollups.
 *
 * @param rollupName  the name of the rollup command
 * @param kwargs      keyword arguments string that influences how the rollup
 *                    expands into commands
 */
Selenium.prototype.doRollup = function(rollupName, kwargs) {
    // we have to temporarily hijack the commandStarted, nextCommand(),
    // commandComplete(), and commandError() methods of the TestLoop object.
    // When the expanded rollup commands are done executing (or an error has
    // occurred), we'll restore them to their original values.
    var loop = currentTest || htmlTestRunner.currentTest;
    var backupManager = {
        backup: function() {
            for (var item in this.data) {
                this.data[item] = loop[item];
            }
        }
        , restore: function() {
            for (var item in this.data) {
                loop[item] = this.data[item];
            }
        }
        , data: {
            requiresCallBack: null
            , commandStarted: null
            , nextCommand: null
            , commandComplete: null
            , commandError: null
            , pendingRollupCommands: null
            , rollupFailed: null
            , rollupFailedMessage: null
        }
    };
    
    var rule = GLOBAL.rollupManager.getRollupRule(rollupName);
    var expandedCommands = rule.getExpandedCommands(kwargs);
    
    // hold your breath ...
    try {
        backupManager.backup();
        loop.requiresCallBack = false;
        loop.commandStarted = function() {};
        loop.nextCommand = function() {
            if (this.pendingRollupCommands.length == 0) {
                return null;
            }
            var command = this.pendingRollupCommands.shift();
            return command;
        };
        loop.commandComplete = function(result) {
            if (result.failed) {
                this.rollupFailed = true;
                this.rollupFailureMessages.push(result.failureMessage);
            }
            
            if (this.pendingRollupCommands.length == 0) {
                result = {
                    failed: this.rollupFailed
                    , failureMessage: this.rollupFailureMessages.join('; ')
                };
                LOG.info('Rollup execution complete: ' + (result.failed
                    ? 'failed! (see error messages below)' : 'ok'));
                backupManager.restore();
                this.commandComplete(result);
            }
        };
        loop.commandError = function(errorMessage) {
            LOG.info('Rollup execution complete: bombed!');
            backupManager.restore();
            this.commandError(errorMessage);
        };
        
        loop.pendingRollupCommands = expandedCommands;
        loop.rollupFailed = false;
        loop.rollupFailureMessages = [];
    }
    catch (e) {
        LOG.error('Rollup error: ' + e);
        backupManager.restore();
    }
};

//******************************************************************************

/**
 * The Command object isn't available in the Selenium RC. We introduce an
 * object with the identical constructor, and set its prototype if possible
 * (only when running in the IDE).
 *
 * @param command
 * @param target
 * @param value
 */
function Command2(command, target, value) {
    this.command = command != null ? command : '';
    this.target = target != null ? target : '';
    this.value = value != null ? value : '';
}

if (typeof(Command) != 'undefined') {
    Command2.prototype = new Command;
}



function CommandMatcherException(message)
{
    this.message = message;
    this.name = 'CommandMatcherException';
}

/**
 * A CommandMatcher object matches commands during the application of a
 * RollupRule. It's specified with a shorthand format, for example:
 *
 *  new CommandMatcher({
 *      command: 'click'
 *      , target: 'ui=allPages::.+'
 *  })
 *
 * which is intended to match click commands whose target is an element in the
 * allPages PageSet. The matching expressions are given as regular expressions;
 * in the example above, the command must be "click"; "clickAndWait" would be
 * acceptable if 'click.*' were used. Here's a more complete example:
 *
 *  new CommandMatcher({
 *      command: 'type'
 *      , target: 'ui=loginPages::username()'
 *      , value: '.+_test'
 *      , updateArgs: function(command, args) {
 *          args.username = command.value;
 *      }
 *  })
 *
 * Here, the command and target are fixed, but there is variability in the 
 * value of the command. When a command matches, the username is saved to the
 * arguments object.
 */
function CommandMatcher(commandMatcherShorthand)
{
    /**
     * Ensure the shorthand notation used to initialize the CommandMatcher has
     * all required values.
     *
     * @param commandMatcherShorthand  an object containing information about
     *                                 the CommandMatcher
     */
    this.validate = function(commandMatcherShorthand) {
        var msg = "CommandMatcher validation error:\n"
            + print_r(commandMatcherShorthand);
        if (!commandMatcherShorthand.command) {
            throw new CommandMatcherException(msg + 'no command specified!');
        }
        if (!commandMatcherShorthand.target) {
            throw new CommandMatcherException(msg + 'no target specified!');
        }
        if (commandMatcherShorthand.minMatches &&
            commandMatcherShorthand.maxMatches &&
            commandMatcherShorthand.minMatches >
            commandMatcherShorthand.maxMatches) {
            throw new CommandMatcherException(msg + 'minMatches > maxMatches!');
        }
        
        return true;
    };

    /**
     * Initialize this object.
     *
     * @param commandMatcherShorthand  an object containing information used to
     *                                 initialize the CommandMatcher
     */
    this.init = function(commandMatcherShorthand) {
        this.validate(commandMatcherShorthand);
        
        this.command = commandMatcherShorthand.command;
        this.target = commandMatcherShorthand.target;
        this.value = commandMatcherShorthand.value || null;
        this.minMatches = commandMatcherShorthand.minMatches || 1;
        this.maxMatches = commandMatcherShorthand.maxMatches || 1;
        this.updateArgs = commandMatcherShorthand.updateArgs ||
            function(command, args) { return args; };
    };
    
    /**
     * Determines whether a given command matches. Updates args by "reference"
     * and returns true if it does; return false otherwise.
     *
     * @param command  the command to attempt to match
     */
    this.isMatch = function(command) {
        var re = new RegExp('^' + this.command + '$');
        if (! re.test(command.command)) {
            return false;
        }
        re = new RegExp('^' + this.target + '$');
        if (! re.test(command.target)) {
            return false;
        }
        if (this.value != null) {
            re = new RegExp('^' + this.value + '$');
            if (! re.test(command.value)) {
                return false;
            }
        }
        
        // okay, the command matches
        return true;
    };
    
    // initialization
    this.init(commandMatcherShorthand);
}



function RollupRuleException(message)
{
    this.message = message;
    this.name = 'RollupRuleException';
}

function RollupRule(rollupRuleShorthand)
{
    /**
     * Ensure the shorthand notation used to initialize the RollupRule has all
     * required values.
     *
     * @param rollupRuleShorthand  an object containing information about the
     *                             RollupRule
     */
    this.validate = function(rollupRuleShorthand) {
        var msg = "RollupRule validation error:\n"
            + print_r(rollupRuleShorthand);
        if (!rollupRuleShorthand.name) {
            throw new RollupRuleException(msg + 'no name specified!');
        }
        if (!rollupRuleShorthand.description) {
            throw new RollupRuleException(msg + 'no description specified!');
        }
        // rollupRuleShorthand.args is optional
        if (!rollupRuleShorthand.commandMatchers &&
            !rollupRuleShorthand.getRollup) {
            throw new RollupRuleException(msg
                + 'no command matchers specified!');
        }
        if (!rollupRuleShorthand.expandedCommands &&
            !rollupRuleShorthand.getExpandedCommands) {
            throw new RollupRuleException(msg
                + 'no expanded commands specified!');
        }
        
        return true;
    };

    /**
     * Initialize this object.
     *
     * @param rollupRuleShorthand  an object containing information used to
     *                             initialize the RollupRule
     */
    this.init = function(rollupRuleShorthand) {
        this.validate(rollupRuleShorthand);
        
        this.name = rollupRuleShorthand.name;
        this.description = rollupRuleShorthand.description;
        this.pre = rollupRuleShorthand.pre || '';
        this.post = rollupRuleShorthand.post || '';
        this.alternateCommand = rollupRuleShorthand.alternateCommand;
        this.args = rollupRuleShorthand.args || [];
        
        if (rollupRuleShorthand.commandMatchers) {
            // construct the rule from the list of CommandMatchers
            this.commandMatchers = [];
            var matchers = rollupRuleShorthand.commandMatchers;
            for (var i = 0; i < matchers.length; ++i) {
                if (matchers[i].updateArgs && this.args.length == 0) {
                    // enforce metadata for arguments
                    var msg = "RollupRule validation error:\n"
                        + print_r(rollupRuleShorthand)
                        + 'no argument metadata provided!';
                    throw new RollupRuleException(msg);
                }
                this.commandMatchers.push(new CommandMatcher(matchers[i]));
            }
            
            // returns false if the rollup doesn't match, or a rollup command
            // if it does. If returned, the command contains the
            // replacementIndexes property, which indicates which commands it
            // substitutes for.
            this.getRollup = function(commands) {
                // this is a greedy matching algorithm
                var replacementIndexes = [];
                var commandMatcherQueue = this.commandMatchers;
                var matchCount = 0;
                var args = {};
                for (var i = 0, j = 0; i < commandMatcherQueue.length;) {
                    var matcher = commandMatcherQueue[i];
                    if (j >= commands.length) {
                        // we've run out of commands! If the remaining matchers
                        // do not have minMatches requirements, this is a
                        // match. Otherwise, it's not.
                        if (matcher.minMatches > 0) {
                            return false;
                        }
                        ++i;
                        matchCount = 0; // unnecessary, but let's be consistent
                    }
                    else {
                        if (matcher.isMatch(commands[j])) {
                            ++matchCount;
                            if (matchCount == matcher.maxMatches) {
                                // exhausted this matcher's matches ... move on
                                // to next matcher
                                ++i;
                                matchCount = 0;
                            }
                            args = matcher.updateArgs(commands[j], args);
                            replacementIndexes.push(j);
                            ++j; // move on to next command
                        }
                        else {
                            //alert(matchCount + ', ' + matcher.minMatches);
                            if (matchCount < matcher.minMatches) {
                                return false;
                            }
                            // didn't match this time, but we've satisfied the
                            // requirements already ... move on to next matcher
                            ++i;
                            matchCount = 0;
                            // still gonna look at same command
                        }
                    }
                }
                
                var rollup;
                if (this.alternateCommand) {
                    rollup = new Command(this.alternateCommand,
                        commands[0].target, commands[0].value);
                }
                else {
                    rollup = new Command('rollup', this.name);
                    rollup.value = to_kwargs(args);
                }
                rollup.replacementIndexes = replacementIndexes;
                return rollup;
            };
        }
        else {
            this.getRollup = function(commands) {
                var result = rollupRuleShorthand.getRollup(commands);
                if (result) {
                    var rollup = new Command(
                        result.command
                        , result.target
                        , result.value
                    );
                    rollup.replacementIndexes = result.replacementIndexes;
                    return rollup;
                }
                return false;
            };
        }
        
        this.getExpandedCommands = function(kwargs) {
            var commands = [];
            var expandedCommands = (rollupRuleShorthand.expandedCommands
                ? rollupRuleShorthand.expandedCommands
                : rollupRuleShorthand.getExpandedCommands(
                    parse_kwargs(kwargs)));
            for (var i = 0; i < expandedCommands.length; ++i) {
                var command = expandedCommands[i];
                commands.push(new Command2(
                    command.command
                    , command.target
                    , command.value
                ));
            }
            return commands;
        };
    };
    
    this.init(rollupRuleShorthand);
}



/**
 *
 */
function RollupManager()
{
    this.init = function()
    {
        this.rollupRules = {};
        if (is_IDE()) {
            Editor.rollupManager = this;
        }
    };

    /**
     * Adds a new RollupRule to the repository. Returns true on success, or
     * false if the rule couldn't be added.
     *
     * @param rollupRuleShorthand  shorthand JSON specification of the new
     *                             RollupRule, possibly including CommandMatcher
     *                             shorthand too.
     * @return                     true if the rule was added successfully,
     *                             false otherwise.
     */
    this.addRollupRule = function(rollupRuleShorthand)
    {
        try {
            var rule = new RollupRule(rollupRuleShorthand);
            this.rollupRules[rule.name] = rule;
        }
        catch(e) {
            smart_alert("Could not create RollupRule from shorthand:\n\n"
                + e.message);
            return false;
        }
        return true;
    };
    
    /**
     * Returns a RollupRule by name.
     *
     * @param rollupName  the name of the rule to fetch
     * @return            the RollupRule, or null if it isn't found.
     */
    this.getRollupRule = function(rollupName)
    {
        return (this.rollupRules[rollupName] || null);
    };
    
    /**
     * Returns a list of name-description pairs for use in populating the
     * auto-populated target dropdown in the IDE. Rules that have an alternate
     * command defined are not included in the list, as they are not bona-fide
     * rollups.
     *
     * @return  a list of name-description pairs
     */
    this.getRollupRulesForDropdown = function()
    {
        var targets = [];
        var names = keys(this.rollupRules).sort();
        for (var i = 0; i < names.length; ++i) {
            var name = names[i];
            if (this.rollupRules[name].alternateCommand) {
                continue;
            }
            targets.push([ name, this.rollupRules[name].description ]);
        }
        return targets;
    };
    
    /**
     * Applies all rules to the current editor commands, asking the user in
     * each case if it's okay to perform the replacement. The rules are applied
     * repeatedly until there are no more matches. The algorithm should
     * remember when the user has declined a replacement, and not ask to do it
     * again.
     *
     * @return  the list of commands with rollup replacements performed
     */
    this.applyRollupRules = function()
    {
        var commands = editor.getTestCase().commands;
        var blacklistedRollups = {};
    
        // so long as rollups were performed, we need to keep iterating through
        // the commands starting at the beginning, because further rollups may
        // potentially be applied on the newly created ones.
        while (true) {
            var performedRollup = false;
            for (var i = 0; i < commands.length; ++i) {
                // iterate through commands
                for (var rollupName in this.rollupRules) {
                    var rule = this.rollupRules[rollupName];
                    var rollup = rule.getRollup(commands.slice(i));
                    if (rollup) {
                        // since we passed in a sliced version of the commands
                        // array to the getRollup() method, we need to re-add 
                        // the offset to the replacementIndexes
                        var k = 0;
                        for (; k < rollup.replacementIndexes.length; ++k) {
                            rollup.replacementIndexes[k] += i;
                        }
                        
                        // build the confirmation message
                        var msg = "Perform the following command rollup?\n\n";
                        for (k = 0; k < rollup.replacementIndexes.length; ++k) {
                            var replacementIndex = rollup.replacementIndexes[k];
                            var command = commands[replacementIndex];
                            msg += '[' + replacementIndex + ']: ';
                            msg += command + "\n";
                        }
                        msg += "\n";
                        msg += rollup;
                        
                        // check against blacklisted rollups
                        if (blacklistedRollups[msg]) {
                            continue;
                        }
                        
                        // highlight the potentially replaced rows
                        for (k = 0; k < commands.length; ++k) {
                            var command = commands[k];
                            command.result = '';
                            if (rollup.replacementIndexes.indexOf(k) != -1) {
                                command.selectedForReplacement = true;
                            }
                            editor.view.rowUpdated(replacementIndex);
                        }
                        
                        // get confirmation from user
                        if (confirm(msg)) {
                            // perform rollup
                            var deleteRanges = [];
                            var replacementIndexes = rollup.replacementIndexes;
                            for (k = 0; k < replacementIndexes.length; ++k) {
                                // this is expected to be list of ranges. A
                                // range has a start, and a list of commands.
                                // The deletion only checks the length of the
                                // command list.
                                deleteRanges.push({
                                    start: replacementIndexes[k]
                                    , commands: [ 1 ]
                                });
                            }
                            editor.view.executeAction(new TreeView
                                .DeleteCommandAction(editor.view,deleteRanges));
                            editor.view.insertAt(i, rollup);
                            
                            performedRollup = true;
                        }
                        else {
                            // cleverly remember not to try this rollup again
                            blacklistedRollups[msg] = true;
                        }
                        
                        // unhighlight
                        for (k = 0; k < commands.length; ++k) {
                            commands[k].selectedForReplacement = false;
                            editor.view.rowUpdated(k);
                        }
                    }
                }
            }
            if (!performedRollup) {
                break;
            }
        }
        return commands;
    };
    
    
    
    GLOBAL.rollupManager = this;
    this.init();
}



/**
 *
 * @param locator  the locator to parse
 */
function parse_locator(locator)
{
    var result = locator.match(/^([A-Za-z]+)=(.+)/);
    if (result) {
        return { type: result[1].toLowerCase(), string: result[2] };
    }
    return { type: 'implicit', string: locator };
}



/**
 * This function duplicates part of BrowserBot.findElement() to open up locator
 * evaluation on arbitrary documents. It returns a located element, or throws
 * a SeleniumError if the locator does not evaluate to a document node. This
 * should replace eval_xpath().
 *
 * @param locator  a locator string
 * @param inDocument  the document in which to apply the locator
 */
function eval_locator(locator, inDocument)
{
    locator = parse_locator(locator);
    
    var element;
    if (typeof(selenium) != 'undefined') {
        // if the locator is an XPath, uppercase it for IE, and lowercase it
        // for Safari. We can add more browser-specific casing rules for other
        // browsers here too.
        if (locator.type == 'xpath' || (locator.type == 'implicit' &&
            locator.string.substring(0, 2) == '//')) {
            if (browserVersion) {
                if (browserVersion.isIE) {
                    try {
                        smart_log('info', 'Locator: ' + locator.string);
                        locator.string = xpathToUpperCase(locator.string);
                    }
                    catch (e) {
                        smart_log('error', e);
                    }
                }
                else if (browserVersion.isSafari) {
                    locator.string = xpathToLowerCase(locator.string);
                }
            }
        }
        if (typeof(editor) == 'undefined' || editor.state == 'playing') {
            smart_log('info', 'Trying [' + locator.type + ']: '
                + locator.string);
        }
        element = selenium.browserbot.findElementBy(locator.type,
            locator.string, inDocument);
    }
    else {
        if (!GLOBAL.mozillaBrowserBot) {
            // create a browser bot to evaluate the locator. Hand it the IDE
            // window as a dummy window.
            GLOBAL.mozillaBrowserBot = new MozillaBrowserBot(window)
        }
        element = GLOBAL.mozillaBrowserBot
            .findElementBy(locator.type, locator.string, inDocument);
    }
    if (element != null) {
        return element;
    }
    
    // Element was not found by any locator function.
    throw new SeleniumError("Element " + locator.string + " not found");
}



/**
 * Create a clone of an object and return it. This is a deep copy of everything
 * but functions, whose references are copied. You shouldn't expect a deep copy
 * of functions anyway.
 *
 * @param orig  the original object to copy
 * @return      a deep copy of the original object. Any functions attached,
 *              however, will have their references copied only.
 */
function clone(orig) {
    var copy;
    switch(typeof(orig)) {
        case 'object':
            copy = (orig.length) ? [] : {};
            for (var attr in orig) {
                copy[attr] = clone(orig[attr]);
            }
            break;
        default:
            copy = orig;
            break;
    }
    return copy;
}



/**
 * Emulates php's print_r() functionality. Returns a nicely formatted string
 * representation of an object. Very useful for debugging.
 *
 * @param object    the object to dump
 * @param maxDepth  the maximum depth to recurse into the object. Ellipses will
 *                  be shown for objects whose depth exceeds the maximum.
 * @param indent    the string to use for indenting progressively deeper levels
 *                  of the dump.
 * @return          a string representing a dump of the object
 */
function print_r(object, maxDepth, indent)
{
    var parentIndent, attr, str = "";
    if (arguments.length == 1) {
        var maxDepth = Number.MAX_VALUE;
    } else {
        maxDepth--;
    }
    if (arguments.length < 3) {
        parentIndent = ''
        var indent = '    ';
    } else {
        parentIndent = indent;
        indent += '    ';
    }

    switch(typeof(object)) {
    case 'object':
        if (object.length != undefined) {
            if (object.length == 0) {
                str += "Array ()\r\n";
            }
            else {
                str += "Array (\r\n";
                for (var i = 0; i < object.length; ++i) {
                    str += indent + '[' + i + '] => ';
                    if (maxDepth == 0)
                        str += "...\r\n";
                    else
                        str += print_r(object[i], maxDepth, indent);
                }
                str += parentIndent + ")\r\n";
            }
        }
        else {
            str += "Object (\r\n";
            for (attr in object) {
                str += indent + "[" + attr + "] => ";
                if (maxDepth == 0)
                    str += "...\r\n";
                else
                    str += print_r(object[attr], maxDepth, indent);
            }
            str += parentIndent + ")\r\n";
        }
        break;
    case 'boolean':
        str += (object ? 'true' : 'false') + "\r\n";
        break;
    case 'function':
        str += "Function\r\n";
        break;
    default:
        str += object + "\r\n";
        break;

    }
    return str;
}



/**
 * Return an array containing all properties of an object. Perl-style.
 *
 * @param object  the object whose keys to return
 * @return        array of object keys, as strings
 */
function keys(object)
{
    var keys = [];
    for (var k in object) {
        keys.push(k);
    }
    return keys;
}



/**
 * Emulates python's range() built-in. Returns an array of integers, counting
 * up (or down) from start to end. Note that the range returned is up to, but
 * NOT INCLUDING, end.
 *.
 * @param start  integer from which to start counting. If the end parameter is
 *               not provided, this value is considered the end and start will
 *               be zero.
 * @param end    integer to which to count. If omitted, the function will count
 *               up from zero to the value of the start parameter. Note that
 *               the array returned will count up to but will not include this
 *               value.
 * @return       an array of consecutive integers. 
 */
function range(start, end)
{
    if (arguments.length == 1) {
        var end = start;
        start = 0;
    }
    
    var r = [];
    if (start < end) {
        while (start != end)
            r.push(start++);
    }
    else {
        while (start != end)
            r.push(start--);
    }
    return r;
}



/**
 * Parses a python-style keyword arguments string and returns the pairs in a
 * new object.
 *
 * @param  kwargs  a string representing a set of keyword arguments. It should
 *                 look like <tt>keyword1=value1, keyword2=value2, ...</tt>
 * @return         an object mapping strings to strings
 */
function parse_kwargs(kwargs)
{
    var args = new Object();
    var pairs = kwargs.split(/\s*,\s*/);
    for (var i = 0; i < pairs.length; ++i) {
        var splits = pairs[i].split(/=/);
        if (splits.length == 1) {
            continue;
        }
        var key = splits.shift();
        var value = splits.join('=');
        args[key.trim()] = value.trim();
    }
    return args;
}



/**
 * Creates a python-style keyword arguments string from an object.
 *
 * @param args  an associative array mapping strings to strings
 * @return      a kwarg string representation of args
 */
function to_kwargs(args)
{
    var s = '';
    var sortedKeys = keys(args).sort();
    for (var i = 0; i < sortedKeys.length; ++i) {
        var k = sortedKeys[i];
        if (s) {
            s += ', ';
        }
        s += k + '=' + args[k];
    }
    return s;
}


function ParseException(message)
{
    this.message = message;
    this.name = 'ParseException';
}



/**
 * Given a full URL string, returns the base URL and the relative path in a new
 * object. Any trailing forward slash is stripped from the path. If we can find
 * a mozilla built-in that implements this function I'm fine with removing it.
 *
 * @param url  the URL to parse
 * @return     an object with the components of the URL broken out into
 *             <tt>protocol</tt>, <tt>domain</tt>, <tt>path</tt>, and an
 *             associative array containing any <tt>params</tt>.
 * @throws     ParseException
 */
function parse_url(url)
{
    url = unescape(url);
    var matches =
        /^(http|https|chrome):\/\/([^\/]+)\/?([^\?]*)\??(.*)$/.exec(url);
    if (matches == null) {
        throw new ParseException('Invalid input to parse_url(): ' + url);
    }
    
    // parse the cgi parameters
    var params = {};
    if (matches[4]) {
        var pairs = matches[4].split(/&/);
        for (var i = 0; i < pairs.length; ++i) {
            var splits = pairs[i].split('=');
            if (splits.length == 1) {
                continue;
            }
            var key = splits.shift();
            var value = splits.join('=');
            params[key] = value;
        }
    }
    
    return {
        'protocol': matches[1],
        'domain': matches[2],
        'path': matches[3].replace(/\/$/, ''),
        'params': params
    };
}



//******************************************************************************



/**
 * Returns true if a node is an ancestor node of a target node, and false
 * otherwise.
 *
 * @param node    the node being compared to the target node
 * @param target  the target node
 * @return        true if node is an ancestor node of target, false otherwise.
 */
function is_ancestor(node, target)
{
    while (target.parentNode) {
        target = target.parentNode;
        if (node == target)
            return true;
    }
    return false;
}



//*****************************************************************************



function UIElementException(message)
{
    this.message = message;
    this.name = 'UIElementException';
}



/**
 * The UIElement object. This has been crafted along with UIMap to make
 * specifying UI elements using JSON as simple as possible. Object construction
 * will fail if 1) a proper name isn't provided, 2) a faulty args argument is
 * given, or 3) getLocator() returns undefined for a valid permutation of default
 * argument values.
 *
 * @param name         the name of the UI element
 * @param description  a description of the UI element
 * @param args         a list of argument definition objects. These objects
 *                     must have at minimum the following members: "name",
 *                     "description", and "defaultValues". The former two are
 *                     strings, while the latter is a list of strings or
 *                     numbers.
 * @param getXPath     a function which takes at least one argument.
 * @return             a new UIElement object
 * @throws             UIElementException
 */
function UIElement(uiElementShorthand)
{
    // shorthand notation will look like:
    //
    // {
    //     name: 'topic'
    //     , description: 'sidebar links to topic categories'
    //     , args: [
    //         {
    //             name: 'name'
    //             , description: 'the name of the topic'
    //             , defaultValues: topLevelTopics
    //         }
    //     ]
    //     , getLocator: function(args) {
    //         return this._listXPath +
    //             "/a[text()='" + args['name'] + "']";
    //     }
    //     // maintain testcases for getXPath()
    //     , testcase1: {
    //         // defaultValues used if args not specified
    //         args: { name: 'foo' }
    //         , xhtml: '<div id=?topiclist>'
    //             + '<ul><li><a expected-result>foo</a></li></ul>'
    //             + '</div>'
    //     }
    //     // set a local element variable
    //     , _listXPath: "//div[@id='topiclist']/ul/li"
    // }
    
    // name cannot be null or an empty string. Enforce the same requirement for
    // the description.
    
    /**
     * Recursively returns all permutations of argument-value pairs, given
     * a list of argument definitions. Each argument definition will have
     * a set of default values to use in generating said pairs. If an argument
     * has no default values defined, it will not be included among the
     * permutations.
     *
     * @param args  a list of UIArguments
     * @return      a list of associative arrays containing key value pairs
     */
    this.permuteArgs = function(args) {
        var permutations = [];
        for (var i = 0; i < args.length; ++i) {
            var arg = args[i];
            // skip arguments for which no default values are defined
            var defaultValues = arg.getDefaultValues();
            if (defaultValues.length == 0) {
                continue;
            }
            for (var j = 0; j < defaultValues.length; ++j) {
                var value = defaultValues[j];
                var nextPermutations = this.permuteArgs(args.slice(i+1));
                if (nextPermutations.length == 0) {
                    var permutation = {};
                    permutation[arg.name] = value + ''; // make into string
                    permutations.push(permutation);
                }
                else {
                    for (var k = 0; k < nextPermutations.length; ++k) {
                        nextPermutations[k][arg.name] = value + '';
                        permutations.push(nextPermutations[k]);
                    }
                }
            }
            break;
        }
        return permutations;
    }
    
    
    
    /**
     * Returns a list of all testcases for this UIElement.
     */
    this.getTestcases = function()
    {
        return this.testcases;
    }
    
    
    
    /**
     * Run all unit tests, stopping at the first failure, if any. Return true
     * if no failures encountered, false otherwise. See the following thread
     * regarding use of getElementById() on XML documents created by parsing
     * text via the DOMParser:
     *
     * http://groups.google.com/group/comp.lang.javascript/browse_thread/thread/2b1b82b3c53a1282/
     */
    this.test = function()
    {
        var parser = new DOMParser();
        var testcases = this.getTestcases();
        testcaseLoop: for (var i = 0; i < testcases.length; ++i) {
            var testcase = testcases[i];
            var xhtml = XHTML_DOCTYPE + '<html xmlns="' + XHTML_XMLNS + '">'
                + testcase.xhtml + '</html>';
            var doc = parser.parseFromString(xhtml, "text/xml");
            if (doc.firstChild.nodeName == 'parsererror') {
                smart_alert('Error parsing XHTML in testcase "' + testcase.name
                    + '" for UI element "' + this.name + '": ' + "\n"
                    + doc.firstChild.firstChild.nodeValue);
            }
            
            // we're no longer using the default locators when testing, because
            // args is now required
            var locator = parse_locator(this.getLocator(testcase.args));
            if (locator.type == 'xpath' || (locator.type == 'implicit' &&
                locator.string.substring(0, 2) == '//')) {
                // set the XHTML namespace on the XPath elements, and lowercase
                // them. Do both in one step for efficiency.
                locator.string = xpathTransform(locator.string, {
                    NodeTestNameNamespace: function(ns) { return 'xhtml'; }
                    , NodeTestNameElement: function(name) {
                        return name.toLowerCase();
                    }
                });
            }
            // piece the locator back together
            locator = (locator.type == 'implicit')
                ? locator.string
                : locator.type + '=' + locator.string;
            try {
                result = eval_locator(locator, doc);
                if (result != null &&
                    result.hasAttribute('expected-result')) {
                    continue testcaseLoop;
                }
            }
            catch (e) {
                smart_log('debug', e.message);
            }
            
            // testcase failed
            if (is_IDE()) {
                smart_alert('Testcase "' + testcase.name
                    + '" failed for UI element "' + this.name + '"!');
            }
            return false;
        }
        return true;
    };
    
    
    
    /**
     * Creates a set of locators using permutations of default values for
     * arguments used in the locator construction.
     *
     * @return  a list of locator strings
     * @throws  UIElementException
     */
    this.getDefaultLocators = function() {
        var defaultLocators = {};
        if (this.args.length == 0) {
            defaultLocators[this.getLocator({})] = {};
        }
        else {
            var permutations = this.permuteArgs(this.args);
            if (permutations.length != 0) {
                for (var i = 0; i < permutations.length; ++i) {
                    var args = permutations[i];
                    var locator = this.getLocator(args);
                    if (!locator) {
                        throw new UIElementException('Error in UIElement(): '
                            + 'no getLocator return value for element "' + name
                            + '"');
                    }
                    defaultLocators[locator] = args;
                }
            }
            else {
                // try using no arguments. If it doesn't work, fine.
                try {
                    var locator = this.getLocator();
                    defaultLocators[locator] = {};
                }
                catch (e) {
                    smart_log('debug', e.message);
                }
            }
        }
        return defaultLocators;
    }
    
    
    
    /**
     * Validate the structure of the shorthand notation this object is being
     * initialized with. Throws an exception otherwise if there's a validation
     * error.
     *
     * @param uiElementShorthand
     *
     * @returns  true if validation passed
     * @throws   UIElementException
     */
    this.validate = function(uiElementShorthand)
    {
        var msg = "UIElement validation error:\n" + print_r(uiElementShorthand);
        if (!uiElementShorthand.name) {
            throw new UIElementException(msg + 'no name specified!');
        }
        if (!uiElementShorthand.description) {
            throw new UIElementException(msg + 'no description specified!');
        }
        if (!uiElementShorthand.locator
            && !uiElementShorthand.getLocator
            && !uiElementShorthand.xpath
            && !uiElementShorthand.getXPath) {
            throw new UIElementException(msg + 'no locator specified!');
        }
        
        return true;
    }
    
    
    
    this.init = function(uiElementShorthand)
    {
        this.validate(uiElementShorthand);
        
        this.name = uiElementShorthand.name;
        this.description = uiElementShorthand.description;
        
        // construct a new one getLocator() method based on the locator
        // property, or use the provided function. We're deprecating the xpath
        // property and getXPath() function, but still allow for them for
        // backwards compatability.
        if (uiElementShorthand.locator) {
            this.getLocator = function(args) {
                return uiElementShorthand.locator;
            };
        }
        else if (uiElementShorthand.getLocator) {
            this.getLocator = uiElementShorthand.getLocator;
        }
        else if (uiElementShorthand.xpath) {
            this.getLocator = function(args) {
                return uiElementShorthand.xpath;
            };
        }
        else {
            this.getLocator = uiElementShorthand.getXPath;
        }
        
        // get the testcases and local variables
        this.testcases = [];
        var localVars = {};
        for (var attr in uiElementShorthand) {
            if (attr.match(/^testcase/)) {
                var testcase = uiElementShorthand[attr];
                if (uiElementShorthand.args &&
                    uiElementShorthand.args.length && !testcase.args) {
                    alert('No args defined in ' + attr + ' for UI element '
                        + this.name + '! Skipping testcase.');
                    continue;
                } 
                testcase.name = attr;
                this.testcases.push(testcase);
            }
            else if (attr.match(/^_/)) {
                this[attr] = uiElementShorthand[attr];
                localVars[attr] = uiElementShorthand[attr];
            }
        }
        
        // create the arguments
        this.args = []
        if (uiElementShorthand.args) {
            for (var i = 0; i < uiElementShorthand.args.length; ++i) {
                this.args.push(new UIArgument(uiElementShorthand.args[i],
                    localVars));
            }
        }
        
        this.defaultLocators = this.getDefaultLocators();
    }
    
    
    
    this.init(uiElementShorthand);
}



function UIArgumentException(message)
{
    this.message = message;
    this.name = 'UIArgumentException';
}



/**
 * Constructs a UIArgument. This is mostly for checking that the values are
 * valid.
 *
 * @param uiArgumentShorthand
 * @param parent
 *
 * @throws               UIArgumentException
 */
function UIArgument(uiArgumentShorthand, localVars)
{
    /**
     * @param uiArgumentShorthand
     * @returns  true if validation passed
     */
    this.validate = function(uiArgumentShorthand)
    {
        var msg = "UIArgument validation error:\n"
            + print_r(uiArgumentShorthand);
        
        // try really hard to throw an exception!
        if (!uiArgumentShorthand.name) {
            throw new UIArgumentException(msg + 'no name specified!');
        }
        if (!uiArgumentShorthand.description) {
            throw new UIArgumentException(msg + 'no description specified!');
        }
        if (!uiArgumentShorthand.defaultValues &&
            !uiArgumentShorthand.getDefaultValues) {
            throw new UIArgumentException(msg + 'no default values specified!');
        }
        
        return true;
    };
    
    
    
    /**
     * @param uiArgumentShorthand
     * @param localVars            a list of local variables
     */
    this.init = function(uiArgumentShorthand, localVars)
    {
        this.validate(uiArgumentShorthand);
        this.name = uiArgumentShorthand.name;
        this.description = uiArgumentShorthand.description;
        if (uiArgumentShorthand.defaultValues) {
            var defaultValues = uiArgumentShorthand.defaultValues;
            this.getDefaultValues =
                function() { return defaultValues; }
        }
        else {
            this.getDefaultValues = uiArgumentShorthand.getDefaultValues;
        }
        
        for (var name in localVars) {
            this[name] = localVars[name];
        }
    }
    
    
    
    this.init(uiArgumentShorthand, localVars);
}



function UISpecifierException(message)
{
    this.message = message;
    this.name = 'UISpecifierException';
}



/**
 * The UISpecifier constructor is overloaded. If less than three arguments are
 * provided, the first argument will be considered a UI specifier string, and
 * will be split out accordingly. Otherwise, the first argument will be
 * considered the path.
 *
 * @param uiSpecifierStringOrPagesetName  a UI specifier string, or the pageset
 *                                        name of the UI specifier
 * @param elementName  the name of the element
 * @param args         an object associating keys to values
 *
 * @return  new UISpecifier object
 */
function UISpecifier(uiSpecifierStringOrPagesetName, elementName, args)
{
    /**
     * Splits this.string, a UI specifier string of the form:
     *
     *     pagesetName::elementName(arg1=value1, arg2=value2, ...)
     *
     * into its component parts, and returns them as an object.
     *
     * @return  an object containing the components of the UI specifier
     * @throws  UISpecifierException
     */
    this.parse = function() {
        var matches = /^(.*)::([^\(]+)\(([^\)]*)\)$/.exec(this.string);
        if (matches == null) {
            throw new UISpecifierException('Error in UISpecifier.parse(): "'
                + this.string + '" is not a valid UI specifier string');
        }
        var args = {};
        if (matches[3]) {
            args = parse_kwargs(matches[3]);
        }
        return {
            pagesetName: matches[1],
            elementName: matches[2],
            args: args
        };
    };
    
    
    
    /**
     * Combines the UI specifier components into a canonical UI specifier
     * string and returns it. Throws an exception if any of the components
     * are invalid.
     *
     * @param pagesetName
     * @param elementName
     * @param kwargs
     * @return             a UI specifier string
     * @throws             UISpecifierException
     */
    this.unparse = function() {
        // empty string is acceptable for the path, but it must be defined
        if (this.pagesetName == undefined) {
            throw new UISpecifierException('Error in UISpecifier.unparse(): "'
                + this.pagesetName + '" is not a valid UI specifier pageset '
                + 'name');
        }
        if (!this.elementName) {
            throw new UISpecifierException('Error in UISpecifier.unparse(): "'
                + this.elementName + '" is not a valid UI specifier element '
                + 'name');
        }
        if (!this.args) {
            throw new UISpecifierException('Error in UISpecifier.unparse(): "'
                + this.args + '" are not valid UI specifier args');
        }
        return this.pagesetName + '::' + this.elementName + '(' +
            to_kwargs(this.args) + ')';
    };
    
    
    
    /*
     * Override the toString() method to return the UI specifier string when
     * evaluated in a string context.
     *
     * @return   a UI specifier string
     */
    this.toString = function() { return this.string; };
    
    
    
    // construct the object
    if (arguments.length < 2) {
        this.string = uiSpecifierStringOrPagesetName;
        var parsed = this.parse();
        this.pagesetName = parsed.pagesetName;
        this.elementName = parsed.elementName;
        this.args = parsed.args;
    }
    else {
        this.pagesetName = uiSpecifierStringOrPagesetName;
        this.elementName = elementName;
        if (args) {
            this.args = clone(args);
        }
        else {
            this.args = {};
        }
        this.string = this.unparse();
    }
}



function PagesetException(message)
{
    this.message = message;
    this.name = 'PagesetException';
}



function Pageset(pagesetShorthand)
{
    /**
     * Returns true if the page is included in this pageset, false otherwise.
     * The page is specified by a document object.
     *
     * @param inDocument  the document object representing the page
     */
    this.contains = function(inDocument)
    {
        var urlParts = parse_url(inDocument.location.href);
        if (!this.pathRegexp.test(urlParts.path)) {
            return false;
        }
        for (var paramName in this.paramRegexps) {
            var paramRegexp = this.paramRegexps[paramName];
            if (!paramRegexp.test(urlParts.params[paramName])) {
                return false;
            }
        }
        if (!this.pageContent(inDocument)) {
            return false;
        }
        
        return true;
    }
    
    
    
    this.getUIElements = function()
    {
        var uiElements = [];
        for (var uiElementName in this.uiElements) {
            uiElements.push(this.uiElements[uiElementName]);
        }
        return uiElements;
    };
    
    
    
    /**
     * Returns a list of UI specifier string stubs representing all UI elements
     * for this pageset. Stubs contain all required arguments, but leave
     * argument values blank. Each element stub is paired with the element's
     * description.
     *
     * @return  a list of UI specifier string stubs
     */
    this.getUISpecifierStringStubs = function()
    {
        var stubs = [];
        for (var name in this.uiElements) {
            var uiElement = this.uiElements[name];
            var args = {};
            for (var i = 0; i < uiElement.args.length; ++i) {
                args[uiElement.args[i].name] = '';
            }
            var uiSpecifier = new UISpecifier(this.name, uiElement.name, args);
            stubs.push([
                GLOBAL.uiMap.prefix + '=' + uiSpecifier.toString()
                , uiElement.description
            ]);
        }
        return stubs;
    }
    
    
    
    /**
     * Throws an exception on validation failure. Returns true otherwise.
     */
    this._validate = function(pagesetShorthand)
    {
        var msg = "Pageset validation error:\n"
            + print_r(pagesetShorthand);
        if (!pagesetShorthand.name) {
            throw new PagesetException(msg + 'no name specified!');
        }
        if (!pagesetShorthand.description) {
            throw new PagesetException(msg + 'no description specified!');
        }
        if (!pagesetShorthand.paths &&
            !pagesetShorthand.pathRegexp &&
            !pagesetShorthand.pageContent) {
            throw new PagesetException(msg
                + 'no path, pathRegexp, or pageContent specified!');
        }
        
        return true;
    };
    
    
    
    this.init = function(pagesetShorthand)
    {
        this._validate(pagesetShorthand);
        this.name = pagesetShorthand.name;
        this.description = pagesetShorthand.description;
        this.pathPrefix = pagesetShorthand.pathPrefix || '';
        if (pagesetShorthand.paths != undefined) {
            var pathRegexp = '^' + RegExp.escape(this.pathPrefix) + '(?:';
            for (var i = 0; i < pagesetShorthand.paths.length; ++i) {
                if (i > 0) {
                    pathRegexp += '|';
                }
                pathRegexp += RegExp.escape(pagesetShorthand.paths[i]);
            }
            pathRegexp += ')$';
            this.pathRegexp = new RegExp(pathRegexp);
        }
        else {
            this.pathRegexp = new RegExp('^' + RegExp.escape(this.pathPrefix)
                + '(?:' + pagesetShorthand.pathRegexp + ')$');
        }
        this.paramRegexps = {};
        for (var paramName in pagesetShorthand.paramRegexps) {
            this.paramRegexps[paramName] =
                new RegExp(pagesetShorthand.paramRegexps[paramName]);
        }
        this.pageContent = pagesetShorthand.pageContent ||
            function() { return true; };
        this.uiElements = {};
    };
    
    
    
    this.init(pagesetShorthand);
}



/**
 * Construct the UI map object, and return it. Once the object is instantiated,
 * it binds to a global variable and will not leave scope.
 *
 * @return  new UIMap object
 */
function UIMap()
{
    this.prefix = 'ui';
    this.pagesets = new Object();
    
    
    
    /**
     * pageset[pagesetName]
     *   regexp
     *   elements[elementName]
     *     UIElement
     */
    this.addPageset = function(pagesetShorthand)
    {
        try {
            var pageset = new Pageset(pagesetShorthand);
        }
        catch (e) {
            try {
            smart_alert("Could not create pageset from shorthand:\n"
                + print_r(pagesetShorthand) + "\n" + e.message);
            }
            catch (e) {
                alert('wtf? caught: ' + e + ', ' (e.message ? e.message : ""));
            }
            return false;
        }
        
        if (this.pagesets[pageset.name]) {
            smart_alert('Could not add pageset "' + pageset.name
                + '": a pageset with that name already exists!');
            return false;
        }
        
        this.pagesets[pageset.name] = pageset;
        return true;
    };
    
    
    
    /**
     * @param pagesetName
     * @param uiElementShorthand  a representation of a UIElement object in
     *                            shorthand JSON.
     */
    this.addElement = function(pagesetName, uiElementShorthand)
    {
        try {
            var uiElement = new UIElement(uiElementShorthand);
        }
        catch (e) {
            smart_alert("Could not create UI element from shorthand:\n"
                + print_r(uiElementShorthand) + "\n" + e.message);
            return false;
        }
        
        // run the element's unit tests only for the IDE, and only when the
        // IDE is starting. Make a rough guess as to the latter condition.
        if (is_IDE() && !editor.selDebugger && !uiElement.test()) {
            smart_alert('Could not add UI element "' + uiElement.name
                + '": failed testcases!');
            return false;
        }
        
        this.pagesets[pagesetName].uiElements[uiElement.name] = uiElement;
        return true;
    };
    
    
    
    /**
     * Returns the pageset for a given UI specifier string.
     *
     * @param uiSpecifierString
     * @return  a pageset object
     */
    this.getPageset = function(uiSpecifierString)
    {
        try {
            var uiSpecifier = new UISpecifier(uiSpecifierString);
            return this.pagesets[uiSpecifier.pagesetName];
        }
        catch (e) {
            return null;
        }
    }
    
    
    
    /**
     * Returns the UIElement that a UISpecifierString or pageset and element
     * pair refer to.
     *
     * @param pagesetNameOrUISpecifierString
     * @return  a UIElement, or null if none is found associated with
     *          uiSpecifierString
     */
    this.getUIElement = function(pagesetNameOrUISpecifierString, uiElementName)
    {
        var pagesetName = pagesetNameOrUISpecifierString;
        if (arguments.length == 1) {
            var uiSpecifierString = pagesetNameOrUISpecifierString;
            try {
                var uiSpecifier = new UISpecifier(uiSpecifierString);
                pagesetName = uiSpecifier.pagesetName;
                var uiElementName = uiSpecifier.elementName;
            }
            catch (e) {
                return null;
            }
        }
        return this.pagesets[pagesetName].uiElements[uiElementName] || null;
    };
    
    
    
    /**
     * Returns a list of pagesets that "contains" the provided page,
     * represented as a document object. Containership is defined by the
     * Pageset object's contain() method.
     *
     * @param inDocument  the page to get pagesets for
     * @return            a list of pagesets
     */
    this.getPagesetsForPage = function(inDocument)
    {
        var pagesets = [];
        for (var pagesetName in this.pagesets) {
            var pageset = this.pagesets[pagesetName];
            if (pageset.contains(inDocument)) {
                pagesets.push(pageset);
            }
        }
        return pagesets;
    };
    
    
    
    /**
     * Returns a list of all pagesets.
     *
     * @return  a list of pagesets
     */
    this.getPagesets = function()
    {
        var pagesets = [];
        for (var pagesetName in this.pagesets) {
            pagesets.push(this.pagesets[pagesetName]);
        }
        return pagesets;
    };
    
    
    
    /**
     * Finds and returns an element on a page given a UI specifier string
     *
     * @param   uiSpecifierString  a String that specifies a UI element with
     *                             attendant argument values
     * @param   inDocument         the document object the specified UI element
     *                             appears in
     * @return                     the element specified by uiSpecifierString,
     *                             or null if it cannot be found
     */
    this.getPageElement = function(uiSpecifierString, inDocument)
    {
        try {
            return eval_locator(this.getLocator(uiSpecifierString), inDocument);
        }
        catch (e) {
            smart_log('debug', 'Caught exception: ' + e.message);
            return null;
        }
    };
    
    
    
    /**
     * Split this out to support use by the Editor.
     *
     * @param uiSpecifierString
     */
    this.getLocator = function(uiSpecifierString)
    {
        try {
            var uiSpecifier = new UISpecifier(uiSpecifierString);
        }
        catch (e) {
            smart_alert('Could not create UISpecifier for string "'
                + uiSpecifierString + '": ' + e.message);
            return null;
        }
        
        var uiElement = this.getUIElement(uiSpecifier.pagesetName,
            uiSpecifier.elementName);
        try {
            return uiElement.getLocator(uiSpecifier.args);
        }
        catch (e) {
            return null;
        }
    }
    
    
    
    /**
     * Finds and returns a UI specifier string given an element and the page
     * that it appears on.
     *
     * @param   element     the document element to map to a UI specifier
     * @param   inDocument  the document the element appears in
     * @return              a UI specifier string, or false if one cannot be
     *                      constructed
     */
    this.getUISpecifierString = function(pageElement, inDocument)
    {
        var is_fuzzy_match =
            PageBot.prototype.locateElementByUIElement.is_fuzzy_match;
        var pagesets = this.getPagesetsForPage(inDocument);
        for (var i = 0; i < pagesets.length; ++i) {
            var pageset = pagesets[i];
            var uiElements = pageset.getUIElements();
            for (var j = 0; j < uiElements.length; ++j) {
                var uiElement = uiElements[j];
                //smart_alert(print_r(uiElement.defaultLocators));
                for (var locator in uiElement.defaultLocators) {
                    try {
                        var node = eval_locator(locator, inDocument);
                        
                        // use a heuristic to determine whether the element
                        // specified is the "same" as the element we're matching
                        if (is_fuzzy_match) {
                            if (is_fuzzy_match(node, pageElement)) {
                                return this.prefix + '=' +
                                    new UISpecifier(pageset.name,
                                        uiElement.name, 
                                        uiElement.defaultLocators[locator]);
                            }
                        }
                        else {
                            if (node == pageElement) {
                                return this.prefix + '=' +
                                    new UISpecifier(pageset.name,
                                        uiElement.name, 
                                        uiElement.defaultLocators[locator]);
                            }
                        }
                    }
                    catch (e) {
                        if (!e.isSeleniumError) {
                            smart_alert(locator + "\n" + e.message);
                        }
                    }
                }
            }
        }
        return false;
    };
    
    
    
    /**
     * Returns a sorted list of UI specifier string stubs representing possible
     * UI elements for all pagesets, paired the their descriptions. Stubs
     * contain all required arguments, but leave argument values blank.
     *
     * @return  a list of UI specifier string stubs
     */
    this.getUISpecifierStringStubs = function() {
        var stubs = [];
        var pagesets = this.getPagesets();
        for (var i = 0; i < pagesets.length; ++i) {
            stubs = stubs.concat(pagesets[i].getUISpecifierStringStubs());
        }
        stubs.sort(function(a, b) {
            if (a[0] < b[0]) {
                return -1;
            }
            return a[0] == b[0] ? 0 : 1;
        });
        return stubs;
    }
    
    
    
    /**
     * Initialize the external objects required for the UI element locator to
     * work. This allows us to create a unit test for this module without
     * importing lots of unnecessary javascript code.
     */
    this.init = function() {
        if (PageBot.prototype.locateElementByUIElement != undefined)
            return;
        
        // add a locator builder for UI elements. This is used to create a
        // locator string (in this case a UI specifier) identifying a page
        // element when it is clicked (or otherwise interacted with) in the
        // IDE. The locator string is later used to find the element when
        // passed to the "locateElementBy..." PageBot method.
        // add the UI element locator, and promote it to top priority
        if (is_IDE()) {
            LocatorBuilders.add(this.prefix, function(node) {
                return GLOBAL.uiMap.getUISpecifierString(node, this.window.document);
                });
            LocatorBuilders.order.unshift(this.prefix);
            LocatorBuilders.order.pop();
            
            // try to bind to the editor object, which should be available if
            // this is being used in the Selenium IDE extension
            Editor.uiMap = this;
        }
        
        // add the symmetric "locateElementBy..." method to PageBot. This
        // function is responsible for mapping a UI specifier string to an
        // element on the page, via XPath, and returning it. If the map is
        // unsuccessful, return null. Returning null on failure to locate the
        // element is part of the "API" for locators, it appears.
        PageBot.prototype.locateElementByUIElement = function(uiSpecifierString, inDocument, inWindow) {
            try {
                var element = GLOBAL.uiMap.getPageElement(uiSpecifierString,
                    inDocument);
            }
            catch(e) {
                LOG.warn("Could not locate element using " +
                    uiSpecifierString + "; caught exception: " + e);
            }
            return element;
        }
        PageBot.prototype.locateElementByUIElement.prefix = this.prefix;
            
        // define a function used to compare the result of a close UI element
        // match with the actual interacted element. If they are close enough
        // according to the heuristic, consider them a match.
        /**
         * A heuristic function for comparing a node with a target node.
         * Typically the node is specified in a UI element definition, while
         * the target node is returned by the recorder as the leaf element which
         * had some event enacted upon it. This particular heuristic covers the
         * case where the <a> element contains other inline tags, such as
         * &lt;em&gt; or &lt;img&gt;.
         *
         * @param node    the node being compared to the target node
         * @param target  the target node
         * @return        true if node equals target, or if node is a link
         *                element and target is its descendant, or if node has
         *                an onclick attribute and target is its descendant.
         *                False otherwise.
         */
        PageBot.prototype.locateElementByUIElement.is_fuzzy_match = function(node, target) {
            try {
                var isMatch = (
                    (node == target) ||
                    ((node.nodeName == 'A' || node.onclick) && is_ancestor(node, target))
                );
                return isMatch;
            }
            catch (e) {
                return false;
            }
        };
    };
    
    
    
    // bind to the global variable
    GLOBAL.uiMap = this;
    try {
        this.init();
    }
    catch (e) {
        // must be unit testing
    }
}



