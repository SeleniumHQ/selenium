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

import com.beust.jcommander.Parameter;

import java.util.Arrays;
import java.util.List;

public class StandaloneConfiguration {

  @Parameter(
    names = "-browserTimeout",
    description = "Number of seconds a browser is allowed to hang (0 means indefinite) while a command is running (example: driver.get(url)). If set, must be greater than or equal to 60. When the timeout is reached while a command is processing, the session will quit.")
  public Integer browserTimeout;

  @Parameter(
    names = "-debug",
    description = "<Boolean> to enable LogLevel.FINE"
  )
  public boolean debug;

  @Parameter(
    names = {"--help", "-help", "-h"},
    help = true,
    hidden = true,
    description = "This help.")
  public boolean help;

  @Parameter(
    names = "-jettyThreads",
    hidden = true)
  public Integer jettyThreads;

  @Parameter(
    names = "-log",
    description = "The filename to use for logging. Default value is null and indicates logging to STDOUT."
  )
  public String log;

  @Parameter(
    names = "-logLongForm",
    description = "if no log is specified, logLongForm can be set to enable longForm output to STDOUT. Default is false"
  )
  public boolean logLongForm;

  @Parameter(
    names = {"-port"},
    description = "The port number the selenium server should use. Default's to 4444. When role is a grid node default is 5555.")
  public Integer port;

  @Parameter(
    names = "-role",
    description = "server role to run as. Options are hub, node, standalone. Default is standalone"
  )
  public String role;

  @Parameter(
    names = {"-timeout", "-sessionTimeout"},
    description = "<Integer> the timeout in seconds before the hub automatically ends a test that hasn't had any activity in the last X seconds. The browser will be released for another test to use. This typically takes care of the client crashes. For grid hub/node roles, CleanUpCycle must also be set. Default is 1800 (30 minutes)")
  public Integer timeout = 1800;

  /**
   * copy another configuration's values into this one if they are set.
   * @param other
   */
  public void merge(StandaloneConfiguration other) {
    if (other.browserTimeout != null) browserTimeout = other.browserTimeout;
    if (other.jettyThreads != null) jettyThreads = other.jettyThreads;
    if (other.timeout != 1800) timeout = other.timeout;
    // role, port, log, debug and help are not merged, they are only consumed by the immediately running node and can't affect a remote
  }

  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(toString(format, "browserTimeout", browserTimeout));
    sb.append(toString(format, "debug", debug));
    sb.append(toString(format, "help", help));
    sb.append(toString(format, "jettyThreads", jettyThreads));
    sb.append(toString(format, "log", log));
    sb.append(toString(format, "logLongForm", logLongForm));
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
      if (value != null) {
        sb.append(String.format(format, name, value));
      }
    }
    return sb;
  }

  public JsonElement toJson() {
    GsonBuilder builder = new GsonBuilder();
    addJsonTypeAdapter(builder);
    return builder.create().toJsonTree(this);
  }

  protected void addJsonTypeAdapter(GsonBuilder builder) {
  }
}
