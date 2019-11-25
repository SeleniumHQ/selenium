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

package org.openqa.selenium.docker;

import com.google.common.reflect.TypeToken;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonException;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.http.HttpHandler;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.logging.Logger;

import static com.google.common.collect.ImmutableList.toImmutableList;
import static java.net.HttpURLConnection.HTTP_OK;
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.remote.http.Contents.string;
import static org.openqa.selenium.remote.http.Contents.utf8String;
import static org.openqa.selenium.remote.http.HttpMethod.GET;
import static org.openqa.selenium.remote.http.HttpMethod.POST;

public class Docker {

  private static final Logger LOG = Logger.getLogger(Docker.class.getName());
  private static final Json JSON = new Json();

  private final HttpHandler client;

  public Docker(HttpHandler client) {
    Objects.requireNonNull(client, "Docker HTTP client must be set.");

    this.client = req -> {
      HttpResponse resp = client.execute(req);

      if (resp.getStatus() < 200 && resp.getStatus() > 200) {
        String value = string(resp);
        try {
          Object obj = JSON.toType(value, Object.class);
          if (obj instanceof Map) {
            Map<?, ?> map = (Map<?, ?>) obj;
            String message = map.get("message") instanceof String ?
                             (String) map.get("message") :
                             value;
            throw new RuntimeException(message);
          }

          throw new RuntimeException(value);
        } catch (JsonException e) {
          throw new RuntimeException(value);
        }
      }

      return resp;
    };
  }

  public Image pull(String name, String tag) {
    Objects.requireNonNull(name);
    Objects.requireNonNull(tag);

    findImage(new ImageNamePredicate(name, tag));

    LOG.info(String.format("Pulling %s:%s", name, tag));

    HttpRequest request = new HttpRequest(POST, "/images/create")
        .addQueryParameter("fromImage", name)
        .addQueryParameter("tag", tag);

    HttpResponse res = client.execute(request);
    if (res.getStatus() != HTTP_OK) {
      throw new WebDriverException("Unable to pull container: " + name);
    }

    LOG.info(String.format("Pull of %s:%s complete", name, tag));

    return findImage(new ImageNamePredicate(name, tag))
        .orElseThrow(() -> new DockerException(
            String.format("Cannot find image matching: %s:%s", name, tag)));
  }

  public List<Image> listImages() {
    LOG.fine("Listing images");
    HttpResponse response = client.execute(new HttpRequest(GET, "/images/json"));

    List<ImageSummary> images =
        JSON.toType(string(response), new TypeToken<List<ImageSummary>>() {}.getType());

    return images.stream()
        .map(Image::new)
        .collect(toImmutableList());
  }

  public Optional<Image> findImage(Predicate<Image> filter) {
    Objects.requireNonNull(filter);

    LOG.fine("Finding image: " + filter);

    return listImages().stream()
        .filter(filter)
        .findFirst();
  }

  public Container create(ContainerInfo info) {
    StringBuilder json = new StringBuilder();

    try (JsonOutput output = JSON.newOutput(json)) {
      output.setPrettyPrint(false);
      output.write(info);
    }

    LOG.info("Creating container: " + json);

    HttpRequest request = new HttpRequest(POST, "/containers/create");
    request.setContent(utf8String(json));

    HttpResponse response = client.execute(request);

    Map<String, Object> toRead = JSON.toType(string(response), MAP_TYPE);

    return new Container(client, new ContainerId((String) toRead.get("Id")));
  }

}
