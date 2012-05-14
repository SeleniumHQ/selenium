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
public class IndividualMouseActionsTest extends MockTestBase {
  private Mouse dummyMouse;
  private Locatable locatableElement;
  private Coordinates dummyCoordinates;

  @Before
  public void setUp() {
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
  public void mouseClickAndHoldAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseDown(dummyCoordinates);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseClickAndHoldActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).mouseDown(null);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseReleaseAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseUp(dummyCoordinates);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseReleaseActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).mouseUp(null);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).click(dummyCoordinates);
    }});

    ClickAction action = new ClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).click(null);
    }});

    ClickAction action = new ClickAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseDoubleClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).doubleClick(dummyCoordinates);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseDoubleClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).doubleClick(null);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, null);
    action.perform();
  }

  @Test
  public void mouseMoveAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
    }});

    MoveMouseAction action = new MoveMouseAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseMoveActionToCoordinatesInElement() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates, 20, 20);
    }});

    MoveToOffsetAction action = new MoveToOffsetAction(dummyMouse, locatableElement, 20, 20);
    action.perform();
  }

  @Test
  public void mouseContextClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).contextClick(dummyCoordinates);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  @Test
  public void mouseContextClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).contextClick(null);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, null);
    action.perform();
  }
}
