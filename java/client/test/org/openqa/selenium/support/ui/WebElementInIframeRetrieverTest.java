package org.openqa.selenium.support.ui;

import static org.hamcrest.Matchers.notNullValue;
import static org.junit.Assert.assertThat;

import org.junit.AfterClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

public class WebElementInIframeRetrieverTest extends JUnit4TestBase {

  private WebElementInIframeRetriever sut;

  @AfterClass
  public static void cleanUpDrivers() {
    JUnit4TestBase.removeDriver();
  }

  @Test
  public void happyPath() {
    driver.get(pages.iframePage);
    sut = new WebElementInIframeRetriever(driver);
    WebElement element = sut.findElement(By.id(getClass().getSimpleName()));

    assertThat(element, notNullValue());
  }

  @Test
  public void noIframesAndElementIsNotPresent() throws Exception {
    driver.get(pages.iframePage);
    sut.findElement(By.id(getClass().getSimpleName()));

  }
}
