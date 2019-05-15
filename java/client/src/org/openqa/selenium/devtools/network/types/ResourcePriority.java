package org.openqa.selenium.devtools.network.types;

/**
 * Loading priority of a resource request
 */
public enum ResourcePriority {

  VeryLow("VeryLow"),
  Low("Low"),
  Medium("Medium"),
  High("High"),
  VeryHigh("VeryHigh");

  private String priority;

  ResourcePriority(String priority) {
    this.priority = priority;
  }

  public String getPriority() {
    return priority;
  }

}
