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
 * @fileoverview Locating elements by XPath expression.
 */

/**
 * XPath result types as defined by the W3C DOM XPath specification.
 * @private
 */
enum XPathResultType {
    ORDERED_NODE_SNAPSHOT_TYPE = 7,
    FIRST_ORDERED_NODE_TYPE = 9,
}

/**
 * Default namespace resolver for XPath evaluation.
 * @private
 */
function getDefaultResolver(): (prefix: string) => string | null {
    const namespaces: Record<string, string> = { svg: 'http://www.w3.org/2000/svg' };
    return (prefix: string) => namespaces[prefix] || null;
}

/**
 * Evaluate an XPath expression and return results.
 *
 * @param node The document or element to evaluate the XPath in.
 * @param path The XPath expression to evaluate.
 * @param resultType The desired result type.
 * @returns The XPathResult or null if the document doesn't support XPath.
 * @private
 */
function evaluate(
    node: Document | Element,
    path: string,
    resultType: XPathResultType
): XPathResult | null {
    const doc = (node.nodeType === Node.DOCUMENT_NODE ? node : node.ownerDocument) as Document;

    if (!doc || !doc.documentElement) {
        return null;
    }

    try {
        const resolver = doc.createNSResolver
            ? doc.createNSResolver(doc.documentElement)
            : (getDefaultResolver() as XPathNSResolver);

        return doc.evaluate(path, node, resolver, resultType, null);
    } catch (e) {
        throw new Error(`Invalid XPath: ${path}`);
    }
}

/**
 * Find a single element using an XPath expression.
 *
 * @param path The XPath expression to search for.
 * @param root The document or element to search within.
 * @returns The first element matching the XPath, or null if not found.
 */
export function single(path: string, root: Document | Element): Element | null {
    try {
        const result = evaluate(root, path, XPathResultType.FIRST_ORDERED_NODE_TYPE);
        if (result && result.singleNodeValue && result.singleNodeValue.nodeType === Node.ELEMENT_NODE) {
            return result.singleNodeValue as Element;
        }
    } catch (e) {
        // Ignore XPath evaluation errors
    }
    return null;
}

/**
 * Find all elements using an XPath expression.
 *
 * @param path The XPath expression to search for.
 * @param root The document or element to search within.
 * @returns An array of all elements matching the XPath.
 */
export function many(path: string, root: Document | Element): Element[] {
    try {
        const result = evaluate(root, path, XPathResultType.ORDERED_NODE_SNAPSHOT_TYPE);
        if (!result) {
            return [];
        }

        const elements: Element[] = [];
        for (let i = 0; i < result.snapshotLength; i++) {
            const node = result.snapshotItem(i);
            if (node && node.nodeType === Node.ELEMENT_NODE) {
                elements.push(node as Element);
            }
        }
        return elements;
    } catch (e) {
        // Ignore XPath evaluation errors
    }
    return [];
}
