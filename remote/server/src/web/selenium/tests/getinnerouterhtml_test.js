function testGetOuterHtml(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  var a = driver.findElement({id: "id1"});
  assertThat(a.getOuterHtml(), equals('<a id="id1" href="#">Foo</a>'));
}


function testGetInnerHtml(driver) {
  driver.get(TEST_PAGES.xhtmlTestPage);
  var a = driver.findElement({id: "id1"});
  assertThat(a.getInnerHtml(), equals('Foo'));
}
