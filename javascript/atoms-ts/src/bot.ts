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
 * Window and document management for the Selenium Atoms.
 * Frameworks using the atoms keep track of which window or frame is currently
 * being used for command execution.
 */

/**
 * The window currently being used for command execution.
 * Defaults to the global window object in browser environments.
 */
let currentWindow: Window = window;

/**
 * Returns the window currently being used for command execution.
 * This allows frameworks to manage execution context across multiple windows and frames.
 *
 * @returns The window for command execution
 */
export const getWindow = (): Window => {
    return currentWindow;
};

/**
 * Sets the window to be used for command execution.
 * Frameworks use this to switch the execution context between windows or frames.
 *
 * @param win The window for command execution
 */
export const setWindow = (win: Window): void => {
    currentWindow = win;
};

/**
 * Returns the document of the window currently being used for command execution.
 *
 * @returns The current window's document
 */
export const getDocument = (): Document => {
    return currentWindow.document;
};
