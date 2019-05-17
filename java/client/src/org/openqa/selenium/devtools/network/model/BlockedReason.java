package org.openqa.selenium.devtools.network.model;

/**
 * The reason why request was blocked
 */
public enum BlockedReason {

  other("other"),
  csp("csp"),
  mixedContent("mixed-content"),
  origin("origin"),
  inspector("inspector"),
  subresourceFilter("subresource-filter"),
  contentType("content-type"),
  collapsedbyClient("collapsed-by-client");

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
