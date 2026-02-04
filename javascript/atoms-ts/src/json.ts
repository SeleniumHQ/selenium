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
 * JSON utilities that leverage native JSON APIs available in all modern browsers.
 * All WebDriver-supported browsers have native JSON support, so we simply
 * use JSON.stringify and JSON.parse directly.
 *
 * @see https://caniuse.com/#search=JSON
 */

/**
 * Converts a JSON-serializable object to its string representation.
 *
 * @param jsonObj The input object to serialize
 * @param replacer Optional replacer function called for each (key, value) pair
 *        that determines how the value should be serialized
 * @returns A JSON string representation of the input object
 * @throws {TypeError} If the object contains non-serializable values
 *
 * @example
 * stringify({ name: 'Alice', age: 30 }) // '{"name":"Alice","age":30}'
 * stringify([1, 2, 3])                   // '[1,2,3]'
 */
export function stringify(
    jsonObj: unknown,
    replacer?: (key: string, value: unknown) => unknown
): string {
    return JSON.stringify(jsonObj, replacer as Parameters<typeof JSON.stringify>[1]);
}

/**
 * Parses a JSON string and returns the deserialized object.
 *
 * @param jsonStr The JSON string to parse
 * @param reviver Optional reviver function called for each (key, value) pair
 *        during deserialization
 * @returns The deserialized JSON object
 * @throws {SyntaxError} If the input string is not valid JSON
 *
 * @example
 * parse('{"name":"Alice","age":30}') // { name: 'Alice', age: 30 }
 * parse('[1,2,3]')                   // [1, 2, 3]
 */
export function parse(
    jsonStr: string,
    reviver?: (key: string, value: unknown) => unknown
): unknown {
    return JSON.parse(jsonStr, reviver as Parameters<typeof JSON.parse>[1]);
}
