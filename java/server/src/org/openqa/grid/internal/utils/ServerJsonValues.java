/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


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
