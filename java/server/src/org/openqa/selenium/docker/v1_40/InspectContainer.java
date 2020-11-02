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

package org.openqa.selenium.docker.v1_40;

import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.docker.ContainerInfo;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Map;
import java.util.logging.Logger;

import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

class InspectContainer {
  private static final Logger LOG = Logger.getLogger(InspectContainer.class.getName());
  private static final Json JSON = new Json();
  private final HttpHandler client;

  public InspectContainer(HttpHandler client) {
    this.client = Require.nonNull("HTTP client", client);
  }

  public ContainerInfo apply(ContainerId id) {
    Require.nonNull("Container id", id);

    HttpResponse res = client.execute(
      new HttpRequest(GET, String.format("/v1.40/containers/%s/json", id))
        .addHeader("Content-Length", "0")
        .addHeader("Content-Type", "text/plain"));
    if (res.getStatus() != HTTP_OK) {
      LOG.warning("Unable to inspect container " + id);
    }
    Map<String, Object> rawInspectInfo = JSON.toType(Contents.string(res), MAP_TYPE);
    Map<String, Object> networkSettings = (Map<String, Object>) rawInspectInfo.get("NetworkSettings");
    String ip = (String) networkSettings.get("IPAddress");
    return new ContainerInfo(id, ip);
  }
}
