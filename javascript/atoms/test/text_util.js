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
 * @fileoverview Utilities for testing {@code bot.dom.getVisibleText}.
 */

goog.require('bot.dom');
goog.require('goog.array');
goog.require('goog.dom');
goog.require('goog.dom.NodeType');
goog.require('goog.testing.TestCase');


function getTestContainer() {
  function createTestContainer() {
    var testContainer = goog.dom.createDom('DIV', {
      id: 'test-container',
      style: 'border: 1px dotted silver'
    }, goog.dom.createDom('DIV', {
      style: 'font-weight:bold;' +
          'text-decoration:underline;' +
          'font-style:italic;' +
          'margin: 0.5em'
    }, 'Test Container'));
    document.body.appendChild(testContainer);
    return testContainer;
  }

  return goog.dom.getElement('test-container') || createTestContainer();
}


/**
 * Verifies that the visible text for the test DOM structure.
 * @param {!Element} element The element to check the text of.
 * @param {...string} var_args Variadic args for the expected lines
 *     of visible text.
 */
function assertTextIs(element, var_args) {
  if (!element.parentNode ||
      // IE sets the parentNode of unattached elements to a document fragment.
      element.parentNode.nodeType != goog.dom.NodeType.ELEMENT) {
    var testContainer = getTestContainer();
    testContainer.appendChild(createTestDom(element));
  }

  var expected = goog.array.slice(arguments, 1).join('\n');
  var actual = bot.dom.getVisibleText(element);

  assertEquals(
      'Expected: ' + escapeText(expected) +
      '\n but was: ' + escapeText(actual) +
      '\n raw html:\n' + element.innerHTML +
      '\n------\n',
      expected, actual);

  function createTestDom(element) {
    return goog.dom.createDom('div', {'style': 'width: 25em;'},
        goog.dom.createDom('div',
            {'style': [
              'margin: 0 0.5em;',
              'padding: 0;',
              'font-style: italic;',
              'color: gray;'
            ].join('')},
            goog.testing.TestCase.currentTestName),
        goog.dom.createDom('div', {
          'style': 'margin-bottom: 0.5em'
        }, element));
  }

  function escapeText(text) {
    return text.replace(/\n/g, '\\n');//.replace(/\s/g, '\\s');
  }
}
