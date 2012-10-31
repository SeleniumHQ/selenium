/*
Copyright 2007-2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.interactions;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.Locatable;

/**
 * The user-facing API for emulating complex user gestures. Use this class rather than using the
 * Keyboard or Mouse directly.
 *
 * Implements the builder pattern: Builds a CompositeAction containing all actions specified by the
 * method calls.
 */
public class Actions {
  protected Mouse mouse;
  protected Keyboard keyboard;
  protected CompositeAction action;

  /**
   * Default constructor - uses the default keyboard, mouse implemented by the driver.
   * @param driver the driver providing the implementations to use.
   */
  public Actions(WebDriver driver) {
    this(((HasInputDevices) driver).getKeyboard(),
        ((HasInputDevices) driver).getMouse());
  }

  /**
   * A constructor that should only be used when the keyboard or mouse were extended to provide
   * additional functionality (for example, dragging-and-dropping from the desktop).
   * @param keyboard the {@link Keyboard} implementation to delegate to.
   * @param mouse the {@link Mouse} implementation to delegate to.
   */
  public Actions(Keyboard keyboard, Mouse mouse) {
    this.mouse = mouse;
    this.keyboard = keyboard;
    resetCompositeAction();
  }

  /**
   * Only used by the TouchActions class.
   * @param keyboard implementation to delegate to.
   */
  public Actions(Keyboard keyboard) {
    this.keyboard = keyboard;
    resetCompositeAction();
  }

  private void resetCompositeAction() {
    action = new CompositeAction();
  }

  /**
   * Performs a modifier key press. Does not release the modifier key - subsequent interactions
   * may assume it's kept pressed.
   * Note that the modifier key is <b>never</b> released implicitly - either
   * <i>keyUp(theKey)</i> or <i>sendKeys(Keys.NULL)</i>
   * must be called to release the modifier.
   * @param theKey Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}. If the
   * provided key is none of those, {@link IllegalArgumentException} is thrown.
   * @return A self reference.
   */
  public Actions keyDown(Keys theKey) {
    return this.keyDown(null, theKey);
  }

  /**
   * Performs a modifier key press after focusing on an element. Equivalent to:
   * <i>Actions.click(element).sendKeys(theKey);</i>
   * @see #keyDown(org.openqa.selenium.Keys)
   *
   * @param theKey Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}. If the
   * provided key is none of those, {@link IllegalArgumentException} is thrown.
   * @return A self reference.
   */
  public Actions keyDown(WebElement element, Keys theKey) {
    action.addAction(new KeyDownAction(keyboard, mouse, (Locatable) element, theKey));
    return this;
  }

  /**
   * Performs a modifier key release. Releasing a non-depressed modifier key will yield undefined
   * behaviour.
   *
   * @param theKey Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}.
   * @return A self reference.
   */
  public Actions keyUp(Keys theKey) {
    return this.keyUp(null, theKey);
  }

  /**
   * Performs a modifier key release after focusing on an element. Equivalent to:
   * <i>Actions.click(element).sendKeys(theKey);</i>
   * @see #keyUp(org.openqa.selenium.Keys) on behaviour regarding non-depressed modifier keys.
   *
   * @param theKey Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}.
   * @return A self reference.
   */
  public Actions keyUp(WebElement element, Keys theKey) {
    action.addAction(new KeyUpAction(keyboard, mouse, (Locatable) element, theKey));
    return this;
  }

  /**
   * Sends keys to the active element. This differs from calling
   * {@link WebElement#sendKeys(CharSequence...)} on the active element in two ways:
   * <ul>
   * <li>The modifier keys included in this call are not released.</li>
   * <li>There is no attempt to re-focus the element - so sendKeys(Keys.TAB) for switching
   * elements should work. </li>
   * </ul>
   *
   * @see WebElement#sendKeys(CharSequence...)
   *
   * @param keysToSend The keys.
   * @return A self reference.
   */
  public Actions sendKeys(CharSequence... keysToSend) {
    return this.sendKeys(null, keysToSend);
  }

  /**
   * Equivalent to calling:
   * <i>Actions.click(element).sendKeys(keysToSend).</i>
   * This method is different from {@link org.openqa.selenium.WebElement#sendKeys(CharSequence...)} - see
   * {@link Actions#sendKeys(CharSequence...)} for details how.
   *
   * @see #sendKeys(java.lang.CharSequence[])
   *
   * @param element element to focus on.
   * @param keysToSend The keys.
   * @return A self reference.
   */
  public Actions sendKeys(WebElement element, CharSequence... keysToSend) {
    action.addAction(new SendKeysAction(keyboard, mouse, (Locatable) element, keysToSend));
    return this;
  }

  /**
   * Clicks (without releasing) in the middle of the given element. This is equivalent to:
   * <i>Actions.moveToElement(onElement).clickAndHold()</i>
   *
   * @param onElement Element to move to and click.
   * @return A self reference.
   */
  public Actions clickAndHold(WebElement onElement) {
    action.addAction(new ClickAndHoldAction(mouse, (Locatable) onElement));
    return this;
  }

  /**
   * Clicks (without releasing) at the current mouse location.
   * @return A self reference.
   */
  public Actions clickAndHold() {
    return this.clickAndHold(null);
  }

  /**
   * Releases the depressed left mouse button, in the middle of the given element.
   * This is equivalent to:
   * <i>Actions.moveToElement(onElement).release()</i>
   *
   * Invoking this action without invoking {@link #clickAndHold()} first will result in
   * undefined behaviour.
   *
   * @param onElement Element to release the mouse button above.
   * @return A self reference.
   */
  public Actions release(WebElement onElement) {
    action.addAction(new ButtonReleaseAction(mouse, (Locatable) onElement));
    return this;
  }

  /**
   * Releases the depressed left mouse button at the current mouse location.
   * @see #release(org.openqa.selenium.WebElement)
   * @return A self reference.
   */
  public Actions release() {
    return this.release(null);
  }

  /**
   * Clicks in the middle of the given element. Equivalent to:
   * <i>Actions.moveToElement(onElement).click()</i>
   *
   * @param onElement Element to click.
   * @return A self reference.
   */
  public Actions click(WebElement onElement) {
    action.addAction(new ClickAction(mouse, (Locatable) onElement));
    return this;
  }

  /**
   * Clicks at the current mouse location. Useful when combined with
   * {@link #moveToElement(org.openqa.selenium.WebElement, int, int)} or
   * {@link #moveByOffset(int, int)}.
   * @return A self reference.
   */
  public Actions click() {
    return this.click(null);
  }

  /**
   * Performs a double-click at middle of the given element. Equivalent to:
   * <i>Actions.moveToElement(element).doubleClick()</i>
   *
   * @param onElement Element to move to.
   * @return A self reference.
   */
  public Actions doubleClick(WebElement onElement) {
    action.addAction(new DoubleClickAction(mouse, (Locatable) onElement));
    return this;
  }

  /**
   * Performs a double-click at the current mouse location.
   * @return A self reference.
   */
  public Actions doubleClick() {
    return this.doubleClick(null);
  }

  /**
   * Moves the mouse to the middle of the element. The element is scrolled into view and its
   * location is calculated using getBoundingClientRect.
   * @param toElement element to move to.
   * @return A self reference.
   */
  public Actions moveToElement(WebElement toElement) {
    action.addAction(new MoveMouseAction(mouse, (Locatable) toElement));
    return this;
  }

  /**
   * Moves the mouse to an offset from the top-left corner of the element.
   * The element is scrolled into view and its location is calculated using getBoundingClientRect.
   * @param toElement element to move to.
   * @param xOffset Offset from the top-left corner. A negative value means coordinates right from
   * the element.
   * @param yOffset Offset from the top-left corner. A negative value means coordinates above
   * the element.
   * @return A self reference.
   */
  public Actions moveToElement(WebElement toElement, int xOffset, int yOffset) {
    action.addAction(new MoveToOffsetAction(mouse, (Locatable) toElement, xOffset, yOffset));
    return this;
  }

  /**
   * Moves the mouse from its current position (or 0,0) by the given offset. If the coordinates
   * provided are outside the viewport (the mouse will end up outside the browser window) then
   * the viewport is scrolled to match.
   * @param xOffset horizontal offset. A negative value means moving the mouse left.
   * @param yOffset vertical offset. A negative value means moving the mouse up.
   * @return A self reference.
   * @throws MoveTargetOutOfBoundsException if the provided offset is outside the document's
   * boundaries.
   */
  public Actions moveByOffset(int xOffset, int yOffset) {
    action.addAction(new MoveToOffsetAction(mouse, null, xOffset, yOffset));
    return this;
  }

  /**
   * Performs a context-click at middle of the given element. First performs a mouseMove
   * to the location of the element.
   *
   * @param onElement Element to move to.
   * @return A self reference.
   */
  public Actions contextClick(WebElement onElement) {
    action.addAction(new ContextClickAction(mouse, (Locatable) onElement));
    return this;
  }

  /**
   * Performs a context-click at the current mouse location.
   * @return A self reference.
   */
  public Actions contextClick() {
    return this.contextClick(null);
  }

  /**
   * A convenience method that performs click-and-hold at the location of the source element,
   * moves to the location of the target element, then releases the mouse.
   *
   * @param source element to emulate button down at.
   * @param target element to move to and release the mouse at.
   * @return A self reference.
   */
  public Actions dragAndDrop(WebElement source, WebElement target) {
    action.addAction(new ClickAndHoldAction(mouse, (Locatable) source));
    action.addAction(new MoveMouseAction(mouse, (Locatable) target));
    action.addAction(new ButtonReleaseAction(mouse, (Locatable) target));
    return this;
  }

  /**
   * A convenience method that performs click-and-hold at the location of the source element,
   * moves by a given offset, then releases the mouse.
   *
   * @param source element to emulate button down at.
   * @param xOffset horizontal move offset.
   * @param yOffset vertical move offset.
   * @return A self reference.
   */
  public Actions dragAndDropBy(WebElement source, int xOffset, int yOffset) {
    action.addAction(new ClickAndHoldAction(mouse, (Locatable) source));
    action.addAction(new MoveToOffsetAction(mouse, null, xOffset, yOffset));
    action.addAction(new ButtonReleaseAction(mouse, null));
    return this;
  }

  /**
   * Generates a composite action containinig all actions so far, ready to be performed (and
   * resets the internal builder state, so subsequent calls to build() will contain fresh
   * sequences).
   *
   * @return the composite action
   */
  public Action build() {
    CompositeAction toReturn = action;
    resetCompositeAction();
    return toReturn;
  }

  /**
   * A convenience method for performing the actions without calling build() first.
   */
  public void perform() {
    build().perform();
  }
}
