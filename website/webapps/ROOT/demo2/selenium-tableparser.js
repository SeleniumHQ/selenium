/*
 * Copyright 2004 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */
 
TableParser = function(wikiTableRows) {
    this.wikiTableRows = wikiTableRows;
};

// Parses a Wiki table row into a SeleniumB Javascript expression
TableParser.prototype.createCommandFromWikiRow = function(wikiRow) {
    var tokens;
    if(tokens = wikiRow.trim().match(/^\|([^\|]*)\|([^\|]*)\|([^\|]*)\|$/m)) {
        var functionName = tokens[1].trim();
        var arg1 = tokens[2].trim();
        var arg2 = tokens[3].trim();
        return new SeleniumCommand(functionName, arg1, arg2);
    } else {
       throw new Error("Bad wiki row format:" + wikiRow);
    }
};

// Parses a HTML table row into a SeleniumB Javascript expression
TableParser.prototype.createCommandFromHtmlRow = function(row) {
    if(row.cells.length != 3) {
       throw new Error("Bad HTML row format. Rows must have 3 coumns, but had " + row.cells.length);
    }
    var functionName = getText(row.cells[0]);
    var arg1 = getText(row.cells[1]);
    var arg2 = getText(row.cells[2]);
    return new SeleniumCommand(functionName, arg1, arg2);
};

TableParser.prototype.loop = function() {
    row = this.wikiTableRows.getRow();
    if (row == null) return null;
    return this.createCommandForRow(row);
};