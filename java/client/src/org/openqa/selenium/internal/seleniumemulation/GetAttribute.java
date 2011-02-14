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

package org.openqa.selenium.internal.seleniumemulation;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

public class GetAttribute extends SeleneseCommand<String> {
  private final String getAttribute;
  private final JavascriptLibrary library;
  private final ElementFinder finder;

    public GetAttribute(JavascriptLibrary library, ElementFinder finder) {
    this.library = library;
        this.finder = finder;
        getAttribute = "return (" + library.getSeleniumScript("getAttribute.js") + ").apply(null, arguments);";
  }

  @Override
  protected String handleSeleneseCommand(WebDriver driver, String attributeLocator, String ignored) {
    try {
      return (String) library.executeScript(driver, getAttribute, attributeLocator);
    } catch (WebDriverException e) {
      int atSign = attributeLocator.lastIndexOf("@");
      String elementLocator = attributeLocator.substring(0, atSign - 1);
      String attributeName = attributeLocator.substring(atSign + 1);

      WebElement element = finder.findElement(driver, elementLocator);
      return element.getAttribute(attributeName);
    }
  }
}
