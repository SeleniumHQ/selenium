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

import { getParentElement, getParentNodeInComposedDom, isElement } from './element.js'
import {
  ImageMapResult,
  Rect,
  getClientRect as readClientRect,
  getClientRegion as readClientRegion,
  maybeFindImageMap as findImageMap,
} from './geometry.js'
import { OverflowState, getOverflowState as readOverflowState } from './overflow.js'

function isShownElement(elem: Element, optIgnoreOpacity?: boolean): boolean {
  // Per-call memoisation caches. Scoped here so they live only for the
  // duration of this synchronous call — no stale-data risk, no GC pressure
  // between invocations. The helpers that read them stay in this scope for
  // the same reason; only the cache-free primitives moved to core/.
  var computedStyleCache = new Map<Element, CSSStyleDeclaration | null>();
  var clientRectCache = new Map<Element, Rect>();
  var displayedCache = new Map<Node, boolean>();

  function getEffectiveStyle(elem: Element, propertyName: string): string | null {
    var computed = computedStyleCache.get(elem);
    if (computed === undefined) {
      var win = elem.ownerDocument.defaultView;
      computed = win ? (win.getComputedStyle(elem) || null) : null;
      computedStyleCache.set(elem, computed);
    }
    if (!computed) {
      return null;
    }
    var value = computed.getPropertyValue(propertyName);
    return value || null;
  }

  function getOpacity(elem: Element): number {
    var opacityStyle = getEffectiveStyle(elem, 'opacity');
    var opacity = opacityStyle ? Number(opacityStyle) : 1;
    var parent = getParentElement(elem);
    return parent ? opacity * getOpacity(parent) : opacity;
  }

  // Memoising delegates over the shared geometry primitives. One isDisplayed
  // call reads the same element's rect many times over, so the cache is what
  // keeps that from forcing a reflow each time; the uncached primitives live
  // in core/geometry.ts for every other caller.
  function getClientRect(elem: Element): Rect {
    var cachedRect = clientRectCache.get(elem);
    if (cachedRect) {
      return cachedRect;
    }
    var rect = readClientRect(elem, getClientRect);
    clientRectCache.set(elem, rect);
    return rect;
  }

  function maybeFindImageMap(elem: Element): ImageMapResult | null {
    return findImageMap(elem, getClientRect);
  }

  function getClientRegion(elem: Element): Rect {
    return readClientRegion(elem, undefined, getClientRect);
  }

  // The memoised readers are threaded through so the overflow walk shares this
  // call's caches; isDisplayed asks about the whole element, never a region.
  function getOverflowState(elem: Element): OverflowState {
    return readOverflowState(elem, undefined, getEffectiveStyle, getClientRect);
  }

  function isShownInternal(elem: Element, ignoreOpacity: boolean, displayedFn: (element: Node) => boolean): boolean {
    if (!isElement(elem)) {
      throw new Error('Argument to isShown must be of type Element');
    }

    if (isElement(elem, 'BODY')) {
      return true;
    }

    if (isElement(elem, 'OPTION') || isElement(elem, 'OPTGROUP')) {
      var select = (elem as Element).closest('select');
      return !!select && isShownInternal(select, true, displayedFn);
    }

    var imageMap = maybeFindImageMap(elem);
    if (imageMap) {
      return !!imageMap.image && imageMap.rect.width > 0 && imageMap.rect.height > 0 &&
        isShownInternal(imageMap.image, ignoreOpacity, displayedFn);
    }

    if (isElement(elem, 'INPUT') && (elem as HTMLInputElement).type.toLowerCase() === 'hidden') {
      return false;
    }

    if (isElement(elem, 'NOSCRIPT')) {
      return false;
    }

    var visibility = getEffectiveStyle(elem, 'visibility');
    if (visibility === 'collapse' || visibility === 'hidden') {
      return false;
    }

    if (!displayedFn(elem)) {
      return false;
    }

    if (!ignoreOpacity && getOpacity(elem) === 0) {
      return false;
    }

    function positiveSize(element: Element): boolean {
      var rect = getClientRect(element);
      if (rect.height > 0 && rect.width > 0) {
        return true;
      }

      if (isElement(element, 'PATH') && (rect.height > 0 || rect.width > 0)) {
        var strokeWidth = getEffectiveStyle(element, 'stroke-width');
        return !!strokeWidth && parseInt(strokeWidth, 10) > 0;
      }

      var elementVisibility = getEffectiveStyle(element, 'visibility');
      if (elementVisibility === 'collapse' || elementVisibility === 'hidden') {
        return false;
      }

      if (!displayedFn(element)) {
        return false;
      }

      if (getEffectiveStyle(element, 'overflow') === 'hidden') {
        return false;
      }

      for (var index = 0; index < element.childNodes.length; index += 1) {
        var child = element.childNodes[index];
        if (child.nodeType === Node.TEXT_NODE) {
          var text = child.nodeValue || '';
          if (/^[\s]*$/.test(text) && /[\n\r\t]/.test(text)) {
            continue;
          }
          return true;
        }

        if (isElement(child) && positiveSize(child)) {
          return true;
        }
      }

      return false;
    }

    if (!positiveSize(elem)) {
      return false;
    }

    function hiddenByOverflow(element: Element): boolean {
      if (getOverflowState(element) !== 'hidden') {
        return false;
      }

      for (var index = 0; index < element.childNodes.length; index += 1) {
        var child = element.childNodes[index];
        if (isElement(child) && !hiddenByOverflow(child) && positiveSize(child)) {
          return false;
        }
      }

      return true;
    }

    return !hiddenByOverflow(elem);
  }

  function displayed(node: Node): boolean {
    var cached = displayedCache.get(node);
    if (cached !== undefined) {
      return cached;
    }

    if (isElement(node)) {
      var display = getEffectiveStyle(node, 'display');
      var contentVisibility = getEffectiveStyle(node, 'content-visibility');
      if (display === 'none' || contentVisibility === 'hidden') {
        displayedCache.set(node, false);
        return false;
      }
    }

    var parent = getParentNodeInComposedDom(node);
    if (typeof ShadowRoot === 'function' && parent instanceof ShadowRoot) {
      if (parent.host.shadowRoot && parent.host.shadowRoot !== parent) {
        displayedCache.set(node, false);
        return false;
      }
      parent = parent.host;
    }

    if (parent && (parent.nodeType === Node.DOCUMENT_NODE || parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE)) {
      displayedCache.set(node, true);
      return true;
    }

    if (isElement(parent, 'DETAILS') && !(<HTMLDetailsElement>parent).open && !isElement(node, 'SUMMARY')) {
      displayedCache.set(node, false);
      return false;
    }

    var result = !!parent && displayed(parent);
    displayedCache.set(node, result);
    return result;
  }

  return isShownInternal(elem, !!optIgnoreOpacity, displayed);
}

export default isShownElement;
