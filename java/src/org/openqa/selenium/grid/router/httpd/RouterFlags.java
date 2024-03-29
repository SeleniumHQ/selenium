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

package org.openqa.selenium.grid.router.httpd;

import static org.openqa.selenium.grid.config.StandardGridRoles.ROUTER_ROLE;
import static org.openqa.selenium.grid.router.httpd.RouterOptions.NETWORK_SECTION;
import static org.openqa.selenium.grid.router.httpd.RouterOptions.ROUTER_SECTION;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import java.util.Collections;
import java.util.Set;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

@AutoService(HasRoles.class)
public class RouterFlags implements HasRoles {

  @SuppressWarnings("FieldMayBeFinal")
  @Parameter(
      names = {"--relax-checks"},
      description =
          "Relax checks on origin header and content type of incoming requests,"
              + " in contravention of strict W3C spec compliance.",
      arity = 1)
  @ConfigValue(section = NETWORK_SECTION, name = "relax-checks", example = "true")
  private Boolean relaxChecks = false;

  @Parameter(
      names = "--username",
      description =
          "User name clients must use to connect to the server. "
              + "Both this and password need to be set in order to be used.")
  @ConfigValue(section = ROUTER_SECTION, name = "username", example = "admin")
  private String username;

  @Parameter(
      names = "--password",
      description =
          "Password clients must use to connect to the server. "
              + "Both this and the username need to be set in order to be used.")
  @ConfigValue(section = ROUTER_SECTION, name = "password", example = "hunter2")
  private String password;

  @Parameter(
      names = {"--sub-path"},
      arity = 1,
      description =
          "A sub-path that should be considered for all user facing routes on the"
              + " Hub/Router/Standalone")
  @ConfigValue(section = NETWORK_SECTION, name = "sub-path", example = "my_company/selenium_grid")
  public String subPath;

  @Parameter(
      names = {"--disable-ui"},
      arity = 1,
      description = "Disable the Grid UI")
  @ConfigValue(section = ROUTER_SECTION, name = "disable-ui", example = "true")
  public boolean disableUi = false;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(ROUTER_ROLE);
  }
}
