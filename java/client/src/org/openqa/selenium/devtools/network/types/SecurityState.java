package org.openqa.selenium.devtools.network.types;

/**
 * The security level of a page or resource
 */
public enum SecurityState {

  UNKNOWN("unknown"),
  NEUTRAL("neutral"),
  INSECURE("insecure"),
  SECURE("secure"),
  INFO("info");

  private String state;

  SecurityState(String state) {
    this.state = state;
  }

  public String getState() {
    return state;
  }
}
