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
import { Rect, Region, getClientRect, getClientRegion } from './geometry.js'
import { getOverflowState } from './overflow.js'
import { getEffectiveStyle } from './style.js'

interface Box {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// goog.style.getBorderBox: the computed border widths, which are what separate
// a container's client rect from its content box.
function getBorderBox(element: Element): Box {
  const width = (side: string) => parseFloat(getEffectiveStyle(element, 'border-' + side + '-width') || '0') || 0
  return {
    top: width('top'),
    right: width('right'),
    bottom: width('bottom'),
    left: width('left'),
  }
}

// Scrolls the element, or the given sub-region of it, into view and reports
// whether it ended up visible.
//
// This is bot.action.scrollIntoView. It lives in core/ rather than with the
// interaction atoms because it reaches only geometry and overflow -- never
// events, keyboard, mouse or device. In Closure it was trapped in action.js's
// module graph and dragged all of that in with it; per-file imports are what
// let it come out on its own.
export function scrollIntoView(element: Element, optRegion?: Region): boolean {
  // Already in view, or clipped beyond rescuing: either way, no scrolling.
  const overflow = getOverflowState(element, optRegion)
  if (overflow !== 'scroll') {
    return overflow === 'none'
  }

  // Elements under an SVG element may have no scrollIntoView, so only call it
  // where it exists.
  if (typeof (element as HTMLElement).scrollIntoView === 'function') {
    ;(element as HTMLElement).scrollIntoView()
    if (getOverflowState(element, optRegion) === 'none') {
      return true
    }
  }

  // Either there was no scrollIntoView, or it did not bring the requested
  // coordinate into view, so scroll each ancestor by hand.
  const region = getClientRegion(element, optRegion)
  for (let container = getParentElement(element); container; container = getParentElement(container)) {
    scrollRegionIntoContainerView(region, container)
  }

  return getOverflowState(element, optRegion) === 'none'
}

// Based largely on goog.style.scrollIntoContainerView.
function scrollRegionIntoContainerView(region: Rect, container: Element): void {
  const containerRect = getClientRect(container)
  const containerBorder = getBorderBox(container)

  // Position of the region relative to the container's content box.
  const relX = region.left - containerRect.left - containerBorder.left
  const relY = region.top - containerRect.top - containerBorder.top

  // How far the region can move inside the container. clientWidth/Height
  // rather than the rect, so the scrollbar is accounted for.
  const spaceX = container.clientWidth + region.left - region.right
  const spaceY = container.clientHeight + region.top - region.bottom

  container.scrollLeft += Math.min(relX, Math.max(relX - spaceX, 0))
  container.scrollTop += Math.min(relY, Math.max(relY - spaceY, 0))
}
