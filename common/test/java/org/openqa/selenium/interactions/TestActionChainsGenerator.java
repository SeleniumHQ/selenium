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
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.StubTargetLocator;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.StubDriver;

/**
 * Tests the builder for user actions.
 */
public class TestActionChainsGenerator extends MockObjectTestCase {
  private WebElement dummyElement;
  private Mouse dummyMouse;
  private Keyboard dummyKeyboard;
  private WebDriver driver;

  public void setUp() {
    dummyMouse = mock(Mouse.class);
    dummyKeyboard = mock(Keyboard.class);
    dummyElement = mock(WebElement.class);
    driver = new StubDriver() {
      @Override
      public TargetLocator switchTo() {
        return new StubTargetLocator() {
          @Override
          public WebElement activeElement() {
            return dummyElement;
          }
        };
      }

      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }

      @Override
      public Mouse getMouse() {
        return dummyMouse;
      }

      @Override
      public Object executeScript(String script, Object... args) {
        return null;
      }
    };
  }

  public void testCreatingAllKeyboardActions() {

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(Keys.SHIFT);
      one(dummyKeyboard).sendKeys("abc");
      one(dummyKeyboard).releaseKey(Keys.CONTROL);
    }});

    ActionChainsGenerator builder = new ActionChainsGenerator(driver);

    builder.keyDown(Keys.SHIFT).sendKeys("abc").keyUp(Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();
    
    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());
  }

  public void testSupplyingAnElement() {
    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(Keys.SHIFT);
    }});

    ActionChainsGenerator builder = new ActionChainsGenerator(driver).onElement(dummyElement);

    builder.keyDown(Keys.SHIFT);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 1 keyboard action", 1, returnedAction.getNumberOfActions());
  }

  public void testSupplyingIndividualElementsToKeyboardActions() {
    final WebElement dummyElement2 = mock(WebElement.class, "dummy2");
    final WebElement dummyElement3 = mock(WebElement.class, "dummy3");

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(Keys.SHIFT);
      one(dummyKeyboard).sendKeys("abc");
      one(dummyKeyboard).releaseKey(Keys.CONTROL);
    }});

    ActionChainsGenerator builder = new ActionChainsGenerator(driver);

    builder.keyDown(dummyElement, Keys.SHIFT)
        .sendKeys(dummyElement2, "abc")
        .keyUp(dummyElement3, Keys.CONTROL);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 3 keyboard actions", 3, returnedAction.getNumberOfActions());
  }


  public void testCreatingAllMouseActions() {
    checking(new Expectations() {{
      one(dummyMouse).mouseDown(dummyElement);
      one(dummyMouse).mouseUp(dummyElement);
      one(dummyMouse).click(dummyElement);
      one(dummyMouse).doubleClick(dummyElement);
      one(dummyMouse).mouseMove(dummyElement);
      one(dummyMouse).contextClick(dummyElement);
    }});

    ActionChainsGenerator builder = new ActionChainsGenerator(driver);

    builder.clickAndHold(dummyElement)
        .release(dummyElement)
        .click(dummyElement)
        .doubleClick(dummyElement)
        .moveToElement(dummyElement)
        .contextClick(dummyElement);

    CompositeAction returnedAction = (CompositeAction) builder.build();
    returnedAction.perform();

    assertEquals("Expected 6 mouse actions.", 6, returnedAction.getNumberOfActions());
  }
}
