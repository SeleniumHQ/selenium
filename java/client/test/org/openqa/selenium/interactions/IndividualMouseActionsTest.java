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

import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.testing.UnitTests;

/**
 * Unit test for all simple keyboard actions.
 *
 */
@Category(UnitTests.class)
public class IndividualMouseActionsTest {

  @Mock private Mouse mockMouse;
  @Mock private Coordinates mockCoordinates;
  @Mock private Locatable locatableStub;

  @Before
  public void setUp() {
    MockitoAnnotations.initMocks(this);
    when(locatableStub.getCoordinates()).thenReturn(mockCoordinates);
  }

  @Test
  public void mouseClickAndHoldAction() {
    ClickAndHoldAction action = new ClickAndHoldAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).mouseDown(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseClickAndHoldActionOnCurrentLocation() {
    ClickAndHoldAction action = new ClickAndHoldAction(mockMouse, null);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseDown(null);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseReleaseAction() {
    ButtonReleaseAction action = new ButtonReleaseAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).mouseUp(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseReleaseActionOnCurrentLocation() {
    ButtonReleaseAction action = new ButtonReleaseAction(mockMouse, null);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseUp(null);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseClickAction() {
    ClickAction action = new ClickAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).click(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseClickActionOnCurrentLocation() {
    ClickAction action = new ClickAction(mockMouse, null);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).click(null);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseDoubleClickAction() {
    DoubleClickAction action = new DoubleClickAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).doubleClick(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseDoubleClickActionOnCurrentLocation() {
    DoubleClickAction action = new DoubleClickAction(mockMouse, null);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).doubleClick(null);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseMoveAction() {
    MoveMouseAction action = new MoveMouseAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseMoveActionToCoordinatesInElement() {
    MoveToOffsetAction action = new MoveToOffsetAction(mockMouse, locatableStub, 20, 20);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates, 20, 20);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseContextClickAction() {
    ContextClickAction action = new ContextClickAction(mockMouse, locatableStub);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).mouseMove(mockCoordinates);
    order.verify(mockMouse).contextClick(mockCoordinates);
    order.verifyNoMoreInteractions();
  }

  @Test
  public void mouseContextClickActionOnCurrentLocation() {
    ContextClickAction action = new ContextClickAction(mockMouse, null);
    action.perform();

    InOrder order = Mockito.inOrder(mockMouse, mockCoordinates);
    order.verify(mockMouse).contextClick(null);
    order.verifyNoMoreInteractions();
  }
}
