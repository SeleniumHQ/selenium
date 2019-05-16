package org.openqa.selenium.devtools.network.types;

/**
 * Network level fetch failure reason
 */
public enum ErrorReason {

  Failed,
  Aborted,
  TimedOut,
  AccessDenied,
  ConnectionClosed,
  ConnectionReset,
  ConnectionRefused,
  ConnectionAborted,
  ConnectionFailed,
  NameNotResolved,
  InternetDisconnected,
  AddressUnreachable,
  BlockedByClient,
  BlockedByResponse

}
