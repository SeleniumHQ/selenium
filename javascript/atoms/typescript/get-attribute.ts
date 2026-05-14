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

(function (): (element: Element, attribute: string) => string | null {
  /**
   * Common aliases for properties. This maps names that users use to the
   * correct property name.
   */
  const PROPERTY_ALIASES: Record<string, string> = {
    'class': 'className',
    'readonly': 'readOnly',
  };

  /**
   * Boolean properties extracted from the WHATWG spec:
   *   http://www.whatwg.org/specs/web-apps/current-work/
   *
   * These must all be lower-case.
   */
  const BOOLEAN_PROPERTIES: string[] = [
    'allowfullscreen',
    'allowpaymentrequest',
    'allowusermedia',
    'async',
    'autofocus',
    'autoplay',
    'checked',
    'compact',
    'complete',
    'controls',
    'declare',
    'default',
    'defaultchecked',
    'defaultselected',
    'defer',
    'disabled',
    'ended',
    'formnovalidate',
    'hidden',
    'indeterminate',
    'iscontenteditable',
    'ismap',
    'itemscope',
    'loop',
    'multiple',
    'muted',
    'nohref',
    'nomodule',
    'noresize',
    'noshade',
    'novalidate',
    'nowrap',
    'open',
    'paused',
    'playsinline',
    'pubdate',
    'readonly',
    'required',
    'reversed',
    'scoped',
    'seamless',
    'seeking',
    'selected',
    'truespeed',
    'typemustmatch',
    'willvalidate',
  ];

  function getAttribute(element: Element, attributeName: string): string | null {
    return element.getAttribute(attributeName.toLowerCase());
  }

  function getProperty(element: Element, propertyName: string): unknown {
    return (element as unknown as Record<string, unknown>)[propertyName];
  }

  function isElement(node: unknown, tagName?: string): node is Element {
    const elem = node as { nodeType?: number; tagName?: string } | null;
    if (!elem || elem.nodeType !== 1) {
      return false;
    }
    if (!tagName) {
      return true;
    }
    const normalizedTag = tagName.toUpperCase();
    if (node instanceof HTMLFormElement) {
      return normalizedTag === 'FORM';
    }
    return typeof elem.tagName === 'string' && elem.tagName.toUpperCase() === normalizedTag;
  }

  function isSelectable(element: Element): boolean {
    if (isElement(element, 'OPTION')) {
      return true;
    }
    if (isElement(element, 'INPUT')) {
      const type = (element as HTMLInputElement).type.toLowerCase();
      return type === 'checkbox' || type === 'radio';
    }
    return false;
  }

  function isSelected(element: Element): boolean {
    if (isElement(element, 'OPTION')) {
      return (element as HTMLOptionElement).selected;
    }
    const type = (element as HTMLInputElement).type?.toLowerCase();
    if (type === 'checkbox' || type === 'radio') {
      return (element as HTMLInputElement).checked;
    }
    return false;
  }

  function isObject(value: unknown): boolean {
    return value !== null && (typeof value === 'object' || typeof value === 'function');
  }

  /**
   * Get the value of the given property or attribute. If the "attribute" is for
   * a boolean property, we return null in the case where the value is false. If
   * the attribute name is "style" an attempt to convert that style into a string
   * is done.
   *
   * @param element The element to use.
   * @param attribute The name of the attribute to look up.
   * @return The string value of the attribute or property, or null.
   */
  return function get(element: Element, attribute: string): string | null {
    const name = attribute.toLowerCase();

    if (name === 'style') {
      const style = (element as HTMLElement).style;
      if (!style) {
        return null;
      }
      return typeof style === 'string' ? style : style.cssText;
    }

    if ((name === 'selected' || name === 'checked') && isSelectable(element)) {
      return isSelected(element) ? 'true' : null;
    }

    const isLink = isElement(element, 'A');
    const isImg = isElement(element, 'IMG');

    if ((isImg && name === 'src') || (isLink && name === 'href')) {
      const attrValue = getAttribute(element, name);
      if (attrValue) {
        return String(getProperty(element, name));
      }
      return attrValue;
    }

    if (name === 'spellcheck') {
      const attrValue = getAttribute(element, name);
      if (attrValue !== null) {
        const lower = attrValue.toLowerCase();
        if (lower === 'false') {
          return 'false';
        }
        if (lower === 'true') {
          return 'true';
        }
      }
      return String(getProperty(element, name));
    }

    const propName = PROPERTY_ALIASES[name] || attribute;

    if (BOOLEAN_PROPERTIES.indexOf(name) !== -1) {
      const hasAttr = getAttribute(element, attribute) !== null;
      const propValue = getProperty(element, propName);
      return hasAttr || !!propValue ? 'true' : null;
    }

    // Special-case: for list items (<li>), the value property is numeric;
    // callers expecting the attribute's literal string value should get the
    // HTML attribute instead of the coerced numeric property.
    if (name === 'value' && isElement(element, 'LI')) {
      const attrValue = getAttribute(element, attribute);
      return attrValue != null ? attrValue : null;
    }

    // For regular attributes, try the property first since it may be updated
    // dynamically (e.g., input.value set by JavaScript). Fall back to the
    // HTML attribute only for cases where the property is null/undefined/object,
    // such as event handlers in Firefox or expando properties.
    let property: unknown;
    try {
      property = getProperty(element, propName);
    } catch (_e) {
      // Leaves property undefined; getAttribute below will be used as fallback.
    }

    // Fall back to getAttribute when property is null/undefined or an object.
    // This handles event handlers in Firefox and other edge cases.
    if (property == null || isObject(property)) {
      const attrValue = getAttribute(element, attribute);
      return attrValue != null ? attrValue : null;
    }

    return property != null ? String(property) : null;
  };
})()
