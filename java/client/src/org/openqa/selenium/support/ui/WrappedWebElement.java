package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * To be used only when it is expected that the locator can find one and only one element.
 * <p/>
 * The first time that a method is called, the element is retrieved, and then the action is performed.
 * Any subsequent call will only perform the action on the element previously retrieved;
 * in case the action fails because the element is stale, another retrieval is performed, and the action is re-attempted.
 */
public class WrappedWebElement implements WebElement {

  private final By locator;
  private final WebElementRetriever retriever;
  private WebElement element;

  public WrappedWebElement(By locator, WebElementRetriever retriever) {
    this.locator = locator;
    this.retriever = retriever;
  }

  @Override
  public void click() {
    if (!isFound()) {
      findElement();
      element.click();
    } else {
      try {
        element.click();
      } catch (StaleElementReferenceException e) {
        findElement();
        element.click();
      }
    }
  }

  @Override
  public void submit() {
    if (!isFound()) {
      findElement();
      element.submit();
    } else {
      try {
        element.submit();
      } catch (StaleElementReferenceException e) {
        findElement();
        element.submit();
      }
    }
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    if (!isFound()) {
      findElement();
      element.sendKeys(keysToSend);
    } else {
      try {
        element.sendKeys(keysToSend);
      } catch (StaleElementReferenceException e) {
        findElement();
        element.sendKeys(keysToSend);
      }
    }
  }

  @Override
  public void clear() {
    if (!isFound()) {
      findElement();
      element.clear();
    } else {
      try {
        element.clear();
      } catch (StaleElementReferenceException e) {
        findElement();
        element.clear();
      }
    }
  }

  @Override
  public String getTagName() {
    if (!isFound()) {
      findElement();
      return element.getTagName();
    } else {
      try {
        return element.getTagName();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getTagName();
      }
    }
  }

  @Override
  public String getAttribute(String name) {
    if (!isFound()) {
      findElement();
      return element.getAttribute(name);
    } else {
      try {
        return element.getAttribute(name);
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getAttribute(name);
      }
    }
  }

  @Override
  public boolean isSelected() {
    if (!isFound()) {
      findElement();
      return element.isSelected();
    } else {
      try {
        return element.isSelected();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.isSelected();
      }
    }
  }

  @Override
  public boolean isEnabled() {
    if (!isFound()) {
      findElement();
      return element.isEnabled();
    } else {
      try {
        return element.isEnabled();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.isEnabled();
      }
    }
  }

  @Override
  public String getText() {
    if (!isFound()) {
      findElement();
      return element.getText();
    } else {
      try {
        return element.getText();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getText();
      }
    }
  }

  @Override
  public List<WebElement> findElements(By by) {
    if (!isFound()) {
      findElement();
      return element.findElements(by);
    } else {
      try {
        return element.findElements(by);
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.findElements(by);
      }
    }
  }

  @Override
  public WebElement findElement(By by) {
    if (!isFound()) {
      findElement();
      return element.findElement(by);
    } else {
      try {
        return element.findElement(by);
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.findElement(by);
      }
    }
  }

  @Override
  public boolean isDisplayed() {
    if (!isFound()) {
      findElement();
      return element.isDisplayed();
    } else {
      try {
        return element.isDisplayed();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.isDisplayed();
      }
    }
  }

  @Override
  public Point getLocation() {
    if (!isFound()) {
      findElement();
      return element.getLocation();
    } else {
      try {
        return element.getLocation();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getLocation();
      }
    }
  }

  @Override
  public Dimension getSize() {
    if (!isFound()) {
      findElement();
      return element.getSize();
    } else {
      try {
        return element.getSize();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getSize();
      }
    }
  }

  @Override
  public Rectangle getRect() {
    if (!isFound()) {
      findElement();
      return element.getRect();
    } else {
      try {
        return element.getRect();
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getRect();
      }
    }
  }

  @Override
  public String getCssValue(String propertyName) {
    if (!isFound()) {
      findElement();
      return element.getCssValue(propertyName);
    } else {
      try {
        return element.getCssValue(propertyName);
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getCssValue(propertyName);
      }
    }
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    if (!isFound()) {
      findElement();
      return element.getScreenshotAs(target);
    } else {
      try {
        return element.getScreenshotAs(target);
      } catch (StaleElementReferenceException e) {
        findElement();
        return element.getScreenshotAs(target);
      }
    }
  }

  private void findElement() {
    element = retriever.findElement(locator);
  }

  private boolean isFound() {
    return element == null;
  }
}
