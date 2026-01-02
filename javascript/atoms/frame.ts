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
 * @fileoverview Atoms for frame handling.
 */

import { getWindow } from './bot';
import { BotError, ErrorCode } from './error';
import { isElement } from './dom';
import { findElements } from './locators/locators';

// Type declarations for frame-related DOM types
interface FrameElement extends HTMLElement {
  contentWindow: Window | null;
  name: string;
}

/**
 * Gets the frame content window from a frame element.
 */
function getFrameContentWindow(
  frame: HTMLFrameElement | HTMLIFrameElement
): Window | null {
  return frame.contentWindow;
}

/**
 * Returns whether an element is a frame (or iframe).
 */
function isFrame_(element: Element): element is HTMLFrameElement | HTMLIFrameElement {
  return isElement(element, 'FRAME') || isElement(element, 'IFRAME');
}

/**
 * @return The top window.
 */
export function defaultContent(): Window {
  const win = getWindow();
  return win.top || win;
}

/**
 * @return The currently active element.
 */
export function activeElement(): Element {
  return document.activeElement || document.body;
}

/**
 * Gets the parent frame of the specified frame.
 */
export function parentFrame(opt_root?: Window): Window {
  const domWindow = opt_root || getWindow();
  return domWindow.parent;
}

/**
 * Returns a reference to the window object corresponding to the given element.
 * Note that the element must be a frame or an iframe.
 */
export function getFrameWindow(
  element: HTMLIFrameElement | HTMLFrameElement
): Window | null {
  if (isFrame_(element)) {
    return getFrameContentWindow(element);
  }
  throw new BotError(
    ErrorCode.NO_SUCH_FRAME,
    "The given element isn't a frame or an iframe."
  );
}

/**
 * Looks for a frame by its name or id (preferring name over id)
 * under the given root. If no frame was found, we look for an
 * iframe by name or id.
 */
export function findFrameByNameOrId(
  nameOrId: string | number,
  opt_root?: Window
): Window | null {
  const domWindow = opt_root || getWindow();

  // Lookup frame by name
  const numFrames = domWindow.frames.length;
  for (let i = 0; i < numFrames; i++) {
    const frame = domWindow.frames[i] as Window;
    // frameElement can be accessed from within the frame
    const frameElement = (frame as Window & { frameElement?: FrameElement }).frameElement || (frame as unknown as FrameElement);
    if (frameElement.name == nameOrId) {
      // This is needed because Safari 4 returns
      // an HTMLFrameElement instead of a Window object.
      if ((frame as Window).document) {
        return frame;
      } else {
        return getFrameContentWindow(frameElement as HTMLFrameElement | HTMLIFrameElement);
      }
    }
  }

  // Lookup frame by id
  const elements = findElements({ id: nameOrId }, domWindow.document);
  for (let i = 0; i < elements.length; i++) {
    const frameElement = elements[i];
    if (frameElement && isFrame_(frameElement)) {
      return getFrameContentWindow(frameElement);
    }
  }
  return null;
}

/**
 * Looks for a frame by its index under the given root.
 */
export function findFrameByIndex(index: number, opt_root?: Window): Window | null {
  const domWindow = opt_root || getWindow();
  return (domWindow.frames[index] as Window) || null;
}

/**
 * Gets the index of a frame in the given window. Note that the element must
 * be a frame or an iframe.
 */
export function getFrameIndex(
  element: HTMLIFrameElement | HTMLFrameElement,
  opt_root?: Window
): number | null {
  let elementWindow: Window | null;
  try {
    elementWindow = element.contentWindow;
  } catch (e) {
    // Happens in IE{7,8} if a frame doesn't have an enclosing frameset.
    return null;
  }

  if (!isFrame_(element)) {
    return null;
  }

  const domWindow = opt_root || getWindow();
  for (let i = 0; i < domWindow.frames.length; i++) {
    if (elementWindow === domWindow.frames[i]) {
      return i;
    }
  }
  return null;
}
