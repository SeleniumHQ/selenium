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

import org.jmock.integration.junit4.JUnitRuleMockery;
import org.junit.Rule;
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
public class IndividualMouseActionsTest {

  @Rule public JUnitRuleMockery mockery = new JUnitRuleMockery();
  
  private Mouse dummyMouse;
  private Locatable locatableElement;
  private Coordinates dummyCoordinates;

  @Before
  public void setUp() {
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
  public void mouseClickAndHoldAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
      oneOf(dummyMouse).mouseDown(dummyCoordinates);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseClickAndHoldActionOnCurrentLocation() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseDown(null);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseReleaseAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
      oneOf(dummyMouse).mouseUp(dummyCoordinates);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseReleaseActionOnCurrentLocation() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseUp(null);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseClickAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
      oneOf(dummyMouse).click(dummyCoordinates);
    }});

    ClickAction action = new ClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseClickActionOnCurrentLocation() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).click(null);
    }});

    ClickAction action = new ClickAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseDoubleClickAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
      oneOf(dummyMouse).doubleClick(dummyCoordinates);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseDoubleClickActionOnCurrentLocation() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).doubleClick(null);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseMoveAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
    }});

    MoveMouseAction action = new MoveMouseAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseMoveActionToCoordinatesInElement() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates, 20, 20);
    }});

    MoveToOffsetAction action = new MoveToOffsetAction(dummyMouse, locatableElement, 20, 20);
    action.perform();
  }

  @Test
  public void mouseContextClickAction() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).mouseMove(dummyCoordinates);
      oneOf(dummyMouse).contextClick(dummyCoordinates);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseContextClickActionOnCurrentLocation() {
    mockery.checking(new Expectations() {{
      oneOf(dummyMouse).contextClick(null);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, null);
    action.perform();
  }
}
