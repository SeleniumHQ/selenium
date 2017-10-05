package org.openqa.selenium.remote.session;

import com.google.common.collect.ImmutableMap;

import java.util.Map;
import java.util.Objects;

public class ChromeFilter implements CapabilitiesFilter {
  @Override
  public Map<String, Object> apply(Map<String, Object> unmodifiedCaps) {
    ImmutableMap<String, Object> caps = unmodifiedCaps.entrySet().parallelStream()
        .filter(
            entry ->
                ("browserName".equals(entry.getKey()) && "chrome".equals(entry.getValue())) ||
                entry.getKey().startsWith("goog:") ||
                "chromeOptions".equals(entry.getKey()))
        .filter(entry -> Objects.nonNull(entry.getValue()))
        .distinct()
        .collect(ImmutableMap.toImmutableMap(Map.Entry::getKey, Map.Entry::getValue));

    return caps.isEmpty() ? null : caps;
  }

}
