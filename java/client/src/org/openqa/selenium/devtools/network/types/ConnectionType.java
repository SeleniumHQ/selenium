package org.openqa.selenium.devtools.network.types;

/**
 * The underlying connection technology that the browser is supposedly using
 */
public enum ConnectionType {

  none,
  cellular2g,
  cellular3g,
  cellular4g,
  bluetooth,
  ethernet,
  wifi,
  wimax,
  other
}
