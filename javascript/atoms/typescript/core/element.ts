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

// Element primitives shared by the atoms. The bodies here were lifted verbatim
// from is-displayed.ts so the move stays reviewable as a move.
//
// Note what is deliberately *not* here: the style, client-rect and displayed
// helpers from the same file close over caches that is-displayed.ts builds
// fresh on every call, precisely so a long-running page cannot read stale
// layout back. Hoisting those to module scope would turn a per-call memo into
// a process-lifetime one and silently reintroduce that bug, so they stay where
// their caches live.

import { getProperty } from './attribute.js'

// Guards against form children that shadow tagName (e.g. <form><input name="tagName">).
// Element.prototype's descriptor never changes, so this is a module constant
// rather than something to recompute per call.
const tagNameDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'tagName');

function toUpperCaseTag(tagName?: string): string | undefined {
  return tagName ? tagName.toUpperCase() : undefined;
}

export function isElement(node: unknown, tagName?: string): node is Element {
  // Use nodeType instead of instanceof to handle cross-realm Elements
  // (e.g., from iframes), where instanceof checks against a different Element.
  if (!node || (node as Node).nodeType !== 1 /* ELEMENT_NODE */) {
    return false;
  }
  var asElement = node as Element;
  var rawTagName = tagNameDescriptor && typeof tagNameDescriptor.get === 'function'
    ? tagNameDescriptor.get.call(asElement)
    : asElement.tagName;
  var upperTagName = typeof rawTagName === 'string' ? rawTagName.toUpperCase() : '';
  var normalizedTagName = toUpperCaseTag(tagName);
  if (upperTagName === 'FORM') {
    return !normalizedTagName || normalizedTagName === 'FORM';
  }
  return !!upperTagName && (!normalizedTagName || upperTagName === normalizedTagName);
}

export function getParentElement(node: Node): Element | null {
  var current = node.parentNode;
  while (
    current &&
    current.nodeType !== Node.ELEMENT_NODE &&
    current.nodeType !== Node.DOCUMENT_NODE &&
    current.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
  ) {
    current = current.parentNode;
  }
  return current && current.nodeType === 1 /* ELEMENT_NODE */ ? (current as Element) : null;
}

export function isSelectable(element: Element): boolean {
  if (isElement(element, 'OPTION')) {
    return true
  }
  if (isElement(element, 'INPUT')) {
    const type = (element as HTMLInputElement).type.toLowerCase()
    return type === 'checkbox' || type === 'radio'
  }
  return false
}

// Reads the selected/checked state. Callers are responsible for checking
// isSelectable first — the Closure bot.dom.core.isSelected threw for anything
// else, but the atom Appium consumes returns false instead, so the decision
// belongs to the caller rather than here.
export function isSelectedState(element: Element): boolean {
  const type = (element as HTMLInputElement).type && (element as HTMLInputElement).type.toLowerCase()
  const propertyName = type === 'checkbox' || type === 'radio' ? 'checked' : 'selected'
  return !!getProperty(element, propertyName)
}

export function getParentNodeInComposedDom(node: Node): Node | null {
  var parent = node.parentNode;
  var slottable = node as Node & { assignedSlot?: HTMLSlotElement | null };
  var parentWithShadow = parent as (Node & { shadowRoot?: ShadowRoot | null }) | null;

  if (parentWithShadow && parentWithShadow.shadowRoot && slottable.assignedSlot !== undefined) {
    return slottable.assignedSlot ? slottable.assignedSlot.parentNode : null;
  }

  return parent;
}
