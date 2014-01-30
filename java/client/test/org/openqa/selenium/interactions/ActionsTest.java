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
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;

import org.junit.Before;
import org.junit.Test;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Tests the builder for advanced user interaction, the Actions class.
 */
public class ActionsTest {

  @Mock private Mouse mockMouse;
  @Mock private Keyboard mockKeyboard;
  @Mock private Coordinates mockCoordinates;
  private WebElement dummyLocatableElement;
  private WebDriver driver;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);

    dummyLocatableElement = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return mockCoordinates;
      }
    };

    driver = new StubInputDeviceDriver() {
      @Override
      public Keyboard getKeyboard() {
        return mockKeyboard;
      }

      @Override
      public Mouse getMouse() {
        return mockMouse;
      }

    };
  }

  @Test
  public void creatingAllKeyboardActions() {
    Actions builder = new Actions(driver);

    builder.keyDown(Keys.SHIFT).sendKeys("abc").keyUp(Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates);
    order.verify(mockKeyboard).pressKey(Keys.SHIFT);
    order.verify(mockKeyboard).sendKeys("abc");
    order.verify(mockKeyboard).releaseKey(Keys.CONTROL);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void providingAnElementToKeyboardActions() {
    Actions builder = new Actions(driver);

    builder.keyDown(dummyLocatableElement, Keys.SHIFT);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 1 keyboard action", 1, returnedAction.getNumberOfActions());

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates);
    order.verify(mockMouse).click(mockCoordinates);
    order.verify(mockKeyboard).pressKey(Keys.SHIFT);
    order.verifyNoMoreInteractions();
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

    Actions builder = new Actions(driver);

    builder.keyDown(dummyLocatableElement, Keys.SHIFT)
        .sendKeys(dummyElement2, "abc")
        .keyUp(dummyElement3, Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates, dummyCoordinates2,
        dummyCoordinates3);
    order.verify(mockMouse).click(mockCoordinates);
    order.verify(mockKeyboard).pressKey(Keys.SHIFT);
    order.verify(mockMouse).click(dummyCoordinates2);
    order.verify(mockKeyboard).sendKeys("abc");
    order.verify(mockMouse).click(dummyCoordinates3);
    order.verify(mockKeyboard).releaseKey(Keys.CONTROL);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void creatingAllMouseActions() {
    CompositeAction returnedAction = (CompositeAction) new Actions(driver)
        .clickAndHold(dummyLocatableElement)
        .release(dummyLocatableElement)
        .click(dummyLocatableElement)
        .doubleClick(dummyLocatableElement)
        .moveToElement(dummyLocatableElement)
        .contextClick(dummyLocatableElement)
        .build();

    returnedAction.perform();
    assertEquals("Expected 6 mouse actions", 6, returnedAction.getNumberOfActions());

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).mouseDown(mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).mouseUp(mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).click(mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).doubleClick(mockCoordinates);
    // Move twice; oce for moveToElement, once for contextClick.
    order.verify(mockMouse, times(2)).mouseMove(mockCoordinates);
    order.verify(mockMouse).contextClick(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

}
