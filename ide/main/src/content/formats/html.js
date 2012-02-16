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
	}else {
		//Samit: Fix: Atleast try to allow empty test cases, before screaming murder
		//Note: This implementation will work with empty test cases saved with this formatter only
		var templateVars = matchTemplateAndExtractVars(source, options.testTemplate);
		if (templateVars) {
			//Since the matching has succeeded, update the test case with found variable values
			if (templateVars["baseURL"]) {
				testCase.baseURL = templateVars["baseURL"][0];
			}
			if (templateVars["commands"]) {
				testCase.header = doc.substring(0, templateVars["commands"][1]);
				testCase.footer = doc.substring(templateVars["commands"][1]);
				log.debug("header=" + testCase.header);
				log.debug("footer=" + testCase.footer);
			}
			testCase.commands = commands;
		}else {
			throw "no command found";
		}
	}
}

//Samit: Enh: Utility function to match the document against a template and extract the variables marked as ${} in the template
function matchTemplateAndExtractVars(doc, template) {
	var matchTextRa = template.split(/(\$\{\w+\})/g);
	var templateVars = {};
	var captureVar;
	var matchIndex = 0;
		
	for (var i=0; i<matchTextRa.length; i++) {
		var matchedVar = matchTextRa[i].match(/\$\{(\w+)\}/i);
		if (matchedVar) {
			//Found variable!
			if (templateVars[matchedVar[1]]) {
				//already captured, treat as static text and match later
				matchTextRa[i] = templateVars[matchedVar[1]][0];
			}else {
				//variable capture required
				if (captureVar) {
					//Error: Capture failed as there is no way to delimit adjacent variables without static text between them
					log.debug("Error: Capture failed as there is no way to delimit adjacent variables without static text between them");
					return null;
				}
				captureVar = matchedVar[1];
				continue;
			}
		}
		//static text
		if (captureVar) {
			//search for static string
			var index = doc.indexOf(matchTextRa[i], matchIndex);
			if (index >= 0) {			
				//matched
				templateVars[captureVar] = [doc.substring(matchIndex, index), matchIndex];
				matchIndex = matchTextRa[i].length + index;
				captureVar = null;
			}else {
				//Error: Match failed
				log.debug("Error: Match failed");
				return null;
			}
		}else {
			//match text
			if (doc.substr(matchIndex, matchTextRa[i].length) == matchTextRa[i]) {
				//matched!
				matchIndex += matchTextRa[i].length;
			}else {
				//Error:  Match failed
				log.debug("Error: Match failed");
				return null;
			}
		}
	}
	if (captureVar) {
		// capture the final variable if any
		templateVars[captureVar] = [doc.substring(matchIndex), matchIndex];
	}
	return templateVars;
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
 */
function format(testCase, name) {
	var text;
	var commandsText = "";
	var testText;
	var i;
	
	for (i = 0; i < testCase.commands.length; i++) {
		var text = getSourceForCommand(testCase.commands[i]);
		commandsText = commandsText + text;
	}
	
	var testText;
	if (testCase.header == null || testCase.footer == null) {
		testText = options.testTemplate;
		testText = testText.replace(/\$\{name\}/g, name);
		var encoding = options["global.encoding"];
		if (!encoding) encoding = "UTF-8";
		testText = testText.replace(/\$\{encoding\}/g, encoding);
		testText = testText.replace(/\$\{baseURL\}/g, encodeURI(testCase.getBaseURL()));
		var commandsIndex = testText.indexOf("${commands}");
		if (commandsIndex >= 0) {
			var header = testText.substr(0, commandsIndex);
			var footer = testText.substr(commandsIndex + "${commands}".length);
			testText = header + commandsText + footer;
		}
	} else {
		testText = testCase.header + commandsText + testCase.footer;
	}
	
	return testText;
}

function defaultExtension() {
  return this.options.defaultExtension;
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
	"false",
	
	defaultExtension: "html"
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
