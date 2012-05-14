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

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

public class GetText extends SeleneseCommand<String> {
  private final JavascriptLibrary library;
  private final ElementFinder finder;

  public GetText(JavascriptLibrary library, ElementFinder finder) {
    this.library = library;
    this.finder = finder;
  }

  @Override
  protected String handleSeleneseCommand(WebDriver driver, String locator, String ignored) {
    String getText = library.getSeleniumScript("getText.js");

    try {
      return (String) ((JavascriptExecutor) driver).executeScript(
          "return (" + getText + ")(arguments[0]);", locator);
    } catch (WebDriverException e) {
      // TODO(simon): remove fall back for IE driver
      WebElement element = finder.findElement(driver, locator);
      return element.getText();
    }
  }
}
