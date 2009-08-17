package org.openqa.selenium.chrome;


public class Response {

  private final int statusCode;
  private final Object value;
  public Response(int statusCode, Object value) {
    this.statusCode = statusCode;
    this.value = value;
  }
  public int getStatusCode() {
    return statusCode;
  }
  
  public Object getValue() {
    return value;
  }
  
  @Override
  public String toString() {
    return String.format("(%d: %s)", statusCode, getValue());
  }
}
