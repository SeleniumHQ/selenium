package org.openqa.selenium.support.ui;

import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;

import org.junit.AfterClass;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

public class WebElementRetrieverHandlingIframesTest extends JUnit4TestBase {

  private WebElementRetrieverHandlingIframes sut;

  @Before
  public void setup() {
    sut = new WebElementRetrieverHandlingIframes(driver);
  }

  @AfterClass
  public static void cleanUpDrivers() {
    JUnit4TestBase.removeDriver();
  }

  @Test(expected = NoSuchElementException.class)
  public void noIframesAndElementIsNotPresent() {
    driver.get(pages.noIframesPage);
    sut.findElement(By.id("not-present"));
  }

  @Test
  public void noIframesAndElementIsPresent() {
    driver.get(pages.noIframesPage);
    WebElement btn = sut.findElement(By.id("btn"));

    assertThat(btn, notNullValue());
  }

  @Test
  public void foundInRootFrame() {
    driver.get(pages.iframesTreePage);
    WebElement btn = sut.findElement(By.id("element-in-root-iframe"));

    assertThat(btn, notNullValue());
  }

  @Test
  public void foundInLastIframe() {
    driver.get(pages.iframesTreePage);
    WebElement btn = sut.findElement(By.id("element-in-iframe22"));

    assertThat(btn, notNullValue());
  }

  @Test
  public void foundInMiddleIframe() {
    driver.get(pages.iframesTreePage);
    WebElement btn = sut.findElement(By.id("element-in-iframe12"));

    assertThat(btn, notNullValue());
  }
}
