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


var TEST_FILES = [
  'childrenfinding_test.js',
  'correcteventfiring_test.js',
  'draganddrop_test.js',
  'elementattribute_test.js',
  'elementfinding_test.js',
  'elementname_test.js',
  'executingjavascript_test.js',
  'expectederrors_test.js',
  'formhandling_test.js',
  'frameswitching_test.js',
  'getinnerouterhtml_test.js',
  'locatorbuilder_test.js',
  'misc_test.js',
  'pageloading_test.js',
  'partiallinktextmatch_test.js',
  'selectelementhandling_test.js',
  'staleelementreference_test.js',
  'textpages_test.js',
  'typing_contenteditable_test.js',
  'typing_forms_test.js',
  'typing_richtext_test.js',
  'typing_test.js',
  'visibility_test.js',
  'windowswitching_test.js',
  'xpathelementfinding_test.js'
];


var IS_FF_3 = goog.userAgent.GECKO &&
              navigator.userAgent.search(/Firefox\/3\.\d+/) > -1;


/**
 * Hackery! When this file is loaded, we also want to load all of the individual
 * test files.
 */
(function() {
  var uri = new goog.Uri(window.location.href);
  var fileName = uri.getParameterValue('file');

  for (var i = 0, file; file = TEST_FILES[i]; i++) {
    if (!fileName || file == fileName) {
      document.write(
          '<script type="text/javascript" src="' + file + '"></script>');
    }
  }
})();


function whereIs(file) {
  return new goog.Uri(window.location.href).
      setPath('/common/' + file).
      setQueryData('').
      toString();
}


function toSecureUrl(url) {
  return new goog.Uri(url).
      setScheme('https').
      setPort(3443).
      toString();
}

var TEST_PAGES = {
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


var hasSetupPage = false;


// TODO(jmleyba): Update the test runner to check for and run this.
function setUpPage(driver) {
  if (hasSetupPage) {
    return;
  }
  hasSetupPage = true;
  hasSetupPage = true;
  driver.callFunction(function() {
    window.open('', 'test_window');
  });

  var uri = new goog.Uri(window.location.href);
  var currentFile = uri.getParameterValue('file');
  var options = goog.array.map(TEST_FILES, function(file) {
    return goog.dom.createDom('OPTION', {
      value: file,
      innerHTML: file,
      selected: file == currentFile
    });
  });
  goog.array.splice(options, 0, 0, goog.dom.createDom('OPTION', {
    value: 'All Tests',
    innerHTML: 'All Tests',
    selected: !goog.isDef(currentFile)
  }));
  var container = goog.dom.createDom('DIV', null,
      goog.dom.createDom('SPAN', {style:'margin-right:5px;'},
          'Select a test file to run:'),
      goog.dom.createDom('SELECT', null, options));
  if (document.body.firstChild) {
    goog.dom.insertSiblingBefore(container, document.body.firstChild);
  } else {
    goog.dom.appendChild(document.body, container);
  }
  goog.events.listen(container, goog.events.EventType.CHANGE,
      function(e) {
        var option = e.target.childNodes[e.target.selectedIndex];
        uri.getQueryData().clear();
        if (option.value != 'All Tests') {
          uri.getQueryData().add('file', option.value);
        }
        window.location.href = uri.toString();
      });
}


function setUp(driver) {
  setUpPage(driver);
  driver.switchToWindow('test_window');
}


// TODO(jmleyba): Implement setUpPage and tearDownPage
function tearDownPage(driver) {
  // webdriver.logging.setLevel(webdriver.logging.Level.INFO);
  // TODO(jmleyba): How do we make this not close ourselves?
  driver.close();
}
