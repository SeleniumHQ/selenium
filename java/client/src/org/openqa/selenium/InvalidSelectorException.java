/*
Copyright 2011 Selenium committers
Portions copyright 2011 Software Freedom Conservancy

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

/*
 * Thrown by {@link WebDriver#findElement(By) WebDriver.findElement(By by)}
 * and {@link WebElement#findElement(By by) WebElement.findElement(By by)}.
 * Thrown when the selector which is used to find an element does not return
 * a WebElement. Currently this only happens when the selector is an xpath
 * expression is used which is either syntactically invalid (i.e. it is not a
 * xpath expression) or the expression does not select WebElements
 * (e.g. "count(//input)").
 */
public class InvalidSelectorException extends NoSuchElementException {

  public InvalidSelectorException(String reason) {
    super(reason);
  }

  public InvalidSelectorException(String reason, Throwable cause) {
    super(reason, cause);
  }

  @Override
  public String getSupportUrl() {
    return "http://seleniumhq.org/exceptions/invalid_selector_exception.html";
  }
}
