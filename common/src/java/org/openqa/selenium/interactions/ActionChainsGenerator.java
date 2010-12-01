package org.openqa.selenium.interactions;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Implements the builder pattern:
 * Builds a CompositeAction containing all actions specified
 * by the method calls.
 */
public class ActionChainsGenerator {
  private final WebDriver driver;
  private CompositeAction action;
  private WebElement onElement;

  public ActionChainsGenerator(WebDriver driver) {
    this.driver = driver;
    action = new CompositeAction();
  }

  public ActionChainsGenerator onElement(WebElement element) {
    onElement = element;
    return this;
  }

  public ActionChainsGenerator keyDown(Keys theKey) {
    return this.keyDown(onElement, theKey);
  }

  public ActionChainsGenerator keyDown(WebElement element, Keys theKey) {
    action.addAction(new KeyDownAction(driver, element, theKey));
    return this;
  }

  public ActionChainsGenerator keyUp(Keys theKey) {
    return this.keyUp(onElement, theKey);
  }

  public ActionChainsGenerator keyUp(WebElement element, Keys theKey) {
    action.addAction(new KeyUpAction(driver, element, theKey));
    return this;
  }

  public ActionChainsGenerator sendKeys(CharSequence... keysToSend) {
    return this.sendKeys(onElement, keysToSend);
  }

  public ActionChainsGenerator sendKeys(WebElement element, CharSequence... keysToSend) {
    action.addAction(new SendKeysAction(driver, element, keysToSend));
    return this;
  }


  public Action build() {
    CompositeAction toReturn = action;
    action = null;
    return toReturn;
  }

  public ActionChainsGenerator clickAndHold(WebElement onElement) {
    action.addAction(new ClickAndHoldAction(driver, onElement));
    return this;
  }

  public ActionChainsGenerator release(WebElement onElement) {
    action.addAction(new ButtonReleaseAction(driver, onElement));
    return this;
  }

  public ActionChainsGenerator click(WebElement onElement) {
    action.addAction(new ClickAction(driver, onElement));
    return this;
  }

  public ActionChainsGenerator doubleClick(WebElement onElement) {
    action.addAction(new DoubleClickAction(driver, onElement));
    return this;
  }

  public ActionChainsGenerator moveToElement(WebElement toElement) {
    action.addAction(new MoveMouseAction(driver, toElement));
    return this;
  }

  public ActionChainsGenerator contextClick(WebElement onElement) {
    action.addAction(new ContextClickAction(driver, onElement));
    return this;
  }

  public ActionChainsGenerator dragAndDrop(WebElement source, WebElement target) {
    action.addAction(new MoveMouseAction(driver, source));
    action.addAction(new ClickAndHoldAction(driver, source));
    action.addAction(new MoveMouseAction(driver, target));
    action.addAction(new ButtonReleaseAction(driver, target));
    return this;
  }
}
