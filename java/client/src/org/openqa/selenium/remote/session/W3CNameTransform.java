package org.openqa.selenium.remote.session;

import static java.util.Collections.singleton;

import java.util.Collection;
import java.util.Map;
import java.util.function.Predicate;
import java.util.regex.Pattern;
import java.util.stream.Stream;

public class W3CNameTransform implements CapabilityTransform {

  /**
   * Patterns that are acceptable to send to a w3c remote end.
   */
  private final static Predicate<String> ACCEPTED_W3C_PATTERNS = Stream.of(
      "^[\\w-]+:.*$",
      "^acceptInsecureCerts$",
      "^browserName$",
      "^browserVersion$",
      "^platformName$",
      "^pageLoadStrategy$",
      "^proxy$",
      "^setWindowRect$",
      "^timeouts$",
      "^unhandledPromptBehavior$")
      .map(Pattern::compile)
      .map(Pattern::asPredicate)
      .reduce(identity -> false, Predicate::or);

  @Override
  public Collection<Map.Entry<String, Object>> apply(Map.Entry<String, Object> entry) {
    if (ACCEPTED_W3C_PATTERNS.test(entry.getKey())) {
      return singleton(entry);
    }

    return null;
  }
}
