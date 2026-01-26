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

package org.openqa.selenium.docker.client;

import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collection;
import java.util.Map;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerConfig;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.DockerProtocol;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class CreateContainer {
  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(CreateContainer.class.getName());
  private final DockerProtocol protocol;
  private final HttpHandler client;
  private final String apiVersion;
  private final ApiVersionAdapter adapter;

  public CreateContainer(
      DockerProtocol protocol, HttpHandler client, String apiVersion, ApiVersionAdapter adapter) {
    this.protocol = Require.nonNull("Protocol", protocol);
    this.client = Require.nonNull("HTTP client", client);
    this.apiVersion = Require.nonNull("API version", apiVersion);
    this.adapter = Require.nonNull("API version adapter", adapter);
  }

  public Container apply(ContainerConfig info) {
    this.protocol.getImage(info.getImage().getName());

    // Convert ContainerConfig to JSON and adapt for API version
    Map<String, Object> requestJson = JSON.toType(JSON.toJson(info), MAP_TYPE);
    Map<String, Object> adaptedRequest = adapter.adaptContainerCreateRequest(requestJson);

    // Build the URL with optional name parameter
    String url = String.format("/v%s/containers/create", apiVersion);
    if (info.getName() != null && !info.getName().trim().isEmpty()) {
      String containerName = info.getName().trim();
      try {
        String encodedName = URLEncoder.encode(containerName, StandardCharsets.UTF_8.toString());
        url += "?name=" + encodedName;
      } catch (UnsupportedEncodingException e) {
        throw new DockerException("Failed to encode container name: " + containerName, e);
      }
    }

    HttpResponse res =
        DockerMessages.throwIfNecessary(
            client.execute(
                new HttpRequest(POST, url)
                    .addHeader("Content-Type", JSON_UTF_8)
                    .setContent(asJson(adaptedRequest))),
            "Unable to create container: ",
            info);

    try {
      Map<String, Object> rawContainer = JSON.toType(Contents.string(res), MAP_TYPE);

      if (!(rawContainer.get("Id") instanceof String)) {
        throw new DockerException("Unable to read container id: " + rawContainer);
      }
      ContainerId id = new ContainerId((String) rawContainer.get("Id"));

      if (rawContainer.get("Warnings") instanceof Collection) {
        Collection<?> warnings = (Collection<?>) rawContainer.get("Warnings");
        if (!warnings.isEmpty()) {
          String allWarnings =
              warnings.stream().map(String::valueOf).collect(Collectors.joining("\n", " * ", ""));

          LOG.warning(
              String.format("Warnings while creating %s from %s: %s", id, info, allWarnings));
        }
      }

      return new Container(protocol, id);
    } catch (JsonException | NullPointerException e) {
      throw new DockerException("Unable to create container from " + info);
    }
  }
}
