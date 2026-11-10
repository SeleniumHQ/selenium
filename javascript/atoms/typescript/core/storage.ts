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

import { UNKNOWN_ERROR, botError } from './error.js'

// A wrapper over one HTML5 web storage map, mirroring bot.storage.Storage.
//
// The return shapes here are the wire contract -- keySet gives a real Array,
// the single-value reads give string-or-null -- so consumers that parse the
// JSON these atoms send back keep working unchanged.
export class WebStorage {
  private readonly storageMap: Storage

  constructor(storageMap: Storage) {
    this.storageMap = storageMap
  }

  // Values are coerced with `value + ''` before storing. Browsers disagreed
  // about what a null value round-trips as -- Firefox reported <null>, Chrome
  // the string "null" -- so bot.storage.Storage picked the string form and
  // made every browser agree. Changing that would change what callers read
  // back. (html5/storage.js:105)
  setItem(key: string, value: unknown): void {
    try {
      this.storageMap.setItem(key, value + '')
    } catch (error) {
      // Typically a quota overrun, which surfaces as the storage atom failing
      // rather than as a silent no-op.
      throw botError(UNKNOWN_ERROR, (error as Error).message)
    }
  }

  getItem(key: string): string | null {
    return this.storageMap.getItem(key)
  }

  // An Array, not the live key list: Appium and the bindings parse this.
  keySet(): string[] {
    const keys: string[] = []
    const length = this.size()
    for (let i = 0; i < length; i++) {
      keys[i] = this.storageMap.key(i) as string
    }
    return keys
  }

  // Returns the value that was removed, so callers get it without a separate
  // read, or null when the key was not present.
  removeItem(key: string): string | null {
    const value = this.getItem(key)
    this.storageMap.removeItem(key)
    return value
  }

  clear(): void {
    this.storageMap.clear()
  }

  size(): number {
    return this.storageMap.length
  }

  key(index: number): string | null {
    return this.storageMap.key(index)
  }
}

// Reading window.localStorage throws a SecurityError when the browser has
// blocked storage -- a third-party frame, or cookies turned off -- rather than
// returning null, which the original's plain null check predated. Both end up
// as the same "undefined" error either way.
function openStorage(win: Window, name: 'localStorage' | 'sessionStorage', message: string): WebStorage {
  let storageMap: Storage | null = null
  try {
    storageMap = win[name]
  } catch (_blocked) {
    storageMap = null
  }

  if (!storageMap) {
    throw botError(UNKNOWN_ERROR, message)
  }

  return new WebStorage(storageMap)
}

// The window defaults to the one the atom is running in. Closure went through
// bot.getWindow() because the inject layer retargets command execution at a
// frame; an atom called directly is already inside the frame it is asking
// about, and optWindow remains for callers that mean a different one.
export function getLocalStorage(optWindow?: Window): WebStorage {
  return openStorage(optWindow || window, 'localStorage', 'Local storage undefined')
}

export function getSessionStorage(optWindow?: Window): WebStorage {
  return openStorage(optWindow || window, 'sessionStorage', 'Session storage undefined')
}
