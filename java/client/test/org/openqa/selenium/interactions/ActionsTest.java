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

import static org.junit.Assert.assertEquals;

import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;

import org.jmock.Expectations;
import org.junit.Before;
import org.junit.Test;

/**
 * Tests the builder for advanced user interaction, the Actions class.
 */
public class ActionsTest extends MockTestBase {

  private WebElement dummyLocatableElement;
  private Mouse dummyMouse;
  private Keyboard dummyKeyboard;
  private WebDriver driver;
  private Coordinates dummyCoordinates;

  @Before
  public void setUp() {
    dummyMouse = mock(Mouse.class);
    dummyKeyboard = mock(Keyboard.class);
    dummyCoordinates = mock(Coordinates.class);
    dummyLocatableElement = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return dummyCoordinates;
      }
    };

    driver = new StubInputDeviceDriver() {
      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }

      @Override
      public Mouse getMouse() {
        return dummyMouse;
      }

    };
  }

  @Test
  public void creatingAllKeyboardActions() {
    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(Keys.SHIFT);
      one(dummyKeyboard).sendKeys("abc");
      one(dummyKeyboard).releaseKey(Keys.CONTROL);
    }});

    Actions builder = new Actions(driver);

    builder.keyDown(Keys.SHIFT).sendKeys("abc").keyUp(Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());
  }

  @Test
  public void providingAnElementToKeyboardActions() {
    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).pressKey(Keys.SHIFT);
    }});

    Actions builder = new Actions(driver);

    builder.keyDown(dummyLocatableElement, Keys.SHIFT);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 1 keyboard action", 1, returnedAction.getNumberOfActions());
  }

  @Test
  public void supplyingIndividualElementsToKeyboardActions() {
    final Coordinates dummyCoordinates2 = mock(Coordinates.class, "dummy2");
    final Coordinates dummyCoordinates3 = mock(Coordinates.class, "dummy3");

    final WebElement dummyElement2 = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return dummyCoordinates2;
      }
    };

    final WebElement dummyElement3 = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return dummyCoordinates3;
      }
    };

    checking(new Expectations() {{
      one(dummyMouse).click(dummyCoordinates);
      one(dummyKeyboard).pressKey(Keys.SHIFT);
      one(dummyMouse).click(dummyCoordinates2);
      one(dummyKeyboard).sendKeys("abc");
      one(dummyMouse).click(dummyCoordinates3);
      one(dummyKeyboard).releaseKey(Keys.CONTROL);
    }});

    Actions builder = new Actions(driver);

    builder.keyDown(dummyLocatableElement, Keys.SHIFT)
        .sendKeys(dummyElement2, "abc")
        .keyUp(dummyElement3, Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());
  }

  @Test
  public void creatingAllMouseActions() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseDown(dummyCoordinates);
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseUp(dummyCoordinates);
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).click(dummyCoordinates);
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).doubleClick(dummyCoordinates);
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).contextClick(dummyCoordinates);
    }});

    Actions builder = new Actions(driver);

    builder.clickAndHold(dummyLocatableElement)
        .release(dummyLocatableElement)
        .click(dummyLocatableElement)
        .doubleClick(dummyLocatableElement)
        .moveToElement(dummyLocatableElement)
        .contextClick(dummyLocatableElement);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 6 mouse actions", 6, returnedAction.getNumberOfActions());
  }

}
