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

package org.openqa.selenium.grid.docker;

import com.beust.jcommander.Parameter;
import com.google.auto.service.AutoService;
import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.net.URL;
import java.util.Collections;
import java.util.List;
import java.util.Set;

import static org.openqa.selenium.grid.config.StandardGridRoles.NODE_ROLE;

@AutoService(HasRoles.class)
public class DockerFlags implements HasRoles {

  @Parameter(
      names = {"--docker-url"},
      description = "URL for connecting to the docker daemon"
  )
  @ConfigValue(section = "docker", name = "url", example = "\"unix:/var/run/docker\"")
  private URL dockerUrl;

  @Parameter(
      names = {"--docker", "-D"},
      description = "Docker configs which map image name to stereotype capabilities (example " +
                    "`-D selenium/standalone-firefox:latest '{\"browserName\": \"firefox\"}')",
      arity = 2,
      variableArity = true)
  @ConfigValue(
    section = "docker",
    name = "configs",
    example = "[\"selenium/standalone-firefox:latest\", \"{\\\"browserName\\\": \\\"firefox\\\"}\"]")
  private List<String> images2Capabilities;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(NODE_ROLE);
  }
}
