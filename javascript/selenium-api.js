function Selenium(browserbot) {
    this.browserbot = browserbot;
    this.page = function() {return browserbot.currentPage};
}

/*
 * Click on the located element, and attach a callback to notify
 * when the page is reloaded.
 */
Selenium.prototype.clickElement = function(locator, callback) {
    var element = this.page().findElement(locator);
    this.page().clickElement(element, callback);
}

/*
 * Trigger the onclick event on the located element,
 * and attach a callback to notify when the page is reloaded.
 */
Selenium.prototype.onclickElement = function(locator, callback) {
    var element = this.page().findElement(locator);
    this.page().onclickElement(element, callback);
}

/**
 * Overwrite the text in the located text element.
 * TODO fail if it can't be typed into.
 */
Selenium.prototype.type = function(locator, newText) {
    var element = this.page().findElement(locator);
    this.page().replaceText(element, newText);
}

/**
 * Select the option by label from the located select element.
 * TODO fail if it's not a select.
 */
Selenium.prototype.select = function(locator, optionText) {
    var element = this.page().findElement(locator);
    this.page().selectOptionWithLabel(element, optionText);
}

/*
 * Open the browser to a new location.
 */
Selenium.prototype.open = function(newLocation, callback) {
    this.browserbot.openLocation(newLocation, callback);
}

/*
 * Select the named window to be the active window.
 */
Selenium.prototype.selectWindow = function(windowName) {
    this.browserbot.selectWindow(windowName);
}
