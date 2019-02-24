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

package org.openqa.selenium.grid.docker;

import static java.util.logging.Level.WARNING;
import static org.openqa.selenium.remote.http.HttpMethod.GET;

import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.ImageNamePredicate;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.logging.Logger;
import java.util.stream.Collectors;

public class DockerOptions {

  public static final Logger LOG = Logger.getLogger(DockerOptions.class.getName());
  private final Config config;

  public DockerOptions(Config config) {
    this.config = Objects.requireNonNull(config);
  }

  private URL getDockerUrl() {
    try {
      String raw = config.get("docker", "url")
          .orElseThrow(() -> new ConfigException("No docker url configured"));
      return new URL(raw);
    } catch (MalformedURLException e) {
      throw new UncheckedIOException(e);
    }
  }

  public boolean isEnabled(HttpClient.Factory clientFactory) {
    if (!config.getBool("docker", "enabled").orElse(false)) {
      return false;
    }

    // Is the daemon up and running?
    URL url = getDockerUrl();
    HttpClient client = clientFactory.createClient(url);

    try {
      HttpResponse response = client.execute(new HttpRequest(GET, "/_ping"));
      if (response.getStatus() != 200) {
        LOG.warning(String.format("Docker config enabled, but daemon unreachable: %s", url));
        return false;
      }

      return true;
    } catch (IOException e) {
      LOG.log(WARNING, "Unable to ping docker daemon: " + e.getMessage(), e);
      return false;
    }
  }

  public void configure(HttpClient.Factory clientFactory, LocalNode.Builder node)
      throws IOException {
    HttpClient client = clientFactory.createClient(new URL("http://localhost:2375"));
    Docker docker = new Docker(client);

    loadImages(
        docker,
        "selenium/standalone-firefox:3.141.59",
        "selenium/standalone-chrome:3.141.59");

    Image firefox = docker.findImage(new ImageNamePredicate("selenium/standalone-firefox:3.141.59"));
    for (int i = 0; i < Runtime.getRuntime().availableProcessors(); i++) {
      node.add(new ImmutableCapabilities("browserName", "firefox"),
               new DockerSessionFactory(clientFactory, docker, firefox));
    }

    Image chrome = docker.findImage(new ImageNamePredicate("selenium/standalone-chrome:3.141.59"));
    for (int i = 0; i < Runtime.getRuntime().availableProcessors(); i++) {
      node.add(new ImmutableCapabilities("browserName", "chrome"),
               new DockerSessionFactory(clientFactory, docker, chrome));
    }
  }

  private void loadImages(Docker docker, String... imageNames) {
    List<CompletableFuture<Image>> allFutures = Arrays.stream(imageNames)
        .map(entry -> {
          int index = entry.lastIndexOf(':');
          if (index == -1) {
            throw new RuntimeException("Unable to determine tag from " + entry);
          }
          String name = entry.substring(0, index);
          String version = entry.substring(index + 1);

          return CompletableFuture.supplyAsync(() -> docker.pull(name, version));
        })
        .collect(Collectors.toList());

    CompletableFuture<Void>
        cd =
        CompletableFuture.allOf(allFutures.toArray(new CompletableFuture[0]));
    cd.whenComplete((ignored, throwable) -> {

    });
  }
}
