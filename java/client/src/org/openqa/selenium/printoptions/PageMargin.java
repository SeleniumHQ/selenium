package org.openqa.selenium.printoptions;

public class PageMargin {
  private double top;
  private double bottom;
  private double left;
  private double right;

  public PageMargin() {
    this.top = 1.0;
    this.bottom = 1.0;
    this.left = 1.0;
    this.right = 1.0;
  }

  public double getTop() {
    return this.top;
  }

  public double getBottom() {
    return this.bottom;
  }

  public double getLeft() {
    return this.left;
  }

  public double getRight() {
    return this.right;
  }

  public void setTop(double top) {
    if (top < 0) {
      throw new IllegalArgumentException("Top margin value should be > 0");
    }

    this.top = top;
  }

  public void setBottom(double bottom) {
    if (bottom < 0) {
      throw new IllegalArgumentException("Bottom margin value should be > 0");
    }

    this.bottom = bottom;
  }

  public void setRight(double right) {
    if (right < 0) {
      throw new IllegalArgumentException("Right margin value should be > 0");
    }

    this.right = right;
  }

  public void setLeft(double left) {
    if (left < 0) {
      throw new IllegalArgumentException("Left margin value should be > 0");
    }

    this.left = left;
  }
}
