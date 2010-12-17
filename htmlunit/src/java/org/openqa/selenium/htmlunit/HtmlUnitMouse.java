/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.htmlunit;

import java.io.IOException;

import com.gargoylesoftware.htmlunit.ScriptException;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.javascript.host.MouseEvent;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;

/**
 * Implements mouse operations using the HtmlUnit WebDriver.
 *
 */
public class HtmlUnitMouse implements Mouse {
  private final HtmlUnitDriver parent;
  private final HtmlUnitKeyboard keyboard;

  public HtmlUnitMouse(HtmlUnitDriver parent, HtmlUnitKeyboard keyboard) {
    this.parent = parent;
    this.keyboard = keyboard;
  }

  public void click(WebElement onElement) {
    onElement.click();
  }

  public void click(HtmlElement element) {
    try {
      if (parent.isJavascriptEnabled()) {
        if (!(element instanceof HtmlInput)) {
          element.focus();
        }

        element.mouseOver();
        element.mouseMove();
      }

      element.click(keyboard.isShiftPressed(),
          keyboard.isCtrlPressed(), keyboard.isAltPressed());
    } catch (IOException e) {
      throw new WebDriverException(e);
    } catch (ScriptException e) {
      // TODO(simon): This isn't good enough.
      System.out.println(e.getMessage());
      // Press on regardless
    }    
  }

  public void doubleClick(WebElement onElement) {
    HtmlUnitWebElement htmlElem = (HtmlUnitWebElement) onElement;
    htmlElem.doubleClick();    
  }

  public void doubleClick(HtmlElement element) {
    // Send the state of modifier keys to the dblClick method.
    try {
      element.dblClick(keyboard.isShiftPressed(),
          keyboard.isCtrlPressed(), keyboard.isAltPressed());
    } catch (IOException e) {
      //TODO(eran.mes): What should we do in case of error?
      e.printStackTrace();
    }
  }

  public void contextClick(WebElement onElement) {
    HtmlUnitWebElement htmlElem = (HtmlUnitWebElement) onElement;
    htmlElem.mouseContextClick();
  }

  public void contextClick(HtmlElement element) {
    element.rightClick(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed());
  }

  public void mouseDown(WebElement onElement) {
    HtmlUnitWebElement htmlElem = (HtmlUnitWebElement) onElement;
    htmlElem.mouseDown();
  }

  public void mouseDown(HtmlElement element) {
    element.mouseDown(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
  }
    
  public void mouseUp(WebElement onElement) {
    HtmlUnitWebElement htmlElem = (HtmlUnitWebElement) onElement;
    htmlElem.mouseUp();
  }

  public void mouseUp(HtmlElement element) {
    element.mouseUp(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
  }

  public void mouseMove(WebElement toElement) {
    HtmlUnitWebElement htmlElem = (HtmlUnitWebElement) toElement;
    htmlElem.moveToHere();
  }

  public void mouseMove(HtmlElement element) {
    element.mouseMove(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
    element.mouseOver(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
  }

  public void mouseMove(WebElement toElement, long xOffset, long yOffset) {
    throw new UnsupportedOperationException("Moving to arbitrary X,Y coordinates not supported.");
  }
}
