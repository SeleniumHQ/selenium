package org.openqa.selenium.devtools.network.types;

/**
 * Stages of the interception to begin intercepting.
 * Request will intercept before the request is sent. Response will intercept after the response is received
 */
public enum InterceptionStage {
  REQUEST("Request"),
  HEADERS_RECEIVED("HeadersReceived");

  private String stage;

  InterceptionStage(String stage) {
    this.stage = stage;
  }

  public String getStage() {
    return stage;
  }
}
