/**
 * @fileoverview Implements the tests in
 * org.openqa.selenium.ElementAttributeTest using the JS API.  This file
 * should be loaded by the test_suite.js test bootstrap.
 * @author jmleyba@gmail.com (Jason Leyba)
 */

function testReturnsNullForValueOfAnAttributeThatIsNotListed(driver) {
  driver.get(TEST_PAGES.simpleTestPage);
  assertThat(
      driver.findElement({xpath: '//body'}).getAttribute('cheese'), is(null));
}


function testReturnsEmptyAttributeValuesWhenPresentAndValueIsEmpty(driver) {
  driver.get(TEST_PAGES.simpleTestPage);
  assertThat(
      driver.findElement({xpath: '//body'}).getAttribute('style'), is(''));
}


function testReturnsTheValueOfTheDisabledAttributeEventIfItIsMissing(driver) {
  driver.get(TEST_PAGES.formPage);
  assertThat(
      driver.findElement({xpath: "//input[@id='working']"}).
          getAttribute('disabled'),
      equals(false));
}


function testReturnsTheValueOfTheIndexAttributeEvenIfItIsMissing(driver) {
  driver.get(TEST_PAGES.formPage);
  driver.findElement({id: 'multi'}).
      findElements({tagName: 'option'});
  driver.callFunction(function(response) {
    var index = response.value[1].getAttribute('index');
    assertThat(index, equals(1));
  });
}


function testIndicatesTheElementsThatAreDisabledAreNotEnabled(driver) {
  var element;
  driver.get(TEST_PAGES.formPage);
  element = driver.findElement({xpath: "//input[@id='notWorking']"});
  assertThat(element.isEnabled(), is(false));
  element = driver.findElement({xpath: "//input[@id='working']"});
  assertThat(element.isEnabled(), is(true));
}


function testIndicatesWhenATextAreaIsDisabled(driver) {
  driver.get(TEST_PAGES.formPage);
  driver.findElement({xpath: "//textarea[@id='notWorkingArea']"}).
      isEnabled();
  driver.callFunction(function(response) {
    assertFalse(response.value);
  });
}


function testIndicatesWhenASelectIsDisabled(driver) {
  driver.get(TEST_PAGES.formPage);
  var element = driver.findElement({name: 'selectomatic'});
  assertThat(element.isEnabled(), is(true));
  element = driver.findElement({name: 'no-select'});
  assertThat(element.isEnabled(), is(false));
}


function testReturnsTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute(
    driver) {
  driver.get(TEST_PAGES.formPage);
  var checkbox = driver.findElement({xpath: "//input[@id='checky']"});
  assertThat(checkbox.getAttribute('checked'), is(false));
  checkbox.setSelected();
  assertThat(checkbox.getAttribute('checked'), is(true));
}


function testReturnsTheValueOfCheckedForRadioButtonsEvenIfTheyLackTheAttribute(
    driver) {
  driver.get(TEST_PAGES.formPage);
  var cheese = driver.findElement({id: 'cheese'});
  var peas = driver.findElement({id: 'peas'});
  var cheeseAndPeas = driver.findElement({id: 'cheese_and_peas'});
  assertThat(cheese.getAttribute('checked'), is(false));
  assertThat(peas.getAttribute('checked'), is(false));
  assertThat(cheeseAndPeas.getAttribute('checked'), is(true));
  cheese.click();
  assertThat(cheese.getAttribute('checked'), is(true));
  assertThat(peas.getAttribute('checked'), is(false));
  assertThat(cheeseAndPeas.getAttribute('checked'), is(false));
  peas.click();
  assertThat(cheese.getAttribute('checked'), is(false));
  assertThat(peas.getAttribute('checked'), is(true));
  assertThat(cheeseAndPeas.getAttribute('checked'), is(false));
  peas.click();
  assertThat(cheese.getAttribute('checked'), is(false));
  assertThat(peas.getAttribute('checked'), is(true));
  assertThat(cheeseAndPeas.getAttribute('checked'), is(false));
}


function testReturnsTheValueOfSelectedForOptionsEvenIfTheyLackTheAttribute(
    driver) {
  driver.get(TEST_PAGES.formPage);
  driver.findElement({xpath: "//select[@name='selectomatic']"}).
      findElements({tagName: 'option'});
  driver.callFunction(function(response) {
    var webElements = response.value;
    assertThat(webElements[0].isSelected(), is(true));
    assertThat(webElements[1].isSelected(), is(false));
  });
}


function testReturnsValueOfClassAttributeOfAnElement(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  var h1 = driver.findElement({xpath: '//h1'});
  assertThat(h1.getAttribute('class'), equals('header'));
}


function testReturnsTheContentsOfATextAreaAsItsValue(driver) {
  driver.get(TEST_PAGES.formPage);
  driver.findElement({id: 'withText'}).getValue();
  driver.callFunction(function(response) {
    assertEquals(response.value, 'Example text');
  });
}


function testTreatsReadonlyAsAValue(driver) {
  driver.get(TEST_PAGES.formPage);
  var readonly = driver.findElement({name: 'readonly'}).
      getAttribute('readonly');
  var notReadonly = driver.findElement({name: 'x'}).
      getAttribute('readonly');
  assertThat(readonly, not(equals(notReadonly)));
}
