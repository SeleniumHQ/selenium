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
import java.util.Objects;
import java.util.logging.Logger;

public class Container {

  private static final Logger LOG = Logger.getLogger(Container.class.getName());
  private final DockerProtocol protocol;
  private final ContainerId id;

  public Container(DockerProtocol protocol, ContainerId id) {
    LOG.info("Created container " + id);
    this.protocol = Objects.requireNonNull(protocol);
    this.id = Objects.requireNonNull(id);
  }

  public ContainerId getId() {
    return id;
  }

  public void start() {
    LOG.info("Starting " + getId());
    protocol.startContainer(id);
  }

  public void stop(Duration timeout) {
    Objects.requireNonNull(timeout, "Timeout to wait for must be set.");

    if (protocol.exists(id)) {
      LOG.info("Stopping " + getId());

      protocol.stopContainer(id, timeout);
    }
  }

  public void delete() {
    // Check to see if the container exists
    if (protocol.exists(id)) {
      LOG.info("Removing " + getId());

      protocol.deleteContainer(id);
    }
  }
}
