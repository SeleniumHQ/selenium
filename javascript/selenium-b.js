// override the original sel A code
function processCommand(){
    if(testFailed) {
        alert("DOH")
    }
}

function setRowFailed(errorMsg, failureType) {
        alert(errorMsg)
}


SeleniumB = function(wikiTableRows) {
    buildCommandHandlers()
    currentDoc = document
    if(wikiTableRows) {
        // during testing we can pass in a mock to avoid XML-RPC
        this.wikiTableRows = wikiTableRows
    } else {
        xmlrpc = importModule("xmlrpc")
        sp = new xmlrpc.ServiceProxy("/xmlrpc", ["wikiTableRows.getRow", "wikiTableRows.setResult", "wikiTableRows.setException"])
        this.wikiTableRows = sp.wikiTableRows
    }
}

// Parses a Wiki table row into a SeleniumB Javascript expression
SeleniumB.prototype.createJavaScriptFromWikiRow = function(wikiRow) {
    var tokens 
    if(tokens = wikiRow.trim().match(/^\|([^\|]*)\|([^\|]*)\|([^\|]*)\|$/m)) {
        var functionName = tokens[1].trim();
        var arg1 = tokens[2].trim();
        var arg2 = tokens[3].trim();
        return this.createInvocation(functionName, arg1, arg2)
    } else {
       throw new Error("Bad wiki row format:" + wikiRow)
    }
}

// Parses a HTML table row into a SeleniumB Javascript expression
SeleniumB.prototype.createJavaScriptFromHtmlRow = function(row) {
    if(row.cells.length != 3) {
       throw new Error("Bad HTML row format. Rows must have 3 coumns, but had " + row.cells.length)
    }
    var functionName = getText(row.cells[0])
    var arg1 = getText(row.cells[1])
    var arg2 = getText(row.cells[2])
    return this.createInvocation(functionName, arg1, arg2)
}

SeleniumB.prototype.createInvocation = function(functionName, arg1, arg2) {
    var javascript
    if(arg2 == "") {
        javascript = "commandHandlers[\"" + functionName + "\"](\"" + arg1 + "\")";
    } else {
        javascript = "commandHandlers[\"" + functionName + "\"](\"" + arg1 + "\",\"" + arg2 + "\")";
    }
    return javascript
}

SeleniumB.prototype.loop = function() {
    row = this.getRow()
    javascript = this.createJavaScriptFromWikiRow(row)
    eval(javascript)
}

// TODO: These should be prototypes for SeleniumA
// In "pure mode" there could be other prototypes that
// update the FIT tables instead. (FIT tables should not
// be displayed when using SeleniumB - results should be 
// sent back over XML-RPC.

// Get next command over XML-RPC
SeleniumB.prototype.getRow = function() {
    wikiRow = this.wikiTableRows.getRow()
    return wikiRow;
}

// Set result of command over XML-RPC
SeleniumB.prototype.setResult = function(result) {
    this.wikiTableRows.setResult(result)
}

// Set result of command as exception over XML-RPC
SeleniumB.prototype.setException = function(result) {
    this.wikiTableRows.setException(result)
}