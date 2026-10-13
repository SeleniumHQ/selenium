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

import {
  JAVASCRIPT_ERROR,
  NO_SUCH_WINDOW,
  SCRIPT_TIMEOUT,
  STALE_ELEMENT_REFERENCE,
  UNKNOWN_ERROR,
  botError,
} from './error.js'

// bot.inject: the element cache, the {ELEMENT}/{WINDOW} handle format and the
// {status, value} response envelope that injected scripts talk through.
//
// Statuses are W3C error strings, and success is 'success'. bot.inject sent
// bot.ErrorCode numbers (0, 10, 28...), the JSON wire protocol's encoding;
// a consumer that compared against those numbers has to compare strings now.

export const ELEMENT_KEY = 'ELEMENT'
export const WINDOW_KEY = 'WINDOW'
export const SUCCESS = 'success'

// Both live on the document rather than in module state because every atom is
// a separate bundle with its own module scope: the document is the only thing
// two injected atoms share. They must stay byte-identical to bot.inject.cache,
// or an id minted by a Closure atom is stale to a TypeScript one and the
// reverse, for as long as both kinds are injected into the same page.
const CACHE_KEY = '$wdc_'
const ELEMENT_KEY_PREFIX = ':wdc:'

export interface Response {
  status: string
  value: unknown
}

type Cacheable = Element | Document | Window
type Cache = Record<string, unknown> & { nextId: number }

function getCache(optDoc?: Document | null): Cache {
  const doc = (optDoc || document) as unknown as Record<string, Cache | undefined>
  let cache = doc[CACHE_KEY]
  if (!cache) {
    // The id counter lives in the cache so it resets whenever the cache does.
    cache = doc[CACHE_KEY] = { nextId: Date.now() } as Cache
  }
  // The original notes nextId sometimes reads back as NaN; reseed rather than
  // mint ':wdc:NaN'.
  if (!cache.nextId) {
    cache.nextId = Date.now()
  }
  return cache
}

// Keyed by the owning document, so a window -- which has no ownerDocument --
// and a document both land in the current document's cache.
export function addElement(el: Cacheable): string {
  const cache = getCache((el as Element).ownerDocument)
  for (const key in cache) {
    if (cache[key] == el) {
      return key
    }
  }
  const id = ELEMENT_KEY_PREFIX + cache.nextId++
  cache[id] = el
  return id
}

// Stale rather than no-such-element for an unknown key: the id may have come
// from a previous document's cache, which is gone after a navigation.
export function getElement(key: string, optDoc?: Document): Element | Window {
  key = decodeURIComponent(key)
  const doc = optDoc || document
  const cache = getCache(doc)
  if (!(key in cache)) {
    throw botError(STALE_ELEMENT_REFERENCE, 'Element does not exist in cache')
  }

  const el = cache[key] as Record<string, unknown>

  if ('setInterval' in el) {
    if (el['closed']) {
      delete cache[key]
      throw botError(NO_SUCH_WINDOW, 'Window has been closed.')
    }
    return el as unknown as Window
  }

  // Attached means reachable from the documentElement, stepping out of shadow
  // roots through their host.
  let node = el as unknown as Node | null
  while (node) {
    if (node == doc.documentElement) {
      return el as unknown as Element
    }
    if ((node as ShadowRoot).host && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
      node = (node as ShadowRoot).host
    }
    node = node.parentNode
  }
  delete cache[key]
  throw botError(STALE_ELEMENT_REFERENCE, 'Element is no longer attached to the DOM')
}

function isArrayLike(value: object): value is ArrayLike<unknown> {
  return typeof (value as { length?: unknown }).length == 'number'
}

// Makes a value JSON-safe: elements and documents become {ELEMENT: id},
// windows {WINDOW: id}, functions their source, undefined null, and other
// objects are walked keeping only string keys.
//
// `seen` is never popped, so an object reached twice through different paths
// -- not a cycle, just shared -- is reported as recursive too. Inherited from
// bot.inject.wrapValue; kept because it is what consumers get today.
export function wrapValue(value: unknown): unknown {
  const seen: object[] = []
  const wrap = (value: unknown): unknown => {
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        return value
      case 'function':
        return value.toString()
      case 'object': {
        if (value === null) {
          return null
        }
        // A real Array is mapped without joining `seen` -- goog.typeOf calls it
        // 'array', not 'object' -- so the same array twice is not "recursive".
        if (Array.isArray(value)) {
          return value.map(wrap)
        }
        if (seen.indexOf(value) >= 0) {
          throw botError(JAVASCRIPT_ERROR, 'Recursive object cannot be transferred')
        }

        // Duck-typed rather than instanceof, which is false for a node from
        // another frame's realm.
        const nodeType = (value as { nodeType?: unknown }).nodeType
        if ('nodeType' in value && (nodeType == Node.ELEMENT_NODE || nodeType == Node.DOCUMENT_NODE)) {
          return { [ELEMENT_KEY]: addElement(value as Element) }
        }
        if ('document' in value) {
          return { [WINDOW_KEY]: addElement(value as Window) }
        }

        seen.push(value)
        if (isArrayLike(value)) {
          return Array.prototype.map.call(value, wrap)
        }
        const result: Record<string, unknown> = {}
        for (const key in value) {
          result[key] = wrap((value as Record<string, unknown>)[key])
        }
        return result
      }
      default:
        return null
    }
  }
  return wrap(value)
}

// Resolves {ELEMENT}/{WINDOW} handles against optDoc's cache. Functions pass
// through untouched so a script can be handed a callback.
export function unwrapValue(value: unknown, optDoc?: Document): unknown {
  if (Array.isArray(value)) {
    return value.map((v) => unwrapValue(v, optDoc))
  }
  if (typeof value == 'function') {
    return value
  }
  if (value !== null && typeof value == 'object') {
    const obj = value as Record<string, unknown>
    if (ELEMENT_KEY in obj) {
      return getElement(obj[ELEMENT_KEY] as string, optDoc)
    }
    if (WINDOW_KEY in obj) {
      return getElement(obj[WINDOW_KEY] as string, optDoc)
    }
    const result: Record<string, unknown> = {}
    for (const key in obj) {
      result[key] = unwrapValue(obj[key], optDoc)
    }
    return result
  }
  return value
}

export function wrapResponse(value: unknown): Response {
  return { status: SUCCESS, value: wrapValue(value) }
}

// Only a string code is a status. A DOMException carries a legacy numeric
// `code` (12 for a bad selector), which would otherwise leak through as one.
export function wrapError(err: unknown): Response {
  const code = (err as { code?: unknown } | null)?.code
  return {
    status: typeof code == 'string' ? code : UNKNOWN_ERROR,
    value: { message: (err as Error | null)?.message },
  }
}

// Compiles `fn` in the target window's realm so that globals it names resolve
// there. A string is a function body; a function is recompiled from its
// source, which assumes it closes over nothing outside that window.
function recompileFunction(fn: Function | string, theWindow: Window): Function {
  const WindowFunction = (theWindow as unknown as { Function: FunctionConstructor }).Function
  if (typeof fn === 'string') {
    return new WindowFunction(fn)
  }
  return theWindow == window ? fn : new WindowFunction('return (' + fn + ').apply(null,arguments);')
}

export function executeScript(
  fn: Function | string,
  args: unknown[],
  optStringify?: boolean,
  optWindow?: Window,
): string | Response {
  const win = optWindow || window
  let ret: Response
  try {
    const compiled = recompileFunction(fn, win)
    const unwrappedArgs = unwrapValue(args, win.document) as unknown[]
    ret = wrapResponse(compiled.apply(null, unwrappedArgs))
  } catch (ex) {
    ret = wrapError(ex)
  }
  return optStringify ? JSON.stringify(ret) : ret
}

// The script finishes by calling the callback appended as its last argument.
// onDone is always called exactly once: with that value, with the error the
// script threw, on timeout, or when the window unloads underneath it.
export function executeAsyncScript(
  fn: Function | string,
  args: unknown[],
  timeout: number,
  onDone: (result: string | Response) => void,
  optStringify?: boolean,
  optWindow?: Window,
): void {
  const win = optWindow || window
  let timeoutId: number | undefined
  let responseSent = false

  function onunload(): void {
    sendResponse(
      UNKNOWN_ERROR,
      Error('Detected a page unload event; asynchronous script execution does not work across page loads.'),
    )
  }

  function sendResponse(status: string, value: unknown): void {
    if (responseSent) {
      return
    }
    win.removeEventListener('unload', onunload, true)
    win.clearTimeout(timeoutId)
    let response: Response
    if (status != SUCCESS) {
      const cause = value as { message?: string; stack?: string }
      const err = botError(status, cause.message || value + '')
      err.stack = cause.stack
      response = wrapError(err)
    } else {
      response = wrapResponse(value)
    }
    onDone(optStringify ? JSON.stringify(response) : response)
    responseSent = true
  }

  if (win.closed) {
    sendResponse(UNKNOWN_ERROR, 'Unable to execute script; the target window is closed.')
    return
  }

  const compiled = recompileFunction(fn, win)
  const unwrappedArgs = unwrapValue(args, win.document) as unknown[]
  unwrappedArgs.push((value: unknown) => sendResponse(SUCCESS, value))

  win.addEventListener('unload', onunload, true)

  const startTime = Date.now()
  try {
    compiled.apply(win, unwrappedArgs)

    // Armed after the call, so a script that calls back from a zero-length
    // timer is not beaten to it by its own timeout.
    timeoutId = win.setTimeout(() => {
      sendResponse(
        SCRIPT_TIMEOUT,
        Error('Timed out waiting for asynchronous script result after ' + (Date.now() - startTime) + ' ms'),
      )
    }, Math.max(0, timeout))
  } catch (ex) {
    const code = (ex as { code?: unknown }).code
    sendResponse(typeof code == 'string' ? code : UNKNOWN_ERROR, ex)
  }
}

// webdriver.atoms.inject.getWindow: the window named by a {WINDOW: id} handle,
// or the current one.
export function getWindow(optWindow?: { [WINDOW_KEY]: string }): Window {
  return optWindow ? (getElement(optWindow[WINDOW_KEY]) as Window) : window
}
