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

import org.jmock.Expectations;
import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;

import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

/**
 * Unit test for all simple keyboard actions.
 * 
 */
public class IndividualKeyboardActionsTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();

  private Keyboard dummyKeyboard;
  private Mouse dummyMouse;
  private Coordinates dummyCoordinates;
  private Locatable locatableElement;
  final String keysToSend = "hello";

  @Before
  public void setUp() {
    dummyKeyboard = mockery.mock(Keyboard.class);
    dummyMouse = mockery.mock(Mouse.class);
    dummyCoordinates = mockery.mock(Coordinates.class);

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

    mockery.checking(new Expectations() {{
      oneOf(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse, keyToPress);
    keyDown.perform();
  }

  @Test
  public void keyDownActionOnAnElement() {
    final Keys keyToPress = Keys.SHIFT;

    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).click(dummyCoordinates);
      oneOf(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction keyDown = new KeyDownAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToPress);

    keyDown.perform();
  }

  @Test
  public void keyUpActionWithoutProvidedElement() {
    final Keys keyToRelease = Keys.CONTROL;

    mockery.checking(new Expectations() {{
      oneOf(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction keyUp = new KeyUpAction(dummyKeyboard, dummyMouse, keyToRelease);
    keyUp.perform();
  }

  @Test
  public void keyUpOnAnAnElement() {
    final Keys keyToRelease = Keys.SHIFT;

    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).click(dummyCoordinates);
      oneOf(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction upAction = new KeyUpAction(dummyKeyboard, dummyMouse,
        locatableElement, keyToRelease);
    upAction.perform();
  }

  @Test
  public void sendKeysActionWithoutProvidedElement() {
    mockery.checking(new Expectations() {{
      oneOf(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse, keysToSend);
    sendKeys.perform();
  }

  @Test
  public void sendKeysActionOnAnElement() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).click(dummyCoordinates);
      oneOf(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(dummyKeyboard, dummyMouse,
        locatableElement, keysToSend);
    sendKeys.perform();
  }

  @Test
  public void keyDownActionFailsOnNonModifier() {
    final Keys keyToPress = Keys.BACK_SPACE;

    try {
      new KeyDownAction(dummyKeyboard, dummyMouse, locatableElement, keyToPress);
      fail();
    } catch (IllegalArgumentException e) {
      assertTrue(e.getMessage().contains("modifier keys"));
    }
  }
}
