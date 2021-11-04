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

/*
 * Thrown by {@link WebDriver#findElement(By) WebDriver.findElement(By by)}
 * and {@link WebElement#findElement(By by) WebElement.findElement(By by)}.
 * Thrown when the selector which is used to find an element is invalid.
 * It can be a query with syntax errors, e.g. XPath or CSS query with syntax
 * errors, or a compound class name passed as an argument to By.className(),
 * or the expression does not select WebElements (e.g. "count(//input)").
 */
public class InvalidSelectorException extends NoSuchElementException {

  private static final String SUPPORT_URL =
    BASE_SUPPORT_URL + "#invalid_selector_exception";

  public InvalidSelectorException(String reason) {
    super(reason);
  }

  public InvalidSelectorException(String reason, Throwable cause) {
    super(reason, cause);
  }

  @Override
  public String getSupportUrl() {
    return SUPPORT_URL;
  }
}
