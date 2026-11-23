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

import { getParentElement } from './element.js'
import { Coordinate, Rect, RectReader, Region, getClientRect, getClientRegion } from './geometry.js'
import { getEffectiveStyle } from './style.js'

export type OverflowState = 'none' | 'hidden' | 'scroll';

// Reading a style is injectable for the same reason reading a rect is:
// isShownElement memoises both across one call, everyone else wants the plain
// read. See core/geometry.ts.
export type StyleReader = (elem: Element, propertyName: string) => string | null;

interface OverflowStyles {
  x: string;
  y: string;
}

// Whether the element -- or the given sub-region of it -- is clipped by an
// ancestor, and if so whether scrolling could bring it into view.
//
// optRegion applies only to the element asked about. The recursive calls that
// walk up the ancestors deliberately pass no region, matching
// bot.dom.getOverflowState.
export function getOverflowState(
  elem: Element,
  optRegion?: Region,
  getStyle: StyleReader = getEffectiveStyle,
  getRect: RectReader = getClientRect,
): OverflowState {
  var region = getClientRegion(elem, optRegion, getRect)
  var ownerDoc = elem.ownerDocument
  var htmlElem = ownerDoc.documentElement
  var bodyElem = ownerDoc.body
  var htmlOverflowStyle = getStyle(htmlElem, 'overflow') || 'visible'
  var treatAsFixedPosition = false

  function canBeOverflowed(container: Element, position: string | null): boolean {
    if (container === htmlElem) {
      return true
    }

    var display = getStyle(container, 'display') || ''
    if (display.indexOf('inline') === 0 || display === 'contents') {
      return false
    }

    if (position === 'absolute' && getStyle(container, 'position') === 'static') {
      return false
    }

    return true
  }

  function getOverflowParent(current: Element): Element | null {
    var position = getStyle(current, 'position')
    if (position === 'fixed') {
      treatAsFixedPosition = true
      return current === htmlElem ? null : htmlElem
    }

    var parent = getParentElement(current)
    while (parent && !canBeOverflowed(parent, position)) {
      parent = getParentElement(parent)
    }
    return parent
  }

  function getOverflowStyles(current: Element): OverflowStyles {
    var overflowElem = current
    if (htmlOverflowStyle === 'visible') {
      if (current === htmlElem && bodyElem) {
        overflowElem = bodyElem
      } else if (current === bodyElem) {
        return { x: 'visible', y: 'visible' }
      }
    }

    var overflow = {
      x: getStyle(overflowElem, 'overflow-x') || 'visible',
      y: getStyle(overflowElem, 'overflow-y') || 'visible',
    }

    if (current === htmlElem) {
      overflow.x = overflow.x === 'visible' ? 'auto' : overflow.x
      overflow.y = overflow.y === 'visible' ? 'auto' : overflow.y
    }

    return overflow
  }

  function getScroll(current: Element): Coordinate {
    if (current === htmlElem) {
      return {
        x: ownerDoc.defaultView ? ownerDoc.defaultView.pageXOffset : 0,
        y: ownerDoc.defaultView ? ownerDoc.defaultView.pageYOffset : 0,
      }
    }

    return { x: current.scrollLeft, y: current.scrollTop }
  }

  function overflowStateOf(container: Element): OverflowState {
    return getOverflowState(container, undefined, getStyle, getRect)
  }

  for (var container = getOverflowParent(elem); container; container = getOverflowParent(container)) {
    var containerOverflow = getOverflowStyles(container)
    if (containerOverflow.x === 'visible' && containerOverflow.y === 'visible') {
      continue
    }

    var containerRect: Rect = getRect(container)
    if (containerRect.width === 0 || containerRect.height === 0) {
      return 'hidden'
    }

    var underflowsX = region.right < containerRect.left
    var underflowsY = region.bottom < containerRect.top
    if ((underflowsX && containerOverflow.x === 'hidden') || (underflowsY && containerOverflow.y === 'hidden')) {
      return 'hidden'
    }

    if ((underflowsX && containerOverflow.x !== 'visible') || (underflowsY && containerOverflow.y !== 'visible')) {
      var containerScroll = getScroll(container)
      var unscrollableX = region.right < containerRect.left - containerScroll.x
      var unscrollableY = region.bottom < containerRect.top - containerScroll.y
      if ((unscrollableX && containerOverflow.x !== 'visible') || (unscrollableY && containerOverflow.y !== 'visible')) {
        return 'hidden'
      }

      return overflowStateOf(container) === 'hidden' ? 'hidden' : 'scroll'
    }

    var overflowsX = region.left >= containerRect.left + containerRect.width
    var overflowsY = region.top >= containerRect.top + containerRect.height
    if ((overflowsX && containerOverflow.x === 'hidden') || (overflowsY && containerOverflow.y === 'hidden')) {
      return 'hidden'
    }

    if ((overflowsX && containerOverflow.x !== 'visible') || (overflowsY && containerOverflow.y !== 'visible')) {
      if (treatAsFixedPosition) {
        var docScroll = getScroll(container)
        // region.right against scrollHeight is not a transcription slip: the
        // Closure original compares the horizontal edge to the vertical
        // dimension here (dom.js:800) and the ports have always matched it.
        if (region.left >= htmlElem.scrollWidth - docScroll.x || region.right >= htmlElem.scrollHeight - docScroll.y) {
          return 'hidden'
        }
      }

      return overflowStateOf(container) === 'hidden' ? 'hidden' : 'scroll'
    }
  }

  return 'none'
}
