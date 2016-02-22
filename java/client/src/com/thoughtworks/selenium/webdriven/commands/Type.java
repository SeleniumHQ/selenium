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

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.webdriven.ElementFinder;
import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.util.logging.Logger;

public class Type extends SeleneseCommand<Void> {
  private final static Logger log = Logger.getLogger(Type.class.getName());

  private final AlertOverride alertOverride;
  private final JavascriptLibrary js;
  private final ElementFinder finder;
  private final KeyState state;
  private final String type;

  public Type(AlertOverride alertOverride, JavascriptLibrary js, ElementFinder finder,
      KeyState state) {
    this.alertOverride = alertOverride;
    this.js = js;
    this.finder = finder;
    this.state = state;
    type = "return (" + js.getSeleniumScript("type.js") + ").apply(null, arguments);";
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    alertOverride.replaceAlertMethod(driver);

    if (state.controlKeyDown || state.altKeyDown || state.metaKeyDown)
      throw new SeleniumException(
          "type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");

    String valueToUse = state.shiftKeyDown ? value.toUpperCase() : value;

    WebElement element = finder.findElement(driver, locator);

    String tagName = element.getTagName();
    String elementType = element.getAttribute("type");
    if ("input".equals(tagName.toLowerCase()) &&
        elementType != null && "file".equals(elementType.toLowerCase())) {
      log.warning("You should be using attachFile to set the value of a file input element");
      element.sendKeys(valueToUse);
      return null;
    }

    if (!"input".equals(tagName.toLowerCase())) {
      if (driver instanceof JavascriptExecutor) {
        ((JavascriptExecutor) driver).executeScript("arguments[0].value = '';", element);
      }
      element.sendKeys(valueToUse);
      return null;
    }

    if (driver instanceof JavascriptExecutor) {
      js.executeScript(driver, type, element, valueToUse);
    } else {
      element.clear();
      element.sendKeys(valueToUse);
    }

    return null;
  }
}
