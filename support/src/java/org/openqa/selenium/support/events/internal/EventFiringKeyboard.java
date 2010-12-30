// Copyright 2010 Google Inc. All Rights Reserved.
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
