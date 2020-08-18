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

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Collections;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.ROUTER_ROLE;

@AutoService(HasRoles.class)
public class RouterFlags implements HasRoles {

  @Parameter(
    names = {"--relax-checks"},
    description = "Relax checks on origin header and content type of incoming requests," +
      " in contravention of strict W3C spec compliance.",
    arity = 1)
  @ConfigValue(section = "network", name = "relax_checks", example = "--relax-checks")
  private boolean relaxChecks;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(ROUTER_ROLE);
  }
}
