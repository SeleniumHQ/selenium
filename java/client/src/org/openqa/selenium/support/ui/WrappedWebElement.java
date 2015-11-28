package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * When a locator can find one and only one element.
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
    findElement();
    element.click();
  }

  @Override
  public void submit() {
    findElement();
    element.submit();
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    findElement();
    element.sendKeys(keysToSend);
  }

  @Override
  public void clear() {
    findElement();
    element.clear();
  }

  @Override
  public String getTagName() {
    findElement();
    return element.getTagName();
  }

  @Override
  public String getAttribute(String name) {
    findElement();
    return element.getAttribute(name);
  }

  @Override
  public boolean isSelected() {
    findElement();
    return element.isSelected();
  }

  @Override
  public boolean isEnabled() {
    findElement();
    return element.isEnabled();
  }

  @Override
  public String getText() {
    findElement();
    return element.getText();
  }

  @Override
  public List<WebElement> findElements(By by) {
    findElement();
    return element.findElements(by);
  }

  @Override
  public WebElement findElement(By by) {
    findElement();
    return element.findElement(by);
  }

  @Override
  public boolean isDisplayed() {
    findElement();
    return element.isDisplayed();
  }

  @Override
  public Point getLocation() {
    findElement();
    return element.getLocation();
  }

  @Override
  public Dimension getSize() {
    findElement();
    return element.getSize();
  }

  @Override
  public Rectangle getRect() {
    findElement();
    return element.getRect();
  }

  @Override
  public String getCssValue(String propertyName) {
    findElement();
    return element.getCssValue(propertyName);
  }

  @Override
  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    findElement();
    return element.getScreenshotAs(target);
  }

  private void findElement() {
    element = retriever.findElement(locator);
  }
}
