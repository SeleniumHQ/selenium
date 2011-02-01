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

package org.openqa.selenium.interactions;

import org.jmock.Expectations;
import org.jmock.integration.junit3.MockObjectTestCase;
import org.openqa.selenium.*;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Unit test for all simple keyboard actions.
 *
 */
public class TestIndividualKeyboardActions extends MockObjectTestCase {
  private Keyboard dummyKeyboard;
  private Mouse dummyMouse;
  private Coordinates dummyCoordinates;
  private Locatable locatableElement;
    final String keysToSend = "hello";

  public void setUp() {
    dummyKeyboard = mock(Keyboard.class);
    dummyMouse = mock(Mouse.class);
    dummyCoordinates = mock(Coordinates.class);

    locatableElement = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return dummyCoordinates;
      }
    };
  }

  public void testKeyDownActionWithoutProvidedElement() {
    final Keys keyToPress = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(keyToPress);
    }});
   
    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse, keyToPress);
    keyDown.perform();
  }

  public void testKeyDownActionOnAnElement() {
    final Keys keyToPress = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToPress);

    keyDown.perform();
  }


  public void testKeyUpActionWithoutProvidedElement() {
    final Keys keyToRelease = Keys.CONTROL;

    checking(new Expectations() {{
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction keyUp = new KeyUpAction(dummyKeyboard, dummyMouse, keyToRelease);
    keyUp.perform();
  }

  public void testKeyUpOnAnAnElement() {
    final Keys keyToRelease = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction upAction = new KeyUpAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToRelease);
    upAction.perform();
  }


  public void testSendKeysActionWithoutProvidedElement() {
    checking(new Expectations() {{
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse, keysToSend);
    sendKeys.perform();
  }

  public void testSendKeysActionOnAnElement() {
    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse,
        locatableElement, keysToSend);
    sendKeys.perform();
  }

  public void testKeyDownActionFailsOnNonModifier() {
    final Keys keyToPress = Keys.BACK_SPACE;

    try {
      KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse,
          locatableElement, keyToPress);
      fail();
    } catch (IllegalArgumentException e) {
      assertTrue(e.getMessage().contains("modifier keys"));
    }
  }
}
