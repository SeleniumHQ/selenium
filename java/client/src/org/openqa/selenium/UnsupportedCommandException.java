/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium;

/**
 * Used to indicate that a command used by the remote webdriver is unsupported.
 */
public class UnsupportedCommandException extends WebDriverException {

  private static final long serialVersionUID = 1627610118479812117L;

  public UnsupportedCommandException() {
    super();
  }

  public UnsupportedCommandException(String message) {
    super(message);
  }

  public UnsupportedCommandException(Throwable cause) {
    super(cause);
  }

  public UnsupportedCommandException(String message, Throwable cause) {
    super(message, cause);
  }
}
