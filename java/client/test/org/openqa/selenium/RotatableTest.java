/*
Copyright 2012 Software Freedom Conservancy
Copyright 2010-2012 Selenium committers

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

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class RotatableTest extends JUnit4TestBase {

  private boolean isRotatable() {
    return driver instanceof Rotatable;
  }

  @Test
  public void testRotateToLandscapeMode() {
    if (!isRotatable()) {
      return;
    }
    Rotatable rotatable = (Rotatable) driver;
    rotatable.rotate(ScreenOrientation.LANDSCAPE);
    assertEquals(ScreenOrientation.LANDSCAPE, rotatable.getOrientation());
  }

  @Test
  public void testRotateToPortrait() {
    if (!isRotatable()) {
      return;
    }
    Rotatable rotatable = (Rotatable) driver;
    rotatable.rotate(ScreenOrientation.PORTRAIT);
    assertEquals(ScreenOrientation.PORTRAIT, rotatable.getOrientation());
  }

  @Test
  public void testGetOrientationReturnsInitialValue() {
    if (!isRotatable()) {
      return;
    }
    assertNotNull(((Rotatable) driver).getOrientation());
  }

}