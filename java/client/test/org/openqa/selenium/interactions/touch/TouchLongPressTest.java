/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

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

package org.openqa.selenium.interactions.touch;

import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.testing.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.testing.Ignore.Driver.IE;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.MockTestBase;
import org.openqa.selenium.StubRenderedWebElement;
import org.openqa.selenium.TouchScreen;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;

import org.jmock.Expectations;

import org.junit.Before;

/**
 * Tests the long press action.
 */
public class TouchLongPressTest extends MockTestBase {

  private TouchScreen dummyTouch;
  private Locatable locatableElement;
  private Coordinates dummyCoordinates;

  @Before
  public void setUp() {
    dummyTouch = mock(TouchScreen.class);
    dummyCoordinates = mock(Coordinates.class);

    locatableElement = new StubRenderedWebElement() {
      @Override
      public Coordinates getCoordinates() {
        return dummyCoordinates;
      }
    };
  }

  @Ignore(value = {CHROME, FIREFOX, HTMLUNIT, IE, IPHONE, OPERA, SELENESE},
      reason = "TouchScreen operations not supported")
  @Test
  public void testCanLongPress() {
    checking(new Expectations() {{
      one(dummyTouch).longPress(dummyCoordinates);
    }});

    LongPressAction longPress = new LongPressAction(dummyTouch, locatableElement);
    longPress.perform();
  }
}
