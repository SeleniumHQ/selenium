package com.googlecode.webdriver;


public class I18nTest extends AbstractDriverTestCase {
    
  @Ignore("ie, safari, htmlunit, firefox")
  public void testCn() {
      driver.get(chinesePage);
      driver.findElement(By.linkText("中国之声")).click();
  }
}