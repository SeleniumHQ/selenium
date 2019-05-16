package org.openqa.selenium.devtools.network.types;

/**
 * Resource type as it was perceived by the rendering engine
 */
public enum ResourceType {

  Document,
  Stylesheet,
  Image,
  Media,
  Font,
  Script,
  TextTrack,
  XHR,
  Fetch,
  EventSource,
  WebSocket,
  Manifest,
  SignedExchange,
  Ping,
  CSPViolationReport,
  Other

}
