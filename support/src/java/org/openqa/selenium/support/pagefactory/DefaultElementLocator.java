package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.lang.reflect.Field;

/**
 * The default element locator, which will lazily locate an element on a page.
 * This class is designed for use with the {@link org.openqa.selenium.support.PageFactory} and understands
 * the annotations {@link org.openqa.selenium.support.FindBy} and {@link org.openqa.selenium.support.CacheLookup}.
 */
public class DefaultElementLocator implements ElementLocator {
  private final WebDriver driver;
  private final boolean cacheElement;
  private final By by;
  private WebElement cachedElement;

  /**
   * Creates a new element locator.
   * 
   * @param driver The driver to use when finding the element
   * @param field The field on the Page Object that will hold the located value
   */
  public DefaultElementLocator(WebDriver driver, Field field) {
    this.driver = driver;
    Annotations annotations = new Annotations(field);
    cacheElement = annotations.isLookupCached();
    by = annotations.buildBy();
  }

  /**
   * Find the element.
   */
  public WebElement findElement() {
    if (cachedElement != null && cacheElement) {
      return cachedElement;
    }

    WebElement element = driver.findElement(by);
    if (cacheElement) {
      cachedElement = element;
    }

    return element;
  }
}
