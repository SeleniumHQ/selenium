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

'use strict';

const assert = require('assert');
const sinon = require('sinon');

const command = require('../../lib/command');
const error = require('../../lib/error');
const input = require('../../lib/input');
const {WebElement} = require('../../lib/webdriver');


describe('input.Actions', function() {
  class StubExecutor {
    constructor(...responses) {
      this.responses = responses;
      this.commands = [];
    }

    execute(command) {
      const name = command.getName();
      const parameters = command.getParameters();
      this.commands.push({name, parameters});
      return this.responses.shift()
          || Promise.reject(
              new Error('unexpected command: ' + command.getName()));
    }
  }

  describe('perform()', function() {
    it('omits idle devices', async function() {
      let executor = new StubExecutor(
          Promise.resolve(),
          Promise.resolve(),
          Promise.resolve(),
          Promise.resolve());

      await new input.Actions(executor).perform();
      assert.deepEqual(executor.commands, []);

      await new input.Actions(executor).pause().perform();
      assert.deepEqual(executor.commands, []);

      await new input.Actions(executor).pause(1).perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{type: 'pause', duration: 1}],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [{type: 'pause', duration: 1}],
              },
          ],
        }
      }]);

      executor.commands.length = 0;
      let actions = new input.Actions(executor);
      await actions.pause(1, actions.keyboard()).perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [{type: 'pause', duration: 1}],
          }],
        }
      }]);
    });

    it('can be called multiple times', async function() {
      const executor = new StubExecutor(Promise.resolve(), Promise.resolve());
      const actions = new input.Actions(executor).keyDown(input.Key.SHIFT);

      const expected = {
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [{type: 'keyDown', value: input.Key.SHIFT}],
          }]}
      };

      await actions.perform();
      assert.deepEqual(executor.commands, [expected]);

      await actions.perform();
      assert.deepEqual(executor.commands, [expected, expected]);
    });
  });

  describe('pause()', function() {
    it('defaults to all devices', async function() {
      const executor = new StubExecutor(Promise.resolve());

      await new input.Actions(executor).pause(3).perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [{type: 'pause', duration: 3}],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [{type: 'pause', duration: 3}],
              },
          ],
        }
      }]);
    });

    it('duration defaults to 0', async function() {
      const executor = new StubExecutor(Promise.resolve());

      await new input.Actions(executor)
          .pause()
          .pause(3)
          .perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  {type: 'pause', duration: 0},
                  {type: 'pause', duration: 3},
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [
                  {type: 'pause', duration: 0},
                  {type: 'pause', duration: 3},
                ],
              },
          ],
        }
      }]);
    });

    it('single device w/ synchronization', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions
          .pause(100, actions.keyboard())
          .pause(100, actions.mouse())
          .perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  {type: 'pause', duration: 100},
                  {type: 'pause', duration: 0},
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [
                  {type: 'pause', duration: 0},
                  {type: 'pause', duration: 100},
                ],
              },
          ],
        }
      }]);
    });

    it('single device w/o synchronization', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor, {async: true});

      await actions
          .pause(100, actions.keyboard())
          .pause(100, actions.mouse())
          .perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
              {
                id: 'default keyboard',
                type: 'key',
                actions: [
                  {type: 'pause', duration: 100},
                ],
              },
              {
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [
                  {type: 'pause', duration: 100},
                ],
              },
          ],
        }
      }]);
    });

    it('pause a single device multiple times by specifying it multiple times',
        async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions
          .pause(100, actions.keyboard(), actions.keyboard())
          .perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [
              {type: 'pause', duration: 100},
              {type: 'pause', duration: 100},
            ],
          }],
        }
      }]);
    });
  });

  describe('keyDown()', function() {
    it('sends normalized code point', async function() {
      let executor = new StubExecutor(Promise.resolve());

      await new input.Actions(executor).keyDown('\u0041\u030a').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [{type: 'keyDown', value: '\u00c5'}],
          }],
        }
      }]);
    });

    it('rejects keys that are not a single code point', function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);
      assert.throws(
          () => actions.keyDown('\u1E9B\u0323'),
          error.InvalidArgumentError);
    });
  });

  describe('keyUp()', function() {
    it('sends normalized code point', async function() {
      let executor = new StubExecutor(Promise.resolve());

      await new input.Actions(executor).keyUp('\u0041\u030a').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [{type: 'keyUp', value: '\u00c5'}],
          }],
        }
      }]);
    });

    it('rejects keys that are not a single code point', function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);
      assert.throws(
          () => actions.keyUp('\u1E9B\u0323'),
          error.InvalidArgumentError);
    });
  });

  describe('sendKeys()', function() {
    it('sends down/up for single key', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions.sendKeys('a').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [
              {type: 'keyDown', value: 'a'},
              {type: 'keyUp', value: 'a'},
            ],
          }],
        }
      }]);
    });

    it('sends down/up for vararg keys', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions.sendKeys('a', 'b').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [
              {type: 'keyDown', value: 'a'},
              {type: 'keyUp', value: 'a'},
              {type: 'keyDown', value: 'b'},
              {type: 'keyUp', value: 'b'},
            ],
          }],
        }
      }]);
    });

    it('sends down/up for multichar strings in varargs', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions.sendKeys('a', 'bc', 'd').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [
              {type: 'keyDown', value: 'a'},
              {type: 'keyUp', value: 'a'},
              {type: 'keyDown', value: 'b'},
              {type: 'keyUp', value: 'b'},
              {type: 'keyDown', value: 'c'},
              {type: 'keyUp', value: 'c'},
              {type: 'keyDown', value: 'd'},
              {type: 'keyUp', value: 'd'},
            ],
          }],
        }
      }]);
    });

    it('synchronizes with other devices', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions.sendKeys('ab').pause(100, actions.mouse()).perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
            {
              id: 'default keyboard',
              type: 'key',
              actions: [
                {type: 'keyDown', value: 'a'},
                {type: 'keyUp', value: 'a'},
                {type: 'keyDown', value: 'b'},
                {type: 'keyUp', value: 'b'},
                {type: 'pause', duration: 0},
              ],
            },
            {
              id: 'default mouse',
              type: 'pointer',
              parameters: {pointerType: 'mouse'},
              actions: [
                {type: 'pause', duration: 0},
                {type: 'pause', duration: 0},
                {type: 'pause', duration: 0},
                {type: 'pause', duration: 0},
                {type: 'pause', duration: 100},
              ],
            },
          ],
        }
      }]);
    });

    it('without device synchronization', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor, {async: true});

      await actions.sendKeys('ab').pause(100, actions.mouse()).perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [
            {
              id: 'default keyboard',
              type: 'key',
              actions: [
                {type: 'keyDown', value: 'a'},
                {type: 'keyUp', value: 'a'},
                {type: 'keyDown', value: 'b'},
                {type: 'keyUp', value: 'b'},
              ],
            },
            {
              id: 'default mouse',
              type: 'pointer',
              parameters: {pointerType: 'mouse'},
              actions: [{type: 'pause', duration: 100}],
            },
          ],
        }
      }]);
    });
  });

  describe('click()', function() {
    it('clicks immediately if no element provided', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      await actions.click().perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default mouse',
            type: 'pointer',
            parameters: {pointerType: 'mouse'},
            actions: [
              {type: 'pointerDown', button: input.Button.LEFT},
              {type: 'pointerUp', button: input.Button.LEFT},
            ],
          }],
        },
      }]);
    });

    it('moves to target element before clicking', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      const fakeElement = {};

      await actions.click(fakeElement).perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default mouse',
            type: 'pointer',
            parameters: {pointerType: 'mouse'},
            actions: [
              {
                type: 'pointerMove',
                origin: fakeElement,
                duration: 100,
                x: 0,
                y: 0,
              },
              {type: 'pointerDown', button: input.Button.LEFT},
              {type: 'pointerUp', button: input.Button.LEFT},
            ],
          }],
        },
      }]);
    });

    it('synchronizes with other devices', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);

      const fakeElement = {};

      await actions.click(fakeElement).sendKeys('a').perform();
      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default keyboard',
            type: 'key',
            actions: [
              {type: 'pause', duration: 0},
              {type: 'pause', duration: 0},
              {type: 'pause', duration: 0},
              {type: 'keyDown', value: 'a'},
              {type: 'keyUp', value: 'a'},
            ],
          }, {
            id: 'default mouse',
            type: 'pointer',
            parameters: {pointerType: 'mouse'},
            actions: [
              {
                type: 'pointerMove',
                origin: fakeElement,
                duration: 100,
                x: 0,
                y: 0,
              },
              {type: 'pointerDown', button: input.Button.LEFT},
              {type: 'pointerUp', button: input.Button.LEFT},
              {type: 'pause', duration: 0},
              {type: 'pause', duration: 0},
            ],
          }],
        },
      }]);
    });
  });

  describe('dragAndDrop', function() {
    it('dragAndDrop(fromEl, toEl)', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);
      const e1 = new WebElement(null, 'abc123');
      const e2 = new WebElement(null, 'def456');

      await actions.dragAndDrop(e1, e2).perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default mouse',
            type: 'pointer',
            parameters: {pointerType: 'mouse'},
            actions: [
              {
                type: 'pointerMove',
                duration: 100,
                origin: e1,
                x: 0,
                y: 0,
              },
              {type: 'pointerDown', button: input.Button.LEFT},
              {
                type: 'pointerMove',
                duration: 100,
                origin: e2,
                x: 0,
                y: 0,
              },
              {type: 'pointerUp', button: input.Button.LEFT},
            ],
          }],
        }
      }]);
    });

    it('dragAndDrop(el, offset)', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);
      const e1 = new WebElement(null, 'abc123');

      await actions.dragAndDrop(e1, {x: 30, y: 40}).perform();

      assert.deepEqual(executor.commands, [{
        name: command.Name.ACTIONS,
        parameters: {
          actions: [{
            id: 'default mouse',
            type: 'pointer',
            parameters: {pointerType: 'mouse'},
            actions: [
              {
                type: 'pointerMove',
                duration: 100,
                origin: e1,
                x: 0,
                y: 0,
              },
              {type: 'pointerDown', button: input.Button.LEFT},
              {
                type: 'pointerMove',
                duration: 100,
                origin: input.Origin.POINTER,
                x: 30,
                y: 40,
              },
              {type: 'pointerUp', button: input.Button.LEFT},
            ],
          }],
        }
      }]);
    });

    it('throws if target is invalid', async function() {
      const executor = new StubExecutor(Promise.resolve());
      const actions = new input.Actions(executor);
      const e = new WebElement(null, 'abc123');

      assert.throws(
          () => actions.dragAndDrop(e),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, null),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, {}),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, {x:0}),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, {y:0}),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, {x:0, y:'a'}),
          error.InvalidArgumentError);
      assert.throws(
          () => actions.dragAndDrop(e, {x:'a', y:0}),
          error.InvalidArgumentError);
    });
  });

  describe('bridge mode', function() {
    it('cannot enable async and bridge at the same time', function() {
      let exe = new StubExecutor;
      assert.throws(
          () => new input.Actions(exe, {async: true, bridge: true}),
          error.InvalidArgumentError);
    });

    it('behaves as normal if first command succeeds', async function() {
      const actions = new input.Actions(new StubExecutor(Promise.resolve()));
      await actions.click().sendKeys('a').perform();
    });

    it('handles pauses locally', async function() {
      const start = Date.now();
      const actions =
          new input.Actions(
              new StubExecutor(
                  Promise.reject(new error.UnknownCommandError)),
              {bridge: true});

      await actions.pause(100).perform();

      const elapsed = Date.now() - start;
      assert.ok(elapsed > 100, elapsed);
    });

    it('requires non-modifier keys to be used in keydown/up sequences', async function() {
      const actions =
          new input.Actions(
              new StubExecutor(
                  Promise.reject(new error.UnknownCommandError)),
              {bridge: true});

      try {
        await actions.keyDown(input.Key.SHIFT).keyDown('a').perform();
        return Promise.reject(Error('should have failed!'));
      } catch (err) {
        if (!(err instanceof error.UnsupportedOperationError)
            || !err.message.endsWith('must be followed by a keyup for the same key')) {
          throw err;
        }
      }
    });

    it('key sequence', async function() {
      const executor =
          new StubExecutor(
              Promise.reject(new error.UnknownCommandError),
              Promise.resolve('shift down'),
              Promise.resolve(),
              Promise.resolve(),
              Promise.resolve(),
              Promise.resolve('shift up'));
      const actions = new input.Actions(executor, {bridge: true});

      await actions
          .keyDown(input.Key.SHIFT)
          .sendKeys('abc')
          .keyUp(input.Key.SHIFT)
          .sendKeys('de')
          .perform();

      assert.deepEqual(executor.commands, [
          {
            name: command.Name.ACTIONS,
            parameters: {
              actions: [{
                id: 'default keyboard',
                type: 'key',
                actions: [
                  {type: 'keyDown', value: input.Key.SHIFT},
                  {type: 'keyDown', value: 'a'},
                  {type: 'keyUp', value: 'a'},
                  {type: 'keyDown', value: 'b'},
                  {type: 'keyUp', value: 'b'},
                  {type: 'keyDown', value: 'c'},
                  {type: 'keyUp', value: 'c'},
                  {type: 'keyUp', value: input.Key.SHIFT},
                  {type: 'keyDown', value: 'd'},
                  {type: 'keyUp', value: 'd'},
                  {type: 'keyDown', value: 'e'},
                  {type: 'keyUp', value: 'e'},
                ],
              }],
            }
          },
          {
            name: command.Name.LEGACY_ACTION_SEND_KEYS,
            parameters: {value: [input.Key.SHIFT]}
          },
          {
            name: command.Name.LEGACY_ACTION_SEND_KEYS,
            parameters: {value: ['a', 'b', 'c']}
          },
          {
            name: command.Name.LEGACY_ACTION_SEND_KEYS,
            parameters: {value: [input.Key.SHIFT]}
          },
          {
            name: command.Name.LEGACY_ACTION_SEND_KEYS,
            parameters: {value: ['d', 'e']}
          },
      ]);
    });

    it('mouse movements cannot be relative to the viewport', async function() {
      const actions =
          new input.Actions(
              new StubExecutor(
                  Promise.reject(new error.UnknownCommandError)),
              {bridge: true});

      try {
        await actions.move({x: 10, y: 15}).perform();
        return Promise.reject(Error('should have failed!'));
      } catch (err) {
        if (!(err instanceof error.UnsupportedOperationError)
            || !err.message.startsWith('pointer movements relative to viewport')) {
          throw err;
        }
      }
    });

    describe('detects clicks', function() {
      it('press/release for same button is a click', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions
            .press(input.Button.LEFT)
            .release(input.Button.LEFT)
            .perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });

      it('not a click if release is a different button', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve(),
                Promise.resolve(),
                Promise.resolve(),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions
            .press(input.Button.LEFT)
            .press(input.Button.RIGHT)
            .release(input.Button.LEFT)
            .release(input.Button.RIGHT)
            .perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerDown', button: input.Button.RIGHT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.RIGHT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_DOWN,
              parameters: {button: input.Button.LEFT},
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_DOWN,
              parameters: {button: input.Button.RIGHT},
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_UP,
              parameters: {button: input.Button.LEFT},
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_UP,
              parameters: {button: input.Button.RIGHT},
            },
        ]);
      });

      it('click() shortcut', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions.click().perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });

      it('detects context-clicks', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions
            .press(input.Button.RIGHT)
            .release(input.Button.RIGHT)
            .perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.RIGHT},
                    {type: 'pointerUp', button: input.Button.RIGHT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.RIGHT},
            },
        ]);
      });

      it('contextClick() shortcut', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions.contextClick().perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.RIGHT},
                    {type: 'pointerUp', button: input.Button.RIGHT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.RIGHT},
            },
        ]);
      });

      it('click(element)', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve([0, 0]),
                Promise.resolve(),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions.click(element).perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {
                      type: 'pointerMove',
                      duration: 100,
                      origin: element,
                      x: 0,
                      y: 0,
                    },
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.EXECUTE_SCRIPT,
              parameters: {
                script: input.INTERNAL_COMPUTE_OFFSET_SCRIPT,
                args: [element],
              },
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
              parameters: {
                element: 'abc123',
                xoffset: 0,
                yoffset: 0,
              },
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });
    });

    describe('detects double-clicks', function() {
      it('press/release x2 for same button is a double-click', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions
            .press(input.Button.LEFT)
            .release(input.Button.LEFT)
            .press(input.Button.LEFT)
            .release(input.Button.LEFT)
            .perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_DOUBLE_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });

      it('doubleClick() shortcut', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});

        await actions.doubleClick().perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_DOUBLE_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });

      it('not a double-click if second click is another button', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve(),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});

        await actions.click().contextClick().perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                    {type: 'pointerDown', button: input.Button.RIGHT},
                    {type: 'pointerUp', button: input.Button.RIGHT},
                  ],
                }],
              }
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.LEFT},
            },
            {
              name: command.Name.LEGACY_ACTION_CLICK,
              parameters: {button: input.Button.RIGHT},
            },
        ]);
      });

      it('doubleClick(element)', async function() {
        const executor =
            new StubExecutor(
                Promise.reject(new error.UnknownCommandError),
                Promise.resolve([7, 10]),
                Promise.resolve(),
                Promise.resolve());

        const actions = new input.Actions(executor, {bridge: true});
        const element = new WebElement(null, 'abc123');

        await actions.doubleClick(element).perform();

        assert.deepEqual(executor.commands, [
            {
              name: command.Name.ACTIONS,
              parameters: {
                actions: [{
                  id: 'default mouse',
                  type: 'pointer',
                  parameters: {pointerType: 'mouse'},
                  actions: [
                    {
                      type: 'pointerMove',
                      duration: 100,
                      origin: element,
                      x: 0,
                      y: 0,
                    },
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                    {type: 'pointerDown', button: input.Button.LEFT},
                    {type: 'pointerUp', button: input.Button.LEFT},
                  ],
                }],
              }
            },
            {
              name: command.Name.EXECUTE_SCRIPT,
              parameters: {
                script: input.INTERNAL_COMPUTE_OFFSET_SCRIPT,
                args: [element],
              },
            },
            {
              name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
              parameters: {
                element: 'abc123',
                xoffset: 7,
                yoffset: 10,
              },
            },
            {
              name: command.Name.LEGACY_ACTION_DOUBLE_CLICK,
              parameters: {button: input.Button.LEFT},
            },
        ]);
      });
    });

    it('mouse sequence', async function() {
      const executor =
          new StubExecutor(
              Promise.reject(new error.UnknownCommandError),
              Promise.resolve([-6, 9]),
              Promise.resolve(),
              Promise.resolve(),
              Promise.resolve(),
              Promise.resolve());

      const actions = new input.Actions(executor, {bridge: true});
      const element = new WebElement(null, 'abc123');

      await actions
          .move({x: 5, y: 5, origin: element})
          .click()
          .move({x: 10, y: 15, origin: input.Origin.POINTER})
          .doubleClick()
          .perform();

      assert.deepEqual(executor.commands, [
          {
            name: command.Name.ACTIONS,
            parameters: {
              actions: [{
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: element,
                    x: 5,
                    y: 5,
                  },
                  {type: 'pointerDown', button: input.Button.LEFT},
                  {type: 'pointerUp', button: input.Button.LEFT},
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: input.Origin.POINTER,
                    x: 10,
                    y: 15,
                  },
                  {type: 'pointerDown', button: input.Button.LEFT},
                  {type: 'pointerUp', button: input.Button.LEFT},
                  {type: 'pointerDown', button: input.Button.LEFT},
                  {type: 'pointerUp', button: input.Button.LEFT},
                ],
              }],
            }
          },
          {
            name: command.Name.EXECUTE_SCRIPT,
            parameters: {
              script: input.INTERNAL_COMPUTE_OFFSET_SCRIPT,
              args: [element],
            },
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
            parameters: {
              element: 'abc123',
              xoffset: -1,
              yoffset: 14,
            },
          },
          {
            name: command.Name.LEGACY_ACTION_CLICK,
            parameters: {button: input.Button.LEFT},
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
            parameters: {xoffset: 10, yoffset: 15},
          },
          {
            name: command.Name.LEGACY_ACTION_DOUBLE_CLICK,
            parameters: {button: input.Button.LEFT},
          },
      ]);
    });

    it('dragAndDrop', async function() {
      const executor =
          new StubExecutor(
              Promise.reject(new error.UnknownCommandError),
              Promise.resolve([15, 20]),
              Promise.resolve(),
              Promise.resolve(),
              Promise.resolve([25, 30]),
              Promise.resolve(),
              Promise.resolve());

      const actions = new input.Actions(executor, {bridge: true});
      const e1 = new WebElement(null, 'abc123');
      const e2 = new WebElement(null, 'def456');

      await actions.dragAndDrop(e1, e2).perform();

      assert.deepEqual(executor.commands, [
          {
            name: command.Name.ACTIONS,
            parameters: {
              actions: [{
                id: 'default mouse',
                type: 'pointer',
                parameters: {pointerType: 'mouse'},
                actions: [
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: e1,
                    x: 0,
                    y: 0,
                  },
                  {type: 'pointerDown', button: input.Button.LEFT},
                  {
                    type: 'pointerMove',
                    duration: 100,
                    origin: e2,
                    x: 0,
                    y: 0,
                  },
                  {type: 'pointerUp', button: input.Button.LEFT},
                ],
              }],
            }
          },
          {
            name: command.Name.EXECUTE_SCRIPT,
            parameters: {
              script: input.INTERNAL_COMPUTE_OFFSET_SCRIPT,
              args: [e1],
            },
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
            parameters: {
              element: 'abc123',
              xoffset: 15,
              yoffset: 20,
            },
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_DOWN,
            parameters: {button: input.Button.LEFT},
          },
          {
            name: command.Name.EXECUTE_SCRIPT,
            parameters: {
              script: input.INTERNAL_COMPUTE_OFFSET_SCRIPT,
              args: [e2],
            },
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_MOVE,
            parameters: {
              element: 'def456',
              xoffset: 25,
              yoffset: 30,
            },
          },
          {
            name: command.Name.LEGACY_ACTION_MOUSE_UP,
            parameters: {button: input.Button.LEFT},
          },
      ]);
    });
  });
});
