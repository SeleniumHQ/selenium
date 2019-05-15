package org.openqa.selenium.devtools.network.types;

/**
 * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
 */
public enum RequestReferrerPolicy {

  UNSAFE_URL("unsafe-url"),
  NO_REFERRER_WHEN_DOWNGRADE("no-referrer-when-downgrade"),
  NO_REFERRER("no-referrer"),
  ORIGIN("origin"),
  ORIGIN_WHEN_CROSS_ORIGIN("origin-when-cross-origin"),
  SAME_ORIGIN("same-origin"),
  STRICT_ORIGIN("strict-origin"),
  STRICT_ORIGIN_WHEN_CROSS_ORIGIN("strict-origin-when-cross-origin");

  private String policy;

  RequestReferrerPolicy(String policy) {
    this.policy = policy;
  }

  public String getPolicy() {
    return policy;
  }

}
