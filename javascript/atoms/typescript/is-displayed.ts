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

type OverflowState = 'none' | 'hidden' | 'scroll';

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface ImageMapResult {
  image: Element | null;
  rect: Rect;
}

interface OverflowStyles {
  x: string;
  y: string;
}

interface Coordinate {
  x: number;
  y: number;
}

(function (): (elem: Element, optIgnoreOpacity?: boolean) => boolean {
  // Cache the tagName descriptor once to avoid repeated property lookups during
  // DOM traversal. This guards against form children that shadow tagName on their
  // owner form (e.g. <form><input name="tagName">).
  var tagNameDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'tagName');

  function toUpperCaseTag(tagName?: string): string | undefined {
    return tagName ? tagName.toUpperCase() : undefined;
  }

  function isElement(node: unknown, tagName?: string): node is Element {
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

  function getParentElement(node: Node): Element | null {
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

  function getEffectiveStyle(elem: Element, propertyName: string): string | null {
    var win = elem.ownerDocument.defaultView;
    if (!win) {
      return null;
    }
    var computed = win.getComputedStyle(elem);
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

  function getParentNodeInComposedDom(node: Node): Node | null {
    var parent = node.parentNode;
    var slottable = node as Node & { assignedSlot?: HTMLSlotElement | null };
    var parentWithShadow = parent as (Node & { shadowRoot?: ShadowRoot | null }) | null;

    if (parentWithShadow && parentWithShadow.shadowRoot && slottable.assignedSlot !== undefined) {
      return slottable.assignedSlot ? slottable.assignedSlot.parentNode : null;
    }

    return parent;
  }

  function createRect(left: number, top: number, width: number, height: number): Rect {
    return {
      left: left,
      top: top,
      right: left + width,
      bottom: top + height,
      width: width,
      height: height,
    };
  }

  function getClientRect(elem: Element): Rect {
    var imageMap = maybeFindImageMap(elem);
    if (imageMap) {
      return imageMap.rect;
    }

    var elemTagName = typeof (elem as Element).tagName === 'string' ? (elem as Element).tagName : '';
    if (elemTagName.toUpperCase() === 'HTML') {
      var doc = (elem as Element).ownerDocument;
      return createRect(0, 0, doc.documentElement.clientWidth, doc.documentElement.clientHeight);
    }

    try {
      var nativeRect = (elem as Element).getBoundingClientRect();
      return {
        left: nativeRect.left,
        top: nativeRect.top,
        right: nativeRect.right,
        bottom: nativeRect.bottom,
        width: nativeRect.right - nativeRect.left,
        height: nativeRect.bottom - nativeRect.top,
      };
    } catch (_error) {
      return createRect(0, 0, 0, 0);
    }
  }

  function getAreaRelativeRect(area: HTMLAreaElement): Rect {
    var shape = area.shape.toLowerCase();
    var coords = area.coords.split(',').map(function (value) {
      return Number(value.trim());
    });

    if (shape === 'rect' && coords.length === 4) {
      return createRect(coords[0], coords[1], coords[2] - coords[0], coords[3] - coords[1]);
    }

    if (shape === 'circle' && coords.length === 3) {
      return createRect(coords[0] - coords[2], coords[1] - coords[2], coords[2] * 2, coords[2] * 2);
    }

    if (shape === 'poly' && coords.length > 2) {
      var minX = coords[0];
      var minY = coords[1];
      var maxX = minX;
      var maxY = minY;

      for (var index = 2; index + 1 < coords.length; index += 2) {
        minX = Math.min(minX, coords[index]);
        maxX = Math.max(maxX, coords[index]);
        minY = Math.min(minY, coords[index + 1]);
        maxY = Math.max(maxY, coords[index + 1]);
      }

      return createRect(minX, minY, maxX - minX, maxY - minY);
    }

    return createRect(0, 0, 0, 0);
  }

  function findImageUsingMap(mapName: string, doc: Document): Element | null {
    var elements = doc.getElementsByTagName('*');
    for (var index = 0; index < elements.length; index += 1) {
      var useMap = elements[index].getAttribute('usemap');
      if (useMap === '#' + mapName) {
        return elements[index];
      }
    }
    return null;
  }

  function maybeFindImageMap(elem: Element): ImageMapResult | null {
    var isMap = isElement(elem, 'MAP');
    if (!isMap && !isElement(elem, 'AREA')) {
      return null;
    }

    var map = isMap ? elem : isElement(elem.parentNode, 'MAP') ? elem.parentNode : null;
    var image: Element | null = null;
    var rect = createRect(0, 0, 0, 0);

    if (isElement(map, 'MAP') && (map as HTMLMapElement).name) {
      image = findImageUsingMap((map as HTMLMapElement).name, (map as HTMLMapElement).ownerDocument);
      if (image) {
        rect = getClientRect(image);
        if (!isMap && isElement(elem, 'AREA') && (elem as HTMLAreaElement).shape.toLowerCase() !== 'default') {
          var relativeRect = getAreaRelativeRect(elem as HTMLAreaElement);
          var relativeX = Math.min(Math.max(relativeRect.left, 0), rect.width);
          var relativeY = Math.min(Math.max(relativeRect.top, 0), rect.height);
          var width = Math.min(relativeRect.width, rect.width - relativeX);
          var height = Math.min(relativeRect.height, rect.height - relativeY);
          rect = createRect(relativeX + rect.left, relativeY + rect.top, width, height);
        }
      }
    }

    return { image: image, rect: rect };
  }

  function getClientRegion(elem: Element): Rect {
    return getClientRect(elem);
  }

  function getOverflowState(elem: Element): OverflowState {
    var region = getClientRegion(elem);
    var ownerDoc = elem.ownerDocument;
    var htmlElem = ownerDoc.documentElement;
    var bodyElem = ownerDoc.body;
    var htmlOverflowStyle = getEffectiveStyle(htmlElem, 'overflow') || 'visible';
    var treatAsFixedPosition = false;

    function canBeOverflowed(container: Element, position: string | null): boolean {
      if (container === htmlElem) {
        return true;
      }

      var display = getEffectiveStyle(container, 'display') || '';
      if (display.indexOf('inline') === 0 || display === 'contents') {
        return false;
      }

      if (position === 'absolute' && getEffectiveStyle(container, 'position') === 'static') {
        return false;
      }

      return true;
    }

    function getOverflowParent(current: Element): Element | null {
      var position = getEffectiveStyle(current, 'position');
      if (position === 'fixed') {
        treatAsFixedPosition = true;
        return current === htmlElem ? null : htmlElem;
      }

      var parent = getParentElement(current);
      while (parent && !canBeOverflowed(parent, position)) {
        parent = getParentElement(parent);
      }
      return parent;
    }

    function getOverflowStyles(current: Element): OverflowStyles {
      var overflowElem = current;
      if (htmlOverflowStyle === 'visible') {
        if (current === htmlElem && bodyElem) {
          overflowElem = bodyElem;
        } else if (current === bodyElem) {
          return { x: 'visible', y: 'visible' };
        }
      }

      var overflow = {
        x: getEffectiveStyle(overflowElem, 'overflow-x') || 'visible',
        y: getEffectiveStyle(overflowElem, 'overflow-y') || 'visible',
      };

      if (current === htmlElem) {
        overflow.x = overflow.x === 'visible' ? 'auto' : overflow.x;
        overflow.y = overflow.y === 'visible' ? 'auto' : overflow.y;
      }

      return overflow;
    }

    function getScroll(current: Element): Coordinate {
      if (current === htmlElem) {
        return {
          x: ownerDoc.defaultView ? ownerDoc.defaultView.pageXOffset : 0,
          y: ownerDoc.defaultView ? ownerDoc.defaultView.pageYOffset : 0,
        };
      }

      return { x: current.scrollLeft, y: current.scrollTop };
    }

    for (var container = getOverflowParent(elem); container; container = getOverflowParent(container)) {
      var containerOverflow = getOverflowStyles(container);
      if (containerOverflow.x === 'visible' && containerOverflow.y === 'visible') {
        continue;
      }

      var containerRect = getClientRect(container);
      if (containerRect.width === 0 || containerRect.height === 0) {
        return 'hidden';
      }

      var underflowsX = region.right < containerRect.left;
      var underflowsY = region.bottom < containerRect.top;
      if ((underflowsX && containerOverflow.x === 'hidden') || (underflowsY && containerOverflow.y === 'hidden')) {
        return 'hidden';
      }

      if ((underflowsX && containerOverflow.x !== 'visible') || (underflowsY && containerOverflow.y !== 'visible')) {
        var containerScroll = getScroll(container);
        var unscrollableX = region.right < containerRect.left - containerScroll.x;
        var unscrollableY = region.bottom < containerRect.top - containerScroll.y;
        if ((unscrollableX && containerOverflow.x !== 'visible') || (unscrollableY && containerOverflow.y !== 'visible')) {
          return 'hidden';
        }

        var containerUnderflowState = getOverflowState(container);
        return containerUnderflowState === 'hidden' ? 'hidden' : 'scroll';
      }

      var overflowsX = region.left >= containerRect.left + containerRect.width;
      var overflowsY = region.top >= containerRect.top + containerRect.height;
      if ((overflowsX && containerOverflow.x === 'hidden') || (overflowsY && containerOverflow.y === 'hidden')) {
        return 'hidden';
      }

      if ((overflowsX && containerOverflow.x !== 'visible') || (overflowsY && containerOverflow.y !== 'visible')) {
        if (treatAsFixedPosition) {
          var docScroll = getScroll(container);
          if (region.left >= htmlElem.scrollWidth - docScroll.x || region.right >= htmlElem.scrollHeight - docScroll.y) {
            return 'hidden';
          }
        }

        var containerOverflowState = getOverflowState(container);
        return containerOverflowState === 'hidden' ? 'hidden' : 'scroll';
      }
    }

    return 'none';
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

  return function isShownElement(elem: Element, optIgnoreOpacity?: boolean): boolean {
    function displayed(node: Node): boolean {
      if (isElement(node)) {
        var display = getEffectiveStyle(node, 'display');
        var contentVisibility = getEffectiveStyle(node, 'content-visibility');
        if (display === 'none' || contentVisibility === 'hidden') {
          return false;
        }
      }

      var parent = getParentNodeInComposedDom(node);
      if (typeof ShadowRoot === 'function' && parent instanceof ShadowRoot) {
        if (parent.host.shadowRoot && parent.host.shadowRoot !== parent) {
          return false;
        }
        parent = parent.host;
      }

      if (parent && (parent.nodeType === Node.DOCUMENT_NODE || parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE)) {
        return true;
      }

      if (isElement(parent, 'DETAILS') && !(<HTMLDetailsElement>parent).open && !isElement(node, 'SUMMARY')) {
        return false;
      }

      return !!parent && displayed(parent);
    }

    return isShownInternal(elem, !!optIgnoreOpacity, displayed);
  };
})();
