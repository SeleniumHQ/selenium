package org.openqa.selenium.devtools.network.types;

/**
 * Resource type as it was perceived by the rendering engine
 */
public enum ResourceType {

  Document("Document"),
  Stylesheet("Stylesheet"),
  Image("Image"),
  Media("Media"),
  Font("Font"),
  Script("Script"),
  TextTrack("TextTrack"),
  XHR("XHR"),
  Fetch("Fetch"),
  EventSource("EventSource"),
  WebSocket("WebSocket"),
  Manifest("Manifest"),
  SignedExchange("SignedExchange"),
  Ping("Ping"),
  CSPViolationReport("CSPViolationReport"),
  Other("Other");

  private String type;

  ResourceType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }

}
