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

import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class AddSelection extends SeleneseCommand<Void> {
  private ElementFinder finder;
  private SeleniumSelect select;

  public AddSelection(ElementFinder elementFinder, SeleniumSelect select) {
    this.finder = elementFinder;
    this.select = select;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String optionLocator) {
    WebElement element = finder.findElement(driver, locator);
    if (!select.isMultiple(element)) {
      throw new SeleniumException("You may only add a selection to a select that supports multiple selections");
    }
    select.select(driver, locator, optionLocator, true, false);
    return null;
  }
}
