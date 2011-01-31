/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.chrome;

import org.openqa.selenium.WebDriverException;

/**
 * Exception used to signal that Chrome is not (or is no longer) running.
 *
 * @author jmleyba@gmail.com (Jason Leyba)
 */
public class ChromeNotRunningException extends WebDriverException {

  public ChromeNotRunningException() {
  }

  public ChromeNotRunningException(String message) {
    super(message);
  }

  public ChromeNotRunningException(Throwable cause) {
    super(cause);
  }

  public ChromeNotRunningException(String message, Throwable cause) {
    super(message, cause);
  }
}
