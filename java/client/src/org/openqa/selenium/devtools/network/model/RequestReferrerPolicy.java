package org.openqa.selenium.devtools.network.model;

/**
 * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/
 */
public enum RequestReferrerPolicy {

  unsafeUrl("unsafe-url"),
  noReferrerWhenDowngrade("no-referrer-when-downgrade"),
  noReferrer("no-referrer"),
  origin("origin"),
  originWhenCrossOrigin("origin-when-cross-origin"),
  sameOrigin("same-origin"),
  strictOrigin("strict-origin"),
  strictOriginWhenCrossOrigin("strict-origin-when-cross-origin");

  private String policy;

  RequestReferrerPolicy(String policy) {
    this.policy = policy;
  }

  public String getPolicy() {
    return policy;
  }

}
