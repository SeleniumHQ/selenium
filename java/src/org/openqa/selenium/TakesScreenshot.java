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
package org.openqa.selenium;

/**
 * Indicates a driver or an HTML element that can capture a screenshot and store it in different
 * ways.
 *
 * <p>Example usage:
 *
 * <pre>
 * File screenshotFile = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
 * String screenshotBase64 = ((TakesScreenshot) element).getScreenshotAs(OutputType.BASE64);
 * </pre>
 *
 * @see OutputType
 */
public interface TakesScreenshot {
  /**
   * Capture the screenshot and store it in the specified location.
   *
   * <p>For a W3C-conformant WebDriver or WebElement, this behaves as stated in <a
   * href="https://w3c.github.io/webdriver/#screen-capture">W3C WebDriver specification</a>.
   *
   * <p>For a non-W3C-conformant WebDriver, this makes a best effort depending on the browser to
   * return the following in order of preference:
   *
   * <ul>
   *   <li>Entire page
   *   <li>Current window
   *   <li>Visible portion of the current frame
   *   <li>The screenshot of the entire display containing the browser
   * </ul>
   *
   * For a non-W3C-conformant WebElement extending TakesScreenshot, this makes a best effort
   * depending on the browser to return the following in order of preference:
   *
   * <ul>
   *   <li>The entire content of the HTML element
   *   <li>The visible portion of the HTML element
   * </ul>
   *
   * @param <X> Return type for getScreenshotAs.
   * @param target target type, @see OutputType
   * @return Object in which is stored information about the screenshot.
   * @throws WebDriverException on failure.
   * @throws UnsupportedOperationException if the underlying implementation does not support
   *     screenshot capturing.
   */
  <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException;
}
