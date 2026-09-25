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

const fs = require('node:fs/promises')
const path = require('node:path')
const command = require('./command')
const error = require('./error')
const Symbols = require('./symbols')
const { Zip } = require('../io/zip')

/**
 * A browser extension installed via {@link ./webdriver.WebDriver#installWebExtension}.
 * Wraps the identifier the browser assigned; pass it to
 * {@link ./webdriver.WebDriver#uninstallWebExtension}.
 */
class WebExtension {
  /**
   * @param {string} id identifier assigned to the extension by the browser.
   * @package
   */
  constructor(id) {
    /** @const {string} identifier assigned to the extension by the browser. */
    this.id = id
    // A public field, frozen, rather than a private field behind a getter, so logging an
    // extension shows its id instead of an empty `WebExtension {}`.
    Object.freeze(this)
  }
}

/**
 * @param {!./webdriver.WebDriver} driver
 * @return {!Promise<boolean>} whether the session was created with BiDi enabled.
 */
async function isBidiEnabled(driver) {
  const caps = await driver.getCapabilities()
  return Boolean(caps.get('webSocketUrl'))
}

/**
 * @param {string} method the driver method that needs BiDi.
 * @return {!error.UnsupportedOperationError}
 */
function bidiRequired(method) {
  return new error.UnsupportedOperationError(
    `${method} requires BiDi; enable it with options.enableBidi() before creating the session`,
  )
}

/**
 * Checks the install options against the ones this browser honors, so an option it would drop
 * (another browser's, or a misspelled one) fails instead of being silently ignored.
 * @param {*} options the options passed to installWebExtension.
 * @param {!Array<string>} supported the boolean options this browser honors.
 * @param {string} browser the browser name, for the error message.
 * @return {!Object<string, boolean>} the options that were set.
 * @throws {error.InvalidArgumentError} on an unsupported option or a non-boolean value.
 */
function checkInstallOptions(options, supported, browser) {
  if (options === undefined) {
    return {}
  }
  if (typeof options !== 'object' || options === null || Array.isArray(options)) {
    throw new error.InvalidArgumentError('installWebExtension options must be an object')
  }
  const set = {}
  for (const [key, value] of Object.entries(options)) {
    if (value === undefined) continue
    if (!supported.includes(key)) {
      const allowed = supported.length ? `supports only ${supported.join(', ')}` : 'supports no options'
      throw new error.InvalidArgumentError(`installWebExtension on ${browser} ${allowed}; got "${key}"`)
    }
    if (typeof value !== 'boolean') {
      throw new error.InvalidArgumentError(`installWebExtension option "${key}" must be a boolean`)
    }
    set[key] = value
  }
  return set
}

/**
 * @param {*} extension the value passed to uninstallWebExtension.
 * @return {string} the wrapped id.
 * @throws {error.InvalidArgumentError} if `extension` is not a {@link WebExtension}.
 */
function extensionId(extension) {
  if (!(extension instanceof WebExtension)) {
    throw new error.InvalidArgumentError(
      'uninstallWebExtension expects the WebExtension returned by installWebExtension',
    )
  }
  return extension.id
}

/**
 * The extension as base64 bytes: a directory is zipped, a file read, and anything else is
 * taken to already be base64-encoded.
 * @param {string} extension
 * @return {!Promise<string>}
 */
async function encodeExtension(extension) {
  checkExtensionArg(extension)
  const stats = await statOrNull(extension)
  if (stats?.isDirectory()) {
    const zip = new Zip()
    await zip.addDir(extension)
    return (await zip.toBuffer('DEFLATE')).toString('base64')
  }
  if (stats?.isFile()) {
    return (await fs.readFile(extension)).toString('base64')
  }
  return asBase64(extension)
}

/**
 * The BiDi `webExtension.ExtensionData` for `extension`. A directory only resolves on the
 * machine running the browser, so unless the session runs on a driver service this client
 * started (see {@link Symbols.localDriverService}) it is uploaded first; an archive or base64
 * bytes travel inline.
 * @param {!./webdriver.WebDriver} driver
 * @param {string} extension
 * @return {!Promise<{type: string, path: (string|undefined), value: (string|undefined)}>}
 */
async function extensionData(driver, extension) {
  checkExtensionArg(extension)
  const stats = await statOrNull(extension)
  if (stats?.isDirectory()) {
    const dir = path.resolve(extension)
    const local = driver.getExecutor()[Symbols.localDriverService] === true
    return { type: 'path', path: local ? dir : await uploadDirectory(driver, dir) }
  }
  return { type: 'base64', value: await encodeExtension(extension) }
}

/**
 * Uploads `dir` to the remote end and returns the path it was unpacked to there.
 * @param {!./webdriver.WebDriver} driver
 * @param {string} dir absolute path of the directory.
 * @return {!Promise<string>}
 */
async function uploadDirectory(driver, dir) {
  // The endpoint returns the path of the archive's single top-level entry, so keep the
  // directory itself as that entry rather than flattening its contents.
  const zip = new Zip()
  await zip.addDir(dir, path.basename(dir))
  const encoded = (await zip.toBuffer('DEFLATE')).toString('base64')
  return driver.execute(new command.Command(command.Name.UPLOAD_FILE).setParameter('file', encoded))
}

async function statOrNull(file) {
  try {
    return await fs.stat(file)
  } catch (err) {
    if (err.code === 'ENOENT' || err.code === 'ENAMETOOLONG') {
      return null
    }
    throw err
  }
}

function checkExtensionArg(extension) {
  if (typeof extension !== 'string' || extension === '') {
    throw new error.InvalidArgumentError(
      `installWebExtension expects a path or a base64 string, got ${extension === '' ? 'an empty string' : typeof extension}`,
    )
  }
}

// Leading bytes of a packed extension: a zip (.xpi, .zip) or a Chrome .crx.
const ARCHIVE_SIGNATURES = [Buffer.from('PK\x03\x04', 'latin1'), Buffer.from('Cr24', 'latin1')]

/**
 * `value` itself, if it is base64 of a packed extension. Checking the decoded bytes, not just the
 * alphabet, matters: a mistyped relative path such as `extensions/myext` is valid base64 too, and
 * sending it would surface as an unrelated error from the browser.
 * @param {string} value
 * @return {string}
 * @throws {error.InvalidArgumentError} if it is neither.
 */
function asBase64(value) {
  const bytes = /^[A-Za-z0-9+/]+={0,2}$/.test(value) ? Buffer.from(value, 'base64') : null
  if (!bytes || !ARCHIVE_SIGNATURES.some((signature) => bytes.subarray(0, signature.length).equals(signature))) {
    throw new error.InvalidArgumentError(
      `No such file or directory, and not base64 of a packed extension (.xpi/.zip/.crx): ${truncate(value)}`,
    )
  }
  return value
}

function truncate(value, max = 80) {
  return value.length > max ? `${value.slice(0, max)}...` : value
}

module.exports = {
  WebExtension,
  // Package-internal helpers shared by WebDriver and firefox.Driver; not re-exported from index.js.
  bidiRequired,
  checkInstallOptions,
  encodeExtension,
  extensionData,
  extensionId,
  isBidiEnabled,
}
