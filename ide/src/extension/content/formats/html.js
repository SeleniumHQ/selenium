// Characters that should be escaped when saving.
var EncodeToXhtmlEntity = ["amp", "gt", "lt", "quot", "nbsp"];

var XhtmlEntityFromChars = {};
for (var i = 0; i < EncodeToXhtmlEntity.length; i++) {
    var entity = EncodeToXhtmlEntity[i];
    XhtmlEntityFromChars[XhtmlEntities[entity]] = entity;
}

// A regular expression that matches characters that can be converted to entities.
var XhtmlEntityChars = "[";
for (var code in XhtmlEntityFromChars) {
    var c = parseInt(code).toString(16);
    while (c.length < 4) {
        c = "0" + c;
    }
    XhtmlEntityChars += "\\u" + c;
}
XhtmlEntityChars += "]";

function decodeText(text) {
    if (text == null) return "";
	text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/&(\w+);/g, function(str, p1) {
            var c = XhtmlEntities[p1];
            if (c) {
                return String.fromCharCode(c);
            } else {
                return str;
            }
        });
    text = text.replace(/&#(\d+);/g, function(str, p1) { 
            return String.fromCharCode(parseInt(p1));
        });
    text = text.replace(/&#x([0-9a-f]+);/gi, function(str, p1) { 
            return String.fromCharCode(parseInt(p1, 16));
        });
    text = text.replace(/ +/g, " "); // truncate multiple spaces to single space
    text = text.replace(/\xA0/g, " "); // treat nbsp as space
	if ('true' == options.escapeDollar) {
		text = text.replace(/([^\\])\$\{/g, '$1$$$${'); // replace [^\]${...} with $${...}
		text = text.replace(/^\$\{/g, '$$$${'); // replace ^${...} with $${...}
		text = text.replace(/\\\$\{/g, '$${'); // replace \${...} with ${...}
	}
    // trim spaces
	text = text.replace(/^\s+/, "");
	text = text.replace(/\s+$/, "");
	return text;
}

function encodeText(text) {
    if (text == null) return "";
    // & -> &amp;
    // &amp; -> &amp;amp;
    // &quot; -> &amp;quot;
    // \xA0 -> &nbsp;
    text = text.replace(new RegExp(XhtmlEntityChars, "g"),
                        function(c) {
            var entity = XhtmlEntityFromChars[c.charCodeAt(c)];
            if (entity) {
                return "&" + entity + ";";
            } else {
                throw "Failed to encode entity: " + c;
            }
        });
    text = text.replace(/ {2,}/g, function(str) {
            var result = '';
            for (var i = 0; i < str.length; i++) {
                result += '&nbsp;';
            }
            return result;
        }); // convert multiple spaces to nbsp
	if ('true' == options.escapeDollar) {
		text = text.replace(/([^\$])\$\{/g, '$1\\${'); // replace [^$]${...} with \${...}
		text = text.replace(/^\$\{/g, '\\${'); // replace ^${...} with \${...}
		text = text.replace(/\$\$\{/g, '${'); // replace $${...} with ${...}
	}
    text = text.replace(/\n/g, "<br />");
	return text;
}

function convertText(command, converter) {
	var props = ['command', 'target', 'value'];
	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		command[prop] = converter(command[prop]);
	}
}

/**
 * Parse source and update TestCase. Throw an exception if any error occurs.
 *
 * @param testCase TestCase to update
 * @param source The source to parse
 */
function parse(testCase, source) {
	var commandRegexp = new RegExp(options.commandLoadPattern, 'i');
	var commentRegexp = new RegExp(options.commentLoadPattern, 'i');
	var commandOrCommentRegexp = new RegExp("((" + options.commandLoadPattern + ")|(" + options.commentLoadPattern + "))", 'ig');
	var doc = source;
	var commands = [];
	var commandFound = false;
	var lastIndex;
	while (true) {
		//log.debug("doc=" + doc + ", commandRegexp=" + commandRegexp);
		lastIndex = commandOrCommentRegexp.lastIndex;
		var docResult = commandOrCommentRegexp.exec(doc);
		if (docResult) {
			if (docResult[2]) { // command
				var command = new Command();
				command.skip = docResult.index - lastIndex;
				command.index = docResult.index;
				var result = commandRegexp.exec(doc.substring(lastIndex));
				eval(options.commandLoadScript);
				convertText(command, decodeText);
				commands.push(command);
				if (!commandFound) {
					// remove comments before the first command or comment
					for (var i = commands.length - 1; i >= 0; i--) {
						if (commands[i].skip > 0) {
							commands.splice(0, i);
							break;
						}
					}
					testCase.header = doc.substr(0, commands[0].index);
					commandFound = true;
				}
			} else { // comment
				var comment = new Comment();
				comment.skip = docResult.index - lastIndex;
				comment.index = docResult.index;
				var result = commentRegexp.exec(doc.substring(lastIndex));
				eval(options.commentLoadScript);
				commands.push(comment);
			}
		} else {
			break;
		}
	}
	if (commands.length > 0) {
		testCase.footer = doc.substring(lastIndex);
		log.debug("header=" + testCase.header);
		log.debug("footer=" + testCase.footer);
        if (testCase.header &&
            /<link\s+rel="selenium\.base"\s+href="(.*)"/.test(testCase.header)) {
            testCase.baseURL = decodeURI(RegExp.$1);
        }
		//log.debug("commands.length=" + commands.length);
		testCase.commands = commands;
	} else {
		throw "no command found";
	}
}

function getSourceForCommand(commandObj) {
	var command = null;
	var comment = null;
	var template = '';
	if (commandObj.type == 'command') {
		command = commandObj;
		command = command.createCopy();
		convertText(command, this.encodeText);
		template = options.commandTemplate;
	} else if (commandObj.type == 'comment') {
		comment = commandObj;
		template = options.commentTemplate;
	}
	var result;
	var text = template.replace(/\$\{([a-zA-Z0-9_\.]+)\}/g, 
        function(str, p1, offset, s) {
            result = eval(p1);
            return result != null ? result : '';
        });
	return text;
}

/**
 * Format an array of commands to the snippet of source.
 * Used to copy the source into the clipboard.
 *
 * @param The array of commands to sort.
 */
function formatCommands(commands) {
	var commandsText = '';
	for (i = 0; i < commands.length; i++) {
		var text = getSourceForCommand(commands[i]);
		commandsText = commandsText + text;
	}
	return commandsText;
}

/**
 * Format TestCase and return the source.
 * The 3rd and 4th parameters are used only in default HTML format.
 *
 * @param testCase TestCase to format
 * @param name The name of the test case, if any. It may be used to embed title into the source.
 * @param saveHeaderAndFooter true if the header and footer should be saved into the TestCase.
 * @param useDefaultHeaderAndFooter Parameter used for only default format.
 */
function format(testCase, name, saveHeaderAndFooter, useDefaultHeaderAndFooter) {
	var text;
	var commandsText = "";
	var testText;
	var i;
	
	for (i = 0; i < testCase.commands.length; i++) {
		var text = getSourceForCommand(testCase.commands[i]);
		commandsText = commandsText + text;
	}
	
	var testText;
	if (testCase.header == null || testCase.footer == null || useDefaultHeaderAndFooter) {
		testText = options.testTemplate;
		testText = testText.replace(/\$\{name\}/g, name);
		var encoding = options["global.encoding"];
		if (!encoding) encoding = "UTF-8";
		testText = testText.replace(/\$\{encoding\}/g, encoding);
		testText = testText.replace(/\$\{baseURL\}/g, encodeURI(testCase.baseURL));
		var commandsIndex = testText.indexOf("${commands}");
		if (commandsIndex >= 0) {
			var header = testText.substr(0, commandsIndex);
			var footer = testText.substr(commandsIndex + "${commands}".length);
			testText = header + commandsText + footer;
			if (saveHeaderAndFooter) {
				testCase.header = header;
				testCase.footer = footer;
			}
		}
	} else {
		testText = testCase.header + commandsText + testCase.footer;
	}
	
	return testText;
}

/*
 * Optional: The customizable option that can be used in format/parse functions.
 */
this.options = {
	commandLoadPattern:
	"<tr\s*[^>]*>" +
	"\\s*(<!--[\\d\\D]*?-->)?" +
	"\\s*<td\s*[^>]*>\\s*([\\w]*?)\\s*</td>" +
	"\\s*<td\s*[^>]*>([\\d\\D]*?)</td>" +
	"\\s*(<td\s*/>|<td\s*[^>]*>([\\d\\D]*?)</td>)" +
	"\\s*</tr>\\s*",
	
	commandLoadScript:
	"command.command = result[2];\n" +
	"command.target = result[3];\n" +
	"command.value = result[5] || '';\n",

	commentLoadPattern:
	"<!--([\\d\\D]*?)-->\\s*",

	commentLoadScript:
	"comment.comment = result[1];\n",

	testTemplate:
    '<?xml version="1.0" encoding="${encoding}"?>\n' +
    '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">\n' +
	'<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">\n' +
	'<head profile="http://selenium-ide.openqa.org/profiles/test-case">\n' +
	'<meta http-equiv="Content-Type" content="text/html; charset=${encoding}" />\n' +
    '<link rel="selenium.base" href="${baseURL}" />\n' +
	"<title>${name}</title>\n" +
	"</head>\n" +
	"<body>\n" +
	'<table cellpadding="1" cellspacing="1" border="1">\n'+
	'<thead>\n' +
	'<tr><td rowspan="1" colspan="3">${name}</td></tr>\n' +
	"</thead><tbody>\n" +
	"${commands}\n" +
	"</tbody></table>\n" +
	"</body>\n" +
	"</html>\n",

	commandTemplate:
	"<tr>\n" +
	"\t<td>${command.command}</td>\n" +
	"\t<td>${command.target}</td>\n" +
	"\t<td>${command.value}</td>\n" +
	"</tr>\n",

	commentTemplate:
	"<!--${comment.comment}-->\n",
	
	escapeDollar:
	"false"
};

/*
 * Optional: XUL XML String for the UI of the options dialog
 */
this.configForm = 
	//'<tabbox flex="1"><tabs orient="horizontal"><tab label="Load"/><tab label="Save"/></tabs>' +
	//'<tabpanels flex="1">' +
	//'<tabpanel orient="vertical">' +
	'<description>Regular expression for each command entry</description>' +
	'<textbox id="options_commandLoadPattern" flex="1"/>' +
	'<separator class="thin"/>' +
	'<description>Script to load command from the pattern</description>' +
	'<textbox id="options_commandLoadScript" multiline="true" flex="1" rows="2"/>' +
	//'<separator class="thin"/>' +
	//'<description>Regular expression for comments between commands</description>' +
	//'<textbox id="options_commentLoadPattern" flex="1"/>' +
	//'<separator class="thin"/>' +
	//'<description>Script to load comment from the pattern</description>' +
	//'<textbox id="options_commentLoadScript" multiline="true" flex="1" rows="2"/>' +
	'<separator class="groove"/>' +
	//'</vbox><vbox>' +
	//'</tabpanel>' +
	//'<tabpanel orient="vertical">' +
	'<description>Template for new test html file</description>' +
	'<textbox id="options_testTemplate" multiline="true" flex="1" rows="3"/>' +
	'<separator class="thin"/>' +
	'<description>Template for command entries in the test html file</description>' +
	'<textbox id="options_commandTemplate" multiline="true" flex="1" rows="3"/>' +
	'<separator class="groove"/>' +
	'<checkbox id="options_escapeDollar" label="Escape \'${\' as \'\\${\' (useful for JSP 2.0)"/>';
	//'<separator class="thin"/>' +
	//'<description>Template for comment entries in the test html file</description>' +
	//'<textbox id="options_commentTemplate" multiline="true" flex="1"/>' +
	//'</tabpanel></tabpanels></tabbox>';
