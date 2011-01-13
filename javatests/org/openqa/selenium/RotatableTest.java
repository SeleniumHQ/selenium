/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

public class RotatableTest extends AbstractDriverTestCase {
  
  private boolean isRotatable() {
    return (driver instanceof Rotatable) ? true : false;
  }

  public void testRotateToLandscapeMode() {
    if (!isRotatable()) {
      return;
    }
    Rotatable rotatable = (Rotatable) driver;
    rotatable.rotate(ScreenOrientation.LANDSCAPE);
    assertEquals(ScreenOrientation.LANDSCAPE, rotatable.getOrientation());
  }
  
  public void testRotateToPortrait() {
    if (!isRotatable()) {
      return;
    }
    Rotatable rotatable = (Rotatable) driver;
    rotatable.rotate(ScreenOrientation.PORTRAIT);
    assertEquals(ScreenOrientation.PORTRAIT, rotatable.getOrientation());
  }
  
  public void testGetOrientationReturnsInitialValue() {
    if (!isRotatable()) {
      return;
    }
    assertNotNull(((Rotatable) driver).getOrientation());
  }
}
