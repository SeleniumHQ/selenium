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

package com.thoughtworks.selenium.webdriven.commands;

import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class GetValue extends SeleneseCommand<String> {
  private final ElementFinder finder;

  public GetValue(ElementFinder finder) {
    this.finder = finder;
  }

  @Override
  protected String handleSeleneseCommand(WebDriver driver, String locator, String ignored) {
    WebElement element = finder.findElement(driver, locator);
    // Special-case handling for checkboxes and radio buttons: The Selenium API returns "on" for
    // checked checkboxes and radio buttons and off for unchecked ones. WebDriver will return "null" for
    // the "checked" attribute if the checkbox or the radio button is not-checked, "true" otherwise.
    if (element.getTagName().equals("input")
        && (element.getAttribute("type").equals("checkbox")
            || element.getAttribute("type").equals("radio")))
    {
      if (element.getAttribute("checked") == null) {
        return "off";
      }
      return "on";
    }

    return element.getAttribute("value");
  }
}
