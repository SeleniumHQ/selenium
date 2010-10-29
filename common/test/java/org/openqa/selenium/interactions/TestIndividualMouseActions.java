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
import org.openqa.selenium.RenderedWebElement;
import org.openqa.selenium.StubDriver;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.awt.*;

/**
 * Unit test for all simple keyboard actions.
 *
 */
public class TestIndividualMouseActions extends MockObjectTestCase {
  private Mouse dummyMouse;
  private WebElement dummyElement;
  private RenderedWebElement dummyRenderedElement;
  private WebDriver fakeDriver;

  public void setUp() {
    dummyMouse = mock(Mouse.class);
    dummyElement = mock(WebElement.class);
    dummyRenderedElement = mock(RenderedWebElement.class);
    fakeDriver = new StubDriver() {
      @Override
      public Mouse getMouse() {
        return dummyMouse;
      }
    };
  }

  public void testMouseClickAndHoldAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseDown(dummyElement);
    }});

    ClickAndHoldAction action = new ClickAndHoldAction(fakeDriver, dummyElement);
    action.perform();
  }

  public void testMouseReleaseAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseUp(dummyElement);
    }});

    ButtonReleaseAction action = new ButtonReleaseAction(fakeDriver, dummyElement);
    action.perform();
  }


  public void testMouseClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).click(dummyElement);
    }});

    ClickAction action = new ClickAction(fakeDriver, dummyElement);
    action.perform();
  }

  public void testMouseDoubleClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).doubleClick(dummyElement);
    }});

    DoubleClickAction action = new DoubleClickAction(fakeDriver, dummyElement);
    action.perform();
  }

  public void testMouseMoveAction() {
    checking(new Expectations() {{
      one(dummyMouse).mouseMove(dummyElement);
    }});

    MoveMouseAction action = new MoveMouseAction(fakeDriver, dummyElement);
    action.perform();
  }

  public void testMouseMoveToCoordinatesFailsOnNonRenderedWebElement() {
    try {
      MoveToOffsetAction action = new MoveToOffsetAction(fakeDriver, dummyElement, 20, 20);
      fail("Was not supposed to do a move to offset not on a RenderedWebElement");
    } catch (ElementNotDisplayedException e) {
      // Expected
    }
  }

  public void testMouseMoveActionToCoordinatesInElement() {
    checking(new Expectations() {{
      one(dummyRenderedElement).getSize();
      will(returnValue(new Dimension(50, 50)));
      one(dummyMouse).mouseMove(dummyRenderedElement, 20, 20);
    }});

    MoveToOffsetAction action = new MoveToOffsetAction(fakeDriver, dummyRenderedElement, 20, 20);
    action.perform();
  }

  public void testMouseMoveActionToCoordinatesOutsideElementFails() {
    checking(new Expectations() {{
      one(dummyRenderedElement).getSize();
      will(returnValue(new Dimension(20, 20)));
    }});

    try {
      MoveToOffsetAction action = new MoveToOffsetAction(fakeDriver, dummyRenderedElement, 50, 50);
      action.perform();
      fail("Was not supposed to be able to move outside element boundries.");
    } catch (MoveOutsideBoundriesException e) {
      //Expected.
    }

  }

  public void testMouseContextClickAction() {
    checking(new Expectations() {{
      one(dummyMouse).contextClick(dummyElement);
    }});

    ContextClickAction action = new ContextClickAction(fakeDriver, dummyElement);
    action.perform();
  }

}
