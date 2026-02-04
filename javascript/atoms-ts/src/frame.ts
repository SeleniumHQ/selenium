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
 * Frame handling utilities for navigating between windows and frames.
 * Provides methods to locate frames by name, id, or index.
 */

import { WebDriverError, ErrorCode } from './error';
import { getWindow } from './bot';
import { isElement } from './domcore';

/**
 * Returns the top-level window (default content).
 *
 * @returns The top window of the current frame hierarchy
 *
 * @example
 * defaultContent() // window.top
 */
export function defaultContent(): Window {
    return getWindow().top!;
}

/**
 * Returns the currently active element in the document.
 * Falls back to document.body if no element is currently focused.
 *
 * @returns The currently active element
 *
 * @example
 * activeElement() // returns document.activeElement or document.body
 */
export function activeElement(): Element {
    return document.activeElement || document.body || document.documentElement;
}

/**
 * Gets the parent frame of the specified window.
 *
 * @param optRoot Optional window to get the parent of. Defaults to the current window.
 * @returns The parent window (or self if at top level)
 *
 * @example
 * parentFrame() // returns parent window
 */
export function parentFrame(optRoot?: Window): Window {
    const domWindow = optRoot || getWindow();
    return domWindow.parent || domWindow;
}

/**
 * Tests whether an element is a frame or iframe.
 *
 * @param element The element to test
 * @returns true if the element is a FRAME or IFRAME
 */
function isFrame(element: Element): element is HTMLFrameElement | HTMLIFrameElement {
    return (
        isElement(element, 'FRAME') || isElement(element, 'IFRAME')
    );
}

/**
 * Returns a reference to the window object corresponding to the given frame or iframe element.
 *
 * @param element The frame or iframe element
 * @returns The window reference for the given element
 * @throws WebDriverError if the element is not a frame or iframe
 *
 * @example
 * const iframe = document.querySelector('iframe');
 * getFrameWindow(iframe) // returns the iframe's contentWindow
 */
export function getFrameWindow(element: HTMLFrameElement | HTMLIFrameElement): Window {
    if (isFrame(element)) {
        return element.contentWindow!;
    }
    throw new WebDriverError(
        ErrorCode.NO_SUCH_FRAME,
        "The given element isn't a frame or an iframe."
    );
}

/**
 * Looks for a frame by its name or id (preferring name over id).
 * First searches accessible frames, then iframes in the document.
 *
 * @param nameOrId The frame's name, id, or numeric index as a string
 * @param optRoot Optional window to search under. Defaults to the current window.
 * @returns The window if found, null otherwise
 *
 * @example
 * findFrameByNameOrId('myFrame')      // finds frame by name
 * findFrameByNameOrId('frameId')      // finds frame by id
 */
export function findFrameByNameOrId(nameOrId: string | number, optRoot?: Window): Window | null {
    const domWindow = optRoot || getWindow();
    const nameOrIdStr = String(nameOrId);

    // Search by name in frames collection
    const frames = domWindow.frames;
    for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const frameElement = frame.frameElement as HTMLFrameElement | HTMLIFrameElement | null;
        if (frameElement && frameElement.name === nameOrIdStr) {
            return frame;
        }
    }

    // Search by id in the document
    try {
        const element = domWindow.document.getElementById(nameOrIdStr);
        if (element && isFrame(element)) {
            return element.contentWindow;
        }
    } catch {
        // Cross-origin access or other error
    }

    return null;
}

/**
 * Looks for a frame by its index in the window's frames collection.
 *
 * @param index The zero-based frame index
 * @param optRoot Optional window to search under. Defaults to the current window.
 * @returns The frame window if found, null otherwise
 *
 * @example
 * findFrameByIndex(0)  // returns first frame
 * findFrameByIndex(1)  // returns second frame
 */
export function findFrameByIndex(index: number, optRoot?: Window): Window | null {
    const domWindow = optRoot || getWindow();
    return (domWindow.frames[index] as Window) || null;
}

/**
 * Gets the index of a frame element within its parent window.
 *
 * @param element The frame or iframe element to locate
 * @param optRoot Optional window to search under. Defaults to the current window.
 * @returns The zero-based frame index, or null if not found
 *
 * @example
 * const iframe = document.querySelector('iframe');
 * getFrameIndex(iframe) // returns 0 if it's the first frame
 */
export function getFrameIndex(
    element: HTMLFrameElement | HTMLIFrameElement,
    optRoot?: Window
): number | null {
    if (!isFrame(element)) {
        return null;
    }

    let elementWindow: Window | null = null;
    try {
        elementWindow = element.contentWindow;
    } catch {
        // Blocked by cross-origin policy or other error
        return null;
    }

    if (!elementWindow) {
        return null;
    }

    const domWindow = optRoot || getWindow();
    const frames = domWindow.frames;
    for (let i = 0; i < frames.length; i++) {
        if (elementWindow === frames[i]) {
            return i;
        }
    }

    return null;
}
