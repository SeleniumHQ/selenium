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

(function (element: Element, attribute: string): string | null {
  const PROPERTY_ALIASES: Record<string, string> = {
    'class': 'className',
    'readonly': 'readOnly',
  };

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

  if (name === 'value' && isElement(element, 'LI')) {
    const attrValue = getAttribute(element, attribute);
    return attrValue != null ? attrValue : null;
  }

  let property: unknown;
  try {
    property = getProperty(element, propName);
  } catch (_e) {
    // getAttribute below will be used as fallback
  }

  if (property == null || isObject(property)) {
    const attrValue = getAttribute(element, attribute);
    return attrValue != null ? attrValue : null;
  }

  return property != null ? String(property) : null;
})
