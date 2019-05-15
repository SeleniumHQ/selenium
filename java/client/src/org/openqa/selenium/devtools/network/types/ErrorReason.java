package org.openqa.selenium.devtools.network.types;

/**
 * Network level fetch failure reason
 */
public enum ErrorReason {

  Failed("Failed"),
  Aborted("Aborted"),
  TimedOut("TimedOut"),
  AccessDenied("AccessDenied"),
  ConnectionClosed("ConnectionClosed"),
  ConnectionReset("ConnectionReset"),
  ConnectionRefused("ConnectionRefused"),
  ConnectionAborted("ConnectionAborted"),
  ConnectionFailed("ConnectionFailed"),
  NameNotResolved("NameNotResolved"),
  InternetDisconnected("InternetDisconnected"),
  AddressUnreachable("AddressUnreachable"),
  BlockedByClient("BlockedByClient"),
  BlockedByResponse("BlockedByResponse");

  private String reason;

  ErrorReason(String type) {
    this.reason = reason;
  }

  public String getReason() {
    return reason;
  }

}
