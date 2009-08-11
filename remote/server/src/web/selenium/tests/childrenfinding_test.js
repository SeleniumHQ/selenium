/**
 * @fileoverview Implements the tests in org.openqa.selenium.ChildrenFindingTest
 * using the JS API.  This file should be loaded by the test_suite.js test
 * bootstrap.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

function testReturnAnEmptyListWhenThereAreNoChildrenOfANode(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.findElement({id: 'table'}).
      findElements({tagName: 'tr'});
  driver.callFunction(function(response) {
    assertEquals(0, response.value.length);
  });
}


function testShouldNotFindElementOutsideTree(driver) {
  driver.get(TEST_PAGES.formPage);
  var login = driver.findElement({name: 'login'});
  assertThat(login.isElementPresent({name: 'x'}), is(false));
  login.findElement({name: 'x'});
  driver.catchExpectedError();
}


function testShouldFindGrandChildren(driver) {
  driver.get(TEST_PAGES.formPage);
  driver.findElement({id: 'nested_form'}).
      findElement({name: 'x'});
}


function testFindElementByIdWhenMultipleMatchesExist(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var text = driver.findElement({id: 'test_id_div'}).
      findElement({id: 'test_id'}).
      getText();
  assertThat(text, equals('inside'));
}


function testFindElementByIdWhenNoMatchInContext(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({id: 'test_id_div'}).
      findElement({id: 'test_id_out'});
  driver.catchExpectedError(
      'Should not be able to find an element by ID when that element does ' +
      'not exist under the given root');
}


function testCanDetectWhenElementsArePresentByXPath(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var xpath = {xpath: '//form[@name="form2"]/select/x'};
  assertThat(driver.isElementPresent(xpath), is(false));
  var select = driver.findElement({xpath: '//form[@name="form2"]/select'});
  assertThat(select.isElementPresent({xpath: './/x'}), is(false));
}


function testRaisesAnErrorWhenChildElementIsNotFoundByXPath(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var xpath = {xpath: '//form[@name="form2"]/select/x'};
  assertThat(driver.isElementPresent(xpath), is(false));
  var select = driver.findElement({xpath: '//form[@name="form2"]/select'});
  select.findElement({xpath: './/x'});
  driver.catchExpectedError();
}


function testFindElementsById(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({name: 'form2'}).
      findElements({id: '2'});
  driver.callFunction(function(response) {
    assertEquals('Should find two elements', 2, response.value.length);
  });
}


function testFindElementsByLinkTest(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({name: 'div1'}).
      findElements({linkText: 'hello world'});
  driver.callFunction(function(response) {
    var webElements = response.value;
    assertEquals('Should find two elements', 2, webElements.length);
    assertThat(webElements[0].getAttribute('name'), is('link1'));
    assertThat(webElements[1].getAttribute('name'), is('link2'));
  });
}


function testFindElementsByLinkText(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({name: 'div1'}).
      findElements({linkText: 'hello world'});
  driver.callFunction(function(response) {
    assertEquals('Should find two elements', 2, response.value.length);
  });
}


function testShouldFindChildElementsByClassName(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var one = driver.findElement({name: 'classes'}).
      findElement({className: 'one'});
  assertThat(one.getText(), equals('Find me'));
}


function testShouldFindChildrenByClassName(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({name: 'classes'}).
      findElements({className: 'one'});
  driver.callFunction(function(response) {
    assertEquals(2, response.value.length);
  });
}


function testShouldFindChildElementByTagName(driver) {
  driver.get(TEST_PAGES.nestedPage);
  var name = driver.findElement({name: 'div1'}).findElement({tagName: 'A'}).
      getAttribute('name');
  assertThat(name, is('link1'));
//  assertThat(
//      driver.findElement({name: 'div1'}).
//          findElement({tagName: 'A'}).
//          getAttribute('name'),
//      is('link1'));
}


function testShouldFindChildrenByTagName(driver) {
  driver.get(TEST_PAGES.nestedPage);
  driver.findElement({name: 'div1'}).
      findElements({tagName: 'A'});
  driver.callFunction(function(response) {
    assertEquals(2, response.value.length);
  });
}
