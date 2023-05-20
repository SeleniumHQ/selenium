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

import java.time.Duration;
import java.util.ArrayList;
import java.util.logging.Level;
import java.util.logging.Logger;
import org.openqa.selenium.internal.Require;

public class Container {

  private static final Logger LOG = Logger.getLogger(Container.class.getName());
  private final DockerProtocol protocol;
  private final ContainerId id;
  private boolean running;

  public Container(DockerProtocol protocol, ContainerId id) {
    this.protocol = Require.nonNull("Protocol", protocol);
    this.id = Require.nonNull("Container id", id);
    this.running = false;
    LOG.info("Created container " + id);
  }

  public ContainerId getId() {
    return id;
  }

  public void start() {
    LOG.info("Starting container " + getId());
    protocol.startContainer(id);
    this.running = true;
  }

  public void stop(Duration timeout) {
    Require.nonNull("Timeout to wait for", timeout);

    if (this.running) {
      LOG.info("Stopping container " + getId());
      try {
        protocol.stopContainer(id, timeout);
        this.running = false;
      } catch (RuntimeException e) {
        LOG.log(Level.WARNING, "Unable to stop container: " + e.getMessage(), e);
      }
    }
  }

  public ContainerInfo inspect() {
    LOG.info("Inspecting container " + getId());

    return protocol.inspectContainer(getId());
  }

  public ContainerLogs getLogs() {
    if (this.running) {
      LOG.info("Getting logs " + getId());
      return protocol.getContainerLogs(getId());
    }
    return new ContainerLogs(getId(), new ArrayList<>());
  }
}
