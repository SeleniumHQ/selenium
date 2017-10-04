package org.openqa.selenium.json;

import com.google.gson.JsonParseException;

import org.openqa.selenium.WebDriverException;

public class JsonException extends WebDriverException {
  public JsonException(String message, JsonParseException jpe) {
    super(message, jpe);
    setStackTrace(jpe.getStackTrace());
  }

  public JsonException(JsonParseException jpe) {
    super(jpe.getMessage(), jpe.getCause());
    setStackTrace(jpe.getStackTrace());
  }
}
