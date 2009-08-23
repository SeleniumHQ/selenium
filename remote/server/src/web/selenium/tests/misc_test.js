function testShouldReportTheCurrentUrlCorrectly(driver) {
  driver.get(TEST_PAGES.simpleTestPage);
  assertThat(driver.getCurrentUrl(), equals(TEST_PAGES.simpleTestPage));
  driver.get(TEST_PAGES.javascriptPage);
  assertThat(driver.getCurrentUrl(), equals(TEST_PAGES.javascriptPage));
}


function testShouldReturnTheSourceOfAPage(driver) {
  driver.get(TEST_PAGES.simpleTestPage);
  var source = driver.getPageSource();
  assertThat(source, contains("<html"));
  assertThat(source, contains("</html"));
  assertThat(source, contains("An inline element"));
  assertThat(source, contains("<p id="));
  assertThat(source, contains("lotsofspaces"));
}


function testUsersCanOverrideSetTimeoutWithoutBreakingWebDriver(driver) {
  window.setTimeout = goog.nullFunction;
  var count = 0;
  function incrementCount() {
    count += 1;
  }
  window.setTimeout(incrementCount, 0);
  window.setTimeout(incrementCount, 1);
  driver.sleep(5);
  driver.callFunction(function() {
    assertEquals(0, count);
  });
  // If this doesn't work, it will most likely result in the tests timing out.
}
