function testWaitingForAConditionThatIsAlreadyTrue(driver) {
  driver.wait(function() { return true; }, 0);
}


function testWaitingForASimpleCountingCondition(driver) {
  var count = 0;
  var condition = function() {
    count++;
    return count == 10;
  };
  driver.wait(condition, 1000);
  driver.callFunction(function() {
    assertEquals(10, count);
  });
}


function testWaitingForAConditionThatReturnsAFuture(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var clickToShow = driver.findElement({id: 'clickToShow'});
  var clickToHide = driver.findElement({id: 'clickToHide'});

  clickToShow.click();
  driver.callFunction(webdriver.logging.info, null,
      'waiting for black box to be visible');
  driver.wait(clickToHide.isDisplayed, 4000, clickToHide);
  assertThat(clickToHide.isDisplayed(), equals(true));

  clickToHide.click();
  driver.callFunction(webdriver.logging.info, null,
      'waiting for black box to not be visible');
  driver.waitNot(clickToHide.isDisplayed, 4000, clickToHide);
  assertThat(clickToHide.isDisplayed(), equals(false));
}


function testWaitTimeouts(driver) {
  var neverTrue = function() { return false; };
  driver.wait(neverTrue, 500);
  driver.catchExpectedError('Wait commmand should have timed out');
}


function testWaitingOnAFutureConditionThatTimesout(driver) {
  driver.get(TEST_PAGES.javascriptPage);
  var clickToShow = driver.findElement({id: 'clickToShow'});
  driver.waitNot(clickToShow.isDisplayed, 500, clickToShow);
  driver.catchExpectedError('Wait commmand should have timed out', function(command) {
    var response = command.response;
    assertTrue(!!response);
    assertTrue(response.isFailure);
    var regex = /Timeout after \d{3}ms/;
    assertThat(response.value, matchesRegex(regex));
  });
}
