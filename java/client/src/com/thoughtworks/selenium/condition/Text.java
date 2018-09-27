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

package com.thoughtworks.selenium.condition;

/**
 * Checks whether text exists either anywhere on the page, or inside a given locator.
 */
public class Text extends Condition {
  private final String locator;
  private final String expectedText;

  /**
   * Look for text anywhere on the page.
   *
   * @param expectedText text we're looking for
   */
  public Text(String expectedText) {
    this(expectedText, null);
  }

  /**
   * Look for text inside a given locator.
   *
   * @param expectedText text we're looking for
   * @param locator Selenium locator
   */
  public Text(String expectedText, String locator) {
    super("Expecting text " + expectedText + (null == locator ? "" : " in " + locator));
    this.locator = locator;
    this.expectedText = expectedText;
  }

  @Override
  public boolean isTrue(ConditionRunner.Context context) {
    if (null == locator) {
      return context.getSelenium().isTextPresent(expectedText);
    }
    return context.getSelenium().getText(locator).equalsIgnoreCase(expectedText);
  }
}
