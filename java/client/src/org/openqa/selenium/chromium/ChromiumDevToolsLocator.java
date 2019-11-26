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

package org.openqa.selenium.chromium;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.devtools.Connection;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.URL;
import java.util.Map;
import java.util.Optional;

class ChromiumDevToolsLocator {

  private static final Json JSON = new Json();

  public static Optional<Connection> getChromeConnector(
      HttpClient.Factory clientFactory,
      Capabilities caps,
      String capabilityKey) {
    Object raw = caps.getCapability(capabilityKey);
    if (!(raw instanceof Map)) {
      return Optional.empty();
    }

    raw = ((Map<?, ?>) raw).get("debuggerAddress");
    if (!(raw instanceof String)) {
      return Optional.empty();
    }

    int index = ((String) raw).lastIndexOf(":");
    if (index == -1 || index == ((String) raw).length() - 1) {
      return Optional.empty();
    }

    try {
      URL url = new URL(String.format("http://%s", raw));

      HttpClient client = clientFactory.createClient(url);

      HttpResponse res = client.execute(new HttpRequest(GET, "/json/version"));
      if (res.getStatus() != HTTP_OK) {
        return Optional.empty();
      }

      Map<String, Object> versionData = JSON.toType(string(res), MAP_TYPE);
      raw = versionData.get("webSocketDebuggerUrl");

      if (!(raw instanceof String)) {
        return Optional.empty();
      }

      String debuggerUrl = (String) raw;

      return Optional.of(new Connection(client, debuggerUrl));
    } catch (IOException | JsonException e) {
      return Optional.empty();
    }
  }
}
