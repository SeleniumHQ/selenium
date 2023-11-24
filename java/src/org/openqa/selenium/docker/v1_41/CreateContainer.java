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

package org.openqa.selenium.docker.v1_41;

import static org.openqa.selenium.docker.v1_41.V141Docker.DOCKER_API_VERSION;
import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.asJson;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

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

  public CreateContainer(DockerProtocol protocol, HttpHandler client) {
    this.protocol = Require.nonNull("Protocol", protocol);
    this.client = Require.nonNull("HTTP client", client);
  }

  public Container apply(ContainerConfig info) {
    HttpResponse res =
        DockerMessages.throwIfNecessary(
            client.execute(
                new HttpRequest(POST, String.format("/v%s/containers/create", DOCKER_API_VERSION))
                    .addHeader("Content-Type", JSON_UTF_8)
                    .setContent(asJson(info))),
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
        if (warnings.size() > 0) {
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
