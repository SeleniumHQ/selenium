package org.openqa.selenium.devtools.network.types;

/** Type of this initiator. */
public enum InitiatorType {

  PARSER("parser"),
  SCRIPT("script"),
  PRELOAD("preload"),
  SIGNED_EXCHANGE("SignedExchange"),
  OTHER("other");

  private String type;

  InitiatorType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }
}
