package org.openqa.selenium.devtools.network.types;

/**
 * Created by aohana
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
