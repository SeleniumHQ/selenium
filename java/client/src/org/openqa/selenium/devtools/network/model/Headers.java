package org.openqa.selenium.devtools.network.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.json.JsonInput;

import java.util.Map;

/**
 * Request / response headers as keys / values of JSON object.
 */
public class Headers extends com.google.common.collect.ForwardingMap<String, Object> {

  private final java.util.Map<String, Object> headers;

  public Headers(java.util.Map<String, Object> headers) {
    this.headers = java.util.Objects.requireNonNull(headers, "Missing value for Headers");
  }

  protected java.util.Map<String, Object> delegate() {
    return headers;
  }

  private static Headers fromJson(JsonInput input) {
    return new Headers(input.read(new com.google.common.reflect.TypeToken<java.util.Map<String, Object>>() {
    }.getType()));
  }

  public Map<String, Object> toJson() {
    return headers;
  }

  public String toString() {
    return headers.toString();
  }
}
