function testShouldBeAbleToLoadASimplePageOfText(driver) {
  driver.get(TEST_PAGES.textPage);
  assertThat(driver.getPageSource(),
             equals('<html><head></head><body><pre>Test</pre></body></html>'));
}
