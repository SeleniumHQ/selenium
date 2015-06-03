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

package org.openqa.selenium.htmlunit;

import java.io.IOException;

import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Keyboard;

import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlFileInput;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.html.HtmlPasswordInput;
import com.gargoylesoftware.htmlunit.html.HtmlTextArea;
import com.gargoylesoftware.htmlunit.html.HtmlTextInput;
import com.gargoylesoftware.htmlunit.javascript.host.event.Event;
import com.gargoylesoftware.htmlunit.javascript.host.event.KeyboardEvent;

/**
 * Implements keyboard operations using the HtmlUnit WebDriver.
 *
 */
public class HtmlUnitKeyboard implements Keyboard {
  private KeyboardModifiersState modifiersState = new KeyboardModifiersState();
  private final HtmlUnitDriver parent;

  HtmlUnitKeyboard(HtmlUnitDriver parent) {
    this.parent = parent;
  }

  private HtmlUnitWebElement getElementToSend(WebElement toElement) {
    WebElement sendToElement = toElement;
    if (sendToElement == null) {
      sendToElement = parent.switchTo().activeElement();
    }

    return (HtmlUnitWebElement) sendToElement;
  }

  @Override
  public void sendKeys(CharSequence... keysToSend) {
    WebElement toElement = parent.switchTo().activeElement();

    HtmlUnitWebElement htmlElem = getElementToSend(toElement);
    htmlElem.sendKeys(keysToSend);
  }

  public void sendKeys(HtmlElement element, String currentValue, InputKeysContainer keysToSend) {
    keysToSend.setCapitalization(modifiersState.isShiftPressed());

    if (parent.isJavascriptEnabled() && !(element instanceof HtmlFileInput)) {
      if (element instanceof HtmlTextArea) {
        HtmlTextArea area = (HtmlTextArea) element;
        String text = area.getText();
        area.setSelectionStart(text.length());
        area.setSelectionEnd(text.length());
      }
      else if (element instanceof HtmlTextInput) {
        HtmlTextInput input = (HtmlTextInput) element;
        String text = input.getText();
        input.setSelectionStart(text.length());
        input.setSelectionEnd(text.length());
      }
      else if (element instanceof HtmlPasswordInput) {
        HtmlPasswordInput input = (HtmlPasswordInput) element;
        String text = input.getText();
        input.setSelectionStart(text.length());
        input.setSelectionEnd(text.length());
      }
      try {
        element.type(keysToSend.toString());
      } catch (IOException e) {
        throw new WebDriverException(e);
      }
    } else if (element instanceof HtmlInput) {
      HtmlInput input = (HtmlInput) element;

      input.setValueAttribute((currentValue == null ? "" : currentValue) + keysToSend.toString());
    } else if (element instanceof HtmlTextArea) {
      ((HtmlTextArea) element).setText(
          (currentValue == null ? "" : currentValue) + keysToSend.toString());
    } else {
      throw new UnsupportedOperationException(
          "You may only set the value of elements that are input elements");
    }
  }

  @Override
  public void pressKey(CharSequence keyToPress) {
    WebElement toElement = parent.switchTo().activeElement();

    HtmlUnitWebElement htmlElement = getElementToSend(toElement);
    modifiersState.storeKeyDown(keyToPress);
    htmlElement.sendKeyDownEvent(keyToPress);
  }

  @Override
  public void releaseKey(CharSequence keyToRelease) {
    WebElement toElement = parent.switchTo().activeElement();

    HtmlUnitWebElement htmlElement = getElementToSend(toElement);
    modifiersState.storeKeyUp(keyToRelease);
    htmlElement.sendKeyUpEvent(keyToRelease);
  }

  void performSingleKeyAction(HtmlElement element, CharSequence modifierKey, String eventDescription) {
    boolean shiftKey = modifierKey.equals(Keys.SHIFT);
    boolean ctrlKey = modifierKey.equals(Keys.CONTROL);
    boolean altKey = modifierKey.equals(Keys.ALT);

    Event keyEvent = new KeyboardEvent(element, eventDescription, 0, shiftKey, ctrlKey, altKey);
    element.fireEvent(keyEvent);

  }

  public boolean isShiftPressed() {
    return modifiersState.isShiftPressed();
  }

  public boolean isCtrlPressed() {
    return modifiersState.isCtrlPressed();
  }

  public boolean isAltPressed() {
    return modifiersState.isAltPressed();
  }

}
