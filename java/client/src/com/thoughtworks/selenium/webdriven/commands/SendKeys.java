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

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;

public class SendKeys extends SeleneseCommand<Void> {
  private final AlertOverride alertOverride;
  private final ElementFinder finder;

  public SendKeys(AlertOverride alertOverride, ElementFinder finder) {
    this.alertOverride = alertOverride;
    this.finder = finder;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String locator, String value) {
    alertOverride.replaceAlertMethod(driver);

    value = value.replace("${KEY_ALT}", Keys.ALT);
    value = value.replace("${KEY_CONTROL}", Keys.CONTROL);
    value = value.replace("${KEY_CTRL}", Keys.CONTROL);
    value = value.replace("${KEY_META}", Keys.META);
    value = value.replace("${KEY_COMMAND}", Keys.COMMAND);
    value = value.replace("${KEY_SHIFT}", Keys.SHIFT);

    value = value.replace("${KEY_BACKSPACE}", Keys.BACK_SPACE);
    value = value.replace("${KEY_BKSP}", Keys.BACK_SPACE);
    value = value.replace("${KEY_DELETE}", Keys.DELETE);
    value = value.replace("${KEY_DEL}", Keys.DELETE);
    value = value.replace("${KEY_ENTER}", Keys.ENTER);
    value = value.replace("${KEY_EQUALS}", Keys.EQUALS);
    value = value.replace("${KEY_ESCAPE}", Keys.ESCAPE);
    value = value.replace("${KEY_ESC}", Keys.ESCAPE);
    value = value.replace("${KEY_INSERT}", Keys.INSERT);
    value = value.replace("${KEY_INS}", Keys.INSERT);
    value = value.replace("${KEY_PAUSE}", Keys.PAUSE);
    value = value.replace("${KEY_SEMICOLON}", Keys.SEMICOLON);
    value = value.replace("${KEY_SPACE}", Keys.SPACE);
    value = value.replace("${KEY_TAB}", Keys.TAB);

    value = value.replace("${KEY_LEFT}", Keys.LEFT);
    value = value.replace("${KEY_UP}", Keys.UP);
    value = value.replace("${KEY_RIGHT}", Keys.RIGHT);
    value = value.replace("${KEY_DOWN}", Keys.DOWN);
    value = value.replace("${KEY_PAGE_UP}", Keys.PAGE_UP);
    value = value.replace("${KEY_PGUP}", Keys.PAGE_UP);
    value = value.replace("${KEY_PAGE_DOWN}", Keys.PAGE_DOWN);
    value = value.replace("${KEY_PGDN}", Keys.PAGE_DOWN);
    value = value.replace("${KEY_END}", Keys.END);
    value = value.replace("${KEY_HOME}", Keys.HOME);

    value = value.replace("${KEY_NUMPAD0}", Keys.NUMPAD0);
    value = value.replace("${KEY_N0}", Keys.NUMPAD0);
    value = value.replace("${KEY_NUMPAD1}", Keys.NUMPAD1);
    value = value.replace("${KEY_N1}", Keys.NUMPAD1);
    value = value.replace("${KEY_NUMPAD2}", Keys.NUMPAD2);
    value = value.replace("${KEY_N2}", Keys.NUMPAD2);
    value = value.replace("${KEY_NUMPAD3}", Keys.NUMPAD3);
    value = value.replace("${KEY_N3}", Keys.NUMPAD3);
    value = value.replace("${KEY_NUMPAD4}", Keys.NUMPAD4);
    value = value.replace("${KEY_N4}", Keys.NUMPAD4);
    value = value.replace("${KEY_NUMPAD5}", Keys.NUMPAD5);
    value = value.replace("${KEY_N5}", Keys.NUMPAD5);
    value = value.replace("${KEY_NUMPAD6}", Keys.NUMPAD6);
    value = value.replace("${KEY_N6}", Keys.NUMPAD6);
    value = value.replace("${KEY_NUMPAD7}", Keys.NUMPAD7);
    value = value.replace("${KEY_N7}", Keys.NUMPAD7);
    value = value.replace("${KEY_NUMPAD8}", Keys.NUMPAD8);
    value = value.replace("${KEY_N8}", Keys.NUMPAD8);
    value = value.replace("${KEY_NUMPAD9}", Keys.NUMPAD9);
    value = value.replace("${KEY_N9}", Keys.NUMPAD9);
    value = value.replace("${KEY_ADD}", Keys.ADD);
    value = value.replace("${KEY_NUM_PLUS}", Keys.ADD);
    value = value.replace("${KEY_DECIMAL}", Keys.DECIMAL);
    value = value.replace("${KEY_NUM_PERIOD}", Keys.DECIMAL);
    value = value.replace("${KEY_DIVIDE}", Keys.DIVIDE);
    value = value.replace("${KEY_NUM_DIVISION}", Keys.DIVIDE);
    value = value.replace("${KEY_MULTIPLY}", Keys.MULTIPLY);
    value = value.replace("${KEY_NUM_MULTIPLY}", Keys.MULTIPLY);
    value = value.replace("${KEY_SEPARATOR}", Keys.SEPARATOR);
    value = value.replace("${KEY_SEP}", Keys.SEPARATOR);
    value = value.replace("${KEY_SUBTRACT}", Keys.SUBTRACT);
    value = value.replace("${KEY_NUM_MINUS}", Keys.SUBTRACT);

    value = value.replace("${KEY_F1}", Keys.F1);
    value = value.replace("${KEY_F2}", Keys.F2);
    value = value.replace("${KEY_F3}", Keys.F3);
    value = value.replace("${KEY_F4}", Keys.F4);
    value = value.replace("${KEY_F5}", Keys.F5);
    value = value.replace("${KEY_F6}", Keys.F6);
    value = value.replace("${KEY_F7}", Keys.F7);
    value = value.replace("${KEY_F8}", Keys.F8);
    value = value.replace("${KEY_F9}", Keys.F9);
    value = value.replace("${KEY_F10}", Keys.F10);
    value = value.replace("${KEY_F11}", Keys.F11);
    value = value.replace("${KEY_F12}", Keys.F12);

    finder.findElement(driver, locator).sendKeys(value);

    return null;
  }
}
