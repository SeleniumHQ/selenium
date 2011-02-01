// Copyright 2011 Google Inc. All Rights Reserved.
package org.openqa.selenium;

/**
 * Similar to Point - implement locally to avoid depending on GWT.
 */
public class Dimension {
  public final int width;
  public final int height;

  public Dimension(int width, int height) {
    this.width = width;
    this.height = height;
  }

  public int getWidth() {
    return width;
  }

  public int getHeight() {
    return height;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Dimension)) {
      return false;
    }

    Dimension other = (Dimension) o;
    return other.width == width && other.height == height;
  }

  @Override
  public int hashCode() {
    // Assuming height, width, rarely exceed 4096 pixels, shifting
    // by 12 should provide a good hash value.
    return width << 12 + height;
  }
}
