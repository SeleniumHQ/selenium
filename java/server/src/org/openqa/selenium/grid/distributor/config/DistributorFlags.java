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

package org.openqa.selenium.grid.distributor.config;


import static org.openqa.selenium.grid.config.StandardGridRoles.DISTRIBUTOR_ROLE;
import static org.openqa.selenium.grid.distributor.config.DistributorOptions.DEFAULT_DISTRIBUTOR_IMPLEMENTATION;
import static org.openqa.selenium.grid.distributor.config.DistributorOptions.DEFAULT_HEALTHCHECK_INTERVAL;
import static org.openqa.selenium.grid.distributor.config.DistributorOptions.DISTRIBUTOR_SECTION;

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.net.URI;
import java.util.Collections;
import java.util.Set;

@SuppressWarnings("FieldMayBeFinal")
@AutoService(HasRoles.class)
public class DistributorFlags implements HasRoles {

  @Parameter(names = {"-d", "--distributor"}, description = "Url of the distributor.")
  @ConfigValue(section = DISTRIBUTOR_SECTION, name = "host", example = "\"http://localhost:5553\"")
  private URI distributorServer;

  @Parameter(
    names = "--distributor-port",
    description = "Port on which the distributor is listening.")
  @ConfigValue(section = DISTRIBUTOR_SECTION, name = "port", example = "5553")
  private Integer distributorServerPort;

  @Parameter(
    names = "--distributor-host",
    description = "Host on which the distributor is listening.")
  @ConfigValue(section = DISTRIBUTOR_SECTION, name = "hostname", example = "\"localhost\"")
  private String distributorServerHost;

  @Parameter(
    names = {"--distributor-implementation"},
    description = "Full classname of non-default distributor implementation")
  @ConfigValue(
    section = DISTRIBUTOR_SECTION,
    name = "implementation",
    example = DEFAULT_DISTRIBUTOR_IMPLEMENTATION)
  private String implementation = DEFAULT_DISTRIBUTOR_IMPLEMENTATION;

  @Parameter(
    names = {"--healthcheck-interval"},
    description = "How often, in seconds, will the health check run for all Nodes." +
      "This ensures the server can ping all the Nodes successfully.")
  @ConfigValue(section = DISTRIBUTOR_SECTION, name = "healthcheck-interval", example = "60")
  public int healthcheckInterval =  DEFAULT_HEALTHCHECK_INTERVAL;


  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(DISTRIBUTOR_ROLE);
  }
}
