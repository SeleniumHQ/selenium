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
import static org.openqa.selenium.remote.http.HttpMethod.POST;

import java.util.Map;
import java.util.logging.Logger;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.internal.Reference;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

class PullImage {
  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(PullImage.class.getName());
  private final HttpHandler client;
  private final String apiVersion;

  public PullImage(HttpHandler client, String apiVersion) {
    this.client = Require.nonNull("HTTP client", client);
    this.apiVersion = Require.nonNull("API version", apiVersion);
  }

  public void apply(Reference ref) {
    Require.nonNull("Reference to pull", ref);

    LOG.info("Pulling " + ref);

    String image = String.format("%s/%s", ref.getDomain(), ref.getName());
    HttpRequest req =
        new HttpRequest(POST, String.format("/v%s/images/create", apiVersion))
            .addHeader("Content-Type", JSON_UTF_8)
            .addQueryParameter("fromImage", image)
            .addQueryParameter("platform", ref.getPlatform());

    if (ref.getDigest() != null) {
      req.addQueryParameter("tag", ref.getDigest());
    } else if (ref.getTag() != null) {
      req.addQueryParameter("tag", ref.getTag());
    }

    HttpResponse res = client.execute(req);

    LOG.info("Have response from server");

    if (!res.isSuccessful()) {
      String message = "Unable to pull image: " + ref.getFamiliarName();

      try {
        Map<String, Object> value = JSON.toType(Contents.string(res), MAP_TYPE);
        message = (String) value.get("message");
      } catch (Exception e) {
        // Unable to parse error response, use default message
        LOG.fine(
            "Failed to parse error response from Docker daemon for image "
                + ref.getFamiliarName()
                + ": "
                + e.getMessage());
      }

      throw new DockerException(message);
    }
  }
}
