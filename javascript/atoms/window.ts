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
 * @fileoverview Atoms for simulating user actions against the browser window.
 */

import { getWindow } from './bot';
import { BotError, ErrorCode } from './error';
import { fire, EventType } from './events';
import { isEngineVersion, ANDROID_PRE_ICECREAMSANDWICH } from './userAgent';

// Browser detection
const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const IS_IE = /MSIE|Trident/.test(userAgent);
const IS_WEBKIT = /AppleWebKit/.test(userAgent);
const IS_MOBILE = /Mobile/.test(userAgent);
const IS_ANDROID = /Android/.test(userAgent);
const IS_IPAD = /iPad/.test(userAgent);

// ============================================================================
// Size and Coordinate types
// ============================================================================

export interface Size {
  width: number;
  height: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

/**
 * Creates a Size object with getShortest/getLongest methods for compatibility.
 */
function createSize(width: number, height: number): Size & { getShortest(): number; getLongest(): number } {
  return {
    width,
    height,
    getShortest() {
      return Math.min(this.width, this.height);
    },
    getLongest() {
      return Math.max(this.width, this.height);
    }
  };
}

// ============================================================================
// Private constants
// ============================================================================

/**
 * Whether the value of history.length includes a newly loaded page.
 */
const HISTORY_LENGTH_INCLUDES_NEW_PAGE_ = !IS_IE;

/**
 * Whether value of history.length includes the pages ahead of the current one
 * in the history.
 */
const HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_ =
  !IS_WEBKIT || isEngineVersion('533');

// ============================================================================
// Orientation enum
// ============================================================================

/**
 * Screen orientation values. From the draft W3C spec.
 */
export enum Orientation {
  PORTRAIT = 'portrait-primary',
  PORTRAIT_SECONDARY = 'portrait-secondary',
  LANDSCAPE = 'landscape-primary',
  LANDSCAPE_SECONDARY = 'landscape-secondary',
}

/**
 * Returns the degrees corresponding to the orientation input.
 */
const getOrientationDegrees_ = (function () {
  let orientationMap: Record<string, number> | undefined;
  return function (orientation: Orientation): number | undefined {
    if (!orientationMap) {
      orientationMap = {};
      if (IS_MOBILE) {
        orientationMap[Orientation.PORTRAIT] = 0;
        orientationMap[Orientation.LANDSCAPE] = 90;
        orientationMap[Orientation.LANDSCAPE_SECONDARY] = -90;
        if (IS_IPAD) {
          orientationMap[Orientation.PORTRAIT_SECONDARY] = 180;
        }
      } else if (IS_ANDROID) {
        orientationMap[Orientation.PORTRAIT] = -90;
        orientationMap[Orientation.LANDSCAPE] = 0;
        orientationMap[Orientation.PORTRAIT_SECONDARY] = 90;
        orientationMap[Orientation.LANDSCAPE_SECONDARY] = 180;
      }
    }
    return orientationMap[orientation];
  };
})();

// ============================================================================
// Private helpers
// ============================================================================

/**
 * Gets the frame element for a window.
 */
function getFrame_(win: Window): HTMLElement | null {
  try {
    return win.frameElement as HTMLElement | null;
  } catch (e) {
    return null;
  }
}

/**
 * Gets the border box of an element.
 */
function getBorderBox(elem: Element): {
  top: number;
  right: number;
  bottom: number;
  left: number;
} {
  const style = window.getComputedStyle(elem);
  return {
    top: parseFloat(style.borderTopWidth) || 0,
    right: parseFloat(style.borderRightWidth) || 0,
    bottom: parseFloat(style.borderBottomWidth) || 0,
    left: parseFloat(style.borderLeftWidth) || 0,
  };
}

/**
 * Gets the viewport size of a window.
 */
function getViewportSize(win: Window): Size {
  const doc = win.document;
  const docEl = doc.documentElement;
  return {
    width: docEl.clientWidth || win.innerWidth,
    height: docEl.clientHeight || win.innerHeight,
  };
}

/**
 * Checks the number of pages to navigate in history.
 */
function checkNumPages_(maxPages: number | null, opt_numPages?: number): number {
  const numPages = opt_numPages !== undefined ? opt_numPages : 1;
  if (numPages <= 0) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'number of pages must be positive'
    );
  }
  if (maxPages !== null && numPages > maxPages) {
    throw new BotError(
      ErrorCode.UNKNOWN_ERROR,
      'number of pages must be less than the length of the browser history'
    );
  }
  return numPages;
}

/**
 * Gets the current window orientation in degrees.
 */
function getCurrentOrientationDegrees_(): number {
  const win = getWindow() as Window & { orientation?: number };
  if (win.orientation === undefined) {
    win.orientation = 0;
  }
  return win.orientation;
}

// ============================================================================
// Public functions
// ============================================================================

/**
 * Go back in the browser history.
 */
export function back(opt_numPages?: number): void {
  const maxPages = HISTORY_LENGTH_INCLUDES_NEW_PAGE_
    ? getWindow().history.length - 1
    : getWindow().history.length;
  const numPages = checkNumPages_(maxPages, opt_numPages);
  getWindow().history.go(-numPages);
}

/**
 * Go forward in the browser history.
 */
export function forward(opt_numPages?: number): void {
  const maxPages = HISTORY_LENGTH_INCLUDES_FORWARD_PAGES_
    ? getWindow().history.length - 1
    : null;
  const numPages = checkNumPages_(maxPages, opt_numPages);
  getWindow().history.go(numPages);
}

/**
 * Determine the size of the window that a user could interact with.
 */
export function getInteractableSize(opt_win?: Window): Size {
  const win = opt_win || getWindow();
  const doc = win.document;
  const elem = doc.documentElement;
  const body = doc.body;
  if (!body) {
    throw new BotError(ErrorCode.UNKNOWN_ERROR, 'No BODY element present');
  }

  const widths = [
    elem.clientWidth,
    elem.scrollWidth,
    elem.offsetWidth,
    body.scrollWidth,
    body.offsetWidth,
  ];
  const heights = [
    elem.clientHeight,
    elem.scrollHeight,
    elem.offsetHeight,
    body.scrollHeight,
    body.offsetHeight,
  ];

  const width = Math.max.apply(null, widths);
  const height = Math.max.apply(null, heights);

  return { width, height };
}

/**
 * Determine the outer size of the window.
 */
export function getSize(opt_win?: Window): Size & { getShortest(): number; getLongest(): number } {
  const win = opt_win || getWindow();
  const frame = getFrame_(win);
  if (ANDROID_PRE_ICECREAMSANDWICH) {
    if (frame) {
      const box = getBorderBox(frame);
      return createSize(
        frame.clientWidth - box.left - box.right,
        frame.clientHeight
      );
    } else {
      return createSize(320, 240);
    }
  } else if (frame) {
    return createSize(frame.clientWidth, frame.clientHeight);
  } else {
    const docElem = win.document.documentElement;
    const body = win.document.body;
    const width =
      win.outerWidth ||
      (docElem && docElem.clientWidth) ||
      (body && body.clientWidth) ||
      0;
    const height =
      win.outerHeight ||
      (docElem && docElem.clientHeight) ||
      (body && body.clientHeight) ||
      0;
    return createSize(width, height);
  }
}

/**
 * Set the outer size of the window.
 */
export function setSize(size: Size, opt_win?: Window): void {
  const win = opt_win || getWindow();
  const frame = getFrame_(win) as HTMLFrameElement | HTMLIFrameElement | null;
  if (frame) {
    frame.style.minHeight = '0px';
    frame.style.minWidth = '0px';
    (frame as HTMLIFrameElement).width = size.width + 'px';
    frame.style.width = size.width + 'px';
    (frame as HTMLIFrameElement).height = size.height + 'px';
    frame.style.height = size.height + 'px';
  } else {
    win.resizeTo(size.width, size.height);
  }
}

/**
 * Determine the scroll position of the window.
 */
export function getScroll(opt_win?: Window): Coordinate {
  const win = opt_win || getWindow();
  const doc = win.document;
  const docEl = doc.documentElement;
  const body = doc.body;

  // Standard way for modern browsers
  if (typeof win.pageXOffset === 'number') {
    return { x: win.pageXOffset, y: win.pageYOffset };
  }

  // For older IE
  if (docEl && (docEl.scrollLeft || docEl.scrollTop)) {
    return { x: docEl.scrollLeft, y: docEl.scrollTop };
  }

  // For quirks mode
  if (body) {
    return { x: body.scrollLeft, y: body.scrollTop };
  }

  return { x: 0, y: 0 };
}

/**
 * Set the scroll position of the window.
 */
export function setScroll(position: Coordinate, opt_win?: Window): void {
  const win = opt_win || getWindow();
  win.scrollTo(position.x, position.y);
}

/**
 * Get the position of the window.
 */
export function getPosition(opt_win?: Window): Coordinate {
  const win = opt_win || getWindow();
  let x: number;
  let y: number;

  if (IS_IE) {
    x = (win as Window & { screenLeft?: number }).screenLeft || 0;
    y = (win as Window & { screenTop?: number }).screenTop || 0;
  } else {
    x = win.screenX;
    y = win.screenY;
  }

  return { x, y };
}

/**
 * Set the position of the window.
 */
export function setPosition(position: Coordinate, opt_win?: Window): void {
  const win = opt_win || getWindow();
  win.moveTo(position.x, position.y);
}

/**
 * Scrolls the given position into the viewport.
 */
export function scrollIntoView(position: Coordinate, opt_win?: Window): void {
  const win = opt_win || getWindow();
  const viewport = getViewportSize(win);
  const scroll = getScroll(win);

  function newScrollDim(
    positionDim: number,
    scrollDim: number,
    viewportDim: number
  ): number {
    if (positionDim < scrollDim) {
      return positionDim;
    } else if (positionDim >= scrollDim + viewportDim) {
      return positionDim - viewportDim + 1;
    } else {
      return scrollDim;
    }
  }

  const targetScroll: Coordinate = {
    x: newScrollDim(position.x, scroll.x, viewport.width),
    y: newScrollDim(position.y, scroll.y, viewport.height),
  };

  if (targetScroll.x !== scroll.x || targetScroll.y !== scroll.y) {
    setScroll(targetScroll, win);
  }

  const newScroll = getScroll(win);
  if (targetScroll.x !== newScroll.x || targetScroll.y !== newScroll.y) {
    throw new BotError(
      ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
      `The target scroll location (${targetScroll.x}, ${targetScroll.y}) is not on the page.`
    );
  }
}

/**
 * Changes window orientation.
 */
export function changeOrientation(orientation: Orientation): void {
  const win = getWindow() as Window & { orientation?: number };
  const currentOrientationDegrees = getCurrentOrientationDegrees_();
  const newOrientationDegrees = getOrientationDegrees_(orientation);
  if (
    currentOrientationDegrees === newOrientationDegrees ||
    newOrientationDegrees === undefined
  ) {
    return;
  }

  if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
    const descriptor = Object.getOwnPropertyDescriptor(win, 'orientation');
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(win, 'orientation', {
        configurable: true,
        get: function () {
          return newOrientationDegrees;
        },
      });
    }
  }
  fire(win as unknown as Element, EventType.ORIENTATIONCHANGE);

  if (Math.abs(currentOrientationDegrees - newOrientationDegrees) % 180 !== 0) {
    const size = getSize();
    const shorter = size.getShortest();
    const longer = size.getLongest();
    if (
      orientation === Orientation.PORTRAIT ||
      orientation === Orientation.PORTRAIT_SECONDARY
    ) {
      setSize({ width: shorter, height: longer });
    } else {
      setSize({ width: longer, height: shorter });
    }
  }
}
