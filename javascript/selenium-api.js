function TestApp(browserbot) {
    this.browserbot = browserbot;
    this.page = function() {return browserbot.currentPage};
}

TestApp.prototype.findElement = function(locator) {
    // First try using id/name search
    var element = this.page().findIdentifiedElement(locator);

    // Next, if the locator starts with 'document.', try to use Dom traversal
    if (element == null && locator.indexOf("document.") == 0) {
        var domTraversal = locator.substr(9)
        element = this.page().findElementByDomTraversal(domTraversal)
    }

    // TODO: try xpath

    return element;
}