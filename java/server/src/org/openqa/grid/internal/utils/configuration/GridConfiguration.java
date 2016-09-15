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

import com.google.gson.annotations.Expose;

import com.beust.jcommander.Parameter;

import org.openqa.grid.internal.utils.configuration.converters.CustomConverter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.Servlet;

public class GridConfiguration extends StandaloneConfiguration {

  /*
   * config parameters which serialize and deserialize to/from json
   */

  @Expose
  @Parameter(
    names = "-cleanUpCycle",
    description = "<Integer> in ms : specifies how often the hub will poll running proxies for timed-out (i.e. hung) threads. Must also specify \"timeout\" option"
  )
  public Integer cleanUpCycle;

  @Expose
  @Parameter(
    names = "-custom",
    description = "<String> : NOT RECOMMENDED--may be deprecated to encourage proper servlet customization. Comma separated key=value pairs for custom grid extensions. example: -custom myParamA=Value1,myParamB=Value2",
    converter = CustomConverter.class
  )
  public Map<String, String> custom = new HashMap<>();

  @Expose
  @Parameter(
    names = "-host",
    description =  "<String> IP or hostname : usually determined automatically. Most commonly useful in exotic network configurations (e.g. network with VPN)"
  )
  public String host;

  @Expose
  @Parameter(
    names = "-maxSession",
    description = "<Integer> max number of tests that can run at the same time on the node, irrespective of the browser used"
  )
  public Integer maxSession = 1;

  @Expose
  @Parameter(
    names = {"-servlet", "-servlets"},
    description = "<String> : list of extra servlets the grid (hub or node) will make available. Specify multiple on the command line: -servlet tld.company.ServletA -servlet tld.company.ServletB. The servlet must exist in the path: /grid/admin/ServletA /grid/admin/ServletB"
  )
  public List<String> servlets;

  @Expose
  @Parameter(
    names = {"-withoutServlet", "-withoutServlets"},
    description = "<String> : list of default (hub or node) servlets to disable. Advanced use cases only. Not all default servlets can be disabled. Specify multiple on the command line: -withoutServlet tld.company.ServletA -withoutServlet tld.company.ServletB"
  )
  public List<String> withoutServlets;

  /**
   * replaces this instance of configuration value with the 'other' value if it's set.
   * @param other
   */
  public void merge(GridConfiguration other) {
    super.merge(other);
    // don't merge 'host'
    if (isMergeAble(other.cleanUpCycle, cleanUpCycle)) {
      cleanUpCycle = other.cleanUpCycle;
    }
    if (isMergeAble(other.custom, custom)) {
      custom.putAll(other.custom);
    }
    if (isMergeAble(other.maxSession, maxSession) &&
        other.maxSession.intValue() > 0) {
      maxSession = other.maxSession;
    }
    if (isMergeAble(other.servlets, servlets)) {
      servlets = other.servlets;
    }
    if (isMergeAble(other.withoutServlets, withoutServlets)) {
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

  @Override
  public String toString(String format) {
    StringBuilder sb = new StringBuilder();
    sb.append(super.toString(format));
    sb.append(toString(format, "cleanUpCycle", cleanUpCycle));
    sb.append(toString(format, "custom", custom));
    sb.append(toString(format, "host", host));
    sb.append(toString(format, "maxSession", maxSession));
    sb.append(toString(format, "servlets", servlets));
    sb.append(toString(format, "withoutServlets", withoutServlets));
    return sb.toString();
  }
}
