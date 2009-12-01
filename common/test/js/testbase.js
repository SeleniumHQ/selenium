goog.require('goog.Uri');
goog.require('goog.dom');
goog.require('goog.events');
goog.require('goog.math.Coordinate');
goog.require('goog.math.Size');
goog.require('goog.string');
goog.require('goog.userAgent');
goog.require('webdriver.Key');
goog.require('webdriver.WebElement');
goog.require('webdriver.asserts');
goog.require('webdriver.factory');
goog.require('webdriver.jsunit');



window.IS_FF_3 = navigator.userAgent.search(/Firefox\/3\.\d+/) > -1;


(function() {
  goog.global.whereIs = function(file) {
    return window.location.protocol + '//' + window.location.host +
           '/common/' + file;
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
})();
