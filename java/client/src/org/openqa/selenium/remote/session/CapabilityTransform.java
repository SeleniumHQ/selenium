package org.openqa.selenium.remote.session;

import java.util.Collection;
import java.util.Map;
import java.util.function.Function;

/**
 * Takes a capability and allows it to be transformed into 0, 1, or n different capabilities for a
 * W3C New Session payload.
 */
@FunctionalInterface
public interface CapabilityTransform
    extends Function<Map.Entry<String, Object>, Collection<Map.Entry<String, Object>>> {

  /**
   * @return {@code null} to remove the capability, or a collection of {@link Map.Entry} instances.
   */
  @Override
  Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry);
}
