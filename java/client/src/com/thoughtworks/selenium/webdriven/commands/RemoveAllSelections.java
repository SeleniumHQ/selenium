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

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.List;

public class RemoveAllSelections extends SeleneseCommand<Void> {
  private final ElementFinder finder;

  public RemoveAllSelections(ElementFinder finder) {
    this.finder = finder;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    WebElement select = finder.findElement(driver, locator);
    List<WebElement> options = select.findElements(By.tagName("option"));

    String multiple = select.getAttribute("multiple");
    if (multiple == null || "".equals(multiple)) {
      return null;
    }

    removeAllSelections(options);

    return null;
  }

  private void removeAllSelections(List<WebElement> options) {
    for (WebElement option : options) {
      if (option.isSelected())
        option.click();
    }
  }
}
