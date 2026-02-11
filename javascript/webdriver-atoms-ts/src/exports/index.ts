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
 * Public API for WebDriver Atoms TypeScript library.
 *
 * This module provides the complete public API for WebDriver atoms,
 * combining script execution, element manipulation, and storage access
 * into a unified interface.
 */

// ============================================================================
// Phase 1: Script Execution
// ============================================================================

export { executeScript, executeAsyncScript, getWindow } from '../inject';
export type { JsonWindow } from '../inject';

// ============================================================================
// Phase 2: Storage Access
// ============================================================================

// Local Storage
export {
    setItem as localStorageSetItem,
    getItem as localStorageGetItem,
    removeItem as localStorageRemoveItem,
    clear as localStorageClear,
    size as localStorageSize,
    key as localStorageKey,
    keySet as localStorageKeySet
} from '../storage/local_storage';

// Session Storage
export {
    setItem as sessionStorageSetItem,
    getItem as sessionStorageGetItem,
    removeItem as sessionStorageRemoveItem,
    clear as sessionStorageClear,
    size as sessionStorageSize,
    key as sessionStorageKey,
    keySet as sessionStorageKeySet
} from '../storage/session_storage';

// ============================================================================
// Phase 3: Element Manipulation
// ============================================================================

// Element properties and manipulation
export {
    isSelected,
    getLocation,
    getLocationInView,
    getText,
    type as elementType,
    Size,
    Rect
} from '../element';

// Element attributes
export {
    get as attributeGet,
    set as attributeSet,
    remove as attributeRemove,
    has as attributeHas
} from '../attribute';

// Element inputs and events
export {
    sendKeys,
    click,
    mouseMove,
    mouseButtonDown,
    mouseButtonUp,
    doubleClick,
    rightClick,
    mouseClick
} from '../inputs';

// ============================================================================
// Phase 4: Inject Wrappers (Advanced)
// ============================================================================

// Script execution with serialized window support
export {
    executeScript as injectedExecuteScript,
    executeAsyncScript as injectedExecuteAsyncScript,
    getWindow as getInjectedWindow,
    WINDOW_KEY,
    type SerializedWindow
} from '../inject/execute_script';

// Element actions
export {
    type as injectedType,
    submit,
    clear as injectedClear,
    click as injectedClick,
    doubleClick as injectedDoubleClick,
    rightClick as injectedRightClick,
    type JsonElement,
    type JsonWindow as JsonWindowAlias
} from '../inject/action';

// DOM queries
export {
    getText as injectedGetText,
    isSelected as injectedIsSelected,
    getTopLeftCoordinates,
    getAttribute as injectedGetAttribute,
    isDisplayed,
    getSize,
    type Coordinate
} from '../inject/dom';

// Element finding
export {
    findElement,
    findElements,
    type Strategy
} from '../inject/find_element';

// Frame navigation
export {
    findFrameByIdOrName,
    activeElement,
    parentFrame,
    findFrameByIndex
} from '../inject/frame';

// Storage access via injection
export {
    setItem as injectedSetItem,
    getItem as injectedGetItem,
    keySet as injectedKeySet,
    removeItem as injectedRemoveItem,
    clear as injectedClear_local
} from '../inject/local_storage';

export {
    setItem as injectedSessionSetItem,
    getItem as injectedSessionGetItem,
    keySet as injectedSessionKeySet,
    removeItem as injectedSessionRemoveItem,
    clear as injectedSessionClear
} from '../inject/session_storage';

// ============================================================================
// Export namespace for convenience
// ============================================================================

/**
 * Local Storage operations.
 */
export * as LocalStorage from '../storage/local_storage';

/**
 * Session Storage operations.
 */
export * as SessionStorage from '../storage/session_storage';

/**
 * Injected element operations.
 */
export * as InjectedElement from '../inject/action';

/**
 * Injected DOM queries.
 */
export * as InjectedDOM from '../inject/dom';

/**
 * Frame navigation operations.
 */
export * as Frames from '../inject/frame';

// ============================================================================
// Phase 6: Element Locators
// ============================================================================

export {
    add as addLocatorStrategy,
    type LocatorStrategy
} from '../locators';

/**
 * Element locator strategies and finder functions.
 */
export * as Locators from '../locators';
