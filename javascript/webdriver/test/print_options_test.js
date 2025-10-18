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


goog.provide('webdriver.PrintOptionsTest');

goog.require('goog.testing.jsunit');
goog.require('webdriver.PrintOptions');
goog.require('webdriver.PrintOrientation');
goog.require('webdriver.PageSize');
goog.require('webdriver.Margins');

goog.require('webdriver.print_options');

/**
 * Tests for the PrintOptions class.
 */
function testDefaultPageSize() {
    console.log("*******************");

  console.log("Running test: should set default page size to A4");
  const options = new webdriver.PrintOptions();
  assertEquals(
    webdriver.PrintOptions.PaperSize.A4.width,
    options.page.width
  );
  assertEquals(
    webdriver.PrintOptions.PaperSize.A4.height,
    options.page.height
  );
}

function testCustomPageSize() {
  const options = new webdriver.PrintOptions();
  const customSize = { width: 25, height: 30 };
  options.setPageSize(customSize);
  assertEquals(25, options.page.width);
  assertEquals(30, options.page.height);
}

closure_test_suite(
    name = "test",
    data = [
        ":all_files",
        ":deps",
        "//javascript/atoms:deps",
        "//javascript/webdriver/atoms/inject:deps",
    ],
)

function testDebugLogging() {
    console.log("Running debug logging test...");
    fail("Intentional failure to check log output");
  }

function testInvalidPageSize() {
  const options = new webdriver.PrintOptions();
  assertThrows(() => {
    options.setPageSize(null);
  }, 'Invalid page size dimensions.');
}

function testOrientation() {
  const options = new webdriver.PrintOptions();
  options.setOrientation(webdriver.PrintOrientation.LANDSCAPE);
  assertEquals(webdriver.PrintOrientation.LANDSCAPE, options.orientation);
}

function testCustomMargins() {
  const options = new webdriver.PrintOptions();
  const customMargins = { top: 1, right: 2, bottom: 3, left: 4 };
  options.setMargins(customMargins);
  assertEquals(1, options.margin.top);
  assertEquals(2, options.margin.right);
  assertEquals(3, options.margin.bottom);
  assertEquals(4, options.margin.left);
}

function testNegativeMargins() {
  const options = new webdriver.PrintOptions();
  assertThrows(() => {
    options.setMargins({ top: -1, right: 1, bottom: 1, left: 1 });
  }, 'Margins cannot have negative values.');
}

function testPageRanges() {
  const options = new webdriver.PrintOptions();
  options.addPageRange('1-5');
  assertEquals('1-5', options.pageRanges.join(','));
}

function testInvalidPageRanges() {
  const options = new webdriver.PrintOptions();
  assertThrows(() => {
    options.addPageRange('1-2-3');
  }, 'Invalid page range format.');
}

function testSerialization() {
  const options = new webdriver.PrintOptions();
  options.setOrientation(webdriver.PrintOrientation.LANDSCAPE);
  options.setScale(1.5);
  options.setPageSize(webdriver.PrintOptions.PaperSize.LETTER);
  options.setMargins({ top: 1, right: 1, bottom: 1, left: 1 });
  options.addPageRange('1-5');

  const dict = options.toJSON();
  assertObjectEquals(dict, {
    orientation: 'landscape',
    scale: 1.5,
    background: false,
    shrinkToFit: true,
    page: { width: 21.59, height: 27.94 },
    margin: { top: 1, right: 1, bottom: 1, left: 1 },
    pageRanges: '1-5',
  });
}
