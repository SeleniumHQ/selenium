TableParser = function(wikiTableRows) {
    this.wikiTableRows = wikiTableRows
}

// Parses a Wiki table row into a SeleniumB Javascript expression
TableParser.prototype.createJavaScriptFromWikiRow = function(wikiRow) {
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
TableParser.prototype.createJavaScriptFromHtmlRow = function(row) {
    if(row.cells.length != 3) {
       throw new Error("Bad HTML row format. Rows must have 3 coumns, but had " + row.cells.length)
    }
    var functionName = getText(row.cells[0])
    var arg1 = getText(row.cells[1])
    var arg2 = getText(row.cells[2])
    return this.createInvocation(functionName, arg1, arg2)
}

TableParser.prototype.createInvocation = function(functionName, arg1, arg2) {
    var javascript
    if(arg2 == "") {
        javascript = "commandHandlers[\"" + functionName + "\"](\"" + arg1 + "\")";
    } else {
        javascript = "commandHandlers[\"" + functionName + "\"](\"" + arg1 + "\",\"" + arg2 + "\")";
    }
    return javascript
}

TableParser.prototype.loop = function() {
    row = this.wikiTableRows.getRow()
    javascript = this.createJavaScriptFromWikiRow(row)
}
