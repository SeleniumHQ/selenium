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

const { error } = require('selenium-webdriver')

const { resolveRef, takeSnapshot } = require('../snapshot')

/** Shared schema fragments, kept short: every agent pays for them each turn. */
const ELEMENT = { type: 'string', description: 'Human-readable element description' }
const REF = { type: 'string', description: 'Element ref from the snapshot, e.g. e12' }

/**
 * An error whose message is meant for the agent as is.
 */
class ToolError extends Error {}

/**
 * @param {!Object} ctx tool context
 * @param {string} ref
 * @return {!Promise<!Object>} the WebElement, with the driver switched into its frame
 */
async function elementFor(ctx, ref) {
  const driver = await ctx.session.driver()
  try {
    return await resolveRef(driver, ctx.session.refs, ref)
  } catch (e) {
    throw new ToolError(e.message)
  }
}

/**
 * Runs `action` on an element, turning a stale handle into advice the agent
 * can act on.
 *
 * @param {string} ref
 * @param {function(): !Promise<T>} action
 * @return {!Promise<T>}
 * @template T
 */
async function onElement(ref, action) {
  try {
    return await action()
  } catch (e) {
    if (e instanceof error.StaleElementReferenceError) {
      throw new ToolError(
        `Ref ${ref} no longer points at an element on the page. Call browser_snapshot to get fresh refs.`,
      )
    }
    if (e instanceof error.ElementNotInteractableError) {
      throw new ToolError(`Ref ${ref} cannot be interacted with (it may be hidden or covered): ${firstLine(e.message)}`)
    }
    if (e instanceof error.ElementClickInterceptedError) {
      throw new ToolError(`Another element would receive the click on ${ref}: ${firstLine(e.message)}`)
    }
    throw e
  }
}

function firstLine(message) {
  return String(message || '').split('\n')[0]
}

/**
 * @param {!Object} driver
 * @return {!Promise<?string>} the text of an open dialog, or null if none
 */
async function openDialogText(driver) {
  try {
    const alert = await driver.switchTo().alert()
    return await alert.getText()
  } catch (e) {
    if (e instanceof error.NoSuchAlertError) return null
    throw e
  }
}

/**
 * Describes the page after a tool has run: URL, title, tabs if more than one,
 * an open dialog, and the snapshot unless one was not asked for.
 *
 * @param {!Object} ctx
 * @param {{snapshot: (boolean|undefined), all: (boolean|undefined)}=} options
 * @return {!Promise<string>}
 */
async function describePage(ctx, options = {}) {
  const driver = await ctx.session.driver()
  const dialog = await openDialogText(driver)
  if (dialog !== null) {
    return [
      '### Modal dialog',
      `A dialog is open: ${JSON.stringify(dialog)}`,
      'Use browser_handle_dialog to accept or dismiss it before doing anything else.',
    ].join('\n')
  }

  const out = []
  await driver.switchTo().defaultContent()
  out.push('### Page', `- URL: ${await driver.getCurrentUrl()}`, `- Title: ${await driver.getTitle()}`)
  const handles = await driver.getAllWindowHandles()
  if (handles.length > 1) {
    const current = await driver.getWindowHandle()
    out.push(`- Tab ${handles.indexOf(current)} of ${handles.length} (see browser_tabs)`)
  }
  if (options.snapshot !== false) {
    let snapshot
    try {
      snapshot = await takeSnapshot(driver, ctx.session.refs, { all: options.all })
    } catch (e) {
      if (e instanceof error.UnexpectedAlertOpenError) return describePage(ctx, options)
      throw e
    }
    out.push('', '### Snapshot', snapshot)
  }
  return out.join('\n')
}

/**
 * @param {string} text
 * @return {{content: !Array<!Object>}}
 */
function textResult(text) {
  return { content: [{ type: 'text', text }] }
}

/**
 * Result for an action: one line saying what happened, then the page.
 *
 * @param {!Object} ctx
 * @param {string} summary
 * @return {!Promise<{content: !Array<!Object>}>}
 */
async function actionResult(ctx, summary) {
  return textResult(`${summary}\n\n${await describePage(ctx)}`)
}

module.exports = {
  ELEMENT,
  REF,
  ToolError,
  actionResult,
  describePage,
  elementFor,
  onElement,
  openDialogText,
  textResult,
}
