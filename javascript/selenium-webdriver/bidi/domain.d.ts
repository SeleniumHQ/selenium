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

export interface EventDescriptor<T> {
  readonly method: string
  readonly type?: { fromWire(payload: unknown): T }
}

/**
 * Describes one subscribable BiDi event, for use with Domain#addCallback().
 * @param {string} method The event's wire method name, e.g. 'log.entryAdded'.
 * @param {{fromWire(payload: unknown): T}} [type] Runtime record/union class for the
 *   event's params, if the schema declares one — addCallback() parses each delivered
 *   payload through it before the caller's handler runs.
 * @returns {EventDescriptor<T>} The event descriptor, ready to pass to Domain#addCallback().
 */
export function event<T>(method: string, type?: { fromWire(payload: unknown): T }): EventDescriptor<T>

/** Internal construction guard — only a generated `Class.create(driver)` passes this. Never use directly. */
export const DOMAIN_TOKEN: unique symbol

export declare class Domain {
  protected constructor(bidi: unknown, token: typeof DOMAIN_TOKEN)
  protected static connect(driver: unknown): Promise<unknown>
  protected send(method: string, params: Record<string, unknown>): Promise<unknown>

  /**
   * Subscribes `handler` to a BiDi event. Subscription lifecycle (remote
   * subscribe/unsubscribe, per-subscription bookkeeping) lives on the
   * connection itself; this only adds parsing a delivered payload through
   * the descriptor's type before the caller's handler runs.
   * @param {EventDescriptor<T>} descriptor An event descriptor from event().
   * @param {function(T): void} handler Invoked with the event's parsed params each time it fires.
   * @returns {Promise<{id: string, unsubscribe: function(): Promise<void>}>} A handle
   *     for this subscription; call `unsubscribe()` to stop receiving the event.
   */
  addCallback<T>(
    descriptor: EventDescriptor<T>,
    handler: (params: T) => void,
  ): Promise<{ id: string; unsubscribe(): Promise<void> }>
}
