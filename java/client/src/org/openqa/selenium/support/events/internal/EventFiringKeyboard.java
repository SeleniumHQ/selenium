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


package org.openqa.selenium.support.events.internal;

import java.lang.reflect.Proxy;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Keyboard;
import org.openqa.selenium.support.events.EventFiringInvocationHandler;
import org.openqa.selenium.support.events.listeners.KeyboardEventListener;

/**
 * A keyboard firing events.
 */
public class EventFiringKeyboard implements Keyboard {
  private final WebDriver driver;
  private final KeyboardEventListener dispatcher;
  private final Keyboard keyboard;

  public EventFiringKeyboard(WebDriver driver, KeyboardEventListener dispatcher) {
    this.driver = driver;
    this.dispatcher = dispatcher;
    this.keyboard = (Keyboard) Proxy.newProxyInstance(Keyboard.class
        .getClassLoader(), new Class[] { Keyboard.class },
        new EventFiringInvocationHandler(dispatcher, driver,
            ((HasInputDevices) this.driver).getKeyboard()));
  }

  public void sendKeys(CharSequence... keysToSend) {
    dispatcher.beforeSendKeys(driver, keysToSend);
    keyboard.sendKeys(keysToSend);
    dispatcher.afterSendKeys(driver, keysToSend);
  }

  public void pressKey(CharSequence keyToPress) {
    dispatcher.beforePressdKey(driver, keyToPress);
    keyboard.pressKey(keyToPress);
    dispatcher.afterPressKey(driver, keyToPress);
  }

  public void releaseKey(CharSequence keyToRelease) {
    dispatcher.beforeReleaseKey(driver, keyToRelease);
    keyboard.releaseKey(keyToRelease);
    dispatcher.afterReleaseKey(driver, keyToRelease);
  }
}
