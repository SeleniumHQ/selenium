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

package org.openqa.selenium.grid.node.k8s;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.util.Collections;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;

@AutoService(HasRoles.class)
public class OneShotFlags implements HasRoles {

  @Parameter(
    names = {"--driver-name"},
    description = "Name of the browser to use (optional)")
  @ConfigValue(section = "k8s", name = "driver_name", example = "firefox")
  private String driverBinary;

  @Parameter(
    names = {"--stereotype"},
    description = "Stringified JSON representing browser stereotype (what to match against)")
  @ConfigValue(
    section = "k8s",
    name = "stereotype",
    example = "\"{\\\"browserName\\\": \\\"firefox\\\"}\"")
  private String stereotype;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
