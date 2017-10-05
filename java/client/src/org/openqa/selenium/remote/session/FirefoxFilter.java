package org.openqa.selenium.remote.session;

import com.google.common.collect.ImmutableMap;

import java.util.Map;
import java.util.Objects;

public class FirefoxFilter implements CapabilitiesFilter {
  // Note: we don't take a dependency on the FirefoxDriver jar as it might not be on the classpath

  @Override
  public Map<String, Object> apply(Map<String, Object> unmodifiedCaps) {
    ImmutableMap<String, Object> caps = unmodifiedCaps.entrySet().parallelStream()
        .filter(entry ->
                    ("browserName".equals(entry.getKey()) && "firefox".equals(entry.getValue())) ||
                    entry.getKey().startsWith("firefox_") ||
                    entry.getKey().startsWith("moz:"))
        .filter(entry -> Objects.nonNull(entry.getValue()))
        .distinct()
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    return caps.isEmpty() ? null : caps;
  }
}
