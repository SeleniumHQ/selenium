/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.support.ui;

import org.openqa.selenium.WebDriverException;

/**
 * A simple exception that is thrown if an {@link ExpectedCondition} is not met
 * met by a {@link Wait}. See the documentation in {@link WebDriverWait} for
 * more information.
 */
public class TimeoutException extends WebDriverException {
  /**
   * Time out a test, indicating why the timeout occurred.
   */
  public TimeoutException(String message) {
    super(message);
  }

  /**
   * Time out a test, indicating why the timeout occurred and giving a cause.
   */
  public TimeoutException(String message, Throwable cause) {
    super(message, cause);
  }
}
