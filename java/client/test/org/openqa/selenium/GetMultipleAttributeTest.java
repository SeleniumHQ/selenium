package org.openqa.selenium;

import static org.openqa.selenium.Ignore.Driver.OPERA;

@Ignore(OPERA)
public class GetMultipleAttributeTest extends AbstractDriverTestCase {

  public void testMultipleAttributeShouldBeFalseWhenNotSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithoutMultiple"));
    assertEquals("false", element.getAttribute("multiple"));
  }

  public void testMultipleAttributeShouldBeTrueWhenSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleEqualsMultiple"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsBlank() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithEmptyStringMultiple"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithoutAValue() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleWithoutValue"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsSomethingElse() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithRandomMultipleValue"));
    assertEquals("true", element.getAttribute("multiple"));
  }

}