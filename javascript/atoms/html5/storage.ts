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

/**
 * @fileoverview Atoms for accessing HTML5 web storage maps (localStorage,
 * sessionStorage). These storage objects store each item as a key-value
 * mapping pair.
 */

import { getWindow } from '../bot';
import { BotError, ErrorCode } from '../error';
import { API, isSupported } from './html5';

/**
 * Provides a wrapper object to the HTML5 web storage object.
 */
export class StorageWrapper {
  private storageMap_: Storage;

  constructor(storageMap: Storage) {
    this.storageMap_ = storageMap;
  }

  /**
   * Sets the value item of a key/value pair in the Storage object.
   * If the value given is null, the string 'null' will be inserted instead.
   */
  setItem(key: string, value: unknown): void {
    try {
      // Note: Ideally, browsers should set a null value. But the browsers
      // report arbitrarily. Firefox returns <null>, while Chrome reports
      // the string "null". We are setting the value to the string "null".
      this.storageMap_.setItem(key, value + '');
    } catch (e) {
      throw new BotError(ErrorCode.UNKNOWN_ERROR, (e as Error).message);
    }
  }

  /**
   * Returns the value item of a key in the Storage object.
   */
  getItem(key: string): string | null {
    const value = this.storageMap_.getItem(key);
    return value;
  }

  /**
   * Returns an array of keys of all keys of the Storage object.
   */
  keySet(): (string | null)[] {
    const keys: (string | null)[] = [];
    const length = this.size();
    for (let i = 0; i < length; i++) {
      keys[i] = this.storageMap_.key(i);
    }
    return keys;
  }

  /**
   * Removes an item with a given key.
   */
  removeItem(key: string): string | null {
    const value = this.getItem(key);
    this.storageMap_.removeItem(key);
    return value;
  }

  /**
   * Removes all items.
   */
  clear(): void {
    this.storageMap_.clear();
  }

  /**
   * Returns the number of items in the Storage object.
   */
  size(): number {
    return this.storageMap_.length;
  }

  /**
   * Returns the key item of the key/value pairs in the Storage object
   * of a given index.
   */
  key(index: number): string | null {
    return this.storageMap_.key(index);
  }

  /**
   * Returns HTML5 storage object of the wrapper Storage object.
   */
  getStorageMap(): Storage {
    return this.storageMap_;
  }
}

/**
 * A factory method to create a wrapper to access the HTML5 localStorage object.
 * Note: We are not using Closure from goog.storage,
 * Closure uses "window" object directly, which may not always be
 * defined (for example in firefox extensions).
 * We use bot.window() from bot.js instead to keep track of the window or frame
 * is currently being used for command execution.
 */
export function getLocalStorage(opt_window?: Window): StorageWrapper {
  const win = opt_window || getWindow();

  if (!isSupported(API.LOCAL_STORAGE, win)) {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, 'Local storage undefined');
  }
  const storageMap = win.localStorage;
  return new StorageWrapper(storageMap);
}

/**
 * A factory method to create a wrapper to access the HTML5 sessionStorage object.
 */
export function getSessionStorage(opt_window?: Window): StorageWrapper {
  const win = opt_window || getWindow();

  if (isSupported(API.SESSION_STORAGE, win)) {
    const storageMap = win.sessionStorage;
    return new StorageWrapper(storageMap);
  }
  throw new BotError(ErrorCode.UNKNOWN_ERROR, 'Session storage undefined');
}
