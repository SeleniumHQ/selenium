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

package org.openqa.selenium.interactions;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.interactions.internal.Locatable;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Tests the builder for advanced user interaction, the Actions class.
 */
@RunWith(JUnit4.class)
public class ActionsTest {

  @Mock private Mouse mockMouse;
  @Mock private Keyboard mockKeyboard;
  @Mock private Coordinates mockCoordinates;
  private WebElement dummyLocatableElement;
  private WebDriver driver;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);

    dummyLocatableElement = mockLocatableElementWithCoordinates(mockCoordinates);

    driver = mock(WebDriver.class, withSettings().extraInterfaces(HasInputDevices.class));
    when(((HasInputDevices) driver).getKeyboard()).thenReturn(mockKeyboard);
    when(((HasInputDevices) driver).getMouse()).thenReturn(mockMouse);
  }

  @Test
  public void creatingAllKeyboardActions() {
    new Actions(driver).keyDown(Keys.SHIFT).sendKeys("abc").keyUp(Keys.CONTROL).perform();

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates);
    order.verify(mockKeyboard).pressKey(Keys.SHIFT);
    order.verify(mockKeyboard).sendKeys("abc");
    order.verify(mockKeyboard).releaseKey(Keys.CONTROL);
    order.verifyNoMoreInteractions();
  }


  @Test(expected = IllegalArgumentException.class)
  public void throwsIllegalArgumentExceptionIfKeysNull() {
    new Actions(driver).sendKeys(null).perform();
  }

  @Test(expected = IllegalArgumentException.class)
  public void throwsIllegalArgumentExceptionOverridenIfKeysNull() {
    new Actions(driver).sendKeys(dummyLocatableElement,null).perform();
  }

  @Test
  public void providingAnElementToKeyboardActions() {
    new Actions(driver).keyDown(dummyLocatableElement, Keys.SHIFT).perform();

    InOrder order = inOrder(mockMouse, mockKeyboard, mockCoordinates);
    order.verify(mockMouse).click(mockCoordinates);
    order.verify(mockKeyboard).pressKey(Keys.SHIFT);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void supplyingIndividualElementsToKeyboardActions() {
    final Coordinates dummyCoordinates2 = mock(Coordinates.class, "dummy2");
    final Coordinates dummyCoordinates3 = mock(Coordinates.class, "dummy3");

    final WebElement dummyElement2 = mockLocatableElementWithCoordinates(dummyCoordinates2);
    final WebElement dummyElement3 = mockLocatableElementWithCoordinates(dummyCoordinates3);

    new Actions(driver)
        .keyDown(dummyLocatableElement, Keys.SHIFT)
        .sendKeys(dummyElement2, "abc")
        .keyUp(dummyElement3, Keys.CONTROL)
        .perform();

    InOrder order = inOrder(
        mockMouse,
        mockKeyboard,
        mockCoordinates,
        dummyCoordinates2,
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
    new Actions(driver)
        .clickAndHold(dummyLocatableElement)
        .release(dummyLocatableElement)
        .click(dummyLocatableElement)
        .doubleClick(dummyLocatableElement)
        .moveToElement(dummyLocatableElement)
        .contextClick(dummyLocatableElement)
        .perform();

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

  @SuppressWarnings({"unchecked", "rawtypes"})
  @Test
  public void testCtrlClick() {
    WebDriver driver = mock(WebDriver.class, withSettings().extraInterfaces(Interactive.class));
    ArgumentCaptor<Collection<Sequence>> sequenceCaptor =
        ArgumentCaptor.forClass((Class) Collection.class);
    Mockito.doNothing().when((Interactive) driver).perform(sequenceCaptor.capture());

    new Actions(driver)
        .keyDown(Keys.CONTROL)
        .click()
        .keyUp(Keys.CONTROL)
        .perform();

    Collection<Sequence> sequence = sequenceCaptor.getValue();

    assertEquals(2, sequence.size());

    // get mouse and keyboard sequences
    Map<String, Object>[] sequencesJson = sequence.stream().map(Sequence::toJson).toArray(HashMap[]::new);
    Map<String, Object> mouseSequence = sequencesJson[0];
    Map<String, Object> keyboardSequence;
    if (!mouseSequence.get("type").equals("pointer")) {
      mouseSequence = sequencesJson[1];
      keyboardSequence = sequencesJson[0];
    }
    else {
      keyboardSequence = sequencesJson[1];
    }

    assertEquals("pointer", mouseSequence.get("type"));
    List<Map<?,?>> mouseActions = (List<Map<?,?>>) mouseSequence.get("actions");
    assertEquals(4, mouseActions.size());

    assertEquals("key", keyboardSequence.get("type"));
    List<Map<?, ?>> keyboardActions = (List<Map<?, ?>>) keyboardSequence.get("actions");
    assertEquals(4, keyboardActions.size());

    // Mouse pauses as key goes down
    Map<?, ?> pauseAction = mouseActions.get(0);
    assertEquals("pause", pauseAction.get("type"));
    assertEquals(0L, pauseAction.get("duration"));

    Map<?, ?> keyDownAction = keyboardActions.get(0);
    assertEquals("keyDown", keyDownAction.get("type"));
    assertEquals(Keys.CONTROL.toString(), keyDownAction.get("value"));

    // Mouse goes down, so keyboard pauses
    Map<?, ?> pointerDownAction = mouseActions.get(1);
    assertEquals("pointerDown", pointerDownAction.get("type"));
    assertEquals(0, pointerDownAction.get("button"));

    pauseAction = keyboardActions.get(1);
    assertEquals("pause", pauseAction.get("type"));
    assertEquals(0L, pauseAction.get("duration"));

    // Mouse goes up, so keyboard pauses
    Map<?, ?> pointerUpAction = mouseActions.get(2);
    assertEquals("pointerUp", pointerUpAction.get("type"));
    assertEquals(0, pointerUpAction.get("button"));

    pauseAction = keyboardActions.get(2);
    assertEquals("pause", pauseAction.get("type"));
    assertEquals(0L, pauseAction.get("duration"));

    // Mouse pauses as keyboard releases key
    pauseAction = mouseActions.get(3);
    assertEquals("pause", pauseAction.get("type"));
    assertEquals(0L, pauseAction.get("duration"));

    Map<?, ?> keyUpAction = keyboardActions.get(3);
    assertEquals("keyUp", keyUpAction.get("type"));
    assertEquals(Keys.CONTROL.toString(), keyUpAction.get("value"));
  }


  private WebElement mockLocatableElementWithCoordinates(Coordinates coord) {
    WebElement element = mock(WebElement.class,
                              withSettings().extraInterfaces(Locatable.class));
    when(((Locatable) element).getCoordinates()).thenReturn(coord);
    return element;
  }
}
