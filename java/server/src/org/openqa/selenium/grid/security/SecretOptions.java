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

package org.openqa.selenium.grid.security;

import static java.util.Base64.getEncoder;

import org.openqa.selenium.Credentials;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Optional;

public class SecretOptions {

  private static final String ROUTER_SECTION = "router";
  private static final String SERVER_SECTION = "server";

  private final Config config;

  public SecretOptions(Config config) {
    this.config = config;
  }

  public Secret getRegistrationSecret() {
    String secret = "";
    if ((isSecure() || isSelfSigned())
        && !config.get(SERVER_SECTION, "registration-secret").isPresent()) {
      try {
        secret = getEncoder()
          .encodeToString(
            Arrays.copyOfRange(Files.readAllBytes(getCertificate().toPath()), 0, 32));
        return new Secret(secret);
      } catch (IOException e) {
        throw new ConfigException("Cannot read the certificate file: " + e.getMessage());
      }
    }
    return config.get(SERVER_SECTION, "registration-secret")
      .map(Secret::new).orElse(new Secret(secret));
  }

  public UsernameAndPassword getServerAuthentication() {
    Optional<String> username = config.get(ROUTER_SECTION, "username");
    Optional<String> password = config.get(ROUTER_SECTION, "password");

    if (!username.isPresent() || !password.isPresent()) {
      return null;
    }

    return new UsernameAndPassword(username.get(), password.get());
  }

  private boolean isSecure() {
    return config.get(SERVER_SECTION, "https-private-key").isPresent()
           && config.get(SERVER_SECTION, "https-certificate").isPresent();
  }

  private boolean isSelfSigned() {
    return config.getBool(SERVER_SECTION, "https-self-signed").orElse(false);
  }

  private File getCertificate() {
    String certificatePath = config.get(SERVER_SECTION, "https-certificate")
      .orElse(null);
    if (certificatePath != null) {
      return new File(certificatePath);
    }
    throw new ConfigException(
      "You must provide a certificate via --https-certificate when using --https");
  }

}
