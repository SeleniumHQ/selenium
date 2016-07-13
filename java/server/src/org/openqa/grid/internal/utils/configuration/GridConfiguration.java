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

import com.beust.jcommander.IStringConverter;
import com.beust.jcommander.Parameter;

import org.openqa.grid.internal.utils.configuration.converters.CustomConverter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class GridConfiguration extends StandaloneConfiguration {

  @Parameter(
    names = "-cleanUpCycle",
    description = "<Integer> in ms : specifies how often the hub will poll running proxies for timed-out (i.e. hung) threads. Must also specify \"timeout\" option"
  )
  public Integer cleanUpCycle;

  @Parameter(
    names = "-custom",
    description = "<String> : NOT RECOMMENDED--may be deprecated to encourage proper servlet customization. Comma separated key=value pairs for custom grid extensions. example: -custom myParamA=Value1,myParamB=Value2",
    converter = CustomConverter.class
  )
  public Map<String, String> custom = new HashMap<>();

  @Parameter(
    names = "-host",
    description =  "<String> IP or hostname : usually determined automatically. Most commonly useful in exotic network configurations (e.g. network with VPN)"
  )
  public String host;

  @Parameter(
    names = "-maxSession",
    description = "<Integer> max number of tests that can run at the same time on the node, irrespective of the browser used"
  )
  public Integer maxSession = 1;

  @Parameter(
    names = {"-servlet", "-servlets"},
    description = "<String> : list of extra servlets this hub will display. Allows to present custom view of the hub for monitoring and management purposes. Specify multiple on the command line: -servlet tld.company.ServletA -servlet tld.company.ServletB. The servlet must exist in the path: /grid/admin/ServletA /grid/admin/ServletB"
  )
  public List<String> servlets;
  /**
   * replaces this instance of configuration value with the 'other' value if it's set.
   * @param other
   */
  public void merge(GridConfiguration other) {
    super.merge(other);
    // don't merge 'host'
    if (other.cleanUpCycle != null) {
      cleanUpCycle = other.cleanUpCycle;
    }
    custom.putAll(other.custom);
    if (other.maxSession != 1) {
      maxSession = other.maxSession;
    }
    if (other.servlets != null) {
      servlets = other.servlets;
    }
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
    return sb.toString();
  }
}
