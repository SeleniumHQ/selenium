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

package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class IsEditable extends SeleneseCommand<Boolean> {
  private final ElementFinder finder;

  public IsEditable(ElementFinder finder) {
    this.finder = finder;
  }

  @Override
  protected Boolean handleSeleneseCommand(WebDriver driver, String locator, String value) {
    WebElement element = finder.findElement(driver, locator);
    String tagName = element.getTagName().toLowerCase();
    boolean acceptableTagName = "input".equals(tagName) || "select".equals(tagName);
    String readonly = "";
    if ("input".equals(tagName)) {
      readonly = element.getAttribute("readonly");
      if (readonly == null || "false".equals(readonly)) {
        readonly = "";
      }
    }

    return element.isEnabled() && acceptableTagName && "".equals(readonly);
  }
}
