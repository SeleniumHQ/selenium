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
import com.thoughtworks.selenium.webdriven.JavascriptLibrary;
import com.thoughtworks.selenium.webdriven.SeleneseCommand;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class IsOrdered extends SeleneseCommand<Boolean> {
  private final ElementFinder finder;
  private final JavascriptLibrary js;

  public IsOrdered(ElementFinder finder, JavascriptLibrary js) {
    this.finder = finder;
    this.js = js;
  }

  @Override
  protected Boolean handleSeleneseCommand(WebDriver driver, String locator1, String locator2) {
    WebElement one = finder.findElement(driver, locator1);
    WebElement two = finder.findElement(driver, locator2);

    String ordered =
        "    if (arguments[0] === arguments[1]) return false;\n" +
            "\n" +
            "    var previousSibling;\n" +
            "    while ((previousSibling = arguments[1].previousSibling) != null) {\n" +
            "        if (previousSibling === arguments[0]) {\n" +
            "            return true;\n" +
            "        }\n" +
            "        arguments[1] = previousSibling;\n" +
            "    }\n" +
            "    return false;\n";

    Boolean result = (Boolean) js.executeScript(driver, ordered, one, two);
    return result != null && result.booleanValue();
  }
}
