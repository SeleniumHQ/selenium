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
  let result = []
  for (let i = 0; i < args.length; i++) {
    let element = args[i]
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
    let actions = this.actions_.concat()
    for (let action of actions) {
      await this.driver_.execute(action.command)
    }
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
  sendKeys(var_args) { // eslint-disable-line
    let keys = flatten(arguments)
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
    let cmd = new command.Command(
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
    let cmd = new command.Command(
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_DOWN)
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_MOVE)
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_SCROLL)
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_SCROLL)
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_FLICK)
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
    let cmd = new command.Command(command.Name.LEGACY_ACTION_TOUCH_FLICK)
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
