package org.openqa.grid.internal.utils;

/**
 * Well-known JSON constants in use by grid/server
 */
public class ServerJsonValues {

  /**
   * how many ms can a browser be hanging before being considered hanging (dead). The grid does not
   * act on this value by itself, but passes the value on to the nodes, which do.
   */
  public static final JsonKey BROWSER_TIMEOUT = JsonKey.key("browserTimeout");

  /**
   * how many ms can a session be idle before being considered timed out. Working together with
   * cleanup cycle. Worst case scenario, a session can be idle for timout + cleanup cycle before the
   * timeout is detected.
   */
  public static final JsonKey CLIENT_TIMEOUT = JsonKey.key("timeout");

}
