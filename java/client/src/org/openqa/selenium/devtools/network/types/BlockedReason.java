package org.openqa.selenium.devtools.network.types;

/**
 * The reason why request was blocked
 */
public enum BlockedReason {

  OTHER("other"),
  CSP("csp"),
  MIXED_CONTENT("mixed-content"),
  ORIGIN("origin"),
  INSPECTOR("inspector"),
  SUBRESOURCE_FILTER("subresource-filter"),
  CONTENT_TYPE("content-type"),
  COLLAPSED_BY_CLIENT("collapsed-by-client");

  private String reason;

  BlockedReason(String reason) {
    this.reason = reason;
  }

  public String getReason() {
    return reason;
  }

  public static BlockedReason fromString(String s) {
    for (BlockedReason b : BlockedReason.values()) {
      if (b.getReason().equalsIgnoreCase(s)) {
        return b;
      }
    }
    return null;
  }

}
