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

const assert = require('assert')
const command = require('../../lib/command')
const error = require('../../lib/error')
const input = require('../../lib/input')
const { WebElement } = require('../../lib/webdriver')

describe('input.Actions', function () {
  class StubExecutor {
    constructor(...responses) {
      this.responses = responses
      this.commands = []
    }

    execute(command) {
      const name = command.getName()
      const parameters = command.getParameters()
      this.commands.push({ name, parameters })
      return (
        this.responses.shift() ||
        Promise.reject(new Error('unexpected command: ' + command.getName()))
      )
    }
  }

  describe('perform()', function () {
    it('omits idle devices', async function () {
      let executor = new StubExecutor(
        Promise.resolve(),
        Promise.resolve(),
        Promise.resolve(),
        Promise.resolve()
      )

      await new input.Actions(executor).perform()
      assert.deepStrictEqual(executor.commands, [])

      await new input.Actions(executor).pause().perform()
      assert.deepStrictEqual(executor.commands, [])

      await new input.Actions(executor).pause(1).perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'pause', duration: 1 }],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [{ type: 'pause', duration: 1 }],
              },
              {
                id: 'default wheel',
                type: 'wheel',
                actions: [{ type: 'pause', duration: 1 }],
              },
            ],
          },
        },
      ])

      executor.commands.length = 0
      let actions = new input.Actions(executor)
      await actions.pause(1, actions.keyboard()).perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'pause', duration: 1 }],
              },
            ],
          },
        },
      ])
    })

    it('can be called multiple times', async function () {
      const executor = new StubExecutor(Promise.resolve(), Promise.resolve())
      const actions = new input.Actions(executor).keyDown(input.Key.SHIFT)

      const expected = {
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
            {
              id: 'default keyboard',
              type: 'key',
              actions: [{ type: 'keyDown', value: input.Key.SHIFT }],
            },
          ],
        },
      }

      await actions.perform()
      assert.deepStrictEqual(executor.commands, [expected])

      await actions.perform()
      assert.deepStrictEqual(executor.commands, [expected, expected])
    })
  })

  describe('pause()', function () {
    it('defaults to all devices', async function () {
      const executor = new StubExecutor(Promise.resolve())

      await new input.Actions(executor).pause(3).perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'pause', duration: 3 }],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [{ type: 'pause', duration: 3 }],
              },
              {
                id: 'default wheel',
                type: 'wheel',
                actions: [
                  {
                    duration: 3,
                    type: 'pause',
                  },
                ],
              },
            ],
          },
        },
      ])
    })

    it('duration defaults to 0', async function () {
      const executor = new StubExecutor(Promise.resolve())

      await new input.Actions(executor).pause().pause(3).perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 3 },
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 3 },
                ],
              },
              {
                id: 'default wheel',
                type: 'wheel',
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 3 },
                ],
              },
            ],
          },
        },
      ])
    })

    it('single device w/ synchronization', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions
        .pause(100, actions.keyboard())
        .pause(100, actions.mouse())
        .perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'pause', duration: 100 },
                  { type: 'pause', duration: 0 },
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 100 },
                ],
              },
            ],
          },
        },
      ])
    })

    it('single device w/o synchronization', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor, { async: true })

      await actions
        .pause(100, actions.keyboard())
        .pause(100, actions.mouse())
        .perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'pause', duration: 100 }],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [{ type: 'pause', duration: 100 }],
              },
            ],
          },
        },
      ])
    })

    it('pause a single device multiple times by specifying it multiple times', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.pause(100, actions.keyboard(), actions.keyboard()).perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'pause', duration: 100 },
                  { type: 'pause', duration: 100 },
                ],
              },
            ],
          },
        },
      ])
    })
  })

  describe('keyDown()', function () {
    it('sends normalized code point', async function () {
      let executor = new StubExecutor(Promise.resolve())

      await new input.Actions(executor).keyDown('\u0041\u030a').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'keyDown', value: '\u00c5' }],
              },
            ],
          },
        },
      ])
    })

    it('rejects keys that are not a single code point', function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)
      assert.throws(
        () => actions.keyDown('\u1E9B\u0323'),
        error.InvalidArgumentError
      )
    })
  })

  describe('keyUp()', function () {
    it('sends normalized code point', async function () {
      let executor = new StubExecutor(Promise.resolve())

      await new input.Actions(executor).keyUp('\u0041\u030a').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{ type: 'keyUp', value: '\u00c5' }],
              },
            ],
          },
        },
      ])
    })

    it('rejects keys that are not a single code point', function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)
      assert.throws(
        () => actions.keyUp('\u1E9B\u0323'),
        error.InvalidArgumentError
      )
    })
  })

  describe('sendKeys()', function () {
    it('sends down/up for single key', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.sendKeys('a').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                ],
              },
            ],
          },
        },
      ])
    })

    it('sends down/up for vararg keys', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.sendKeys('a', 'b').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                  { type: 'keyDown', value: 'b' },
                  { type: 'keyUp', value: 'b' },
                ],
              },
            ],
          },
        },
      ])
    })

    it('sends down/up for multichar strings in varargs', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.sendKeys('a', 'bc', 'd').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                  { type: 'keyDown', value: 'b' },
                  { type: 'keyUp', value: 'b' },
                  { type: 'keyDown', value: 'c' },
                  { type: 'keyUp', value: 'c' },
                  { type: 'keyDown', value: 'd' },
                  { type: 'keyUp', value: 'd' },
                ],
              },
            ],
          },
        },
      ])
    })

    it('synchronizes with other devices', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.sendKeys('ab').pause(100, actions.mouse()).perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                  { type: 'keyDown', value: 'b' },
                  { type: 'keyUp', value: 'b' },
                  { type: 'pause', duration: 0 },
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 100 },
                ],
              },
            ],
          },
        },
      ])
    })

    it('without device synchronization', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor, { async: true })

      await actions.sendKeys('ab').pause(100, actions.mouse()).perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                  { type: 'keyDown', value: 'b' },
                  { type: 'keyUp', value: 'b' },
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [{ type: 'pause', duration: 100 }],
              },
            ],
          },
        },
      ])
    })

    it('string length > 500', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor, { async: true })
      let str = ''
      for (let i = 0; i < 501; i++) {
        str += i
      }
      const executionResult = await actions
        .sendKeys(str)
        .perform()
        .then(() => true)
        .catch(() => false)
      assert.strictEqual(executionResult, true)
    })
  })

  describe('click()', function () {
    it('clicks immediately if no element provided', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      await actions.click().perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerDown',
                    button: input.Button.LEFT,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  { type: 'pointerUp', button: input.Button.LEFT },
                ],
              },
            ],
          },
        },
      ])
    })

    it('moves to target element before clicking', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      const fakeElement = {}

      await actions.click(fakeElement).perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerMove',
                    origin: fakeElement,
                    duration: 100,
                    x: 0,
                    y: 0,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerDown',
                    button: input.Button.LEFT,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  { type: 'pointerUp', button: input.Button.LEFT },
                ],
              },
            ],
          },
        },
      ])
    })

    it('synchronizes with other devices', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)

      const fakeElement = {}

      await actions.click(fakeElement).sendKeys('a').perform()
      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                  { type: 'keyDown', value: 'a' },
                  { type: 'keyUp', value: 'a' },
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerMove',
                    origin: fakeElement,
                    duration: 100,
                    x: 0,
                    y: 0,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerDown',
                    button: input.Button.LEFT,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  { type: 'pointerUp', button: input.Button.LEFT },
                  { type: 'pause', duration: 0 },
                  { type: 'pause', duration: 0 },
                ],
              },
            ],
          },
        },
      ])
    })
  })

  describe('dragAndDrop', function () {
    it('dragAndDrop(fromEl, toEl)', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)
      const e1 = new WebElement(null, 'abc123')
      const e2 = new WebElement(null, 'def456')

      await actions.dragAndDrop(e1, e2).perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: e1,
                    x: 0,
                    y: 0,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerDown',
                    button: input.Button.LEFT,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: e2,
                    x: 0,
                    y: 0,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  { type: 'pointerUp', button: input.Button.LEFT },
                ],
              },
            ],
          },
        },
      ])
    })

    it('dragAndDrop(el, offset)', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)
      const e1 = new WebElement(null, 'abc123')

      await actions.dragAndDrop(e1, { x: 30, y: 40 }).perform()

      assert.deepStrictEqual(executor.commands, [
        {
          name: command.Name.ACTIONS,
          parameters: {
            actions: [
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: { pointerType: 'mouse' },
                actions: [
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: e1,
                    x: 0,
                    y: 0,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerDown',
                    button: input.Button.LEFT,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: input.Origin.POINTER,
                    x: 30,
                    y: 40,
                    altitudeAngle: 0,
                    azimuthAngle: 0,
                    width: 0,
                    height: 0,
                    pressure: 0,
                    tangentialPressure: 0,
                    tiltX: 0,
                    tiltY: 0,
                    twist: 0,
                  },
                  { type: 'pointerUp', button: input.Button.LEFT },
                ],
              },
            ],
          },
        },
      ])
    })

    it('throws if target is invalid', async function () {
      const executor = new StubExecutor(Promise.resolve())
      const actions = new input.Actions(executor)
      const e = new WebElement(null, 'abc123')

      assert.throws(() => actions.dragAndDrop(e), error.InvalidArgumentError)
      assert.throws(
        () => actions.dragAndDrop(e, null),
        error.InvalidArgumentError
      )
      assert.throws(
        () => actions.dragAndDrop(e, {}),
        error.InvalidArgumentError
      )
      assert.throws(
        () => actions.dragAndDrop(e, { x: 0 }),
        error.InvalidArgumentError
      )
      assert.throws(
        () => actions.dragAndDrop(e, { y: 0 }),
        error.InvalidArgumentError
      )
      assert.throws(
        () => actions.dragAndDrop(e, { x: 0, y: 'a' }),
        error.InvalidArgumentError
      )
      assert.throws(
        () => actions.dragAndDrop(e, { x: 'a', y: 0 }),
        error.InvalidArgumentError
      )
    })
  })
})
