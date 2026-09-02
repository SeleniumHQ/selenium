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

export interface EnumEntry<T extends string | number> {
  readonly values: readonly T[]
  includes(value: unknown): value is T
}

/**
 * Registers a schema `enum` — a closed set of string or number values a field
 * may hold (e.g. emulation.MediaFeaturesGrid, CSS's `grid` media feature, is
 * spec'd as the integer 0 or 1, not a string).
 * @param name Schema type name, e.g. 'network.InterceptPhase'.
 * @param values The enum's valid values.
 * @returns The registered entry, used by validateValue() to check a ref'd value's
 *   membership; also returned so a generator can build a discoverable constant from it.
 */
export function defineEnum<T extends string | number>(name: string, values: readonly T[]): EnumEntry<T>
