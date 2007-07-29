function stripDoPrefix(name) {
    if ("do" == name.substring(0, 2)) {
        var firstChar = name.substring(2, 3).toLowerCase();
        return firstChar + name.substring(3);
    }
    return name;
}

function extractArgList(source) {
    var argString = source.match(/function\s*\(([^)]*)\)/)[1];
    argString = argString.replace(/\s/, "");
    var args = argString.split(/,/);
    // Split will return a single empty string if there are no args
    if ("" == args[0]) {
        args.shift();
    }
    return args;
}

function extractInitialComment(source) {
    var commentMatcher = source.match(/function\s*\w*\s*\([^)]*\)\s*{\s*\/\*\*((?:.|[\r\n])*?)\*\//);
    if (commentMatcher == null) return "";
    if (commentMatcher.length < 2) {
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
        if ("do" != name.substring(0, 2)) {
            throw "Command " + name + " doesn't start with 'do', or else you forget to specify a @return tag";
        }
        comment = comment.replace(/^[\s\r\n]*/, "");
        comment = comment.replace(/[\s\r\n]*$/, "");
        print("<comment>" + comment + "</comment>\n");
        return;
    }
    tagString = comment.substring(tagStart);
    comment = comment.substring(0, tagStart - 1);
    tagString = tagString.replace(/\n/g, " ");
    var tags = tagString.match(/(@[^@]*)/g);
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var paramMatch = tag.match(/^@param\s+(\S+)\s+(.*)/);
        if (paramMatch) {
            var arg = paramMatch[1];
            var argDesc = paramMatch[2];
            if (argMap[arg] == null) {
                throw ("Comment error: " + name + " @param " + arg + " does not match any argument");
            }
            argDesc = argDesc.replace(/^\s+/, "");
            argDesc = argDesc.replace(/\s+$/, "");
            argMap[arg] = argDesc;
        }
        var returnMatch = tag.match(/^@return\s+(\S+)\s+(.*)/);
        if (returnMatch) {
            var returnType = returnMatch[1];
            if (!returnType.match(/^(string|number|boolean)(\[\])?$/)) {
                throw ("Comment error: " + name + " @return type " + returnType + " is invalid; must be one of: string, number, boolean, string[], number[], boolean[]");
            }
            var returnDesc = returnMatch[2];
            if (returnDesc == null) {
                throw ("Comment error: " + name + " @return does not have a description");
            }
            returnDesc = returnDesc.replace(/^\s+/, "");
            returnDesc = returnDesc.replace(/\s+$/, "");
            print("<return type=\"" + returnType + "\">" + returnDesc + "</return>\n");
        }
    }
    
    for (var i = 0; i < args.length; i++) {
        if ("" == argMap[args[i]]) throw ("Comment error: " + name + " param " + args[i] + " has no description");
        print("<param name=\"" + args[i] + "\">" + argMap[args[i]] + "</param>\n");
    }
    comment = comment.replace(/^[\s\r\n]*/, "");
    comment = comment.replace(/[\s\r\n]*$/, "");
    print("<comment>" + comment + "</comment>\n");
}

function getFileContentOfSeleniumAPIFile(filename) {
    importPackage(java.io);

    var apiJsFile = new BufferedReader(new FileReader(filename));
    var content;
    var line;
    while ((line = apiJsFile.readLine()) != null) {
        content += line + '\n';
    }
    apiJsFile.close();
    return content;
}

var content = getFileContentOfSeleniumAPIFile(arguments[0]);
if (arguments[1]) {
    content += getFileContentOfSeleniumAPIFile(arguments[1]);
}

print("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
print("<apidoc>\n");

print("<top>" + extractInitialComment(content) + "</top>\n");

var commandPattern = /Selenium.prototype.((do|get|assert|is)\w*)\s*=\s*function\s*\([^)]*\)\s*{\s*(\/\*\*((?:.|[\r\n])*?)\*\/|[^\/])/ig;
var result;
while ((result = commandPattern.exec(content)) != null) {
    var name = result[1];
    var source = result[0];
    print("<function name=\"" + stripDoPrefix(name) + "\">\n");
    var args = extractArgList(source);
    var comment = extractInitialComment(source);
    if (comment == null || "" == comment) {
        throw ("Comment for " + name + " was blank!");
    }
    handleTags(name, args, comment);
    print("</function>\n");
}

print("</apidoc>");



