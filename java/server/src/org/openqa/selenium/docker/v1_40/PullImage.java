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

import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.internal.Reference;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.Map;
import java.util.Objects;
import java.util.logging.Logger;

import static org.openqa.selenium.json.Json.JSON_UTF_8;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

class PullImage {
  private static final Json JSON = new Json();
  private static final Logger LOG = Logger.getLogger(PullImage.class.getName());
  private final HttpHandler client;

  public PullImage(HttpHandler client) {
    this.client = Objects.requireNonNull(client);
  }

  public void apply(Reference ref) {
    Objects.requireNonNull(ref, "Reference to pull must be set");

    LOG.info("Pulling " + ref);

    HttpRequest req = new HttpRequest(POST, "/v1.40/images/create")
      .addHeader("Content-Type", JSON_UTF_8)
      .addHeader("Content-Length", "0")
      .addQueryParameter("fromImage", String.format("%s/%s", ref.getRepository(), ref.getName()));

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
        // fall through
      }

      throw new DockerException(message);
    }
  }
}
