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
import org.openqa.selenium.Mouse;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.interactions.internal.Coordinates;

/**
 * Unit test for all simple keyboard actions.
 *
 */
public class TestIndividualMouseActions extends MockObjectTestCase {
  private Mouse dummyMouse;
  private Locatable locatableElement;
  private Coordinates dummyCoordinates;

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

  public void testMouseClickAndHoldAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseDown(dummyCoordinates);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseClickAndHoldActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).mouseDown(null);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(dummyMouse, null);
    action.perform();
  }


  public void testMouseReleaseAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).mouseUp(dummyCoordinates);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseReleaseActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).mouseUp(null);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(dummyMouse, null);
    action.perform();
  }


  public void testMouseClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).click(dummyCoordinates);
    }});

    ClickAction action = new ClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).click(null);
    }});

    ClickAction action = new ClickAction(dummyMouse, null);
    action.perform();
  }

  public void testMouseDoubleClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
      one(dummyMouse).doubleClick(dummyCoordinates);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseDoubleClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).doubleClick(null);
    }});

    DoubleClickAction action = new DoubleClickAction(dummyMouse, null);
    action.perform();
  }


  public void testMouseMoveAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);
    }});

    MoveMouseAction action = new MoveMouseAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseMoveActionToCoordinatesInElement() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates, 20, 20);
    }});

    MoveToOffsetAction action = new MoveToOffsetAction(dummyMouse, locatableElement, 20, 20);
    action.perform();
  }

  public void testMouseContextClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyCoordinates);      
      one(dummyMouse).contextClick(dummyCoordinates);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, locatableElement);
    action.perform();
  }

  public void testMouseContextClickActionOnCurrentLocation() {
    checking(new Expectations() {{
      one(dummyMouse).contextClick(null);
    }});

    ContextClickAction action = new ContextClickAction(dummyMouse, null);
    action.perform();
  }

}
