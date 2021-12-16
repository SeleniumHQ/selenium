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

package org.openqa.selenium.grid.server;

import static org.openqa.selenium.grid.config.StandardGridRoles.HTTPD_ROLE;

import com.google.auto.service.AutoService;

import com.beust.jcommander.Parameter;

import org.openqa.selenium.grid.config.ConfigValue;
import org.openqa.selenium.grid.config.HasRoles;
import org.openqa.selenium.grid.config.Role;

import java.nio.file.Path;
import java.util.Collections;
import java.util.Set;

@AutoService(HasRoles.class)
public class BaseServerFlags implements HasRoles {

  private static final String SERVER_SECTION = "server";

  @Parameter(
    names = {"--host"},
    description = "Server IP or hostname: usually determined automatically.")
  @ConfigValue(section = SERVER_SECTION, name = "host", example = "\"localhost\"")
  private String host;

  @Parameter(
    names = "--bind-host",
    description = "Whether the server should bind to the host address/name, or only use it to" +
                  " report its reachable url. Helpful in complex network topologies where the" +
                  " server cannot report itself with the current IP/hostname but rather an" +
                  " external IP or hostname (e.g. inside a Docker container).",
    arity = 1)
  @ConfigValue(section = SERVER_SECTION, name = "bind-host", example = "true")
  private Boolean bindHost = true;

  @Parameter(
    description = "Port to listen on. There is no default as this parameter is used by "
                  + "different components, for example Router/Hub/Standalone will use 4444 and "
                  + "Node will use 5555.",
    names = {"-p", "--port"})
  @ConfigValue(section = SERVER_SECTION, name = "port", example = "4444")
  private Integer port;

  @Parameter(
    description = "Maximum number of listener threads. "
                  + "Default value is: (available processors) * 3.",
    names = "--max-threads")
  @ConfigValue(section = SERVER_SECTION, name = "max-threads", example = "12")
  private int maxThreads = Runtime.getRuntime().availableProcessors() * 3;

  @Parameter(
    names = "--allow-cors",
    description = "Whether the Selenium server should allow web browser connections from any host",
    arity = 1)
  @ConfigValue(section = SERVER_SECTION, name = "allow-cors", example = "true")
  private Boolean allowCORS = false;

  @Parameter(
    description = "Private key for https. Get more detailed information by running"
                  + " \"java -jar selenium-server.jar info security\"",
    names = "--https-private-key")
  @ConfigValue(
    section = SERVER_SECTION,
    name = "https-private-key",
    example = "\"/path/to/key.pkcs8\"")
  private Path httpsPrivateKey;

  @Parameter(
    description = "Server certificate for https. Get more detailed information by running"
                  + " \"java -jar selenium-server.jar info security\"",
    names = "--https-certificate")
  @ConfigValue(
    section = SERVER_SECTION,
    name = "https-certificate",
    example = "\"/path/to/cert.pem\"")
  private Path httpsCertificate;

  @Parameter(description = "Node registration secret", names = "--registration-secret")
  @ConfigValue(section = SERVER_SECTION, name = "registration-secret", example = "\"Hunter2\"")
  private String registrationSecret;

  @Parameter(
    description = "Use a self-signed certificate for HTTPS communication",
    names = "--self-signed-https",
    hidden = true)
  @ConfigValue(section = SERVER_SECTION, name = "https-self-signed", example = "false")
  private Boolean isSelfSigned = false;

  @Override
  public Set<Role> getRoles() {
    return Collections.singleton(HTTPD_ROLE);
  }
}
