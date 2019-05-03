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

import com.google.common.collect.HashMultimap;
import com.google.common.collect.Multimap;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.docker.Docker;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.ImageNamePredicate;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.node.local.LocalNode;
import org.openqa.selenium.json.Json;
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
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;

public class DockerOptions {

  private static final Logger LOG = Logger.getLogger(DockerOptions.class.getName());
  private static final Json JSON = new Json();
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

  private boolean isEnabled(HttpClient.Factory clientFactory) {
    if (!config.getAll("docker", "configs").isPresent()) {
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
      LOG.log(WARNING, "Unable to ping docker daemon. Docker disabled: " + e.getMessage());
      return false;
    }
  }

  public void configure(HttpClient.Factory clientFactory, LocalNode.Builder node)
      throws IOException {
    if (!isEnabled(clientFactory)) {
      return;
    }

    List<String> allConfigs = config.getAll("docker", "configs")
        .orElseThrow(() -> new DockerException("Unable to find docker configs"));

    Multimap<String, Capabilities> kinds = HashMultimap.create();
    for (int i = 0; i < allConfigs.size(); i++) {
      String imageName = allConfigs.get(i);
      i++;
      if (i == allConfigs.size()) {
        throw new DockerException("Unable to find JSON config");
      }
      Capabilities stereotype = JSON.toType(allConfigs.get(i), Capabilities.class);

      kinds.put(imageName, stereotype);
    }

    HttpClient client = clientFactory.createClient(new URL("http://localhost:2375"));
    Docker docker = new Docker(client);

    loadImages(docker, kinds.keySet().toArray(new String[0]));

    int maxContainerCount = Runtime.getRuntime().availableProcessors();
    kinds.forEach((name, caps) -> {
      Image image = docker.findImage(new ImageNamePredicate(name))
          .orElseThrow(() -> new DockerException(
              String.format("Cannot find image matching: %s", name)));
      for (int i = 0; i < maxContainerCount; i++) {
        node.add(caps, new DockerSessionFactory(clientFactory, docker, image, caps));
      }
      LOG.finest(String.format(
          "Mapping %s to docker image %s %d times",
          caps,
          name,
          maxContainerCount));
    });
  }

  private void loadImages(Docker docker, String... imageNames) {
    CompletableFuture<Void> cd = CompletableFuture.allOf(
        Arrays.stream(imageNames)
            .map(entry -> {
              int index = entry.lastIndexOf(':');
              if (index == -1) {
                throw new RuntimeException("Unable to determine tag from " + entry);
              }
              String name = entry.substring(0, index);
              String version = entry.substring(index + 1);

              return CompletableFuture.supplyAsync(() -> docker.pull(name, version));
            }).toArray(CompletableFuture[]::new));

    try {
      cd.get();
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
      throw new RuntimeException(e);
    } catch (ExecutionException e) {
      Throwable cause = e.getCause() != null ? e.getCause() : e;
      if (cause instanceof RuntimeException) {
        throw (RuntimeException) cause;
      }
      throw new RuntimeException(cause);
    }
  }
}
