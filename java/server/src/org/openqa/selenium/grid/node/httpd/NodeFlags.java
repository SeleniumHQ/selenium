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

package org.openqa.selenium.grid.node.httpd;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.net.URL;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;

@AutoService(HasRoles.class)
public class NodeFlags implements HasRoles {

  @Parameter(
      names = {"--detect-drivers"}, arity = 1,
      description = "Autodetect which drivers are available on the current system, and add them to the node.")
  @ConfigValue(section = "node", name = "detect-drivers", example = "true")
  public Boolean autoconfigure = true;

  @Parameter(
    names = "--max-sessions",
    description = "Maximum number of concurrent sessions.")
  @ConfigValue(section = "node", name = "max-concurrent-sessions", example = "8")
  public int maxSessions = Runtime.getRuntime().availableProcessors();

  @Parameter(
    names = {"-I", "--driver-implementation"},
    description = "Drivers that should be checked. If specified, will skip autoconfiguration. Example: -I \"firefox\" -I \"chrome\"")
  @ConfigValue(section = "node", name = "drivers", example = "[\"firefox\", \"chrome\"]")
  public Set<String> driverNames = new HashSet<>();

  @Parameter(
    names = {"--public-url"},
    description = "Public URL of the Grid as a whole (typically the address of the hub or the router)")
  @ConfigValue(section = "node", name = "grid-url", example = "\"https://grid.example.com\"")

  public URL gridUri;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
