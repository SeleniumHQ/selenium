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

/**
 * @fileoverview Functions to locate elements by XPath.
 *
 * The locator implementations below differ from the Closure functions
 * goog.dom.xml.{selectSingleNode,selectNodes} in three important ways:
 * 1. they do not refer to "document" which is undefined in the context of a
 *    Firefox extension;
 * 2. they use a default NsResolver for browsers that do not provide
 *    document.createNSResolver (e.g. Android); and
 * 3. they prefer document.evaluate to node.{selectSingleNode,selectNodes}
 *    because the latter silently return nothing when the xpath resolves to a
 *    non-Node type, limiting the error-checking the implementation can provide.
 */

import { BotError, ErrorCode } from '../error';

const NODE_TYPE_ELEMENT = 1;

/**
 * XPathResult enum values. These are defined separately since
 * the context running this script may not support the XPathResult type.
 */
const XPathResultType = {
  ORDERED_NODE_SNAPSHOT_TYPE: 7,
  FIRST_ORDERED_NODE_TYPE: 9,
} as const;

/**
 * Default XPath namespace resolver.
 */
const DEFAULT_RESOLVER: XPathNSResolver = {
  lookupNamespaceURI(prefix: string | null): string | null {
    const namespaces: Record<string, string> = { svg: 'http://www.w3.org/2000/svg' };
    return prefix ? namespaces[prefix] || null : null;
  },
};

/**
 * Gets the owner document for a node.
 */
function getOwnerDocument(node: Node): Document {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument || document;
}

/**
 * Evaluates an XPath expression using a W3 XPathEvaluator.
 *
 * @param node The document or element to perform the search under.
 * @param path The xpath to search for.
 * @param resultType The desired result type.
 * @return The XPathResult or null if the root's ownerDocument
 *     does not support XPathEvaluators.
 */
function evaluate(
  node: Document | Element,
  path: string,
  resultType: number
): XPathResult | null {
  const doc = getOwnerDocument(node);

  if (!doc.documentElement) {
    return null;
  }

  try {
    let resolver: XPathNSResolver = doc.createNSResolver
      ? doc.createNSResolver(doc.documentElement)
      : DEFAULT_RESOLVER;

    // Build dynamic namespace resolver for modern browsers
    const reversedNamespaces: Record<string, string> = {};
    const allNodes = doc.getElementsByTagName('*');
    for (let i = 0; i < allNodes.length; ++i) {
      const n = allNodes[i];
      const ns = n.namespaceURI;
      if (ns && !reversedNamespaces[ns]) {
        let prefix = n.lookupPrefix(ns);
        if (!prefix) {
          const m = ns.match('.*/(\\w+)/?$');
          if (m) {
            prefix = m[1];
          } else {
            prefix = 'xhtml';
          }
        }
        reversedNamespaces[ns] = prefix;
      }
    }
    const namespaces: Record<string, string> = {};
    for (const key in reversedNamespaces) {
      namespaces[reversedNamespaces[key]] = key;
    }
    resolver = {
      lookupNamespaceURI(prefix: string | null): string | null {
        return prefix ? namespaces[prefix] || null : null;
      },
    };

    try {
      return doc.evaluate(path, node, resolver, resultType, null);
    } catch (te) {
      if ((te as Error).name === 'TypeError') {
        // fallback to simplified implementation
        resolver = doc.createNSResolver
          ? doc.createNSResolver(doc.documentElement)
          : DEFAULT_RESOLVER;
        return doc.evaluate(path, node, resolver, resultType, null);
      } else {
        throw te;
      }
    }
  } catch (ex) {
    // The Firefox XPath evaluator can throw an exception if the document is
    // queried while it's in the midst of reloading, so we ignore it. In all
    // other cases, we assume an invalid xpath has caused the exception.
    if (!((ex as Error).name === 'NS_ERROR_ILLEGAL_VALUE')) {
      throw new BotError(
        ErrorCode.INVALID_SELECTOR_ERROR,
        'Unable to locate an element with the xpath expression ' +
          path +
          ' because of the following error:\n' +
          ex
      );
    }
  }

  return null;
}

/**
 * Checks whether a node is an element.
 *
 * @param node Node to check whether it is an Element.
 * @param path XPath expression to include in the error message.
 */
function checkElement(node: Node | undefined, path: string): void {
  if (!node || node.nodeType !== NODE_TYPE_ELEMENT) {
    throw new BotError(
      ErrorCode.INVALID_SELECTOR_ERROR,
      'The result of the xpath expression "' +
        path +
        '" is: ' +
        node +
        '. It should be an element.'
    );
  }
}

interface NodeWithSelectSingleNode extends Node {
  selectSingleNode?: (xpath: string) => Node | null;
}

interface NodeWithSelectNodes extends Node {
  selectNodes?: (xpath: string) => NodeList;
}

interface DocumentWithSetProperty extends Document {
  setProperty?: (name: string, value: string) => void;
}

/**
 * Find an element by using an xpath expression.
 *
 * @param target The xpath to search for.
 * @param root The document or element to perform the search under.
 * @return The first matching element found in the DOM, or null if no
 *     such element could be found.
 */
export function single(target: string, root: Document | Element): Element | null {
  function selectSingleNode(): Node | null {
    const result = evaluate(root, target, XPathResultType.FIRST_ORDERED_NODE_TYPE);

    if (result) {
      const node = result.singleNodeValue;
      return node || null;
    } else if ((root as NodeWithSelectSingleNode).selectSingleNode) {
      const doc = getOwnerDocument(root) as DocumentWithSetProperty;
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return (root as NodeWithSelectSingleNode).selectSingleNode!(target);
    }
    return null;
  }

  const node = selectSingleNode();
  if (node !== null) {
    checkElement(node, target);
  }
  return node as Element | null;
}

/**
 * Find elements by using an xpath expression.
 *
 * @param target The xpath to search for.
 * @param root The document or element to perform the search under.
 * @return All matching elements, or an empty list.
 */
export function many(target: string, root: Document | Element): Element[] {
  function selectNodes(): Node[] {
    const result = evaluate(root, target, XPathResultType.ORDERED_NODE_SNAPSHOT_TYPE);
    if (result) {
      const count = result.snapshotLength;
      const results: Node[] = [];
      for (let i = 0; i < count; ++i) {
        const item = result.snapshotItem(i);
        if (item) {
          results.push(item);
        }
      }
      return results;
    } else if ((root as NodeWithSelectNodes).selectNodes) {
      const doc = getOwnerDocument(root) as DocumentWithSetProperty;
      if (doc.setProperty) {
        doc.setProperty('SelectionLanguage', 'XPath');
      }
      return Array.from((root as NodeWithSelectNodes).selectNodes!(target));
    }
    return [];
  }

  const nodes = selectNodes();
  nodes.forEach((n) => {
    checkElement(n, target);
  });
  return nodes as Element[];
}
