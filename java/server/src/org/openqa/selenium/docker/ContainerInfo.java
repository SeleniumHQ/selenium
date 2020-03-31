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

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Multimap;
import org.openqa.selenium.Beta;

import java.util.Map;
import java.util.Objects;

@Beta
public class ContainerInfo {

  private final Image image;
  // Port bindings, keyed on the container port, with values being host ports
  private final Multimap<String, Map<String, Object>> portBindings;

  private ContainerInfo(Image image, Multimap<String, Map<String, Object>> portBindings) {
    this.image = Objects.requireNonNull(image);
    this.portBindings = Objects.requireNonNull(portBindings);
  }

  public static ContainerInfo image(Image image) {
    return new ContainerInfo(image, HashMultimap.create());
  }

  public ContainerInfo map(Port containerPort, Port hostPort) {
    Objects.requireNonNull(containerPort);
    Objects.requireNonNull(hostPort);

    if (!hostPort.getProtocol().equals(containerPort.getProtocol())) {
      throw new DockerException(
          String.format("Port protocols must match: %s -> %s", hostPort, containerPort));
    }

    Multimap<String, Map<String, Object>> updatedBindings = HashMultimap.create(portBindings);
    updatedBindings.put(
        containerPort.getPort() + "/" + containerPort.getProtocol(),
        ImmutableMap.of("HostPort", String.valueOf(hostPort.getPort()), "HostIp", ""));

    return new ContainerInfo(image, updatedBindings);
  }

  @Override
  public String toString() {
    return "ContainerInfo{" +
      "image=" + image +
      ", portBindings=" + portBindings +
      '}';
  }

  private Map<String, Object> toJson() {
    Map<String, Object> hostConfig = ImmutableMap.of(
        "PortBindings", portBindings.asMap());

    return ImmutableMap.of(
        "Image", image.getId(),
        "HostConfig", hostConfig);
  }
}
