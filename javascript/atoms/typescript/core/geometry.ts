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

import { isElement } from './element.js'

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface ImageMapResult {
  image: Element | null;
  rect: Rect;
}

// The sub-region accepted by getClientRegion and the scrolling helpers. A bare
// coordinate means the single pixel at that point, matching Closure's
// `new goog.math.Rect(region.x, region.y, 1, 1)` coercion.
export type Region = { left: number; top: number; width: number; height: number } | Coordinate;

// Reading a rect is injectable because isShownElement memoises it across the
// hundreds of reads one isDisplayed call makes; everyone else wants the plain
// uncached read.
export type RectReader = (elem: Element) => Rect;

export function createRect(left: number, top: number, width: number, height: number): Rect {
  return {
    left: left,
    top: top,
    right: left + width,
    bottom: top + height,
    width: width,
    height: height,
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function getAreaRelativeRect(area: HTMLAreaElement): Rect {
  var shape = area.shape.toLowerCase()
  var coords = area.coords.split(',').map(function (value) {
    return Number(value.trim())
  })

  if (shape === 'rect' && coords.length === 4) {
    return createRect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1])
  }

  if (shape === 'circle' && coords.length === 3) {
    return createRect(coords[0] - coords[2], coords[1] - coords[2], coords[2] * 2, coords[2] * 2)
  }

  if (shape === 'poly' && coords.length > 2) {
    var minX = coords[0]
    var minY = coords[1]
    var maxX = minX
    var maxY = minY

    for (var index = 2; index + 1 < coords.length; index += 2) {
      minX = Math.min(minX, coords[index])
      maxX = Math.max(maxX, coords[index])
      minY = Math.min(minY, coords[index + 1])
      maxY = Math.max(maxY, coords[index + 1])
    }

    return createRect(minX, minY, maxX - minX, maxY - minY)
  }

  return createRect(0, 0, 0, 0)
}

function findImageUsingMap(mapName: string, doc: Document): Element | null {
  // Use querySelector instead of a full-DOM scan; escape the map name so
  // special characters in the CSS attribute value string are handled safely.
  return doc.querySelector('[usemap="#' + mapName.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"]')
}

export function maybeFindImageMap(elem: Element, getRect: RectReader = getClientRect): ImageMapResult | null {
  var isMap = isElement(elem, 'MAP')
  if (!isMap && !isElement(elem, 'AREA')) {
    return null
  }

  var map = isMap ? elem : isElement(elem.parentNode, 'MAP') ? elem.parentNode : null
  var image: Element | null = null
  var rect = createRect(0, 0, 0, 0)

  if (isElement(map, 'MAP') && (map as HTMLMapElement).name) {
    image = findImageUsingMap((map as HTMLMapElement).name, (map as HTMLMapElement).ownerDocument)
    if (image) {
      rect = getRect(image)
      if (!isMap && isElement(elem, 'AREA') && (elem as HTMLAreaElement).shape.toLowerCase() !== 'default') {
        var relativeRect = getAreaRelativeRect(elem as HTMLAreaElement)
        var relativeX = Math.min(Math.max(relativeRect.left, 0), rect.width)
        var relativeY = Math.min(Math.max(relativeRect.top, 0), rect.height)
        var width = Math.min(relativeRect.width, rect.width - relativeX)
        var height = Math.min(relativeRect.height, rect.height - relativeY)
        rect = createRect(relativeX + rect.left, relativeY + rect.top, width, height)
      }
    }
  }

  return { image: image, rect: rect }
}

// getRect is threaded through to the image-map lookup so a memoising caller
// keeps its cache for the <img> an <area> resolves to, not just the <area>.
export function getClientRect(elem: Element, getRect?: RectReader): Rect {
  var imageMap = maybeFindImageMap(elem, getRect || getClientRect)
  if (imageMap) {
    return imageMap.rect
  }

  var elemTagName = typeof elem.tagName === 'string' ? elem.tagName : ''
  if (elemTagName.toUpperCase() === 'HTML') {
    var doc = elem.ownerDocument
    // In quirks mode (no DOCTYPE), viewport dimensions come from document.body;
    // documentElement.clientWidth/Height is unreliable and can be 0.
    var sizeElem = doc.compatMode === 'CSS1Compat' ? doc.documentElement : (doc.body || doc.documentElement)
    return createRect(0, 0, sizeElem.clientWidth, sizeElem.clientHeight)
  }

  try {
    var nativeRect = elem.getBoundingClientRect()
    return {
      left: nativeRect.left,
      top: nativeRect.top,
      right: nativeRect.right,
      bottom: nativeRect.bottom,
      width: nativeRect.right - nativeRect.left,
      height: nativeRect.bottom - nativeRect.top,
    }
  } catch (_error) {
    return createRect(0, 0, 0, 0)
  }
}

// The element's rect, optionally narrowed to a sub-region clamped inside it.
// Each edge is clamped against the edge computed before it, so a region wider
// than the element collapses to the element rather than spilling past it --
// preserve that ordering, it is load-bearing.
export function getClientRegion(elem: Element, optRegion?: Region, getRect: RectReader = getClientRect): Rect {
  var rect = getRect(elem)
  if (!optRegion) {
    return rect
  }

  var region = 'left' in optRegion
    ? optRegion
    : { left: optRegion.x, top: optRegion.y, width: 1, height: 1 }

  var left = clamp(rect.left + region.left, rect.left, rect.right)
  var top = clamp(rect.top + region.top, rect.top, rect.bottom)
  var right = clamp(left + region.width, left, rect.right)
  var bottom = clamp(top + region.height, top, rect.bottom)

  return createRect(left, top, right - left, bottom - top)
}
