/*
Copyright 2007-2010 Selenium committers

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

import com.google.common.base.Preconditions;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.interactions.InvalidCoordinatesException;
import org.openqa.selenium.interactions.internal.Coordinates;

import com.gargoylesoftware.htmlunit.ScriptException;
import com.gargoylesoftware.htmlunit.html.HtmlElement;
import com.gargoylesoftware.htmlunit.html.HtmlInput;
import com.gargoylesoftware.htmlunit.javascript.host.MouseEvent;

import java.io.IOException;

/**
 * Implements mouse operations using the HtmlUnit WebDriver.
 * 
 */
public class HtmlUnitMouse implements org.openqa.selenium.interactions.Mouse {
  private final HtmlUnitDriver parent;
  private final HtmlUnitKeyboard keyboard;
  private HtmlElement currentActiveElement = null;

  public HtmlUnitMouse(HtmlUnitDriver parent, HtmlUnitKeyboard keyboard) {
    this.parent = parent;
    this.keyboard = keyboard;
  }

  private HtmlElement getElementForOperation(Coordinates potentialCoordinates) {
    if (potentialCoordinates != null) {
      return (HtmlElement) potentialCoordinates.getAuxiliary();
    }

    if (currentActiveElement == null) {
      throw new InvalidCoordinatesException("About to perform an interaction that relies"
          + " on the active element, but there isn't one.");
    }

    return currentActiveElement;
  }


  public void click(Coordinates elementCoordinates) {
    HtmlElement element = getElementForOperation(elementCoordinates);

    moveOutIfNeeded(element);

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
      updateActiveElement(element);
    } catch (IOException e) {
      throw new WebDriverException(e);
    } catch (ScriptException e) {
      // TODO(simon): This isn't good enough.
      System.out.println(e.getMessage());
      // Press on regardless
    }
  }

  private void moveOutIfNeeded(HtmlElement element) {
    try {
      if ((currentActiveElement != element)) {
        if (currentActiveElement != null) {
          currentActiveElement.mouseOver(keyboard.isShiftPressed(),
              keyboard.isCtrlPressed(), keyboard.isAltPressed(), MouseEvent.BUTTON_LEFT);
  
          currentActiveElement.mouseOut(keyboard.isShiftPressed(),
              keyboard.isCtrlPressed(), keyboard.isAltPressed(), MouseEvent.BUTTON_LEFT);
  
          currentActiveElement.blur();
        }
  
        if (element != null) {
          mouseMove(element);
        }
      }
    } catch (ScriptException ignored) {
      System.out.println(ignored.getMessage());
    }
  }

  private void updateActiveElement(HtmlElement element) {
    if (element != null) {
      currentActiveElement = element;
    }
  }

  public void click(Coordinates where, long xOffset, long yOffset) {
    click(where);
  }

  public void doubleClick(Coordinates elementCoordinates) {
    HtmlElement element = getElementForOperation(elementCoordinates);

    moveOutIfNeeded(element);

    // Send the state of modifier keys to the dblClick method.
    try {
      element.dblClick(keyboard.isShiftPressed(),
          keyboard.isCtrlPressed(), keyboard.isAltPressed());
      updateActiveElement(element);
    } catch (IOException e) {
      // TODO(eran.mes): What should we do in case of error?
      e.printStackTrace();
    }
  }

  public void contextClick(Coordinates elementCoordinates) {
    HtmlElement element = getElementForOperation(elementCoordinates);

    moveOutIfNeeded(element);

    element.rightClick(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed());

    updateActiveElement(element);
  }

  public void mouseDown(Coordinates elementCoordinates) {
    HtmlElement element = getElementForOperation(elementCoordinates);

    moveOutIfNeeded(element);

    element.mouseDown(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);

    updateActiveElement(element);
  }

  public void mouseUp(Coordinates elementCoordinates) {
    HtmlElement element = getElementForOperation(elementCoordinates);

    moveOutIfNeeded(element);

    element.mouseUp(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);

    updateActiveElement(element);
  }

  public void mouseMove(Coordinates elementCoordinates) {
    Preconditions.checkNotNull(elementCoordinates);
    HtmlElement element = (HtmlElement) elementCoordinates.getAuxiliary();

    moveOutIfNeeded(element);

    updateActiveElement(element);
  }

  private void mouseMove(HtmlElement element) {
    element.mouseMove(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
    element.mouseOver(keyboard.isShiftPressed(),
        keyboard.isCtrlPressed(), keyboard.isAltPressed(),
        MouseEvent.BUTTON_LEFT);
  }


  public void mouseMove(Coordinates where, long xOffset, long yOffset) {
    throw new UnsupportedOperationException("Moving to arbitrary X,Y coordinates not supported.");
  }
}
