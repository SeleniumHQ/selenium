package org.openqa.selenium.printoptions;

public class PageSize {

  private double height;
  private double width;

  public PageSize() {
    // Initialize with defaults
    this.height = 21.59;
    this.width = 27.94;
  }
  public double getHeight() {
    return height;
  }

  public double getWidth() {
    return width;
  }

  public void setHeight(double height) {
    this.height = height;
  }

  public void setWidth(double width) {
    this.width = width;
  }
}
