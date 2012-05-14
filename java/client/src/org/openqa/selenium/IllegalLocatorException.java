/*
Copyright 2007-2009 Selenium committers

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
 * Thrown when a By cannot handle the arguments it is given. The most obvious case where this
 * excpetion would be thrown is when By.className() is used with a compound class name.
 */
public class IllegalLocatorException extends WebDriverException {
  public IllegalLocatorException(String message) {
    super(message);
  }

  public IllegalLocatorException(String message, Throwable cause) {
    super(message, cause);
  }
}
