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

import org.openqa.selenium.docker.Container;
import org.openqa.selenium.docker.ContainerId;
import org.openqa.selenium.docker.ContainerInfo;
import org.openqa.selenium.docker.DockerException;
import org.openqa.selenium.docker.DockerProtocol;
import org.openqa.selenium.docker.Image;
import org.openqa.selenium.docker.internal.Reference;
import org.openqa.selenium.remote.http.HttpHandler;

import java.time.Duration;
import java.util.Objects;
import java.util.Set;
import java.util.logging.Logger;

public class V140Docker implements DockerProtocol {

  private static final Logger LOG = Logger.getLogger(V140Docker.class.getName());
  private final ListImages listImages;
  private final PullImage pullImage;
  private final CreateContainer createContainer;
  private final StartContainer startContainer;
  private final StopContainer stopContainer;
  private final DeleteContainer deleteContainer;
  private final ContainerExists containerExists;

  public V140Docker(HttpHandler client) {
    Objects.requireNonNull(client);
    listImages = new ListImages(client);
    pullImage = new PullImage(client);

    createContainer = new CreateContainer(this, client);
    startContainer = new StartContainer(client);
    stopContainer = new StopContainer(client);
    deleteContainer = new DeleteContainer(client);
    containerExists = new ContainerExists(client);
  }

  @Override
  public String version() {
    return "1.40";
  }

  @Override
  public Image getImage(String imageName) throws DockerException {
    Objects.requireNonNull(imageName);

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
  public Container create(ContainerInfo info) {
    Objects.requireNonNull(info);

    LOG.info("Creating container: " + info);

    return createContainer.apply(info);
  }

  @Override
  public void startContainer(ContainerId id) throws DockerException {
    Objects.requireNonNull(id);

    LOG.info("Starting container: " + id);

    startContainer.apply(id);
  }

  @Override
  public boolean exists(ContainerId id) {
    Objects.requireNonNull(id);

    LOG.fine(String.format("Checking whether %s is running", id));

    return containerExists.apply(id);
  }

  @Override
  public void stopContainer(ContainerId id, Duration timeout) throws DockerException {
    Objects.requireNonNull(id);
    Objects.requireNonNull(timeout);

    LOG.info("Stopping container: " + id);

    stopContainer.apply(id, timeout);
  }

  @Override
  public void deleteContainer(ContainerId id) throws DockerException {
    Objects.requireNonNull(id);

    LOG.info("Deleting container: " + id);

    deleteContainer.apply(id);
  }
}
