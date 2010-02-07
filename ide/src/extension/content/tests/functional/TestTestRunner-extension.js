/*
 * By default, Selenium looks for a file called "user-extensions.js", and loads and javascript
 * code found in that file. This file is a sample of what that file could look like.
 *
 * user-extensions.js provides a convenient location for adding extensions to Selenium, like
 * new actions, checks and locator-strategies.
 * By default, this file does not exist. Users can create this file and place their extension code
 * in this common location, removing the need to modify the Selenium sources, and hopefully assisting
 * with the upgrade process.
 *
 * You can find contributed extensions at http://wiki.openqa.org/display/SEL/Contributed%20User-Extensions
 */

// The following examples try to give an indication of how Selenium can be extended with javascript.

// All do* methods on the Selenium prototype are added as actions.
// Eg add a typeRepeated action to Selenium, which types the text twice into a text box.
// The typeTwiceAndWait command will be available automatically
Selenium.prototype.doTypeRepeated = function(locator, text) {
    // All locator-strategies are automatically handled by "findElement"
    var element = this.page().findElement(locator);

    // Create the text to type
    var valueToType = text + text;

    // Replace the element text with the new text
    this.page().replaceText(element, valueToType);
};

// All assert* methods on the Selenium prototype are added as checks.
// Eg add a assertValueRepeated check, that makes sure that the element value
// consists of the supplied text repeated.
// The verify version will be available automatically.
Selenium.prototype.assertValueRepeated = function(locator, text) {
    // All locator-strategies are automatically handled by "findElement"
    var element = this.page().findElement(locator);

    // Create the text to verify
    var expectedValue = text + text;

    // Get the actual element value
    var actualValue = element.value;

    // Make sure the actual value matches the expected
    Assert.matches(expectedValue, actualValue);
};

// All get* methods on the Selenium prototype result in
// store, assert, assertNot, verify, verifyNot, waitFor, and waitForNot commands.
// E.g. add a getTextLength method that returns the length of the text
// of a specified element.
// Will result in support for storeTextLength, assertTextLength, etc.
Selenium.prototype.getTextLength = function(locator) {
	return this.getText(locator).length;
};

// All locateElementBy* methods are added as locator-strategies.
// Eg add a "valuerepeated=" locator, that finds the first element with the supplied value, repeated.
// The "inDocument" is a the document you are searching.
PageBot.prototype.locateElementByValueRepeated = function(text, inDocument) {
    // Create the text to search for
    var expectedValue = text + text;

    // Loop through all elements, looking for ones that have a value === our expected value
    var allElements = inDocument.getElementsByTagName("*");
    for (var i = 0; i < allElements.length; i++) {
        var testElement = allElements[i];
        if (testElement.value && testElement.value === expectedValue) {
            return testElement;
        }
    }
    return null;
};

var uiMap = new UIMap();

uiMap.addPageset({
    name: 'homepage'
    , description: 'the OpenQA homepage'
    , paths: [ "" ]
});

uiMap.addElement('homepage', {
    name: 'bannerAd'
    , description: 'the banner advertisement'
    , locator: 'name=google_ads_frame'
});

