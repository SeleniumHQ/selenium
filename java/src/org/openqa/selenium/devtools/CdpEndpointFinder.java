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

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Map;
import java.util.Optional;
import java.util.logging.Logger;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

public class CdpEndpointFinder {

  private static final Logger LOG = Logger.getLogger(CdpEndpointFinder.class.getName());
  private static final Json JSON = new Json();

  public static HttpClient getHttpClient(HttpClient.Factory clientFactory, URI reportedUri) {
    Require.nonNull("HTTP client factory", clientFactory);
    Require.nonNull("DevTools URI", reportedUri);

    ClientConfig config = ClientConfig.defaultConfig().baseUri(reportedUri);

    return clientFactory.createClient(config);
  }

  public static Optional<URI> getCdpEndPoint(HttpClient client) {
    Require.nonNull("HTTP client", client);

    HttpResponse res;
    try {
      res = client.execute(new HttpRequest(GET, "/json/version"));
    } catch (UncheckedIOException e) {
      LOG.warning("Unable to connect to determine websocket url: " + e.getMessage());
      return Optional.empty();
    }
    if (res.getStatus() != HTTP_OK) {
      return Optional.empty();
    }

    Map<String, Object> versionData = JSON.toType(string(res), MAP_TYPE);
    Object raw = versionData.get("webSocketDebuggerUrl");

    if (!(raw instanceof String)) {
      return Optional.empty();
    }

    String debuggerUrl = (String) raw;
    try {
      return Optional.of(new URI(debuggerUrl));
    } catch (URISyntaxException e) {
      LOG.warning("Invalid URI for endpoint " + raw);
      return Optional.empty();
    }
  }

  public static Optional<URI> getReportedUri(Capabilities caps) {
    String key;
    switch (caps.getBrowserName()) {
      case "chrome":
        key = "goog:chromeOptions";
        break;
      case "msedge":
        key = "ms:edgeOptions";
        break;
      case "firefox":
        key = "moz:debuggerAddress";
        break;
      default:
        return Optional.empty();
    }
    return getReportedUri(key, caps);
  }

  public static Optional<URI> getReportedUri(String capabilityKey, Capabilities caps) {
    Object raw = caps.getCapability(capabilityKey);

    if ((raw instanceof Map)) {
      raw = ((Map<?, ?>) raw).get("debuggerAddress");
    }

    if (!(raw instanceof String)) {
      LOG.fine("No debugger address");
      return Optional.empty();
    }

    int index = ((String) raw).lastIndexOf(':');
    if (index == -1 || index == ((String) raw).length() - 1) {
      LOG.fine("No index in " + raw);
      return Optional.empty();
    }

    try {
      URI uri = new URI(String.format("http://%s", raw));
      LOG.fine("URI found: " + uri);
      return Optional.of(uri);
    } catch (URISyntaxException e) {
      LOG.warning("Unable to create URI from: " + raw);
      return Optional.empty();
    }
  }
}
