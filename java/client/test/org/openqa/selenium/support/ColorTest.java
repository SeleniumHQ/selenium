// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

public class ColorTest {
  @Test
  public void rgbToRgb() {
    String rgb = "rgb(1, 2, 3)";
    assertThat(Color.fromString(rgb).asRgb()).isEqualTo(rgb);
  }

  @Test
  public void rgbToRgba() {
    String rgb = "rgb(1, 2, 3)";
    assertThat(Color.fromString(rgb).asRgba()).isEqualTo("rgba(1, 2, 3, 1)");
  }

  @Test
  public void rgbPctToRgba() {
    String rgba = "rgb(10%, 20%, 30%)";
    assertThat(Color.fromString(rgba).asRgba()).isEqualTo("rgba(25, 51, 76, 1)");
  }

  @Test
  public void rgbAllowsWhitespace() {
    String rgb = "rgb(\t1,   2    , 3)";
    String canonicalRgb = "rgb(1, 2, 3)";
    assertThat(Color.fromString(rgb).asRgb()).isEqualTo(canonicalRgb);
  }

  @Test
  public void rgbaToRgba() {
    String rgba = "rgba(1, 2, 3, 0.5)";
    assertThat(Color.fromString(rgba).asRgba()).isEqualTo("rgba(1, 2, 3, 0.5)");
  }

  @Test
  public void rgbaPctToRgba() {
    String rgba = "rgba(10%, 20%, 30%, 0.5)";
    assertThat(Color.fromString(rgba).asRgba()).isEqualTo("rgba(25, 51, 76, 0.5)");
  }

  @Test
  public void hexToHex() {
    String hex = "#ff00a0";
    assertThat(Color.fromString(hex).asHex()).isEqualTo(hex);
  }

  @Test
  public void hexToRgb() {
    String hex = "#01Ff03";
    String rgb = "rgb(1, 255, 3)";
    assertThat(Color.fromString(hex).asRgb()).isEqualTo(rgb);
  }

  @Test
  public void hexToRgba() {
    String hex = "#01Ff03";
    String rgba = "rgba(1, 255, 3, 1)";
    assertThat(Color.fromString(hex).asRgba()).isEqualTo(rgba);
    // same test data as hex3 below
    hex = "#00ff33";
    rgba = "rgba(0, 255, 51, 1)";
    assertThat(Color.fromString(hex).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void rgbToHex() {
    String hex = "#01ff03";
    String rgb = "rgb(1, 255, 3)";
    assertThat(Color.fromString(rgb).asHex()).isEqualTo(hex);
  }

  @Test
  public void hex3ToRgba() {
    String hex = "#0f3";
    String rgba = "rgba(0, 255, 51, 1)";
    assertThat(Color.fromString(hex).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void hslToRgba() {
    String hsl = "hsl(120, 100%, 25%)";
    String rgba = "rgba(0, 128, 0, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
    hsl = "hsl(100, 0%, 50%)";
    rgba = "rgba(128, 128, 128, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
    hsl = "hsl(0, 100%, 50%)"; // red
    rgba = "rgba(255, 0, 0, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
    hsl = "hsl(120, 100%, 50%)"; // green
    rgba = "rgba(0, 255, 0, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
    hsl = "hsl(240, 100%, 50%)"; // blue
    rgba = "rgba(0, 0, 255, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
    hsl = "hsl(0, 0%, 100%)"; // white
    rgba = "rgba(255, 255, 255, 1)";
    assertThat(Color.fromString(hsl).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void hslaToRgba() {
    String hsla = "hsla(120, 100%, 25%, 1)";
    String rgba = "rgba(0, 128, 0, 1)";
    assertThat(Color.fromString(hsla).asRgba()).isEqualTo(rgba);
    hsla = "hsla(100, 0%, 50%, 0.5)";
    rgba = "rgba(128, 128, 128, 0.5)";
    assertThat(Color.fromString(hsla).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void baseColourToRgba() {
    String baseColour = "green";
    String rgba = "rgba(0, 128, 0, 1)";
    assertThat(Color.fromString(baseColour).asRgba()).isEqualTo(rgba);
    baseColour = "gray";
    rgba = "rgba(128, 128, 128, 1)";
    assertThat(Color.fromString(baseColour).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void transparentToRgba() {
    String transparent = "transparent";
    String rgba = "rgba(0, 0, 0, 0)";
    assertThat(Color.fromString(transparent).asRgba()).isEqualTo(rgba);
  }

  @Test
  public void checkEqualsWorks() {
    Color objectA = Color.fromString("#f00");
    Color objectB = Color.fromString("rgb(255, 0, 0)");
    assertThat(objectB).isEqualTo(objectA);
  }

  @Test
  public void checkHashCodeWorks() {
    Color objectA = Color.fromString("#f00");
    Color objectB = Color.fromString("rgb(255, 0, 0)");
    assertThat(objectB.hashCode()).isEqualTo(objectA.hashCode());
  }

  @Test
  public void checkSettingOpacityRGB() {
    String initial = "rgb(1, 255, 3)";
    Color actual = Color.fromString(initial);

    actual.setOpacity(0.5);

    String expected = "rgba(1, 255, 3, 0.5)";
    assertThat(actual.asRgba()).isEqualTo(expected);
  }

  @Test
  public void checkSettingOpacityRGBA() {
    String initial = "rgba(1, 255, 3, 1)";
    Color actual = Color.fromString(initial);

    actual.setOpacity(0);

    String expected = "rgba(1, 255, 3, 0)";
    assertThat(actual.asRgba()).isEqualTo(expected);
  }

  @Test
  public void baseColourToAwt() {
    java.awt.Color green = java.awt.Color.GREEN;
    String rgba = "rgba(0, 255, 0, 1)";
    assertThat(green).isEqualTo(Color.fromString(rgba).getColor());
  }

  @Test
  public void transparentColourToAwt() {
    java.awt.Color transGreen = new java.awt.Color(0, 255, 0, 0);
    String rgba = "rgba(0, 255, 0, 0)";
    assertThat(transGreen).isEqualTo(Color.fromString(rgba).getColor());
  }

}
