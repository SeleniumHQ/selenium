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
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class Type extends SeleneseCommand<Void> {
  private JavascriptLibrary js;
  private ElementFinder finder;
  private final KeyState state;

  public Type(JavascriptLibrary js, ElementFinder finder, KeyState state) {
    this.js = js;
    this.finder = finder;
    this.state = state;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    if (state.controlKeyDown || state.altKeyDown || state.metaKeyDown)
      throw new SeleniumException("type not supported immediately after call to controlKeyDown() or altKeyDown() or metaKeyDown()");

    String type = state.shiftKeyDown ? value.toUpperCase() : value;

    WebElement element = finder.findElement(driver, locator);
    if(driver instanceof JavascriptExecutor && ((JavascriptExecutor) driver).isJavascriptEnabled()) {
        js.callEmbeddedSelenium(driver, "replaceText", element, type);
    } else {
        element.sendKeys(type);
    }

    return null;
  }
}
