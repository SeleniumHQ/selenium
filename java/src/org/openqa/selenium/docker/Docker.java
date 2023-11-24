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

import java.util.Optional;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;

public class Docker {

  private static final Logger LOG = Logger.getLogger(Docker.class.getName());
  protected final HttpHandler client;
  private volatile Optional<DockerProtocol> dockerClient;

  public Docker(HttpHandler client) {
    this.client = Require.nonNull("HTTP client", client);
    this.dockerClient = Optional.empty();
  }

  public boolean isSupported() {
    return getDocker().isPresent();
  }

  public String getVersion() {
    return getDocker().map(DockerProtocol::version).orElse("unsupported");
  }

  public Image getImage(String name) {
    Require.nonNull("Image name to get", name);

    LOG.info("Obtaining image: " + name);

    return getDocker()
        .map(protocol -> protocol.getImage(name))
        .orElseThrow(() -> new DockerException("Unable to get image " + name));
  }

  public Container create(ContainerConfig config) {
    Require.nonNull("Container config", config);

    LOG.fine("Creating image from " + config);

    return getDocker()
        .map(protocol -> protocol.create(config))
        .orElseThrow(() -> new DockerException("Unable to create container: " + config));
  }

  public Optional<ContainerInfo> inspect(ContainerId id) {
    Require.nonNull("Container id", id);

    LOG.fine("Inspecting container with id: " + id);

    if (!getDocker().map(protocol -> protocol.isContainerPresent(id)).orElse(false)) {
      return Optional.empty();
    }

    return Optional.of(
        getDocker()
            .map(protocol -> protocol.inspectContainer(id))
            .orElseThrow(() -> new DockerException("Unable to inspect container: " + id)));
  }

  private Optional<DockerProtocol> getDocker() {
    if (dockerClient.isPresent()) {
      return dockerClient;
    }

    synchronized (this) {
      if (!dockerClient.isPresent()) {
        dockerClient = new VersionCommand(client).getDockerProtocol();
      }
    }

    return dockerClient;
  }
}
