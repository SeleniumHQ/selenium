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

public class KeyEvent extends SeleneseCommand<Void> {
  private final ElementFinder elementFinder;
  private final JavascriptLibrary js;
  private final KeyState state;
  private final String eventName;

  public KeyEvent(ElementFinder elementFinder, JavascriptLibrary js, KeyState state,
      String eventName) {
    this.elementFinder = elementFinder;
    this.js = js;
    this.state = state;
    this.eventName = eventName;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    js.callEmbeddedSelenium(driver, eventName, elementFinder.findElement(driver, locator),
        value, state.controlKeyDown, state.altKeyDown, state.shiftKeyDown, state.metaKeyDown);

    return null;
  }
}
