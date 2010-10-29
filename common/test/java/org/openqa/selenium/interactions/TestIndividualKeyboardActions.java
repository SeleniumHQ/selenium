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
import org.openqa.selenium.*;

/**
 * Unit test for all simple keyboard actions.
 *
 */
public class TestIndividualKeyboardActions extends MockObjectTestCase {
  private Keyboard dummyKeyboard;
  private WebElement dummyElement;
  private WebDriver dummyDriver;
  final String keysToSend = "hello";
  private WebElement dummyActiveElement;

  public void setUp() {
    dummyKeyboard = mock(Keyboard.class);
    dummyElement = mock(WebElement.class, "element");
    dummyDriver = mock(WebDriver.class);
    dummyActiveElement = mock(WebElement.class, "activeElement");
  }

  public void testKeyDownAction() {
    final Keys keyToPress = Keys.SHIFT;

    WebDriver driver = new StubDriver() {
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
    };

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(keyToPress);
    }});
   
    KeyDownAction keyDown = new KeyDownAction(driver, dummyElement, keyToPress);
    keyDown.perform();
  }

  public void testKeyUpAction() {
    final Keys keyToRelease = Keys.CONTROL;

    WebDriver driver = new StubDriver() {
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
    };

    checking(new Expectations() {{
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction keyUp = new KeyUpAction(driver, dummyElement, keyToRelease);
    keyUp.perform();
  }

  public void testSendKeysActionOnNullElement() {

    checking(new Expectations() {{
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    WebDriver driver = new StubDriver() {
      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }
    };

    SendKeysAction sendKeys = new SendKeysAction(driver, keysToSend);
    sendKeys.perform();

  }

  public void testSendKeysActionOnTheActiveElement() {

    WebDriver driver = new StubDriver() {
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
    };

    checking(new Expectations() {{
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(driver, dummyElement, keysToSend);
    sendKeys.perform();
  }

  public void testSendKeysActionOnANonActiveElement() {
    final int[] executeScriptCalls = {0};

    WebDriver driver = new StubDriver() {
      @Override
      public TargetLocator switchTo() {
        return new StubTargetLocator() {
          @Override
          public WebElement activeElement() {
            return dummyActiveElement;
          }
        };
      }

      @Override
      public Object executeScript(String script, Object... args) {
        executeScriptCalls[0] += 1;
        if (executeScriptCalls[0] == 1) {
          assertEquals("Expecting dummyActiveElement", args[0], dummyActiveElement);
        } else {
          assertEquals("Expecting dummyElement", args[0], dummyElement);
        }

        return null;
      }

      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }
    };

    checking(new Expectations() {{
      one(dummyKeyboard).sendKeys(keysToSend);
    }});

    SendKeysAction sendKeys = new SendKeysAction(driver, dummyElement, keysToSend);
    sendKeys.perform();

    assertEquals("Should have seen two calls to executeScript", executeScriptCalls[0], 2);
  }

  public void testKeyDownActionFailsOnNonModifier() {
    final Keys keyToPress = Keys.BACK_SPACE;

    try {
      KeyDownAction keyDown = new KeyDownAction(dummyDriver, dummyElement, keyToPress);
      fail();
    } catch (IllegalArgumentException e) {
      assertTrue(e.getMessage().contains("modifier keys"));
    }
  }

  public void testKeyDownActionWithoutAnElement() {
    final Keys keyToPress = Keys.SHIFT;

    WebDriver driver = new StubDriver() {
      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }
    };

    checking(new Expectations() {{
      one(dummyKeyboard).pressKey(keyToPress);
    }});

    KeyDownAction downAction = new KeyDownAction(driver, keyToPress);
    downAction.perform();
  }

  public void testKeyUpActionWithoutAnElement() {
    final Keys keyToRelease = Keys.SHIFT;

    WebDriver driver = new StubDriver() {
      @Override
      public Keyboard getKeyboard() {
        return dummyKeyboard;
      }
    };

    checking(new Expectations() {{
      one(dummyKeyboard).releaseKey(keyToRelease);
    }});

    KeyUpAction upAction = new KeyUpAction(driver, keyToRelease);
    upAction.perform();
  }
}
