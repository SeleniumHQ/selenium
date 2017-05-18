package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.ElementNotVisibleException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Returns the element found only if it is {@link WebElement#isDisplayed()};
 * throws {@link ElementNotVisibleException} otherwise.
 */
public class DisplayedWebElementRetriever extends WebElementRetrieverDecorator {

  protected DisplayedWebElementRetriever(WebElementRetrieverHandlingIframes retriever) {
    super(retriever);
  }

  @Override
  public WebElement findElement(By locator) {
    WebElement element = decoratedRetriever.findElement(locator);
    if (!element.isDisplayed()) {
      throw new ElementNotVisibleException("Not visible: " + locator);
    }
    return element;

  }

  @Override
  public WebDriver getDriver() {
    return decoratedRetriever.getDriver();
  }
}
