goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('webdriver.Key');
goog.require('webdriver.TestRunner');
goog.require('webdriver.WebElement');
goog.require('webdriver.asserts');
goog.require('webdriver.factory');
goog.require('webdriver.logging');



window.IS_FF_3 = navigator.userAgent.search(/Firefox\/3\.\d+/) > -1;


window.onload = function() {

  goog.global.whereIs = function(file) {
    return new goog.Uri(window.location.href).
        setPath('/common/' + file).
        setQueryData('').
        toString();
  };

  goog.global.toSecureUrl = function(url) {
    return new goog.Uri(url).
        setScheme('https').
        setPort(3443).
        toString();
  };

  var testWindow;

  goog.global.openTestWindow = function(opt_url) {
    var url = opt_url || '';
    testWindow = window.open(url, 'test_window');
    testWindow.moveTo(window.screenLeft, window.screenTop);
    testWindow.resizeTo(window.outerWidth, window.outerHeight);
  };

  goog.global.closeTestWindow = function() {
    if (testWindow) {
      testWindow.close();
    }
  };

  goog.global.switchToTestWindow = function(driver) {
    driver.switchToWindow('test_window');
  };

  goog.global.TEST_PAGE = {
    simpleTestPage: whereIs('simpleTest.html'),
    xhtmlTestPage: whereIs('xhtmlTest.html'),
    formPage: whereIs('formPage.html'),
    metaRedirectPage: whereIs('meta-redirect.html'),
    redirectPage: whereIs('redirect'),
    javascriptEnhancedForm: whereIs('javascriptEnhancedForm.html'),
    javascriptPage: whereIs('javascriptPage.html'),
    framesetPage: whereIs('frameset.html'),
    iframePage: whereIs('iframes.html'),
    dragAndDropPage: whereIs('dragAndDropTest.html'),
    chinesePage: whereIs('cn-test.html'),
    nestedPage: whereIs('nestedElements.html'),
    textPage: whereIs('plain.txt'),
    richtextPage: whereIs('rich_text.html'),
    resultPage: whereIs('resultPage.html')
  };

  webdriver.logging.setLevel(webdriver.logging.Level.ERROR);
  webdriver.logging.enableDomLogging(true);
  webdriver.logging.enableFirebugLogging(false);
  webdriver.TestRunner.start(webdriver.factory.createLocalWebDriver);
};
