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
   * cleanup cycle. Worst case scenario, a session can be idle for timeout + cleanup cycle before
   * the timeout is detected.
   */
  public static final JsonKey CLIENT_TIMEOUT = JsonKey.key("timeout");

  /**
   * How long to wait for new browser session to open up before giving up and throwing Timeout
   * exception {@link org.openqa.selenium.TimeoutException}
   */
  public static final JsonKey NEW_SESSION_WAIT_TIMEOUT = JsonKey.key("newSessionWaitTimeout");

  /**
   * The port the remote/hub will listen on. Default to 4444.
   */
  public static final JsonKey PORT = JsonKey.key("port");

  /**
   * Puts you into debug mode, with more trace information and diagnostics on the console.
   */
  public static final JsonKey DEBUG = JsonKey.key("debug");

  /**
   * Explicitly specify the current host address of box. This will save some time at hub/node boot
   * time, because the hub/node will not do an nslookup.
   */
  public static final JsonKey HOST = JsonKey.key("host");

  /**
   * Define current process to be hub or node
   */
  public static final JsonKey ROLE = JsonKey.key("role");

  /**
   * A class implementing the {@link org.openqa.grid.internal.listeners.Prioritizer} interface.
   * Default to null ( no priority = FIFO ). Specify a custom prioritizer if you need the grid to
   * process the tests from the CI, or the IE tests first for instance.
   */
  public static final JsonKey PRIORITIZER = JsonKey.key("prioritizer");

  /**
   * If true, the hub will reject test requests right away if no proxy is currently registered that
   * can host that capability.Set it to false to have the request queued until a node supporting the
   * capability is added to the grid.
   */
  public static final JsonKey THROW_ON_CAPABILITY_NOT_PRESENT =
      JsonKey.key("throwOnCapabilityNotPresent");

  /**
   * <com.mycompany.MyServlet,com.mycompany.MyServlet2> to register a new servlet on the hub/node.
   * The servlet will accessible under the path  /grid/admin/MyServlet /grid/admin/MyServlet2
   */
  public static final JsonKey SERVLETS = JsonKey.key("servlets");

  /**
   * A class implementing the CapabilityMatcher interface. Defaults to {@link
   * org.openqa.grid.internal.utils.DefaultCapabilityMatcher}. Specify the logic the hub will follow
   * to define if a request can be assigned to a node.Change this class if you want to have the
   * matching process use regular expression instead of exact match for the version of the browser
   * for instance. All the nodes of a grid instance will use the same matcher, defined by the
   * registry.
   */
  public static final JsonKey CAPABILITY_MATCHER = JsonKey.key("capabilityMatcher");

  /**
   * YML file following grid1 format.
   */
  public static final JsonKey GRID_1_YAML = JsonKey.key("grid1Yml");

  /**
   * A JSON file following grid2 format that defines the hub properties.
   */
  public static final JsonKey HUB_CONFIG = JsonKey.key("hubConfig");
}
