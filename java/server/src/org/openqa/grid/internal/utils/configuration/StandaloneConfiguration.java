// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.grid.internal.utils.configuration;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.annotations.Expose;

import com.beust.jcommander.Parameter;

import org.openqa.grid.common.JSONConfigurationUtils;
import org.openqa.grid.common.exception.GridConfigurationException;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class StandaloneConfiguration {
  public static final String DEFAULT_STANDALONE_CONFIG_FILE = "defaults/DefaultStandalone.json";

  /*
   * IMPORTANT - Keep these constant values in sync with the ones specified in
   * 'defaults/DefaultStandalone.json'  -- if for no other reasons documentation & consistency.
   */

  /**
   * Default client timeout
   */
  static final Integer DEFAULT_TIMEOUT = 1800;

  /**
   * Default browser timeout
   */
  static final Integer DEFAULT_BROWSER_TIMEOUT = 0;

  /**
   * Default standalone role
   */
  static final String DEFAULT_ROLE = "standalone";

  /**
   * Default standalone port
   */
  static final Integer DEFAULT_PORT = 4444;

  /**
   * Default state of LogeLevel.FINE log output toggle
   */
  static final Boolean DEFAULT_DEBUG_TOGGLE = false;

  /*
   * config parameters which do not serialize to json
   */

  @Expose( serialize = false )
  @Parameter(
    names = {"-avoidProxy"},
    description = "DO NOT USE: Hack to allow selenium 3.0 server run in SauceLabs",
    hidden = true
  )
  // initially defaults to false from boolean primitive type
  private boolean avoidProxy;

  @Expose( serialize = false )
  @Parameter(
    names = "-browserSideLog",
    description = "DO NOT USE: Provided for compatibility with 2.0",
    hidden = true
  )
  // initially defaults to false from boolean primitive type
  private boolean browserSideLog;

  @Expose( serialize = false )
  @Parameter(
    names = "-captureLogsOnQuit",
    description = "DO NOT USE: Provided for compatibility with 2.0",
    hidden = true
  )
  // initially defaults to false from boolean primitive type
  private boolean captureLogsOnQuit;

  @Expose( serialize = false )
  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "Displays this help"
  )
  /**
   * Whether help or usage() is requested. Default {@code false}.
   */
  // initially defaults to false from boolean primitive type
  public boolean help;

  /*
   * config parameters which serialize and deserialize to/from json
   */

  /**
   * Browser timeout. Default 0 (indefinite wait).
   */
  @Expose
  @Parameter(
    names = "-browserTimeout",
    description = "<Integer> in seconds : number of seconds a browser session is allowed to hang while a WebDriver command is running (example: driver.get(url)). If the timeout is reached while a WebDriver command is still processing, the session will quit. Minimum value is 60. An unspecified, zero, or negative value means wait indefinitely."
  )
  public Integer browserTimeout = DEFAULT_BROWSER_TIMEOUT;

  /**
   * Enable {@code LogLevel.FINE} log messages. Default {@code false}.
   */
  @Expose
  @Parameter(
    names = "-debug",
    description = "<Boolean> : enables LogLevel.FINE.",
    arity = 1
  )
  public Boolean debug = DEFAULT_DEBUG_TOGGLE;

  /**
   *   Max threads for Jetty. Defaults to {@code null}.
   */
  @Expose
  @Parameter(
    names = {"-jettyThreads", "-jettyMaxThreads"},
    description = "<Integer> : max number of threads for Jetty. An unspecified, zero, or negative value means the Jetty default value (200) will be used."
  )
  public Integer jettyMaxThreads;

  /**
   *   Filename to use for logging. Defaults to {@code null}.
   */
  @Expose
  @Parameter(
    names = "-log",
    description = "<String> filename : the filename to use for logging. If omitted, will log to STDOUT"
  )
  public String log;

  /**
   * Port to bind to. Default determined by configuration type.
   */
  @Expose
  @Parameter(
    names = {"-port"},
    description = "<Integer> : the port number the server will use."
  )
  public Integer port = DEFAULT_PORT;

  /**
   * Server role. Default determined by configuration type.
   */
  @Expose
  @Parameter(
    names = "-role",
    description = "<String> options are [hub], [node], or [standalone]."
  )
  public String role = DEFAULT_ROLE;

  /**
   * Client timeout. Default 1800 sec.
   */
  @Expose
  @Parameter(
    names = {"-timeout", "-sessionTimeout"},
    description = "<Integer> in seconds : Specifies the timeout before the server automatically kills a session that hasn't had any activity in the last X seconds. The test slot will then be released for another test to use. This is typically used to take care of client crashes. For grid hub/node roles, cleanUpCycle must also be set."
  )
  public Integer timeout = DEFAULT_TIMEOUT;

  /**
   * Creates a new configuration using the default values.
   */
  public StandaloneConfiguration() {
    // nothing to do.
  }

  /**
   * @param filePath node config json file to load configuration from
   */
  public static StandaloneConfiguration loadFromJSON(String filePath) {
    return loadFromJSON(JSONConfigurationUtils.loadJSON(filePath));
  }

  /**
   * @param json JsonObject to load configuration from
   */
  public static StandaloneConfiguration loadFromJSON(JsonObject json) {
    try {
      GsonBuilder builder = new GsonBuilder();
      StandaloneConfiguration config =
        builder.excludeFieldsWithoutExposeAnnotation().create().fromJson(json, StandaloneConfiguration.class);
      return config;
    } catch (Throwable e) {
      throw new GridConfigurationException("Error with the JSON of the config : " + e.getMessage(),
                                           e);
    }
  }

  /**
   * copy another configuration's values into this one if they are set.
   * @param other
   */
  public void merge(StandaloneConfiguration other) {
    if (other == null) {
      return;
    }

    if (isMergeAble(other.browserTimeout, browserTimeout)) {
      browserTimeout = other.browserTimeout;
    }
    if (isMergeAble(other.jettyMaxThreads, jettyMaxThreads)) {
      jettyMaxThreads = other.jettyMaxThreads;
    }
    if (isMergeAble(other.timeout, timeout)) {
      timeout = other.timeout;
    }
    // role, port, log, debug and help are not merged, they are only consumed by the immediately running node and can't affect a remote
  }

  /**
   * Determines if one object can be merged onto another object. Checks for {@code null},
   * and empty (Collections & Maps) to make decision.
   *
   * @param other the object to merge. must be the same type as the 'target'
   * @param target the object to merge on to. must be the same type as the 'other'
   * @return whether the 'other' can be merged onto the 'target'
   */
  protected boolean isMergeAble(Object other, Object target) {
    // don't merge a null value
    if (other == null) {
      return false;
    } else {
      // allow any non-null value to merge over a null target.
      if (target == null) {
        return true;
      }
    }

    // we know we have two objects with value.. Make sure the types are the same and
    // perform additional checks.

    if (! target.getClass().getSuperclass().getTypeName()
        .equals(other.getClass().getSuperclass().getTypeName())) {
      return false;
    }

    if (target instanceof Collection) {
      return !((Collection) other).isEmpty();
    }

    if (target instanceof Map) {
      return !((Map) other).isEmpty();
    }

    return true;
  }

  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(toString(format, "browserTimeout", browserTimeout));
    sb.append(toString(format, "debug", debug));
    sb.append(toString(format, "help", help));
    sb.append(toString(format, "jettyMaxThreads", jettyMaxThreads));
    sb.append(toString(format, "log", log));
    sb.append(toString(format, "port", port));
    sb.append(toString(format, "role", role));
    sb.append(toString(format, "timeout", timeout));
    return sb.toString();
  }

  @Override
  public String toString() {
    return toString(" -%1$s %2$s");
  }

  public StringBuilder toString(String format, String name, Object value) {
    StringBuilder sb = new StringBuilder();
    List iterator;
    if (value instanceof List) {
      iterator = (List)value;
    } else {
      iterator = Arrays.asList(value);
    }
    for (Object v : iterator) {
      if (v != null &&
          !(v instanceof Map && ((Map) v).isEmpty()) &&
          !(v instanceof Collection && ((Collection) v).isEmpty())) {
        sb.append(String.format(format, name, v));
      }
    }
    return sb;
  }

  /**
   * Return a JsonElement representation of the configuration. Does not serialize nulls.
   * @return
   */
  public JsonElement toJson() {
    GsonBuilder builder = new GsonBuilder();
    addJsonTypeAdapter(builder);
    //Note: it's important that nulls ARE NOT serialized, for backwards compatibility
    return builder.excludeFieldsWithoutExposeAnnotation().create().toJsonTree(this);
  }

  protected void addJsonTypeAdapter(GsonBuilder builder) {
    // no default implementation
  }
}
