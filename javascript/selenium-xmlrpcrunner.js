XmlRpcRunner = function() {
    xmlrpc = importModule("xmlrpc")
    sp = new xmlrpc.ServiceProxy("/xmlrpc", ["wikiTableRows.getRow", "wikiTableRows.setResult", "wikiTableRows.setException"])
    this.wikiTableRows = sp.wikiTableRows
}

XmlRpcRunner.prototype.getWikiTableRows = function() {
    return this.wikiTableRows;
}
