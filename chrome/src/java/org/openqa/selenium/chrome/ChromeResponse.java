package org.openqa.selenium.chrome;

import org.openqa.selenium.remote.Response;


public class ChromeResponse extends Response {

  //Status code of -1 indicates value is the ID of a ChromeWebElement
  private final int statusCode;
  public ChromeResponse(int statusCode, Object value) {
    this.statusCode = statusCode;
    setValue(value);
    setError(statusCode != 0);
  }
  public int getStatusCode() {
    return statusCode;
  }
  
  @Override
  public String toString() {
    return String.format("(%d: %s)", statusCode, getValue());
  }
}
