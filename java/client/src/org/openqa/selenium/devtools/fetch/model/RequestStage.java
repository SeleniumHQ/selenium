package org.openqa.selenium.devtools.fetch.model;

public enum RequestStage {
  REQUEST("Request"),
  RESPONSE("Response"),
  ;

  private final String jsValue;

  private RequestStage(String jsValue) {
    this.jsValue = jsValue;
  }

  @Override
  public String toString() {
    return jsValue;
  }
}
