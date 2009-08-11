function testCanDetermineIfAnElementIsDisplayedOrNot(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  assertThat(driver.findElement({id: 'displayed'}).isDisplayed(), is(true));
  assertThat(driver.findElement({id: 'none'}).isDisplayed(), is(false));
  assertThat(
      driver.findElement({id: 'suppressedParagraph'}).isDisplayed(), is(false));
  assertThat(driver.findElement({id: 'hidden'}).isDisplayed(), is(false));
}


function testVisibilityTakesIntoAccountParentVisibility(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var childDiv = driver.findElement({id: 'hiddenchild'});
  var hiddenLink = driver.findElement({id: 'hiddenlink'});
  assertThat(childDiv.isDisplayed(), is(false));
  assertThat(hiddenLink.isDisplayed(), is(false));
}


function testCountElementsAsVisibleIfStylePropertyHasBeenSet(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var shown = driver.findElement({id: 'visibleSubElement'});
  assertThat(shown.isDisplayed(), is(true));
}


function testHiddenInputElementsAreNeverVisible(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var hidden = driver.findElement({name: 'hidden'});
  assertThat(hidden.isDisplayed(), is(false));
}


function testNotAbleToClickOnAnElementThatIsNotDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var element = driver.findElement({id: 'unclickable'});
  element.click();
  driver.catchExpectedError(
      'Should not be able to click on an invisible element');
}


function testNotAbleToToggleAnElementThatIsNotDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var element = driver.findElement({id: 'untogglable'});
  element.toggle();
  driver.catchExpectedError(
      'Should not be able to toggle an invisible element');
}


function testNotAbleToSelectAnElementThatIsNotDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var element = driver.findElement({id: 'untogglable'});
  element.setSelected();
  driver.catchExpectedError(
      'Should not be able to select an invisible element');
}


function testNotAbleToTypeOnAnElementThatIsNotDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var element = driver.findElement({id: 'unclickable'});
  element.sendKeys('You do not see me');
  driver.catchExpectedError(
      'Should not be able to type on an invisible element');
}


function testElementWithZeroHeightIsNotConsideredDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var zeroHeight = driver.findElement({id: 'zeroheight'});
  assertThat(
      'Elements with zero height should not be considered displayed',
      zeroHeight.isDisplayed(), is(false));
}


function testElementWithZeroWidthIsNotConsideredDisplayed(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var zeroWidth = driver.findElement({id: 'zerowidth'});
  assertThat(
      'Elements with zero width should not be considered displayed',
      zeroWidth.isDisplayed(), is(false));
}
