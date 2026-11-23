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

import type { AccessibilityNode, StateValue } from '../core/accessibility/types.js'

// The reference text rendering of a snapshot: the line grammar ADR 18205 §1
// fixes for every binding's toText, kept here so the corpus's expected text
// has one source and the bindings' ports are held to it. Test-only; the
// bindings each ship their own renderer.
//
//   - role "name" [state] [state=value]: value
//     - text: content
//
// One line per node, children indented two spaces. A true state is bare,
// a false one is left out, any other value is spelled. A value is written as
// is, except that a line break or a backslash in it is escaped (\n, \r, \\)
// so a node never spans two lines. The description is not part of the text
// form.

const STATE_ORDER: ReadonlyArray<string> = ['checked', 'pressed', 'expanded', 'selected', 'level', 'disabled', 'focused']

function quote(name: string): string {
  return '"' + name.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'
}

function oneLine(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\r/g, '\\r').replace(/\n/g, '\\n')
}

function states(map: Record<string, StateValue>): string {
  let out = ''
  for (const key of STATE_ORDER) {
    const value = map[key]
    if (value === true) {
      out += ` [${key}]`
    } else if (value !== undefined && value !== false) {
      out += ` [${key}=${value}]`
    }
  }
  return out
}

function line(node: AccessibilityNode): string {
  if (node.role === 'text') {
    return `- text: ${node.name}`
  }
  let out = `- ${node.role}`
  if (node.name !== '') {
    out += ` ${quote(node.name)}`
  }
  out += states(node.states)
  if (node.value !== undefined && node.value !== '') {
    out += `: ${oneLine(node.value)}`
  }
  return out
}

export function toText(node: AccessibilityNode, indent = ''): string {
  const lines = [indent + line(node)]
  for (const child of node.children) {
    lines.push(toText(child, indent + '  '))
  }
  return lines.join('\n')
}
