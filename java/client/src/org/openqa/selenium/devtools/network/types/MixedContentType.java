package org.openqa.selenium.devtools.network.types;

/**
 * A description of mixed content (HTTP resources on HTTPS pages), as defined by
 * https://www.w3.org/TR/mixed-content/#categories
 */
public enum MixedContentType {

  BLOCKABLE("blockable"),
  OPTIONALLY_BLOCKABLE("optionally-blockable"),
  NONE("none");

  private String type;

  MixedContentType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }
}
