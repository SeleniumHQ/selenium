function testSwitchesFocusToANewWindowWhenItIsOpenedAndNotStopFutureOperations(
    driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.findElement({linkText: 'Open new window'}).click();
  assertThat(driver.getTitle(), equals('XHTML Test Page'));
  driver.switchToWindow('result');
  assertThat(driver.getTitle(), equals('We Arrive Here'));
  driver.get(TEST_PAGES.formPage);  // Tests for blocking
  driver.close();
}


function testThrowsAnErrorWhenNoMatchingWindowsAreFound(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.switchToWindow('invalid name');
  driver.expectErrorFromPreviousCommand(
      'Should not have succeeded');
}


function testAbleToIterateOverAllOpenWindows(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.findElement({name: 'windowOne'}).click();
  driver.getAllWindowHandles();
  driver.callFunction(function(response) {
    assertEquals(
        'Yikes! A non-deterministic test.  There should be 4 windows:\n' +
        '  1. This test window\n' +
        '  2. xhtmlTestPage (name=test_window)\n' +
        '  3. windowOne (name=result)\n' +
        'If there are more windows than this, another test probably did not ' +
        'clean up after itself...\n' +
        'if there are fewer than this, something bad happened',
        3, response.value.length);
    for (var i = 0; i < response.value.length; i++) {
      driver.switchToWindow(response.value[i]);
    }
    // Everything is a-ok, now clean up after ourselves and delete the window
    // opened by clicking on windowOne.
    driver.switchToWindow('result');
    driver.close();
  });
}


function testClickingOnAButtonThatClosesAnOpenWindowDoesNotHangTheBrowser(
    driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  driver.findElement({name: 'windowThree'}).click();
  driver.switchToWindow('result');
  driver.findElement({id: 'close'}).click();
  // Coolness, all good if we get here.
}
