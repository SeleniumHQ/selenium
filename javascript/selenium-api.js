function TestApp(browserbot) {
    this.browserbot = browserbot;
    this.page = function() {return browserbot.currentPage};
}

/*
 * Finds an element on the current page, using various lookup protocols
 */
TestApp.prototype.findElement = function(locator) {
    // First try using id/name search
    var element = this.page().findIdentifiedElement(locator);

    // Next, if the locator starts with 'document.', try to use Dom traversal
    if (element == null && locator.indexOf("document.") == 0) {
        var domTraversal = locator.substr(9)
        element = this.page().findElementByDomTraversal(domTraversal)
    }

    // TODO: try xpath

    if (element == null) {
        throw new Error("Element not found");
    }

    return element;
}

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
TestApp.prototype.clickElement = function(locator, callback) {
    var element = this.findElement(locator);
    this.page().clickElement(element, callback);
}

/*
 * Trigger the onclick event on the located element,
 * and attach a callback to notify when the page is reloaded.
 */
TestApp.prototype.onclickElement = function(locator, callback) {
    var element = this.findElement(locator);
    this.page().onclickElement(element, callback);
}

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
TestApp.prototype.type = function(locator, newText) {
    var element = this.findElement(locator);
    this.page().replaceText(element, newText);
}

/**
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
TestApp.prototype.select = function(locator, optionText) {
    var element = this.findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
}

/*
 * Open the browser to a new location.
 */
TestApp.prototype.open = function(newLocation, callback) {
    this.browserbot.openLocation(newLocation, callback);
}

/*
 * Select the named window to be the active window.
 */
TestApp.prototype.selectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
}
