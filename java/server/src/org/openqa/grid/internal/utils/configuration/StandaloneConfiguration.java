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
import com.google.gson.annotations.Expose;

import com.beust.jcommander.Parameter;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class StandaloneConfiguration {

  /*
   * config parameters which do not serialize to json
   */

  @Expose( serialize = false )
  @Parameter(
    names = {"-avoidProxy"},
    description = "DO NOT USE: Hack to allow selenium 3.0 server run in SauceLabs",
    hidden = true
  )
  private boolean avoidProxy;

  @Expose( serialize = false )
  @Parameter(
    names = "-browserSideLog",
    description = "DO NOT USE: Provided for compatibility with 2.0",
    hidden = true
  )
  private boolean browserSideLog;

  @Expose( serialize = false )
  @Parameter(
    names = "-captureLogsOnQuit",
    description = "DO NOT USE: Provided for compatibility with 2.0",
    hidden = true
  )
  private boolean captureLogsOnQuit;

  @Expose( serialize = false )
  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "Displays this help"
  )
  public boolean help;

  /*
   * config parameters which serialize and deserialize to/from json
   */

  @Expose
  @Parameter(
    names = "-browserTimeout",
    description = "<Integer> in seconds : number of seconds a browser session is allowed to hang (0 means indefinite) while a WebDriver command is running (example: driver.get(url)). If the timeout is reached while a WebDriver command is still processing, the session will quit. Minimum value is 60. Default is 0"
  )
  public Integer browserTimeout;

  @Expose
  @Parameter(
    names = "-debug",
    description = "<Boolean> : enables LogLevel.FINE. Default is false (if omitted)"
  )
  public boolean debug;

  @Expose
  @Parameter(
    names = {"-jettyThreads", "-jettyMaxThreads"},
    description = "<Integer> : max number of threads for Jetty. Default is 200"
  )
  public Integer jettyMaxThreads;

  @Expose
  @Parameter(
    names = "-log",
    description = "<String> filename : the filename to use for logging. If omitted, will log to STDOUT"
  )
  public String log;

  @Expose
  @Parameter(
    names = {"-port"},
    description = "<Integer> : the port number the server will use. Defaults to [4444]. When \"role\" is a set to [node], default is [5555]"
  )
  public Integer port;

  @Expose
  @Parameter(
    names = "-role",
    description = "<String> options are [hub], [node], or [standalone] : Default is [standalone]"
  )
  public String role = "standalone";

  @Expose
  @Parameter(
    names = {"-timeout", "-sessionTimeout"},
    description = "<Integer> in seconds : Specifies the timeout before the server automatically kills a session that hasn't had any activity in the last X seconds. The test slot will then be released for another test to use. This is typically used to take care of client crashes. For grid hub/node roles, cleanUpCycle must also be set. Default is 1800 (30 minutes)"
  )
  public Integer timeout = 1800;

  /**
   * copy another configuration's values into this one if they are set.
   * @param other
   */
  public void merge(StandaloneConfiguration other) {
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

  public JsonElement toJson() {
    GsonBuilder builder = new GsonBuilder();
    addJsonTypeAdapter(builder);
    return builder.excludeFieldsWithoutExposeAnnotation().create().toJsonTree(this);
  }

  protected void addJsonTypeAdapter(GsonBuilder builder) {
    // no default implementation
  }
}
