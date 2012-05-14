/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.support;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ColorTest {
  @Test
  public void rgbToRgb() {
    String rgb = "rgb(1, 2, 3)";
    assertEquals(rgb, Color.fromString(rgb).asRgb());
  }

  @Test
  public void rgbAllowsWhitespace() {
    String rgb = "rgb(\t1,   2    , 3)";
    String canonicalRgb = "rgb(1, 2, 3)";
    assertEquals(canonicalRgb, Color.fromString(rgb).asRgb());
  }

  @Test
  public void hexToHex() {
    String hex = "#ff00a0";
    assertEquals(hex, Color.fromString(hex).asHex());
  }

  @Test
  public void hexToRgb() {
    String hex = "#01Ff03";
    String rgb = "rgb(1, 255, 3)";
    assertEquals(rgb, Color.fromString(hex).asRgb());
  }

  @Test
  public void rgbToHex() {
    String hex = "#01ff03";
    String rgb = "rgb(1, 255, 3)";
    assertEquals(hex, Color.fromString(rgb).asHex());
  }
}
