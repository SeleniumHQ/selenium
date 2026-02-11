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
 * Atoms for simulating user actions against the browser window.
 */

import { WebDriverError, ErrorCode } from './error';
import * as events from './events';
import * as userAgent from './userAgent';

/**
 * Whether the value of history.length includes a newly loaded page. If not,
 * after a new page load history.length is the number of pages that have loaded,
 * minus 1, but becomes the total number of pages on a subsequent back() call.
 */
const HISTORY_LENGTH_INCLUDES_NEW_PAGE = !userAgent.IS_IE;

/**
 * Whether value of history.length includes the pages ahead of the current one
 * in the history. If not, history.length equals the number of prior pages.
 * Here is the WebKit bug for this behavior that was fixed by version 533:
 * https://bugs.webkit.org/show_bug.cgi?id=24472
 */
const HISTORY_LENGTH_INCLUDES_FORWARD_PAGES =
    !userAgent.IS_WEBKIT || userAgent.isEngineVersion('533');

/**
 * Screen orientation values. From the draft W3C spec at:
 * http://www.w3.org/TR/2012/WD-screen-orientation-20120522
 */
export enum Orientation {
    PORTRAIT = 'portrait-primary',
    PORTRAIT_SECONDARY = 'portrait-secondary',
    LANDSCAPE = 'landscape-primary',
    LANDSCAPE_SECONDARY = 'landscape-secondary'
}

/**
 * Size object for window dimensions.
 */
export interface Size {
    width: number;
    height: number;
}

/**
 * Coordinate object for positions.
 */
export interface Coordinate {
    x: number;
    y: number;
}

/**
 * Returns the degrees corresponding to the orientation input.
 */
function getOrientationDegrees(orientation: Orientation): number | undefined {
    const orientationMap: { [key in Orientation]?: number } = {};

    if (userAgent.IS_MOBILE) {
        // The iPhone and Android phones do not change orientation event when
        // held upside down. Hence, PORTRAIT_SECONDARY is not set.
        orientationMap[Orientation.PORTRAIT] = 0;
        orientationMap[Orientation.LANDSCAPE] = 90;
        orientationMap[Orientation.LANDSCAPE_SECONDARY] = -90;
        if (userAgent.IS_IPAD) {
            orientationMap[Orientation.PORTRAIT_SECONDARY] = 180;
        }
    } else if (userAgent.IS_ANDROID) {
        // Unlike the iPad, Android tablets treat landscape orientation as the
        // default, i.e., having window.orientation = 0.
        orientationMap[Orientation.PORTRAIT] = -90;
        orientationMap[Orientation.LANDSCAPE] = 0;
        orientationMap[Orientation.PORTRAIT_SECONDARY] = 90;
        orientationMap[Orientation.LANDSCAPE_SECONDARY] = 180;
    }

    return orientationMap[orientation];
}

/**
 * Go back in the browser history. The number of pages to go back can
 * optionally be specified and defaults to 1.
 */
export function back(opt_numPages?: number): void {
    const win = window;
    // Relax the upper bound by one for browsers that do not count
    // newly loaded pages towards the value of window.history.length.
    const maxPages = HISTORY_LENGTH_INCLUDES_NEW_PAGE ?
        win.history.length - 1 : win.history.length;
    const numPages = checkNumPages_(maxPages, opt_numPages);
    win.history.go(-numPages);
}

/**
 * Go forward in the browser history. The number of pages to go forward can
 * optionally be specified and defaults to 1.
 */
export function forward(opt_numPages?: number): void {
    const win = window;
    // Do not check the upper bound (use null for infinity) for browsers that
    // do not count forward pages towards the value of window.history.length.
    const maxPages = HISTORY_LENGTH_INCLUDES_FORWARD_PAGES ?
        win.history.length - 1 : null;
    const numPages = checkNumPages_(maxPages, opt_numPages);
    win.history.go(numPages);
}

/**
 * Check and validate the number of pages to move in history.
 */
function checkNumPages_(maxPages: number | null, opt_numPages?: number): number {
    const numPages = opt_numPages !== undefined ? opt_numPages : 1;
    if (numPages <= 0) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'number of pages must be positive');
    }
    if (maxPages !== null && numPages > maxPages) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'number of pages must be less than the length of the browser history');
    }
    return numPages;
}

/**
 * Determine the size of the window that a user could interact with. This will
 * be the greatest of document.body.(width|scrollWidth), the same for
 * document.documentElement or the size of the viewport.
 */
export function getInteractableSize(opt_win?: Window): Size {
    const win = opt_win || window;
    const doc = win.document;
    const elem = doc.documentElement;
    const body = doc.body;
    if (!body) {
        throw new WebDriverError(ErrorCode.UNKNOWN_ERROR,
            'No BODY element present');
    }

    const widths = [
        elem.clientWidth, elem.scrollWidth, elem.offsetWidth,
        body.scrollWidth, body.offsetWidth
    ];
    const heights = [
        elem.clientHeight, elem.scrollHeight, elem.offsetHeight,
        body.scrollHeight, body.offsetHeight
    ];

    const width = Math.max(...widths);
    const height = Math.max(...heights);

    return { width, height };
}

/**
 * Gets the frame element.
 */
function getFrame_(win: Window): Element | null {
    try {
        // On IE, accessing the frameElement of a popup window results in a "No
        // Such interface" exception.
        return win.frameElement;
    } catch (e) {
        return null;
    }
}

/**
 * Determine the outer size of the window.
 */
export function getSize(opt_win?: Window): Size {
    const win = opt_win || window;
    const frame = getFrame_(win);
    if (frame) {
        return { width: frame.clientWidth, height: frame.clientHeight };
    } else {
        const docElem = win.document.documentElement;
        const body = win.document.body;
        const width = win.outerWidth || (docElem && docElem.clientWidth) ||
            (body && body.clientWidth) || 0;
        const height = win.outerHeight || (docElem && docElem.clientHeight) ||
            (body && body.clientHeight) || 0;
        return { width, height };
    }
}

/**
 * Set the outer size of the window.
 */
export function setSize(size: Size, opt_win?: Window): void {
    const win = opt_win || window;
    const frame = getFrame_(win);
    if (frame instanceof HTMLElement) {
        // minHeight and minWidth are altered because many browsers will not change
        // height or width if it is less than a specified minHeight or minWidth.
        frame.style.minHeight = '0px';
        frame.style.minWidth = '0px';
        (frame as any).width = size.width + 'px';
        frame.style.width = size.width + 'px';
        (frame as any).height = size.height + 'px';
        frame.style.height = size.height + 'px';
    } else {
        win.resizeTo(size.width, size.height);
    }
}

/**
 * Determine the scroll position of the window.
 */
export function getScroll(opt_win?: Window): Coordinate {
    const win = opt_win || window;
    const doc = win.document;
    const elem = doc.documentElement;
    const body = doc.body || elem;

    let x = 0;
    let y = 0;

    if (win.pageXOffset !== undefined) {
        x = win.pageXOffset;
        y = win.pageYOffset;
    } else if (body) {
        x = body.scrollLeft;
        y = body.scrollTop;
    }

    return { x, y };
}

/**
 * Set the scroll position of the window.
 */
export function setScroll(position: Coordinate, opt_win?: Window): void {
    const win = opt_win || window;
    win.scrollTo(position.x, position.y);
}

/**
 * Get the position of the window.
 */
export function getPosition(opt_win?: Window): Coordinate {
    const win = opt_win || window;
    let x: number;
    let y: number;

    if (userAgent.IS_IE) {
        x = (win as any).screenLeft || 0;
        y = (win as any).screenTop || 0;
    } else {
        x = (win as any).screenX || 0;
        y = (win as any).screenY || 0;
    }

    return { x, y };
}

/**
 * Set the position of the window.
 */
export function setPosition(position: Coordinate, opt_win?: Window): void {
    const win = opt_win || window;
    win.moveTo(position.x, position.y);
}

/**
 * Scrolls the given position into the viewport, using the minimal amount of
 * scrolling necessary to bring the coordinate into view.
 */
export function scrollIntoView(position: Coordinate, opt_win?: Window): void {
    const win = opt_win || window;
    const doc = win.document;
    const elem = doc.documentElement;
    const body = doc.body || elem;

    const viewportWidth = elem.clientWidth || body.clientWidth || 0;
    const viewportHeight = elem.clientHeight || body.clientHeight || 0;
    const scroll = getScroll(win);

    // Scroll the minimal amount to bring the position into view.
    const targetScroll: Coordinate = {
        x: newScrollDim(position.x, scroll.x, viewportWidth),
        y: newScrollDim(position.y, scroll.y, viewportHeight)
    };

    if (targetScroll.x !== scroll.x || targetScroll.y !== scroll.y) {
        setScroll(targetScroll, win);
    }

    // It is difficult to determine the size of the web page in some browsers.
    // We check if the scrolling we intended to do really happened. If not we
    // assume that the target location is not on the web page.
    const actualScroll = getScroll(win);
    if (actualScroll.x !== targetScroll.x || actualScroll.y !== targetScroll.y) {
        throw new WebDriverError(ErrorCode.MOVE_TARGET_OUT_OF_BOUNDS,
            `The target scroll location (${targetScroll.x}, ${targetScroll.y}) is not on the page.`);
    }

    function newScrollDim(positionDim: number, scrollDim: number, viewportDim: number): number {
        if (positionDim < scrollDim) {
            return positionDim;
        } else if (positionDim >= scrollDim + viewportDim) {
            return positionDim - viewportDim + 1;
        } else {
            return scrollDim;
        }
    }
}

/**
 * Get the current window orientation degrees.
 */
function getCurrentOrientationDegrees_(): number {
    const win = window;
    if ((win as any).orientation === undefined) {
        // If window.orientation is not defined, assume a default orientation of 0.
        // A value of 0 indicates a portrait orientation except for android tablets
        // where 0 indicates a landscape orientation.
        (win as any).orientation = 0;
    }
    return (win as any).orientation;
}

/**
 * Changes window orientation.
 */
export function changeOrientation(orientation: Orientation): void {
    const win = window;
    const currentOrientationDegrees = getCurrentOrientationDegrees_();
    const newOrientationDegrees = getOrientationDegrees(orientation);

    if (currentOrientationDegrees === newOrientationDegrees ||
        newOrientationDegrees === undefined) {
        return;
    }

    // If possible, try to override the window's orientation value.
    // On some older version of Android, it's not possible to change
    // the window's orientation value.
    if (Object.getOwnPropertyDescriptor && Object.defineProperty) {
        const descriptor = Object.getOwnPropertyDescriptor(win, 'orientation');
        if (descriptor && descriptor.configurable) {
            Object.defineProperty(win, 'orientation', {
                configurable: true,
                get: function () {
                    return newOrientationDegrees;
                }
            });
        }
    }

    events.fire(win, events.EventType.ORIENTATIONCHANGE);

    // Change the window size to reflect the new orientation.
    if (Math.abs((currentOrientationDegrees - newOrientationDegrees) % 180) !== 0) {
        const size = getSize();
        const shorter = Math.min(size.width, size.height);
        const longer = Math.max(size.width, size.height);

        if (orientation === Orientation.PORTRAIT ||
            orientation === Orientation.PORTRAIT_SECONDARY) {
            setSize({ width: shorter, height: longer });
        } else {
            setSize({ width: longer, height: shorter });
        }
    }
}
