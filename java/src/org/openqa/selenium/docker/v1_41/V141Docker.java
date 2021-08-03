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

import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerConfig;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.docker.ContainerInfo;
import org.openqa.selenium.docker.ContainerLogs;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.DockerProtocol;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.internal.Reference;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.http.HttpHandler;

import java.time.Duration;
import java.util.Set;
import java.util.logging.Logger;

public class V141Docker implements DockerProtocol {

  static final String DOCKER_API_VERSION = "1.41";
  private static final Logger LOG = Logger.getLogger(V141Docker.class.getName());
  private final org.openqa.selenium.docker.v1_41.ListImages listImages;
  private final PullImage pullImage;
  private final org.openqa.selenium.docker.v1_41.CreateContainer createContainer;
  private final StartContainer startContainer;
  private final StopContainer stopContainer;
  private final IsContainerPresent isContainerPresent;
  private final org.openqa.selenium.docker.v1_41.InspectContainer inspectContainer;
  private final org.openqa.selenium.docker.v1_41.GetContainerLogs containerLogs;

  public V141Docker(HttpHandler client) {
    Require.nonNull("HTTP client", client);
    listImages = new org.openqa.selenium.docker.v1_41.ListImages(client);
    pullImage = new PullImage(client);

    createContainer = new org.openqa.selenium.docker.v1_41.CreateContainer(this, client);
    startContainer = new StartContainer(client);
    stopContainer = new StopContainer(client);
    isContainerPresent = new IsContainerPresent(client);
    inspectContainer = new org.openqa.selenium.docker.v1_41.InspectContainer(client);
    containerLogs = new org.openqa.selenium.docker.v1_41.GetContainerLogs(client);
  }

  @Override
  public String version() {
    return DOCKER_API_VERSION;
  }

  @Override
  public Image getImage(String imageName) throws DockerException {
    Require.nonNull("Image name", imageName);

    Reference ref = Reference.parse(imageName);

    LOG.info("Listing local images: " + ref);
    Set<Image> allImages = listImages.apply(ref);
    if (!allImages.isEmpty()) {
      return allImages.iterator().next();
    }

    LOG.info("Pulling " + ref);
    pullImage.apply(ref);

    LOG.info("Pull completed. Listing local images again: " + ref);
    allImages = listImages.apply(ref);
    if (!allImages.isEmpty()) {
      return allImages.iterator().next();
    }

    throw new DockerException("Pull appears to have succeeded, but image not present locally: " + imageName);
  }

  @Override
  public Container create(ContainerConfig config) {
    Require.nonNull("Container config", config);

    LOG.fine("Creating container: " + config);

    return createContainer.apply(config);
  }

  @Override
  public boolean isContainerPresent(ContainerId id) throws DockerException {
    Require.nonNull("Container id", id);

    LOG.info("Checking if container is present: " + id);

    return isContainerPresent.apply(id);
  }

  @Override
  public void startContainer(ContainerId id) throws DockerException {
    Require.nonNull("Container id", id);

    LOG.fine("Starting container: " + id);

    startContainer.apply(id);
  }

  @Override
  public void stopContainer(ContainerId id, Duration timeout) throws DockerException {
    Require.nonNull("Container id", id);
    Require.nonNull("Timeout", timeout);

    LOG.fine("Stopping container: " + id);

    stopContainer.apply(id, timeout);
  }

  @Override
  public ContainerInfo inspectContainer(ContainerId id) throws DockerException {
    Require.nonNull("Container id", id);

    LOG.fine("Inspecting container: " + id);

    return inspectContainer.apply(id);
  }

  @Override
  public ContainerLogs getContainerLogs(ContainerId id) throws DockerException {
    Require.nonNull("Container id", id);

    LOG.info("Getting container logs: " + id);

    return containerLogs.apply(id);
  }
}
