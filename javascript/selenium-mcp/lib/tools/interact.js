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

const { By, Key, error } = require('selenium-webdriver')

const { ELEMENT, REF, ToolError, actionResult, elementFor, onElement } = require('./common')

const DEFAULT_WAIT_MS = 10000
const MAX_WAIT_SECONDS = 60

/** Key names as agents write them (the DOM `key` values Playwright uses). */
const NAMED_KEYS = {
  enter: Key.ENTER,
  return: Key.RETURN,
  tab: Key.TAB,
  escape: Key.ESCAPE,
  esc: Key.ESCAPE,
  backspace: Key.BACK_SPACE,
  delete: Key.DELETE,
  insert: Key.INSERT,
  space: Key.SPACE,
  ' ': Key.SPACE,
  arrowup: Key.ARROW_UP,
  arrowdown: Key.ARROW_DOWN,
  arrowleft: Key.ARROW_LEFT,
  arrowright: Key.ARROW_RIGHT,
  home: Key.HOME,
  end: Key.END,
  pageup: Key.PAGE_UP,
  pagedown: Key.PAGE_DOWN,
  shift: Key.SHIFT,
  control: Key.CONTROL,
  ctrl: Key.CONTROL,
  alt: Key.ALT,
  meta: Key.META,
  command: Key.COMMAND,
  f1: Key.F1,
  f2: Key.F2,
  f3: Key.F3,
  f4: Key.F4,
  f5: Key.F5,
  f6: Key.F6,
  f7: Key.F7,
  f8: Key.F8,
  f9: Key.F9,
  f10: Key.F10,
  f11: Key.F11,
  f12: Key.F12,
}

/**
 * Parses `Enter`, `a` or a chord such as `Control+Shift+A` into the keys to
 * hold and the key to press.
 *
 * @param {string} spec
 * @return {{modifiers: !Array<string>, key: string}}
 * @throws {ToolError} for a name that is not a key
 */
function parseKey(spec) {
  const raw = String(spec)
  // A lone "+" is the plus key, not an empty chord.
  const parts = raw === '+' ? ['+'] : raw.split('+')
  const resolved = parts.map((part) => {
    // One code point, not one UTF-16 unit, so an emoji is a character too.
    if ([...part].length === 1) return part
    const named = NAMED_KEYS[part.toLowerCase()]
    if (!named) throw new ToolError(`Unknown key: ${part}`)
    return named
  })
  return { modifiers: resolved.slice(0, -1), key: resolved[resolved.length - 1] }
}

async function pressKey(driver, spec) {
  const { modifiers, key } = parseKey(spec)
  let actions = driver.actions()
  for (const m of modifiers) actions = actions.keyDown(m)
  actions = actions.keyDown(key).keyUp(key)
  for (const m of [...modifiers].reverse()) actions = actions.keyUp(m)
  await actions.perform()
}

async function fill(element, value) {
  try {
    await element.clear()
  } catch (e) {
    // contenteditable and some custom inputs cannot be cleared; typing still works.
    if (!(e instanceof error.InvalidElementStateError)) throw e
  }
  await element.sendKeys(String(value))
}

/**
 * @param {{name: string, value: string}} field
 * @return {boolean}
 */
function parseChecked(field) {
  const value = String(field.value).trim().toLowerCase()
  if (value === 'true') return true
  if (value === 'false') return false
  throw new ToolError(
    `${field.name}: use "true" or "false" for a checkbox or radio, not ${JSON.stringify(field.value)}.`,
  )
}

async function setChecked(element, wanted, type) {
  if ((await element.isSelected()) === wanted) return
  if (type === 'radio' && !wanted) {
    throw new ToolError('A radio button cannot be cleared by clicking it; choose another option in its group instead.')
  }
  await element.click()
  if ((await element.isSelected()) !== wanted) {
    throw new ToolError(`Clicking the ${type} did not ${wanted ? 'check' : 'uncheck'} it.`)
  }
}

/**
 * Sets a range input's value. Typing does not move a slider, so the value is
 * set the way a user's drag ends: assigned, then input and change fired.
 */
// A valid floating-point number as HTML defines it. Anything else, such as
// 0x5 or 1e, the slider sanitizes to its default, which can happen to equal
// the number the string coerces to.
const HTML_FLOAT = /^-?(\d+|\d*\.\d+)([eE][+-]?\d+)?$/

async function setSliderValue(driver, element, value) {
  if (!HTML_FLOAT.test(String(value))) {
    throw new ToolError(`${JSON.stringify(String(value))} is not a number the slider accepts, e.g. 5 or 2.5.`)
  }
  const result = await driver.executeScript(
    `const el = arguments[0]
     const wanted = arguments[1]
     // readonly does not apply to range inputs, so only disabled blocks a user.
     if (el.disabled) return { error: 'disabled' }
     // Try the value on a detached copy first, so a value the slider would
     // clamp or round is refused without touching the page. Compare as
     // numbers: "7.0" and "07" are both 7.
     const probe = el.cloneNode(false)
     probe.value = wanted
     if (Number(probe.value) !== Number(wanted)) {
       return { error: 'rejected', actual: probe.value }
     }
     el.value = probe.value
     el.dispatchEvent(new Event('input', { bubbles: true }))
     el.dispatchEvent(new Event('change', { bubbles: true }))
     return { actual: el.value }`,
    element,
    String(value),
  )
  if (result.error === 'disabled') throw new ToolError('The slider is disabled.')
  if (result.error === 'rejected') {
    throw new ToolError(`The slider would take ${result.actual}, not ${value}; the value is outside its range or step.`)
  }
}

/**
 * Selects options of a <select> by value or by visible text.
 *
 * @param {!Object} element the select element
 * @param {!Array<string>} values
 * @return {!Promise<!Array<string>>} the labels of the options selected
 */
async function selectOptions(element, values) {
  const tag = (await element.getTagName()).toLowerCase()
  if (tag !== 'select')
    throw new ToolError('browser_select_option needs a <select> element (role combobox or listbox).')
  const multiple = (await element.getAttribute('multiple')) !== null
  if (!multiple && values.length > 1) throw new ToolError('This select allows only one option.')
  const options = []
  for (const option of await element.findElements(By.css('option'))) {
    options.push({
      option,
      value: await option.getAttribute('value'),
      label: (await option.getText()).trim(),
    })
  }
  // Check every value before touching the page, so a bad request changes nothing.
  const missing = values.filter((v) => !options.some((o) => o.value === v || o.label === v))
  if (missing.length) {
    const available = options.map((o) => JSON.stringify(o.label)).join(', ')
    throw new ToolError(`No option matches ${JSON.stringify(missing)}. Options: ${available}`)
  }
  const labels = []
  for (const o of options) {
    const wanted = values.includes(o.value) || values.includes(o.label)
    if (wanted) labels.push(o.label)
    if (wanted !== (await o.option.isSelected()) && (wanted || multiple)) await o.option.click()
  }
  return labels
}

/**
 * @return {!Promise<string>} the text of the page and of the frames it can
 *     reach, so a wait sees what browser_snapshot shows inside iframes
 */
async function pageText(driver) {
  return driver.executeScript(`
    const texts = []
    const visit = (doc, depth) => {
      if (!doc || depth > 5) return
      if (doc.body) texts.push(doc.body.innerText)
      for (const frame of doc.querySelectorAll('iframe, frame')) {
        let inner = null
        try {
          inner = frame.contentDocument
        } catch {
          // a cross-origin frame cannot be read from here
        }
        visit(inner, depth + 1)
      }
    }
    visit(document, 0)
    return texts.join('\\n')`)
}

const tools = [
  {
    name: 'browser_click',
    description: 'Click an element',
    inputSchema: {
      type: 'object',
      properties: {
        element: ELEMENT,
        ref: REF,
        doubleClick: { type: 'boolean' },
        button: { type: 'string', enum: ['left', 'right'] },
      },
      required: ['ref'],
    },
    async run(ctx, { ref, doubleClick, button }) {
      const element = await elementFor(ctx, ref)
      const driver = await ctx.session.driver()
      await onElement(ref, async () => {
        if (doubleClick) await driver.actions().doubleClick(element).perform()
        else if (button === 'right') await driver.actions().contextClick(element).perform()
        else await element.click()
      })
      return actionResult(ctx, `Clicked ${ref}`)
    },
  },
  {
    name: 'browser_type',
    description: 'Type text into an editable element, replacing its contents',
    inputSchema: {
      type: 'object',
      properties: {
        element: ELEMENT,
        ref: REF,
        text: { type: 'string' },
        submit: { type: 'boolean', description: 'Press Enter afterwards' },
      },
      required: ['ref', 'text'],
    },
    async run(ctx, { ref, text, submit }) {
      const element = await elementFor(ctx, ref)
      await onElement(ref, async () => {
        await fill(element, text)
        if (submit) await element.sendKeys(Key.ENTER)
      })
      return actionResult(ctx, `Typed into ${ref}${submit ? ' and pressed Enter' : ''}`)
    },
  },
  {
    name: 'browser_fill_form',
    description: 'Fill several form fields at once',
    inputSchema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Field name' },
              type: { type: 'string', enum: ['textbox', 'checkbox', 'radio', 'combobox', 'slider'] },
              ref: REF,
              value: {
                type: 'string',
                description: 'Text, "true"/"false" for checkbox and radio, option for combobox',
              },
            },
            required: ['name', 'type', 'ref', 'value'],
          },
        },
      },
      required: ['fields'],
    },
    async run(ctx, { fields }) {
      for (const field of fields) {
        const element = await elementFor(ctx, field.ref)
        const driver = await ctx.session.driver()
        await onElement(field.ref, async () => {
          switch (field.type) {
            case 'checkbox':
            case 'radio':
              return setChecked(element, parseChecked(field), field.type)
            case 'combobox':
              return selectOptions(element, [String(field.value)])
            case 'slider':
              return setSliderValue(driver, element, field.value)
            default:
              return fill(element, field.value)
          }
        })
      }
      return actionResult(ctx, `Filled ${fields.length} field${fields.length === 1 ? '' : 's'}`)
    },
  },
  {
    name: 'browser_select_option',
    description: 'Select options in a dropdown',
    inputSchema: {
      type: 'object',
      properties: {
        element: ELEMENT,
        ref: REF,
        values: { type: 'array', items: { type: 'string' }, description: 'Option values or labels' },
      },
      required: ['ref', 'values'],
    },
    async run(ctx, { ref, values }) {
      const element = await elementFor(ctx, ref)
      const labels = await onElement(ref, () => selectOptions(element, values))
      return actionResult(ctx, `Selected ${labels.map((l) => JSON.stringify(l)).join(', ')} in ${ref}`)
    },
  },
  {
    name: 'browser_press_key',
    description: 'Press a key on the keyboard',
    inputSchema: {
      type: 'object',
      properties: {
        key: { type: 'string', description: 'Key name such as Enter or ArrowLeft, a character, or Control+a' },
      },
      required: ['key'],
    },
    async run(ctx, { key }) {
      const driver = await ctx.session.driver()
      await pressKey(driver, key)
      return actionResult(ctx, `Pressed ${key}`)
    },
  },
  {
    name: 'browser_hover',
    description: 'Hover over an element',
    inputSchema: {
      type: 'object',
      properties: { element: ELEMENT, ref: REF },
      required: ['ref'],
    },
    async run(ctx, { ref }) {
      const element = await elementFor(ctx, ref)
      const driver = await ctx.session.driver()
      await onElement(ref, () => driver.actions().move({ origin: element }).perform())
      return actionResult(ctx, `Hovered over ${ref}`)
    },
  },
  {
    name: 'browser_wait_for',
    description: 'Wait for text to appear or disappear, or for a time to pass',
    inputSchema: {
      type: 'object',
      properties: {
        time: { type: 'number', description: 'Seconds to wait' },
        text: { type: 'string', description: 'Text to wait for' },
        textGone: { type: 'string', description: 'Text to wait to disappear' },
      },
    },
    async run(ctx, { time, text, textGone }) {
      if (time === undefined && text === undefined && textGone === undefined) {
        throw new ToolError('Give one of time, text or textGone.')
      }
      const driver = await ctx.session.driver()
      if (time !== undefined) {
        const seconds = Math.min(Math.max(Number(time), 0), MAX_WAIT_SECONDS)
        await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
      }
      if (text !== undefined || textGone !== undefined) {
        const timeout = ctx.config.waitTimeoutMs || DEFAULT_WAIT_MS
        await driver.switchTo().defaultContent()
        try {
          await driver.wait(async () => {
            const body = await pageText(driver)
            return (text === undefined || body.includes(text)) && (textGone === undefined || !body.includes(textGone))
          }, timeout)
        } catch (e) {
          if (e instanceof error.TimeoutError) {
            const what = text !== undefined ? `${JSON.stringify(text)} to appear` : `${JSON.stringify(textGone)} to go`
            throw new ToolError(`Timed out after ${timeout / 1000}s waiting for ${what}.`)
          }
          throw e
        }
      }
      const parts = []
      if (time !== undefined) parts.push(`${time}s`)
      if (text !== undefined) parts.push(`text ${JSON.stringify(text)}`)
      if (textGone !== undefined) parts.push(`${JSON.stringify(textGone)} to go`)
      return actionResult(ctx, `Waited for ${parts.join(', ')}`)
    },
  },
  {
    name: 'browser_handle_dialog',
    description: 'Accept or dismiss an open dialog',
    inputSchema: {
      type: 'object',
      properties: {
        accept: { type: 'boolean' },
        promptText: { type: 'string', description: 'Text to enter in a prompt dialog' },
      },
      required: ['accept'],
    },
    async run(ctx, { accept, promptText }) {
      const driver = await ctx.session.driver()
      let alert
      try {
        alert = await driver.switchTo().alert()
      } catch (e) {
        if (e instanceof error.NoSuchAlertError) throw new ToolError('No dialog is open.')
        throw e
      }
      const text = await alert.getText()
      if (promptText !== undefined) await alert.sendKeys(promptText)
      if (accept) await alert.accept()
      else await alert.dismiss()
      return actionResult(ctx, `${accept ? 'Accepted' : 'Dismissed'} dialog ${JSON.stringify(text)}`)
    },
  },
]

module.exports = { tools, parseChecked, parseKey, setSliderValue }
