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

// Specifiers carry the emitted .js extension because Node's ESM resolver does
// not probe for extensions. "module": "esnext" rewrites nothing, so what is
// written here is what consumers resolve against.
export { default as getAttribute } from './typescript/get-attribute.js'
export { default as findElements } from './typescript/find-elements.js'
export { default as findElement } from './typescript/find-element.js'
export { default as activeElement } from './typescript/active-element.js'
export { default as defaultContent } from './typescript/default-content.js'
export { default as frameByIdOrName } from './typescript/frame-by-id-or-name.js'
export { default as frameByIndex } from './typescript/frame-by-index.js'
export { default as getFrameWindow } from './typescript/get-frame-window.js'
export { default as isDisplayed } from './typescript/is-displayed.js'
export { default as isEnabled } from './typescript/is-enabled.js'
export { default as isSelected } from './typescript/is-selected.js'
export { default as isEditable } from './typescript/is-editable.js'
export { default as isFocusable } from './typescript/is-focusable.js'
export { default as isInteractable } from './typescript/is-interactable.js'
export { default as getAttributeValue } from './typescript/get-attribute-value.js'
export { default as getSize } from './typescript/get-size.js'
export { default as getLocation } from './typescript/get-location.js'
export { default as getEffectiveStyle } from './typescript/get-effective-style.js'
export { default as getValueOfCssProperty } from './typescript/get-effective-style.js'
export { default as getTopLeftCoordinates } from './typescript/get-top-left-coordinates.js'
export { default as getText } from './typescript/get-text.js'
export { default as getLocalStorageItem } from './typescript/get-local-storage-item.js'
export { default as getLocalStorageKey } from './typescript/get-local-storage-key.js'
export { default as getLocalStorageKeys } from './typescript/get-local-storage-keys.js'
export { default as getLocalStorageSize } from './typescript/get-local-storage-size.js'
export { default as setLocalStorageItem } from './typescript/set-local-storage-item.js'
export { default as removeLocalStorageItem } from './typescript/remove-local-storage-item.js'
export { default as clearLocalStorage } from './typescript/clear-local-storage.js'
export { default as getSessionStorageItem } from './typescript/get-session-storage-item.js'
export { default as getSessionStorageKey } from './typescript/get-session-storage-key.js'
export { default as getSessionStorageKeys } from './typescript/get-session-storage-keys.js'
export { default as getSessionStorageSize } from './typescript/get-session-storage-size.js'
export { default as setSessionStorageItem } from './typescript/set-session-storage-item.js'
export { default as removeSessionStorageItem } from './typescript/remove-session-storage-item.js'
export { default as clearSessionStorage } from './typescript/clear-session-storage.js'
export { default as executeScript } from './typescript/execute-script.js'
export { default as executeAsyncScript } from './typescript/execute-async-script.js'
export { default as getElementFromCache } from './typescript/get-element-from-cache.js'
export { default as findElementFragment } from './typescript/find-element-fragment.js'
export { default as click } from './typescript/click.js'
export { default as type } from './typescript/type.js'
export { default as clear } from './typescript/clear.js'
export { default as submit } from './typescript/submit.js'
export { default as accessibilitySnapshot } from './typescript/accessibility-snapshot.js'
export type { AccessibilityNode, StateValue } from './typescript/accessibility-snapshot.js'
export { default as accessibilitySnapshotWire } from './typescript/accessibility-snapshot-wire.js'
export type { WireError, WireNode, WireSnapshot } from './typescript/accessibility-snapshot-wire.js'
