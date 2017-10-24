package org.openqa.selenium.remote.session;

import java.util.Map;
import java.util.function.Function;

/**
 * Takes a stream of capabilities and extracts those that are specific to a browser.
 */
@FunctionalInterface
public interface CapabilitiesFilter extends Function<Map<String, Object>, Map<String, Object>> {

  /**
   * Take a map of capabilties and extract those specific to a browser.
   * @return a {@link Map} of capabilities if any match, or {@code null} otherwise.
   */
  @Override
  Map<String, Object> apply(Map<String, Object> capabilities);
}
