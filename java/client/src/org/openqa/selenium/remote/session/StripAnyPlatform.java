package org.openqa.selenium.remote.session;

import static java.util.Collections.singleton;

import java.util.Collection;
import java.util.Map;

public class StripAnyPlatform implements CapabilityTransform {

  @Override
  public Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry) {
    if (!("platform".equals(entry.getKey()) || "platformName".equals(entry.getKey()))) {
      return singleton(entry);
    }

    String value = String.valueOf(entry.getValue()).toLowerCase();
    if ("null".equals(value) ||
        "*".equals(value) ||
        "any".equals(value)) {
      return null;
    }

    return singleton(entry);
  }
}
