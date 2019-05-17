package org.openqa.selenium.devtools.network.model;

/**
 * A description of mixed content (HTTP resources on HTTPS pages), as defined by
 * https://www.w3.org/TR/mixed-content/#categories
 */
public enum MixedContentType {

  blockable("blockable"),
  optionallyBlockable("optionally-blockable"),
  none("none");

  private String type;

  MixedContentType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }

  public static MixedContentType fromString(String s) {
    for (MixedContentType m : MixedContentType.values()) {
      if (m.getType().equalsIgnoreCase(s)) {
        return m;
      }
    }
    return null;
  }

}
