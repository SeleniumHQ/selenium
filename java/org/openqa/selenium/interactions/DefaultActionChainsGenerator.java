package org.openqa.selenium.interactions;

import org.openqa.selenium.ActionChainsGenerator;
import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Locatable;

/**
 * Implements the builder pattern:
 * Builds a CompositeAction containing all actions specified
 * by the method calls.
 */
public class DefaultActionChainsGenerator implements ActionChainsGenerator {
  protected Mouse mouse;
  protected Keyboard keyboard;
  private CompositeAction action;

  public DefaultActionChainsGenerator(WebDriver driver) {
    this(((HasInputDevices) driver).getKeyboard(),
        ((HasInputDevices) driver).getMouse());
  }

  public DefaultActionChainsGenerator(Keyboard keyboard, Mouse mouse) {
    this.mouse = mouse;
    this.keyboard = keyboard;
    action = new CompositeAction();
  }

  public DefaultActionChainsGenerator keyDown(Keys theKey) {
    return this.keyDown(null, theKey);
  }

  public DefaultActionChainsGenerator keyDown(WebElement element, Keys theKey) {
    action.addAction(new KeyDownAction(keyboard, mouse, (Locatable) element, theKey));
    return this;
  }

  public DefaultActionChainsGenerator keyUp(Keys theKey) {
    return this.keyUp(null, theKey);
  }

  public DefaultActionChainsGenerator keyUp(WebElement element, Keys theKey) {
    action.addAction(new KeyUpAction(keyboard, mouse, (Locatable) element, theKey));
    return this;
  }

  public DefaultActionChainsGenerator sendKeys(CharSequence... keysToSend) {
    return this.sendKeys(null, keysToSend);
  }

  public DefaultActionChainsGenerator sendKeys(WebElement element, CharSequence... keysToSend) {
    action.addAction(new SendKeysAction(keyboard, mouse, (Locatable) element, keysToSend));
    return this;
  }


  public Action build() {
    CompositeAction toReturn = action;
    action = null;
    return toReturn;
  }

  public DefaultActionChainsGenerator clickAndHold(WebElement onElement) {
    action.addAction(new ClickAndHoldAction(mouse, (Locatable) onElement));
    return this;
  }

  public DefaultActionChainsGenerator release(WebElement onElement) {
    action.addAction(new ButtonReleaseAction(mouse, (Locatable) onElement));
    return this;
  }

  public DefaultActionChainsGenerator click(WebElement onElement) {
    action.addAction(new ClickAction(mouse, (Locatable) onElement));
    return this;
  }

  public ActionChainsGenerator click() {
    return this.click(null);
  }

  public DefaultActionChainsGenerator doubleClick(WebElement onElement) {
    action.addAction(new DoubleClickAction(mouse, (Locatable) onElement));
    return this;
  }

  public DefaultActionChainsGenerator moveToElement(WebElement toElement) {
    action.addAction(new MoveMouseAction(mouse, (Locatable) toElement));
    return this;
  }

  public ActionChainsGenerator moveToElement(WebElement toElement, int xOffset, int yOffset) {
    action.addAction(new MoveToOffsetAction(mouse, (Locatable) toElement, xOffset, yOffset));
    return this;
  }

  public ActionChainsGenerator moveByOffset(int xOffset, int yOffset) {
    action.addAction(new MoveToOffsetAction(mouse, null, xOffset, yOffset));
    return this;
  }

  public DefaultActionChainsGenerator contextClick(WebElement onElement) {
    action.addAction(new ContextClickAction(mouse, (Locatable) onElement));
    return this;
  }

  public DefaultActionChainsGenerator dragAndDrop(WebElement source, WebElement target) {
    action.addAction(new ClickAndHoldAction(mouse, (Locatable) source));
    action.addAction(new MoveMouseAction(mouse, (Locatable) target));
    action.addAction(new ButtonReleaseAction(mouse, (Locatable) target));
    return this;
  }
}
