package org.openqa.selenium.devtools.audit.model;

import org.openqa.selenium.devtools.DevToolsException;

import java.util.Arrays;
import java.util.Objects;

public enum Encoding {
  webp,
  jpeg,
  jpg,
  png;

  public static Encoding getEncoding(String val) {
    Objects.requireNonNull(val, "Encoding cannot be null value");
    return Arrays.stream(Encoding.values())
        .filter(e -> e.name().equalsIgnoreCase(val))
        .findFirst()
        .orElseThrow(() -> new DevToolsException("Given value is not supported encoding"));
  }
}
