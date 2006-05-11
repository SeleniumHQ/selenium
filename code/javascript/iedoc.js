
function stripDoPrefix(name) {
	if ("do" == name.substring(0, 2)) {
		var firstChar = name.substring(2,3).toLowerCase();
		return firstChar + name.substring(3);
	}
	return name;
}

function extractArgList(name, func) {
	var source = func.toString();
	var argString = source.match(/function\s*\(([^)]*)\)/)[1];
	//WScript.Echo("argString: " + argString);
	var args = argString.split(/[\s,]/);
	// Split will return a single empty string if there are no args
	if ("" == args[0]) {
		args.shift();
	}
	if (args.length != func.length) {
		throw new Error("Bug! Wrong number of arguments for " + name + ", expected " + func.length + " was " + args.length);
	}
	return args;
}

function extractInitialComment(name, func) {
	var source = func.toString();
	var commentMatcher = source.match(/function\s*\w*\s*\([^)]*\)\s*{\s*\/\*\*((?:.|[\r\n])*?)\*\//);
	if (commentMatcher == null) return "";
	if (commentMatcher.length < 2) {
		//WScript.Echo("No comment for " + name);
		return "";
	}
	var comment = commentMatcher[1];
	comment = comment.replace(/\n\s*\* ?/g, "\n");
	comment = comment.replace(/^[\s\r\n]*/, "");
	comment = comment.replace(/[\s\r\n]*$/, "");
	return comment;
}

function handleTags(name, args, comment) {
	var argMap = new Object();
	for (var i = 0; i < args.length; i++) {
		argMap[args[i]] = "";
	}
	var tagStart = comment.search(/@(param|return)/);
	if (tagStart == -1) {
		comment = comment.replace(/^[\s\r\n]*/, "");
		comment = comment.replace(/[\s\r\n]*$/, "");
		WScript.Echo("<comment>" + comment + "</comment>");
		return;
	}
	tagString = comment.substring(tagStart);
	comment = comment.substring(0, tagStart-1);
	tagString = tagString.replace(/\n/g, " ");
	var tags = tagString.match(/(@[^@]*)/g);
	for (var i = 0; i < tags.length; i++) {
		var tag = tags[i];
		var paramMatch = tag.match(/^@param\s+(\S+)\s+(.*)/);
		if (paramMatch) {
			var arg = paramMatch[1];
			var argDesc = paramMatch[2];
			if (argMap[arg] == null) {
				throw new Error("Comment error: " + name + " @param " + arg + " does not match any argument");
			}
			argDesc = argDesc.replace(/^\s+/, "");
			argDesc = argDesc.replace(/\s+$/, "");
			argMap[arg] = argDesc;
		}
		var returnMatch = tag.match(/^@return\s+(\S+)\s+(.*)/);
		if (returnMatch) {
			var returnType = returnMatch[1];
			if (!returnType.match(/^(string|number|boolean)(\[\])?$/)) {
				throw new Error("Comment error: " + name + " @return type " + returnType + " is invalid; must be one of: string, number, boolean, string[], number[], boolean[]");
			}
			var returnDesc = returnMatch[2];
			if (returnDesc == null) {
				throw new Error("Comment error: " + name + " @return does not have a description");
			}
			returnDesc = returnDesc.replace(/^\s+/, "");
			returnDesc = returnDesc.replace(/\s+$/, "");
			WScript.Echo("<return type=\"" + returnType + "\">" + returnDesc + "</return>");
		}
	}
	for (var i = 0; i < args.length; i++) {
		if ("" == argMap[args[i]]) throw new Error("Comment error: param " + args[i] + " has no description");
		WScript.Echo("<param name=\"" + args[i] + "\">" + argMap[args[i]] + "</param>");
	}
	comment = comment.replace(/^[\s\r\n]*/, "");
	comment = comment.replace(/[\s\r\n]*$/, "");
	WScript.Echo("<comment>" + comment + "</comment>");
}



var objFSO = WScript.CreateObject("Scripting.FileSystemObject")
var scriptFile = objFSO.GetFile("core\\scripts\\selenium-api.js");
var scriptFileStream = scriptFile.OpenAsTextStream(/*ForReading*/1);

eval(scriptFileStream.ReadAll());

var count = 0;

WScript.Echo("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
WScript.Echo("<apidoc>");

var foo = Selenium;
WScript.Echo("<top>" + extractInitialComment("Selenium", foo) + "</top>");


for (var i in Selenium.prototype) {
	//if (count > 1) break;
	if (i.search(/^(do|get|assert|is)/)) continue;
	WScript.Echo("<function name=\"" + stripDoPrefix(i) + "\">");
	var o = Selenium.prototype[i];
	if (o.constructor == Function) {
		//WScript.Echo(o.toString());
		var args = extractArgList(i, o);
		var comment = extractInitialComment(i, o);
		if (comment == null || "" == comment) {
			throw new Error("Comment for " + i + " was blank!");
		}
		handleTags(i, args, comment);
	}
	WScript.Echo("</function>");
	count++;
}

WScript.Echo("</apidoc>");