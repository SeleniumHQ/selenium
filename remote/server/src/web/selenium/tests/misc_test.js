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
