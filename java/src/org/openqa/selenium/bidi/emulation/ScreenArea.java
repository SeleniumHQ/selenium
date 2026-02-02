package org.openqa.selenium.bidi.emulation;

import java.util.Map;

public class ScreenArea {
  private final int height;
  private final int width;

  public ScreenArea(int width, int height) {
    this.width = width;
    this.height = height;
  }

  public Map<String, Integer> toMap() {
    return Map.of("width", width, "height", height);
  }}
