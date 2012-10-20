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
  public void rgbToRgba() {
    String rgb = "rgb(1, 2, 3)";
    assertEquals("rgba(1, 2, 3, 1)", Color.fromString(rgb).asRgba());
  }

  @Test
  public void rgbPctToRgba() {
    String rgba = "rgb(10%, 20%, 30%)";
    assertEquals("rgba(25, 51, 76, 1)", Color.fromString(rgba).asRgba());
  }

  @Test
  public void rgbAllowsWhitespace() {
    String rgb = "rgb(\t1,   2    , 3)";
    String canonicalRgb = "rgb(1, 2, 3)";
    assertEquals(canonicalRgb, Color.fromString(rgb).asRgb());
  }

  @Test
  public void rgbaToRgba() {
    String rgba = "rgba(1, 2, 3, 0.5)";
    assertEquals("rgba(1, 2, 3, 0.5)", Color.fromString(rgba).asRgba());
  }

  @Test
  public void rgbaPctToRgba() {
    String rgba = "rgba(10%, 20%, 30%, 0.5)";
    assertEquals("rgba(25, 51, 76, 0.5)", Color.fromString(rgba).asRgba());
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
  public void hexToRgba() {
    String hex = "#01Ff03";
    String rgba = "rgba(1, 255, 3, 1)";
    assertEquals(rgba, Color.fromString(hex).asRgba());
    // same test data as hex3 below
    hex = "#00ff33";
    rgba = "rgba(0, 255, 51, 1)";
    assertEquals(rgba, Color.fromString(hex).asRgba());
  }

  @Test
  public void rgbToHex() {
    String hex = "#01ff03";
    String rgb = "rgb(1, 255, 3)";
    assertEquals(hex, Color.fromString(rgb).asHex());
  }

  @Test
  public void hex3ToRgba() {
    String hex = "#0f3";
    String rgba = "rgba(0, 255, 51, 1)";
    assertEquals(rgba, Color.fromString(hex).asRgba());
  }

  @Test
  public void hslToRgba() {
    String hsl = "hsl(120, 100%, 25%)";
    String rgba = "rgba(0, 128, 0, 1)";
    assertEquals(rgba, Color.fromString(hsl).asRgba());
    hsl = "hsl(100, 0%, 50%)";
    rgba = "rgba(128, 128, 128, 1)";
    assertEquals(rgba, Color.fromString(hsl).asRgba());
  }

  @Test
  public void hslaToRgba() {
    String hsla = "hsla(120, 100%, 25%, 1)";
    String rgba = "rgba(0, 128, 0, 1)";
    assertEquals(rgba, Color.fromString(hsla).asRgba());
    hsla = "hsla(100, 0%, 50%, 0.5)";
    rgba = "rgba(128, 128, 128, 0.5)";
    assertEquals(rgba, Color.fromString(hsla).asRgba());
  }

  @Test
  public void baseColourToRgba() {
    String baseColour = "green";
    String rgba = "rgba(0, 128, 0, 1)";
    assertEquals(rgba, Color.fromString(baseColour).asRgba());
    baseColour = "gray";
    rgba = "rgba(128, 128, 128, 1)";
    assertEquals(rgba, Color.fromString(baseColour).asRgba());
  }

  @Test
  public void transparentToRgba() {
    String transparent = "transparent";
    String rgba = "rgba(0, 0, 0, 0)";
    assertEquals(rgba, Color.fromString(transparent).asRgba());
  }

  @Test
  public void checkEqualsWorks() {
    Color objectA = Color.fromString("#f00");
    Color objectB = Color.fromString("rgb(255, 0, 0)");
    assertEquals(objectA, objectB);
  }

  @Test
  public void checkHashCodeWorks() {
    Color objectA = Color.fromString("#f00");
    Color objectB = Color.fromString("rgb(255, 0, 0)");
    assertEquals(objectA.hashCode(), objectB.hashCode());
  }
}
