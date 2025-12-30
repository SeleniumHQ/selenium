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
 * @fileoverview Overall configuration of the browser automation atoms.
 */

/**
 * Frameworks using the atoms keep track of which window or frame is currently
 * being used for command execution. Note that "window" may not always be
 * defined (for example in firefox extensions)
 */
let currentWindow: Window;

try {
  currentWindow = window;
} catch (ignored) {
  // We only reach this place in a firefox extension.
  currentWindow = globalThis as any as Window;
}

/**
 * Returns the window currently being used for command execution.
 *
 * @return The window for command execution.
 */
export function getWindow(): Window {
  return currentWindow;
}

/**
 * Sets the window to be used for command execution.
 *
 * @param win The window for command execution.
 */
export function setWindow(win: Window): void {
  currentWindow = win;
}

/**
 * Returns the document of the window currently being used for
 * command execution.
 *
 * @return The current window's document.
 */
export function getDocument(): Document {
  return currentWindow.document;
}
