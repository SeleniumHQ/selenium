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

// Mirrors bidi_schema.json's type-ref vocabulary (see project_bidi_schema.mjs).
export interface TypeNode {
  primitive?: string
  const?: unknown
  ref?: string
  enum?: string[]
  list?: TypeNode
  map?: TypeNode
  union?: TypeNode[]
  // An inline (unnamed) record — project_bidi_schema.mjs's projectEntry() emits this
  // for an anonymous CDDL group instead of hoisting it to a named, ref'able type.
  record?: FieldSpec[]
  nullable?: boolean
  // Present on an inline union with a bare-scalar arm — the primitive(s) that
  // arm accepts (see unionNode() in project_bidi_schema.mjs). Not consumed by
  // validateValue yet; declared so embedding a real schema node type-checks.
  scalar?: string | string[]
  // The exact `const` literals a bare-scalar union arm admits (e.g.
  // input.Origin's "viewport"/"pointer") — see unionNode(). Same status as
  // `scalar`: not yet consumed by validateValue, declared for the embed.
  scalarValues?: unknown[]
}

export interface FieldSpec {
  name: string
  wire: string
  required: boolean
  type: TypeNode
}

export interface RecordOptions {
  extensible?: boolean
}

export declare class ValidationError extends Error {}

export interface RecordClass<T> {
  new (data: T): Readonly<T>
  fromWire(payload: unknown): Readonly<T>
}

/**
 * Registers a schema `record` — a fixed set of named fields, each independently
 * validated on the way out (constructor) and in (fromWire()).
 */
export function defineRecord<T>(name: string, fields: FieldSpec[], options?: RecordOptions): RecordClass<T>

export function defineAlias(name: string, type: TypeNode): void
