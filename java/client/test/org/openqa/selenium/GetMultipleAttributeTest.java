package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;

public class GetMultipleAttributeTest extends JUnit4TestBase {

  @Test
  public void testMultipleAttributeShouldBeFalseWhenNotSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithoutMultiple"));
    assertEquals(null, element.getAttribute("multiple"));
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleEqualsMultiple"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsBlank() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithEmptyStringMultiple"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithoutAValue() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleWithoutValue"));
    assertEquals("true", element.getAttribute("multiple"));
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMutilpeWithValueAsSomethingElse() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithRandomMultipleValue"));
    assertEquals("true", element.getAttribute("multiple"));
  }

}
