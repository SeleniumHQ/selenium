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

package org.openqa.grid.internal.cli;

import com.beust.jcommander.Parameter;

import java.util.List;
import java.util.Map;

public abstract class CommonGridCliOptions extends CommonCliOptions {

  /*
   * config parameters which serialize and deserialize to/from json
   */

  /**
   * Clean up cycle for remote proxies. Default determined by configuration type.
   */
  @Parameter(
      names = "-cleanUpCycle",
      description = "<Integer> in ms : specifies how often the hub will poll running proxies for timed-out (i.e. hung) threads. Must also specify \"timeout\" option"
  )
  // initially defaults to null from type
  private Integer cleanUpCycle;

  /**
   * Custom key/value pairs for the hub registry. Default empty.
   */
  @Parameter(
      names = "-custom",
      description = "<String> : comma separated key=value pairs for custom grid extensions. NOT RECOMMENDED -- may be deprecated in a future revision. Example: -custom myParamA=Value1,myParamB=Value2",
      converter = CustomConverter.class
  )
  private Map<String, String> custom;

  /**
   * Max "browser" sessions a node can handle. Default determined by configuration type.
   */
  @Parameter(
      names = "-maxSession",
      description = "<Integer> max number of tests that can run at the same time on the node, irrespective of the browser used"
  )
  // initially defaults to null from type
  private Integer maxSession;

  /**
   * Extra servlets to initialize/use on the hub or node. Default empty.
   */
  @Parameter(
      names = {"-servlet", "-servlets"},
      description = "<String> : list of extra servlets the grid (hub or node) will make available. Specify multiple on the command line: -servlet tld.company.ServletA -servlet tld.company.ServletB. The servlet must exist in the path: /grid/admin/ServletA /grid/admin/ServletB"
  )
  private List<String> servlets;

  /**
   * Default servlets to exclude on the hub or node. Default empty.
   */
  @Parameter(
      names = {"-withoutServlet", "-withoutServlets"},
      description = "<String> : list of default (hub or node) servlets to disable. Advanced use cases only. Not all default servlets can be disabled. Specify multiple on the command line: -withoutServlet tld.company.ServletA -withoutServlet tld.company.ServletB"
  )
  private List<String> withoutServlets;

  public Integer getCleanUpCycle() {
    return cleanUpCycle;
  }

  public Map<String, String> getCustom() {
    return custom;
  }

  public Integer getMaxSession() {
    return maxSession;
  }

  public List<String> getServlets() {
    return servlets;
  }

  public List<String> getWithoutServlets() {
    return withoutServlets;
  }

}
