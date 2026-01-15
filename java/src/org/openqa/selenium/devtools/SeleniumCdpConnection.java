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

package org.openqa.selenium.devtools;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Optional;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.HasCapabilities;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;

public class SeleniumCdpConnection extends Connection {

  private static final Logger LOG = Logger.getLogger(SeleniumCdpConnection.class.getName());

  private SeleniumCdpConnection(HttpClient client, String url, ClientConfig clientConfig) {
    super(client, url, clientConfig);
  }

  /**
   * @deprecated use {@link #create(WebDriver, ClientConfig)} instead
   */
  @Deprecated
  public static Optional<Connection> create(WebDriver driver) {
    return create(driver, ClientConfig.defaultConfig());
  }

  public static Optional<Connection> create(WebDriver driver, ClientConfig clientConfig) {
    if (!(driver instanceof HasCapabilities)) {
      throw new IllegalStateException("Given webdriver instance must have capabilities");
    }

    return create(((HasCapabilities) driver).getCapabilities(), clientConfig);
  }

  /**
   * @deprecated use {@link #create(Capabilities, ClientConfig)} instead
   */
  @Deprecated
  public static Optional<Connection> create(Capabilities capabilities) {
    return create(capabilities, ClientConfig.defaultConfig());
  }

  public static Optional<Connection> create(Capabilities capabilities, ClientConfig clientConfig) {
    Require.nonNull("Capabilities", capabilities);
    return create(HttpClient.Factory.createDefault(), capabilities, clientConfig);
  }

  /** Use {@link #create(HttpClient.Factory, Capabilities, ClientConfig)} instead */
  @Deprecated
  public static Optional<Connection> create(
      HttpClient.Factory clientFactory, Capabilities capabilities) {
    return create(clientFactory, capabilities, ClientConfig.defaultConfig());
  }

  public static Optional<Connection> create(
      HttpClient.Factory clientFactory, Capabilities capabilities, ClientConfig clientConfig) {
    Require.nonNull("HTTP client factory", clientFactory);
    Require.nonNull("Capabilities", capabilities);
    Require.nonNull("Client config", clientConfig);

    Optional<URI> cdpUri =
        Optional.ofNullable(capabilities.getCapability("se:cdp"))
            .flatMap(
                (uri) -> {
                  if (uri instanceof String) {
                    try {
                      return Optional.of(new URI((String) uri));
                    } catch (URISyntaxException e) {
                      return Optional.empty();
                    }
                  }
                  return Optional.empty();
                });

    Optional<HttpClient> client;

    if (cdpUri.isPresent()) {
      client =
          Optional.of(CdpEndpointFinder.getHttpClient(clientFactory, cdpUri.get(), clientConfig));
    } else {
      Optional<URI> reportedUri = CdpEndpointFinder.getReportedUri(capabilities);
      client =
          reportedUri.map(uri -> CdpEndpointFinder.getHttpClient(clientFactory, uri, clientConfig));

      try {
        cdpUri = client.flatMap(CdpEndpointFinder::getCdpEndPoint);
      } catch (Exception e) {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception ex) {
          e.addSuppressed(ex);
        }
        throw e;
      }

      if (cdpUri.isEmpty()) {
        try {
          client.ifPresent(HttpClient::close);
        } catch (Exception e) {
          LOG.log(
              Level.FINE,
              "failed to close the http client used to check the reported CDP endpoint: "
                  + reportedUri.get(),
              e);
        }
      }
    }

    return cdpUri.map(uri -> new SeleniumCdpConnection(client.get(), uri.toString(), clientConfig));
  }
}
