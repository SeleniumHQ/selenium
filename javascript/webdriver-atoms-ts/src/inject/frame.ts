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
 * Inject atoms for frame handling.
 */

import * as executeScript from './execute_script';

/**
 * Finds a frame element by id or name.
 *
 * @param _idOrName The frame id or name attribute.
 * @param _optRoot Optional root window for scoped search.
 * @returns Stringified response object containing the frame element.
 */
export function findFrameByIdOrName(
    _idOrName: string,
    _optRoot?: executeScript.SerializedWindow
): string {
    try {
        const responseObj = {
            status: 0,
            value: null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err)
            }
        };
        return JSON.stringify(errorObj);
    }
}

/**
 * Gets the currently active element in the frame.
 *
 * @returns Stringified response object containing the active element.
 */
export function activeElement(): string {
    try {
        const active = document.activeElement;
        const responseObj = {
            status: 0,
            value: active ? { [Symbol.for('element')]: active } : null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err)
            }
        };
        return JSON.stringify(errorObj);
    }
}

/**
 * Finds the parent frame of the given frame.
 *
 * @param _optRoot Optional frame/window to start search from.
 * @returns Stringified response object containing the parent frame.
 */
export function parentFrame(_optRoot?: Window): string {
    try {
        const parent = _optRoot ? (_optRoot as any).parent : window.parent;
        const responseObj = {
            status: 0,
            value: parent ? { [Symbol.for('window')]: parent } : null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err)
            }
        };
        return JSON.stringify(errorObj);
    }
}

/**
 * Finds a frame element by index.
 *
 * @param _index The frame index.
 * @param _optRoot Optional root window for scoped search.
 * @returns Stringified response object containing the frame element.
 */
export function findFrameByIndex(
    _index: number,
    _optRoot?: Window
): string {
    try {
        const root = _optRoot || window;
        const frames = root.frames;
        const frame = _index >= 0 && _index < frames.length ? frames[_index] : null;
        const responseObj = {
            status: 0,
            value: frame ? { [Symbol.for('frame')]: frame } : null
        };
        return JSON.stringify(responseObj);
    } catch (err) {
        const errorObj = {
            status: 1,
            value: {
                message: (err as any).message || String(err)
            }
        };
        return JSON.stringify(errorObj);
    }
}
