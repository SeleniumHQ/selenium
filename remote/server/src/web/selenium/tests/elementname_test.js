function testShouldReturnInput(driver) {
  driver.get(TEST_PAGES.formPage);
  var element =  driver.findElement({id: 'cheese'});
  assertThat(element.getElementName(), is('input'));
}
