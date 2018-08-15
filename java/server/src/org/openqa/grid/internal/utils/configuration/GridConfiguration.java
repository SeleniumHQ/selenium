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

import static java.util.Optional.ofNullable;

import org.openqa.grid.internal.cli.CommonGridCliOptions;
import org.openqa.grid.internal.utils.configuration.json.GridJsonConfiguration;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.Servlet;

public class GridConfiguration extends StandaloneConfiguration {
  /*
   * config parameters which serialize and deserialize to/from json
   */

  /**
   * Clean up cycle for remote proxies. Default determined by configuration type.
   */
  // initially defaults to null from type
  public Integer cleanUpCycle;

  /**
   * Custom key/value pairs for the hub registry. Default empty.
   */
  public Map<String, String> custom = new HashMap<>();

  /**
   * Max "browser" sessions a node can handle. Default determined by configuration type.
   */
  // initially defaults to null from type
  public Integer maxSession;

  /**
   * Extra servlets to initialize/use on the hub or node. Default empty.
   */
  public List<String> servlets = new ArrayList<>();

  /**
   * Default servlets to exclude on the hub or node. Default empty.
   */
  public List<String> withoutServlets = new ArrayList<>();

  /**
   * Creates a new configuration with default values
   */
  GridConfiguration() {
    // defeats instantiation outside of this package
  }

  public GridConfiguration(GridJsonConfiguration jsonConfig) {
    super(jsonConfig);
    ofNullable(jsonConfig.getCustom()).ifPresent(v -> custom = new HashMap<>(v));
    ofNullable(jsonConfig.getServlets()).ifPresent(v -> servlets = new ArrayList<>(v));
    ofNullable(jsonConfig.getWithoutServlets()).ifPresent(v -> withoutServlets = new ArrayList<>(v));
  }

  void merge(CommonGridCliOptions cliConfig) {
    super.merge(cliConfig);
    ofNullable(cliConfig.getCleanUpCycle()).ifPresent(v -> cleanUpCycle = v);
    ofNullable(cliConfig.getServlets()).ifPresent(v -> servlets = v);
    ofNullable(cliConfig.getWithoutServlets()).ifPresent(v -> withoutServlets = v);
    ofNullable(cliConfig.getCustom()).ifPresent(v -> custom = v);
  }

  /**
   * replaces this instance of configuration value with the 'other' value if it's set.
   * @param other
   */
  public void merge(GridConfiguration other) {
    if (other == null) {
      return;
    }
    super.merge(other);

    if (isMergeAble(Integer.class, other.cleanUpCycle, cleanUpCycle)) {
      cleanUpCycle = other.cleanUpCycle;
    }
    if (isMergeAble(Map.class, other.custom, custom)) {
      if (custom == null) {
        custom = new HashMap<>();
      }
      custom.putAll(other.custom);
    }
    if (isMergeAble(Integer.class, other.maxSession, maxSession) &&
        other.maxSession > 0) {
      maxSession = other.maxSession;
    }
    if (isMergeAble(List.class, other.servlets, servlets)) {
      servlets = other.servlets;
    }
    if (isMergeAble(List.class, other.withoutServlets, withoutServlets)) {
      withoutServlets = other.withoutServlets;
    }
  }

  /**
   * @param servlet the {@link Servlet} to look for
   * @return whether this configuration requests a 'default' servlet to be omitted
   */
  public boolean isWithOutServlet(Class <? extends Servlet> servlet) {
    return withoutServlets != null &&
           servlet != null &&
           withoutServlets.contains(servlet.getCanonicalName());
  }

  protected void serializeFields(Map<String, Object> appendTo) {
    super.serializeFields(appendTo);

    appendTo.put("cleanUpCycle", cleanUpCycle);
    appendTo.put("custom", custom);
    appendTo.put("maxSession", maxSession);
    appendTo.put("servlets", servlets);
    appendTo.put("withoutServlets", withoutServlets);
  }

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "cleanUpCycle", cleanUpCycle));
    sb.append(toString(format, "custom", custom));
    sb.append(toString(format, "maxSession", maxSession));
    sb.append(toString(format, "servlets", servlets));
    sb.append(toString(format, "withoutServlets", withoutServlets));
    return sb.toString();
  }
}
