function testCanExecuteJavascriptThatReturnsAString(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.executeScript('return document.title');
  assertThat(driver.executeScript('return document.title'),
      equals('XHTML Test Page'));
}


function testCanExecuteJavascriptThatReturnsANumber(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var result = driver.executeScript(
      'return document.getElementsByName("checky").length;');
  assertThat(result, equals(8));
}


function testCanExecuteJavascriptThatReturnsAWebElement(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  // TODO(jmleyba): Need a way to say "when future is set, execute this command"
  var result = driver.executeScript('return document.getElementById("id1");');
  driver.callFunction(function() {
    var element = result.getValue();
    assertTrue('Result should be a WebElement',
               element instanceof webdriver.WebElement);
    assertThat(element.getAttribute('href'), equals('#'));
    assertThat(element.getAttribute('id'), equals('id1'));
  });
}


function testCanExecuteScriptThatReturnsABoolean(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  assertThat(driver.executeScript('return true;'), is(true));
}


function testThrowsAnExceptionWhenTheJavascriptIsBad(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.executeScript('return squiggle();');
  driver.catchExpectedError(
      'Expected an exception from bad javascript');
}


function testCanCallFunctionsDefinedOnThePage(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  driver.executeScript('displayMessage("I like cheese");');
  assertThat(
      driver.findElement({id: 'result'}).getText(), equals('I like cheese'));
}


function testCanPassAStringAsAnArgument(driver) {
  var script = 'return arguments[0] == "fish" ? "fish" : "not fish";';
  driver.get(TEST_PAGES.javascriptPage);
  assertThat(driver.executeScript(script, 'fish'), equals('fish'));
  assertThat(driver.executeScript(script, 'chicken'), equals('not fish'));
}


function testCanPassABooleanAsAScriptArgument(driver) {
  var script = 'return arguments[0] == true;';
  driver.get(TEST_PAGES.javascriptPage);
  assertThat(driver.executeScript(script, true), is(true));
  assertThat(driver.executeScript(script, false), is(false));
}


function testCanPassANumberAsAnArgument(driver) {
  var script = 'return arguments[0] + arguments[1];';
  driver.get(TEST_PAGES.javascriptPage);
  assertThat(driver.executeScript(script, 1, 2), equals(3));
  assertThat(driver.executeScript(script, 27, -15), equals(12));
  assertThat(driver.executeScript(script, 27.5, -15.25), equals(12.25));
}


function testCanPassAWebElementAsAnArgument(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var button = driver.findElement({id: 'plainButton'});
  driver.executeScript(
      "arguments[0]['flibble'] = arguments[0].getAttribute('id');" +
          "return arguments[0]['flibble'];",
      button);
  driver.callFunction(function(response) {
    assertEquals('plainButton', response.value);
  });
}


function testThrowsAnExceptionIfAnArgumentIsNotValid(driver) {
  var script = 'return arguments[0];';
  try {
    driver.executeScript(script, goog.nullFunction);
    fail('Should have rejected invalid argument type: function' +
         '\nValid argument types are: string, boolean, number, and ' +
         'webdriver.WebElement objects');
  } catch (expected) {
    assertEquals('Invalid script argument type: function', expected.message);
  }

  try {
    driver.executeScript(script, []);
    fail('Should have rejected invalid argument type: array' +
         '\nValid argument types are: string, boolean, number, and ' +
         'webdriver.WebElement objects');
  } catch (expected) {
    assertEquals('Invalid script argument type: array', expected.message);
  }

  try {
    driver.executeScript(script, {});
    fail('Should have rejected invalid argument type: object' +
         '\nValid argument types are: string, boolean, number, and ' +
         'webdriver.WebElement objects');
  } catch (expected) {
    assertEquals('Invalid script argument type: object', expected.message);
  }
}


function testShouldBeAbleToGrabTheBodyOfFrameOnceSwitchedTo(driver) {
  driver.get(TEST_PAGES.richtextPage);
  driver.switchToFrame('editFrame');
  // TODO(jmleyba): This is ugly.
  var body = driver.executeScript('return document.body;');
  driver.callFunction(function() {
    assertThat(body.getValue().getText(), equals(''));
  });
}
