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

package org.openqa.selenium.interactions;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;

/**
 * Unit test for all simple keyboard actions.
 * 
 */
public class IndividualKeyboardActionsTest extends MockTestBase {
  private Keyboard dummyKeyboard;
  private Mouse dummyMouse;
  private Coordinates dummyCoordinates;
  private Locatable locatableElement;
  final String keysToSend = "hello";

  @Before
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

  @Test
  public void keyDownActionWithoutProvidedElement() {
    final Keys keyToPress = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse, keyToPress);
    keyDown.perform();
  }

  @Test
  public void keyDownActionOnAnElement() {
    final Keys keyToPress = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToPress);

    keyDown.perform();
  }

  @Test
  public void keyUpActionWithoutProvidedElement() {
    final Keys keyToRelease = Keys.CONTROL;

    checking(new Expectations() {{
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction keyUp = new KeyUpAction(dummyKeyboard, dummyMouse, keyToRelease);
    keyUp.perform();
  }

  @Test
  public void keyUpOnAnAnElement() {
    final Keys keyToRelease = Keys.SHIFT;

    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction upAction = new KeyUpAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToRelease);
    upAction.perform();
  }

  @Test
  public void sendKeysActionWithoutProvidedElement() {
    checking(new Expectations() {{
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse, keysToSend);
    sendKeys.perform();
  }

  @Test
  public void sendKeysActionOnAnElement() {
    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse,
        locatableElement, keysToSend);
    sendKeys.perform();
  }

  @Test
  public void keyDownActionFailsOnNonModifier() {
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
