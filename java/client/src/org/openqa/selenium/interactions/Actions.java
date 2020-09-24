// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.interactions;

import static org.openqa.selenium.interactions.PointerInput.Kind.MOUSE;
import static org.openqa.selenium.interactions.PointerInput.MouseButton.LEFT;
import static org.openqa.selenium.interactions.PointerInput.MouseButton.RIGHT;

import org.openqa.selenium.Keys;
import org.openqa.selenium.UnsupportedCommandException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.PointerInput.Origin;
import org.openqa.selenium.interactions.internal.MouseAction.Button;
import org.openqa.selenium.internal.Require;

import java.time.Duration;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.function.IntConsumer;
import java.util.logging.Logger;

/**
 * The user-facing API for emulating complex user gestures. Use this class rather than using the
 * Keyboard or Mouse directly.
 * <p>
 * Implements the builder pattern: Builds a CompositeAction containing all actions specified by the
 * method calls.
 * <p>
 * Call {@link #perform()} at the end of the method chain to actually perform the actions.
 */
public class Actions {

  private static final Logger LOG = Logger.getLogger(Actions.class.getName());
  private final WebDriver driver;

  // W3C
  private final Map<InputSource, Sequence> sequences = new HashMap<>();
  private final PointerInput defaultMouse = new PointerInput(MOUSE, "default mouse");
  private final KeyInput defaultKeyboard = new KeyInput("default keyboard");

  // JSON-wire protocol
  private final Keyboard jsonKeyboard;
  private final Mouse jsonMouse;
  protected CompositeAction action = new CompositeAction();

  public Actions(WebDriver driver) {
    this.driver = Require.nonNull("Driver", driver);

    if (driver instanceof HasInputDevices) {
      HasInputDevices deviceOwner = (HasInputDevices) driver;
      this.jsonKeyboard = deviceOwner.getKeyboard();
      this.jsonMouse = deviceOwner.getMouse();
    } else {
      this.jsonKeyboard = null;
      this.jsonMouse = null;
    }
  }

  /**
   * Performs a modifier key press. Does not release the modifier key - subsequent interactions
   * may assume it's kept pressed.
   * Note that the modifier key is <b>never</b> released implicitly - either
   * <i>keyUp(theKey)</i> or <i>sendKeys(Keys.NULL)</i>
   * must be called to release the modifier.
   * @param key Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}. If the
   * provided key is none of those, {@link IllegalArgumentException} is thrown.
   * @return A self reference.
   */
  public Actions keyDown(CharSequence key) {
    if (isBuildingActions()) {
      action.addAction(new KeyDownAction(jsonKeyboard, jsonMouse, asKeys(key)));
    }
    return addKeyAction(key, codePoint -> tick(defaultKeyboard.createKeyDown(codePoint)));
  }

  /**
   * Performs a modifier key press after focusing on an element. Equivalent to:
   * <i>Actions.click(element).sendKeys(theKey);</i>
   * @see #keyDown(CharSequence)
   *
   * @param key Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}. If the
   * provided key is none of those, {@link IllegalArgumentException} is thrown.
   * @param target WebElement to perform the action
   * @return A self reference.
   */
  public Actions keyDown(WebElement target, CharSequence key) {
    if (isBuildingActions()) {
      action.addAction(new KeyDownAction(jsonKeyboard, jsonMouse, (Locatable) target, asKeys(key)));
    }
    return focusInTicks(target)
        .addKeyAction(key, codepoint -> tick(defaultKeyboard.createKeyDown(codepoint)));
  }

  /**
   * Performs a modifier key release. Releasing a non-depressed modifier key will yield undefined
   * behaviour.
   *
   * @param key Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}.
   * @return A self reference.
   */
  public Actions keyUp(CharSequence key) {
    if (isBuildingActions()) {
      action.addAction(new KeyUpAction(jsonKeyboard, jsonMouse, asKeys(key)));
    }

    return addKeyAction(key, codePoint -> tick(defaultKeyboard.createKeyUp(codePoint)));
  }

  /**
   * Performs a modifier key release after focusing on an element. Equivalent to:
   * <i>Actions.click(element).sendKeys(theKey);</i>
   * @see #keyUp(CharSequence) on behaviour regarding non-depressed modifier keys.
   *
   * @param key Either {@link Keys#SHIFT}, {@link Keys#ALT} or {@link Keys#CONTROL}.
   * @param target WebElement to perform the action on
   * @return A self reference.
   */
  public Actions keyUp(WebElement target, CharSequence key) {
    if (isBuildingActions()) {
      action.addAction(new KeyUpAction(jsonKeyboard, jsonMouse, (Locatable) target, asKeys(key)));
    }

    return focusInTicks(target)
        .addKeyAction(key, codePoint -> tick(defaultKeyboard.createKeyUp(codePoint)));
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
   * @param keys The keys.
   * @return A self reference.
   *
   * @throws IllegalArgumentException if keys is null
   */
  public Actions sendKeys(CharSequence... keys) {
    if (isBuildingActions()) {
      action.addAction(new SendKeysAction(jsonKeyboard, jsonMouse, null, keys));
    }

    return sendKeysInTicks(keys);
  }

  /**
   * Equivalent to calling:
   * <i>Actions.click(element).sendKeys(keysToSend).</i>
   * This method is different from {@link WebElement#sendKeys(CharSequence...)} - see
   * {@link #sendKeys(CharSequence...)} for details how.
   *
   * @see #sendKeys(java.lang.CharSequence[])
   *
   * @param target element to focus on.
   * @param keys The keys.
   * @return A self reference.
   *
   * @throws IllegalArgumentException if keys is null
   */
  public Actions sendKeys(WebElement target, CharSequence... keys) {
    if (isBuildingActions()) {
      action.addAction(new SendKeysAction(jsonKeyboard, jsonMouse, (Locatable) target, keys));
    }

    return focusInTicks(target).sendKeysInTicks(keys);
  }

  private Keys asKeys(CharSequence key) {
    if (!(key instanceof Keys)) {
      throw new IllegalArgumentException(
          "keyDown argument must be an instanceof Keys: " + key);
    }

    return (Keys) key;
  }

  private Actions sendKeysInTicks(CharSequence... keys) {
    if (keys == null) {
      throw new IllegalArgumentException("Keys should be a not null CharSequence");
    }
    for (CharSequence key : keys) {
      key.codePoints().forEach(codePoint -> {
        tick(defaultKeyboard.createKeyDown(codePoint));
        tick(defaultKeyboard.createKeyUp(codePoint));
      });
    }
    return this;
  }

  private Actions addKeyAction(CharSequence key, IntConsumer consumer) {
    // Verify that we only have a single character to type.
    if (key.codePoints().count() != 1) {
      throw new IllegalStateException(String.format(
        "Only one code point is allowed at a time: %s", key));
    }

    key.codePoints().forEach(consumer);

    return this;
  }

  /**
   * Clicks (without releasing) in the middle of the given element. This is equivalent to:
   * <i>Actions.moveToElement(onElement).clickAndHold()</i>
   *
   * @param target Element to move to and click.
   * @return A self reference.
   */
  public Actions clickAndHold(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new ClickAndHoldAction(jsonMouse, (Locatable) target));
    }
    return moveInTicks(target, 0, 0)
        .tick(defaultMouse.createPointerDown(LEFT.asArg()));
  }

  /**
   * Clicks (without releasing) at the current mouse location.
   * @return A self reference.
   */
  public Actions clickAndHold() {
    if (isBuildingActions()) {
      action.addAction(new ClickAndHoldAction(jsonMouse, null));
    }

    return tick(defaultMouse.createPointerDown(LEFT.asArg()));
  }

  /**
   * Releases the depressed left mouse button, in the middle of the given element.
   * This is equivalent to:
   * <i>Actions.moveToElement(onElement).release()</i>
   *
   * Invoking this action without invoking {@link #clickAndHold()} first will result in
   * undefined behaviour.
   *
   * @param target Element to release the mouse button above.
   * @return A self reference.
   */
  public Actions release(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new ButtonReleaseAction(jsonMouse, (Locatable) target));
    }

    return moveInTicks(target, 0, 0).tick(defaultMouse.createPointerUp(LEFT.asArg()));
  }

  /**
   * Releases the depressed left mouse button at the current mouse location.
   * @see #release(org.openqa.selenium.WebElement)
   * @return A self reference.
   */
  public Actions release() {
    if (isBuildingActions()) {
      action.addAction(new ButtonReleaseAction(jsonMouse, null));
    }

    return tick(defaultMouse.createPointerUp(Button.LEFT.asArg()));
  }

  /**
   * Clicks in the middle of the given element. Equivalent to:
   * <i>Actions.moveToElement(onElement).click()</i>
   *
   * @param target Element to click.
   * @return A self reference.
   */
  public Actions click(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new ClickAction(jsonMouse, (Locatable) target));
    }

    return moveInTicks(target, 0, 0).clickInTicks(LEFT);
  }

  /**
   * Clicks at the current mouse location. Useful when combined with
   * {@link #moveToElement(org.openqa.selenium.WebElement, int, int)} or
   * {@link #moveByOffset(int, int)}.
   * @return A self reference.
   */
  public Actions click() {
    if (isBuildingActions()) {
      action.addAction(new ClickAction(jsonMouse, null));
    }

    return clickInTicks(LEFT);
  }

  private Actions clickInTicks(PointerInput.MouseButton button) {
    tick(defaultMouse.createPointerDown(button.asArg()));
    tick(defaultMouse.createPointerUp(button.asArg()));
    return this;
  }

  private Actions focusInTicks(WebElement target) {
    return moveInTicks(target, 0, 0).clickInTicks(LEFT);
  }

  /**
   * Performs a double-click at middle of the given element. Equivalent to:
   * <i>Actions.moveToElement(element).doubleClick()</i>
   *
   * @param target Element to move to.
   * @return A self reference.
   */
  public Actions doubleClick(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new DoubleClickAction(jsonMouse, (Locatable) target));
    }

    return moveInTicks(target, 0, 0)
        .clickInTicks(LEFT)
        .clickInTicks(LEFT);
  }

  /**
   * Performs a double-click at the current mouse location.
   * @return A self reference.
   */
  public Actions doubleClick() {
    if (isBuildingActions()) {
      action.addAction(new DoubleClickAction(jsonMouse, null));
    }

    return clickInTicks(LEFT).clickInTicks(LEFT);
  }

  /**
   * Moves the mouse to the middle of the element. The element is scrolled into view and its
   * location is calculated using getClientRects.
   * @param target element to move to.
   * @return A self reference.
   */
  public Actions moveToElement(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new MoveMouseAction(jsonMouse, (Locatable) target));
    }

    return moveInTicks(target, 0, 0);
  }

  /**
   * Moves the mouse to an offset from the element's in-view center point.
   * @param target element to move to.
   * @param xOffset Offset from the element's in-view center point. A negative value means
   * an offset left of the point.
   * @param yOffset Offset from the element's in-view center point. A negative value means
   * an offset above the point.
   * @return A self reference.
   */
  public Actions moveToElement(WebElement target, int xOffset, int yOffset) {
    if (isBuildingActions()) {
      action.addAction(new MoveToOffsetAction(jsonMouse, (Locatable) target, xOffset, yOffset));
    }

    // Of course, this is the offset from the centre of the element. We have no idea what the width
    // and height are once we execute this method.
    LOG.info("When using the W3C Action commands, offsets are from the element's in-view center point");
    return moveInTicks(target, xOffset, yOffset);
  }

  private Actions moveInTicks(WebElement target, int xOffset, int yOffset) {
    return tick(defaultMouse.createPointerMove(
        Duration.ofMillis(100),
        Origin.fromElement(target),
        xOffset,
        yOffset));
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
    if (isBuildingActions()) {
      action.addAction(new MoveToOffsetAction(jsonMouse, null, xOffset, yOffset));
    }

    return tick(
        defaultMouse.createPointerMove(Duration.ofMillis(200), Origin.pointer(), xOffset, yOffset));
  }

  /**
   * Performs a context-click at middle of the given element. First performs a mouseMove
   * to the location of the element.
   *
   * @param target Element to move to.
   * @return A self reference.
   */
  public Actions contextClick(WebElement target) {
    if (isBuildingActions()) {
      action.addAction(new ContextClickAction(jsonMouse, (Locatable) target));
    }
    return moveInTicks(target, 0, 0).clickInTicks(RIGHT);
  }

  /**
   * Performs a context-click at the current mouse location.
   * @return A self reference.
   */
  public Actions contextClick() {
    if (isBuildingActions()) {
      action.addAction(new ContextClickAction(jsonMouse, null));
    }

    return clickInTicks(RIGHT);
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
    if (isBuildingActions()) {
      action.addAction(new ClickAndHoldAction(jsonMouse, (Locatable) source));
      action.addAction(new MoveMouseAction(jsonMouse, (Locatable) target));
      action.addAction(new ButtonReleaseAction(jsonMouse, (Locatable) target));
    }

    return moveInTicks(source, 0, 0)
        .tick(defaultMouse.createPointerDown(LEFT.asArg()))
        .moveInTicks(target, 0, 0)
        .tick(defaultMouse.createPointerUp(LEFT.asArg()));
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
    if (isBuildingActions()) {
      action.addAction(new ClickAndHoldAction(jsonMouse, (Locatable) source));
      action.addAction(new MoveToOffsetAction(jsonMouse, null, xOffset, yOffset));
      action.addAction(new ButtonReleaseAction(jsonMouse, null));
    }

    return moveInTicks(source, 0, 0)
        .tick(defaultMouse.createPointerDown(LEFT.asArg()))
        .tick(defaultMouse.createPointerMove(Duration.ofMillis(250), Origin.pointer(), xOffset, yOffset))
        .tick(defaultMouse.createPointerUp(LEFT.asArg()));
  }

  /**
   * Performs a pause.
   *
   * @param pause pause duration, in milliseconds.
   * @return A self reference.
   */
  public Actions pause(long pause) {
    if (isBuildingActions()) {
      action.addAction(new PauseAction(pause));
    }

    return tick(new Pause(defaultMouse, Duration.ofMillis(pause)));
  }

  public Actions pause(Duration duration) {
    Require.nonNegative("Duration of pause", duration);
    if (isBuildingActions()) {
      action.addAction(new PauseAction(duration.toMillis()));
    }

    return tick(new Pause(defaultMouse, duration));
  }

  public Actions tick(Interaction... actions) {
    // All actions must be for a unique source.
    Set<InputSource> seenSources = new HashSet<>();
    for (Interaction action : actions) {
      boolean freshlyAdded = seenSources.add(action.getSource());
      if (!freshlyAdded) {
        throw new IllegalStateException(String.format(
            "You may only add one action per input source per tick: %s",
            Arrays.asList(actions)));
      }
    }

    // Add all actions to sequences
    for (Interaction action : actions) {
      Sequence sequence = getSequence(action.getSource());
      sequence.addAction(action);
    }

    // And now pad the remaining sequences with a pause.
    Set<InputSource> unseen = new HashSet<>(sequences.keySet());
    unseen.removeAll(seenSources);
    for (InputSource source : unseen) {
      getSequence(source).addAction(new Pause(source, Duration.ZERO));
    }

    return this;
  }

  public Actions tick(Action action) {
    if (!(action instanceof IsInteraction)) {
      throw new IllegalStateException("Expected action to implement IsInteraction");
    }

    for (Interaction interaction :
        ((IsInteraction) action).asInteractions(defaultMouse, defaultKeyboard)) {
      tick(interaction);
    }

    if (isBuildingActions()) {
      this.action.addAction(action);
    }

    return this;
  }

  /**
   * Generates a composite action containing all actions so far, ready to be performed (and
   * resets the internal builder state, so subsequent calls to this method will contain fresh
   * sequences).
   * <p>
   * <b>Warning</b>: you may want to call {@link #perform()} instead to actually perform
   * the actions.
   *
   * @return the composite action
   */
  public Action build() {
    Action toReturn = new BuiltAction(driver, new LinkedHashMap<>(sequences), action);
    action = new CompositeAction();
    sequences.clear();
    return toReturn;
  }

  /**
   * A convenience method for performing the actions without calling build() first.
   */
  public void perform() {
    build().perform();
  }

  private Sequence getSequence(InputSource source) {
    Sequence sequence = sequences.get(source);
    if (sequence != null) {
      return sequence;
    }

    int longest = 0;
    for (Sequence examining : sequences.values()) {
      longest = Math.max(longest, examining.size());
    }

    sequence = new Sequence(source, longest);
    sequences.put(source, sequence);

    return sequence;
  }

  private boolean isBuildingActions() {
    return jsonMouse != null || jsonKeyboard != null;
  }

  private static class BuiltAction implements Action {
    private final WebDriver driver;
    private final Map<InputSource, Sequence> sequences;
    private final Action fallBack;

    private BuiltAction(WebDriver driver, Map<InputSource, Sequence> sequences, Action fallBack) {
      this.driver = driver;
      this.sequences = sequences;
      this.fallBack = fallBack;
    }

    @Override
    public void perform() {
      if (driver == null) {
        // One of the deprecated constructors was used. Fall back to the old way for now.
        fallBack.perform();
        return;
      }

      try {
        ((Interactive) driver).perform(sequences.values());
      } catch (ClassCastException | UnsupportedCommandException e) {
        // Fall back to the old way of doing things. Old Skool #ftw
        fallBack.perform();
      }
    }
  }
}
