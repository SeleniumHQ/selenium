package org.openqa.selenium;

import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;


@Ignore({CHROME, OPERA, SELENESE, ANDROID})
public class ClearTest extends AbstractDriverTestCase {

  public void testWritableTextInputShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("writableTextInput"));
    element.clear();
    assertEquals("", element.getAttribute("value"));
  }


  public void testTextInputShouldNotClearWhenDisabled() {
    driver.get(pages.readOnlyPage);
    try {
      WebElement element = driver.findElement(By.id("textInputnotenabled"));
      assertEquals(false, element.isEnabled());
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  public void testTextInputShouldNotClearWhenReadOnly() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("readOnlyTextInput"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  public void testWritableTextAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("writableTextArea"));
    element.clear();
    assertEquals("", element.getAttribute("value"));
  }

  public void testTextAreaShouldNotClearWhenDisabled() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("textAreaNotenabled"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  public void testTextAreaShouldNotClearWhenReadOnly() {
    try {
      driver.get(pages.readOnlyPage);
      WebElement element = driver.findElement(By.id("textAreaReadOnly"));
      element.clear();
      fail("Should not have succeeded");
    } catch (InvalidElementStateException e) {
      // This is expected
    }
  }

  @Ignore(HTMLUNIT)
  public void testContentEditableAreaShouldClear() {
    driver.get(pages.readOnlyPage);
    WebElement element = driver.findElement(By.id("content-editable"));
    element.clear();
    assertEquals("", element.getText());
  }

}
