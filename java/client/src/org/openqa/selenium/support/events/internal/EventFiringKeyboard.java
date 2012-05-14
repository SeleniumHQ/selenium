/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.support.events.internal;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.events.WebDriverEventListener;

/**
 * A keyboard firing events.
 */
public class EventFiringKeyboard implements Keyboard {
  private final WebDriver driver;
  private final WebDriverEventListener dispatcher;
  private final Keyboard keyboard;

  public EventFiringKeyboard(WebDriver driver, WebDriverEventListener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.keyboard = ((HasInputDevices) this.driver).getKeyboard();

  }

  public void sendKeys(CharSequence... keysToSend) {
    keyboard.sendKeys(keysToSend);
  }

  public void pressKey(Keys keyToPress) {
    keyboard.pressKey(keyToPress);
  }

  public void releaseKey(Keys keyToRelease) {
    keyboard.releaseKey(keyToRelease);
  }
}
