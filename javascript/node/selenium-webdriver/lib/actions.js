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

'use strict'

const command = require('./command')
const error = require('./error')
const input = require('./input')

/**
 * @param {!IArrayLike} args .
 * @return {!Array} .
 */
function flatten(args) {
  const result = []
  for (let i = 0; i < args.length; i++) {
    const element = args[i]
    if (Array.isArray(element)) {
      result.push.apply(result, flatten(element))
    } else {
      result.push(element)
    }
  }
  return result
}

const MODIFIER_KEYS = new Set([
  input.Key.ALT,
  input.Key.CONTROL,
  input.Key.SHIFT,
  input.Key.COMMAND,
])

/**
 * Checks that a key is a modifier key.
 * @param {!input.Key} key The key to check.
 * @throws {error.InvalidArgumentError} If the key is not a modifier key.
 * @private
 */
function checkModifierKey(key) {
  if (!MODIFIER_KEYS.has(key)) {
    throw new error.InvalidArgumentError('Not a modifier key')
  }
}

/**
 * Class for defining sequences of complex user interactions. Each sequence
 * will not be executed until {@link #perform} is called.
 *
 * This class should not be instantiated directly. Instead, obtain an instance
 * using {@link ./webdriver.WebDriver#actions() WebDriver.actions()}.
 *
 * Sample usage:
 *
 *     new LegacyActions(driver).
 *         keyDown(Key.SHIFT).
 *         click(element1).
 *         click(element2).
 *         dragAndDrop(element3, element4).
 *         keyUp(Key.SHIFT).
 *         perform();
 *
 * @deprecated This class is strongly deprecated and will be removed once
 *     [Google's Chrome][Chrome] and [Microsoft's Edge][Edge] browsers
 *     support the new action sequence API.
 *
 * [Chrome]: https://chromium.googlesource.com/chromium/src/+/master/docs/chromedriver_status.md
 * [Edge]: https://docs.microsoft.com/en-us/microsoft-edge/webdriver
 */
class LegacyActionSequence {
  /**
   * @param {!./webdriver.WebDriver} driver The driver that should be used to
   *     perform this action sequence.
   */
  constructor(driver) {
    /** @private {!./webdriver.WebDriver} */
    this.driver_ = driver

    /** @private {!Array<{description: string, command: !command.Command}>} */
    this.actions_ = []
  }

  /**
   * Schedules an action to be executed each time {@link #perform} is called on
   * this instance.
   *
   * @param {string} description A description of the command.
   * @param {!command.Command} command The command.
   * @private
   */
  schedule_(description, command) {
    this.actions_.push({
      description: description,
      command: command,
    })
  }

  /**
   * Executes this action sequence.
   *
   * @return {!Promise} A promise that will be resolved once this sequence has
   *     completed.
   */
  async perform() {
    // Make a protected copy of the scheduled actions. This will protect against
    // users defining additional commands before this sequence is actually
    // executed.
    const actions = this.actions_.concat()
    for (const action of actions) {
      await this.driver_.execute(action.command)
    }
  }

  /**
   * Moves the mouse. The location to move to may be specified in terms of the
   * mouse's current location, an offset relative to the top-left corner of an
   * element, or an element (in which case the middle of the element is used).
   *
   * @param {(!./webdriver.WebElement|{x: number, y: number})} location The
   *     location to drag to, as either another WebElement or an offset in
   *     pixels.
   * @param {{x: number, y: number}=} opt_offset If the target {@code location}
   *     is defined as a {@link ./webdriver.WebElement}, this parameter defines
   *     an offset within that element. The offset should be specified in pixels
   *     relative to the top-left corner of the element's bounding box. If
   *     omitted, the element's center will be used as the target offset.
   * @return {!LegacyActionSequence} A self reference.
   */
  mouseMove(location, opt_offset) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_MOUSE_MOVE)

    if (typeof location.x === 'number') {
      setOffset(/** @type {{x: number, y: number}} */ (location))
    } else {
      cmd.setParameter('element', location.getId())
      if (opt_offset) {
        setOffset(opt_offset)
      }
    }

    this.schedule_('mouseMove', cmd)
    return this

    /** @param {{x: number, y: number}} offset The offset to use. */
    function setOffset(offset) {
      cmd.setParameter('xoffset', offset.x || 0)
      cmd.setParameter('yoffset', offset.y || 0)
    }
  }

  /**
   * Schedules a mouse action.
   * @param {string} description A simple descriptive label for the scheduled
   *     action.
   * @param {!command.Name} commandName The name of the command.
   * @param {(./webdriver.WebElement|input.Button)=} opt_elementOrButton Either
   *     the element to interact with or the button to click with.
   *     Defaults to {@link input.Button.LEFT} if neither an element nor
   *     button is specified.
   * @param {input.Button=} opt_button The button to use. Defaults to
   *     {@link input.Button.LEFT}. Ignored if the previous argument is
   *     provided as a button.
   * @return {!LegacyActionSequence} A self reference.
   * @private
   */
  scheduleMouseAction_(
    description,
    commandName,
    opt_elementOrButton,
    opt_button
  ) {
    let button
    if (typeof opt_elementOrButton === 'number') {
      button = opt_elementOrButton
    } else {
      if (opt_elementOrButton) {
        this.mouseMove(
          /** @type {!./webdriver.WebElement} */ (opt_elementOrButton)
        )
      }
      button = opt_button !== void 0 ? opt_button : input.Button.LEFT
    }

    let cmd = new command.Command(commandName).setParameter('button', button)
    this.schedule_(description, cmd)
    return this
  }

  /**
   * Presses a mouse button. The mouse button will not be released until
   * {@link #mouseUp} is called, regardless of whether that call is made in this
   * sequence or another. The behavior for out-of-order events (e.g. mouseDown,
   * click) is undefined.
   *
   * If an element is provided, the mouse will first be moved to the center
   * of that element. This is equivalent to:
   *
   *     sequence.mouseMove(element).mouseDown()
   *
   * Warning: this method currently only supports the left mouse button. See
   * [issue 4047](http://code.google.com/p/selenium/issues/detail?id=4047).
   *
   * @param {(./webdriver.WebElement|input.Button)=} opt_elementOrButton Either
   *     the element to interact with or the button to click with.
   *     Defaults to {@link input.Button.LEFT} if neither an element nor
   *     button is specified.
   * @param {input.Button=} opt_button The button to use. Defaults to
   *     {@link input.Button.LEFT}. Ignored if a button is provided as the
   *     first argument.
   * @return {!LegacyActionSequence} A self reference.
   */
  mouseDown(opt_elementOrButton, opt_button) {
    return this.scheduleMouseAction_(
      'mouseDown',
      command.Name.LEGACY_ACTION_MOUSE_DOWN,
      opt_elementOrButton,
      opt_button
    )
  }

  /**
   * Releases a mouse button. Behavior is undefined for calling this function
   * without a previous call to {@link #mouseDown}.
   *
   * If an element is provided, the mouse will first be moved to the center
   * of that element. This is equivalent to:
   *
   *     sequence.mouseMove(element).mouseUp()
   *
   * Warning: this method currently only supports the left mouse button. See
   * [issue 4047](http://code.google.com/p/selenium/issues/detail?id=4047).
   *
   * @param {(./webdriver.WebElement|input.Button)=} opt_elementOrButton Either
   *     the element to interact with or the button to click with.
   *     Defaults to {@link input.Button.LEFT} if neither an element nor
   *     button is specified.
   * @param {input.Button=} opt_button The button to use. Defaults to
   *     {@link input.Button.LEFT}. Ignored if a button is provided as the
   *     first argument.
   * @return {!LegacyActionSequence} A self reference.
   */
  mouseUp(opt_elementOrButton, opt_button) {
    return this.scheduleMouseAction_(
      'mouseUp',
      command.Name.LEGACY_ACTION_MOUSE_UP,
      opt_elementOrButton,
      opt_button
    )
  }

  /**
   * Convenience function for performing a "drag and drop" maneuver. The target
   * element may be moved to the location of another element, or by an offset (in
   * pixels).
   *
   * @param {!./webdriver.WebElement} element The element to drag.
   * @param {(!./webdriver.WebElement|{x: number, y: number})} location The
   *     location to drag to, either as another WebElement or an offset in
   *     pixels.
   * @return {!LegacyActionSequence} A self reference.
   */
  dragAndDrop(element, location) {
    return this.mouseDown(element).mouseMove(location).mouseUp()
  }

  /**
   * Clicks a mouse button.
   *
   * If an element is provided, the mouse will first be moved to the center
   * of that element. This is equivalent to:
   *
   *     sequence.mouseMove(element).click()
   *
   * @param {(./webdriver.WebElement|input.Button)=} opt_elementOrButton Either
   *     the element to interact with or the button to click with.
   *     Defaults to {@link input.Button.LEFT} if neither an element nor
   *     button is specified.
   * @param {input.Button=} opt_button The button to use. Defaults to
   *     {@link input.Button.LEFT}. Ignored if a button is provided as the
   *     first argument.
   * @return {!LegacyActionSequence} A self reference.
   */
  click(opt_elementOrButton, opt_button) {
    return this.scheduleMouseAction_(
      'click',
      command.Name.LEGACY_ACTION_CLICK,
      opt_elementOrButton,
      opt_button
    )
  }

  /**
   * Double-clicks a mouse button.
   *
   * If an element is provided, the mouse will first be moved to the center of
   * that element. This is equivalent to:
   *
   *     sequence.mouseMove(element).doubleClick()
   *
   * Warning: this method currently only supports the left mouse button. See
   * [issue 4047](http://code.google.com/p/selenium/issues/detail?id=4047).
   *
   * @param {(./webdriver.WebElement|input.Button)=} opt_elementOrButton Either
   *     the element to interact with or the button to click with.
   *     Defaults to {@link input.Button.LEFT} if neither an element nor
   *     button is specified.
   * @param {input.Button=} opt_button The button to use. Defaults to
   *     {@link input.Button.LEFT}. Ignored if a button is provided as the
   *     first argument.
   * @return {!LegacyActionSequence} A self reference.
   */
  doubleClick(opt_elementOrButton, opt_button) {
    return this.scheduleMouseAction_(
      'doubleClick',
      command.Name.LEGACY_ACTION_DOUBLE_CLICK,
      opt_elementOrButton,
      opt_button
    )
  }

  /**
   * Schedules a keyboard action.
   *
   * @param {string} description A simple descriptive label for the scheduled
   *     action.
   * @param {!Array<(string|!input.Key)>} keys The keys to send.
   * @return {!LegacyActionSequence} A self reference.
   * @private
   */
  scheduleKeyboardAction_(description, keys) {
    let cmd = new command.Command(
      command.Name.LEGACY_ACTION_SEND_KEYS
    ).setParameter('value', keys)
    this.schedule_(description, cmd)
    return this
  }

  /**
   * Performs a modifier key press. The modifier key is <em>not released</em>
   * until {@link #keyUp} or {@link #sendKeys} is called. The key press will be
   * targeted at the currently focused element.
   *
   * @param {!input.Key} key The modifier key to push. Must be one of
   *     {ALT, CONTROL, SHIFT, COMMAND, META}.
   * @return {!LegacyActionSequence} A self reference.
   * @throws {error.InvalidArgumentError} If the key is not a valid modifier
   *     key.
   */
  keyDown(key) {
    checkModifierKey(key)
    return this.scheduleKeyboardAction_('keyDown', [key])
  }

  /**
   * Performs a modifier key release. The release is targeted at the currently
   * focused element.
   * @param {!input.Key} key The modifier key to release. Must be one of
   *     {ALT, CONTROL, SHIFT, COMMAND, META}.
   * @return {!LegacyActionSequence} A self reference.
   * @throws {error.InvalidArgumentError} If the key is not a valid modifier
   *     key.
   */
  keyUp(key) {
    checkModifierKey(key)
    return this.scheduleKeyboardAction_('keyUp', [key])
  }

  /**
   * Simulates typing multiple keys. Each modifier key encountered in the
   * sequence will not be released until it is encountered again. All key events
   * will be targeted at the currently focused element.
   *
   * @param {...(string|!input.Key|!Array<(string|!input.Key)>)} var_args
   *     The keys to type.
   * @return {!LegacyActionSequence} A self reference.
   * @throws {Error} If the key is not a valid modifier key.
   */
  sendKeys(_var_args) {
    // eslint-disable-line
    const keys = flatten(arguments)
    return this.scheduleKeyboardAction_('sendKeys', keys)
  }
}

/**
 * Class for defining sequences of user touch interactions. Each sequence
 * will not be executed until {@link #perform} is called.
 *
 * This class should not be instantiated directly. Instead, obtain an instance
 * using {@link ./webdriver.WebDriver#touchActions() WebDriver.touchActions()}.
 *
 * Sample usage:
 *
 *     new LegacyActions(driver).
 *         tapAndHold({x: 0, y: 0}).
 *         move({x: 3, y: 4}).
 *         release({x: 10, y: 10}).
 *         perform();
 *
 * @deprecated This class is strongly deprecated and will be removed once
 *     [Google's Chrome][Chrome] and [Microsoft's Edge][Edge] browsers
 *     support the new action sequence API.
 *
 * [Chrome]: https://chromium.googlesource.com/chromium/src/+/master/docs/chromedriver_status.md
 * [Edge]: https://docs.microsoft.com/en-us/microsoft-edge/webdriver
 */
class LegacyTouchSequence {
  /**
   * @param {!./webdriver.WebDriver} driver The driver that should be used to
   *     perform this action sequence.
   */
  constructor(driver) {
    /** @private {!./webdriver.WebDriver} */
    this.driver_ = driver

    /** @private {!Array<{description: string, command: !command.Command}>} */
    this.actions_ = []
  }

  /**
   * Schedules an action to be executed each time {@link #perform} is called on
   * this instance.
   * @param {string} description A description of the command.
   * @param {!command.Command} command The command.
   * @private
   */
  schedule_(description, command) {
    this.actions_.push({
      description: description,
      command: command,
    })
  }

  /**
   * Executes this action sequence.
   * @return {!Promise} A promise that will be resolved once this sequence has
   *     completed.
   */
  async perform() {
    // Make a protected copy of the scheduled actions. This will protect against
    // users defining additional commands before this sequence is actually
    // executed.
    let actions = this.actions_.concat()
    for (let action of actions) {
      await this.driver_.execute(action.command)
    }
  }

  /**
   * Taps an element.
   *
   * @param {!./webdriver.WebElement} elem The element to tap.
   * @return {!LegacyTouchSequence} A self reference.
   */
  tap(elem) {
    let cmd = new command.Command(
      command.Name.LEGACY_ACTION_TOUCH_SINGLE_TAP
    ).setParameter('element', elem.getId())

    this.schedule_('tap', cmd)
    return this
  }

  /**
   * Double taps an element.
   *
   * @param {!./webdriver.WebElement} elem The element to double tap.
   * @return {!LegacyTouchSequence} A self reference.
   */
  doubleTap(elem) {
    const cmd = new command.Command(
      command.Name.LEGACY_ACTION_TOUCH_DOUBLE_TAP
    ).setParameter('element', elem.getId())

    this.schedule_('doubleTap', cmd)
    return this
  }

  /**
   * Long press on an element.
   *
   * @param {!./webdriver.WebElement} elem The element to long press.
   * @return {!LegacyTouchSequence} A self reference.
   */
  longPress(elem) {
    const cmd = new command.Command(
      command.Name.LEGACY_ACTION_TOUCH_LONG_PRESS
    ).setParameter('element', elem.getId())

    this.schedule_('longPress', cmd)
    return this
  }

  /**
   * Touch down at the given location.
   *
   * @param {{x: number, y: number}} location The location to touch down at.
   * @return {!LegacyTouchSequence} A self reference.
   */
  tapAndHold(location) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_DOWN)
      .setParameter('x', location.x)
      .setParameter('y', location.y)

    this.schedule_('tapAndHold', cmd)
    return this
  }

  /**
   * Move a held {@linkplain #tapAndHold touch} to the specified location.
   *
   * @param {{x: number, y: number}} location The location to move to.
   * @return {!LegacyTouchSequence} A self reference.
   */
  move(location) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_MOVE)
      .setParameter('x', location.x)
      .setParameter('y', location.y)

    this.schedule_('move', cmd)
    return this
  }

  /**
   * Release a held {@linkplain #tapAndHold touch} at the specified location.
   *
   * @param {{x: number, y: number}} location The location to release at.
   * @return {!LegacyTouchSequence} A self reference.
   */
  release(location) {
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_UP)
      .setParameter('x', location.x)
      .setParameter('y', location.y)

    this.schedule_('release', cmd)
    return this
  }

  /**
   * Scrolls the touch screen by the given offset.
   *
   * @param {{x: number, y: number}} offset The offset to scroll to.
   * @return {!LegacyTouchSequence} A self reference.
   */
  scroll(offset) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_SCROLL)
      .setParameter('xoffset', offset.x)
      .setParameter('yoffset', offset.y)

    this.schedule_('scroll', cmd)
    return this
  }

  /**
   * Scrolls the touch screen, starting on `elem` and moving by the specified
   * offset.
   *
   * @param {!./webdriver.WebElement} elem The element where scroll starts.
   * @param {{x: number, y: number}} offset The offset to scroll to.
   * @return {!LegacyTouchSequence} A self reference.
   */
  scrollFromElement(elem, offset) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_SCROLL)
      .setParameter('element', elem.getId())
      .setParameter('xoffset', offset.x)
      .setParameter('yoffset', offset.y)

    this.schedule_('scrollFromElement', cmd)
    return this
  }

  /**
   * Flick, starting anywhere on the screen, at speed xspeed and yspeed.
   *
   * @param {{xspeed: number, yspeed: number}} speed The speed to flick in each
         direction, in pixels per second.
   * @return {!LegacyTouchSequence} A self reference.
   */
  flick(speed) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_FLICK)
      .setParameter('xspeed', speed.xspeed)
      .setParameter('yspeed', speed.yspeed)

    this.schedule_('flick', cmd)
    return this
  }

  /**
   * Flick starting at elem and moving by x and y at specified speed.
   *
   * @param {!./webdriver.WebElement} elem The element where flick starts.
   * @param {{x: number, y: number}} offset The offset to flick to.
   * @param {number} speed The speed to flick at in pixels per second.
   * @return {!LegacyTouchSequence} A self reference.
   */
  flickElement(elem, offset, speed) {
    const cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_FLICK)
      .setParameter('element', elem.getId())
      .setParameter('xoffset', offset.x)
      .setParameter('yoffset', offset.y)
      .setParameter('speed', speed)

    this.schedule_('flickElement', cmd)
    return this
  }
}

// PUBLIC API

module.exports = {
  LegacyActionSequence,
  LegacyTouchSequence,
}
