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
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Multimap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.openqa.selenium.Beta;
import org.openqa.selenium.internal.Require;

@Beta
public class ContainerConfig {

  private static final String DEFAULT_DOCKER_NETWORK = "bridge";
  private static final long DEFAULT_SHM_SIZE = 67108864L; // 64MB

  private final Image image;
  // Port bindings, keyed on the container port, with values being host ports
  private final Multimap<String, Map<String, Object>> portBindings;
  private final Map<String, String> envVars;
  private final Map<String, String> volumeBinds;
  private final List<Device> devices;
  private final String networkName;
  private final boolean autoRemove;
  private final long shmSize;

  public ContainerConfig(
      Image image,
      Multimap<String, Map<String, Object>> portBindings,
      Map<String, String> envVars,
      Map<String, String> volumeBinds,
      List<Device> devices,
      String networkName,
      long shmSize) {
    this.image = image;
    this.portBindings = portBindings;
    this.envVars = envVars;
    this.volumeBinds = volumeBinds;
    this.devices = devices;
    this.networkName = networkName;
    this.autoRemove = true;
    this.shmSize = shmSize;
  }

  public static ContainerConfig image(Image image) {
    return new ContainerConfig(
        image,
        HashMultimap.create(),
        ImmutableMap.of(),
        ImmutableMap.of(),
        ImmutableList.of(),
        DEFAULT_DOCKER_NETWORK,
        DEFAULT_SHM_SIZE);
  }

  public ContainerConfig map(Port containerPort, Port hostPort) {
    Require.nonNull("Container port", containerPort);
    Require.nonNull("Host port", hostPort);

    if (!hostPort.getProtocol().equals(containerPort.getProtocol())) {
      throw new DockerException(
          String.format("Port protocols must match: %s -> %s", hostPort, containerPort));
    }

    Multimap<String, Map<String, Object>> updatedBindings = HashMultimap.create(portBindings);
    updatedBindings.put(
        containerPort.getPort() + "/" + containerPort.getProtocol(),
        ImmutableMap.of("HostPort", String.valueOf(hostPort.getPort()), "HostIp", ""));

    return new ContainerConfig(
        image, updatedBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  public ContainerConfig env(Map<String, String> envVars) {
    Require.nonNull("Container env vars", envVars);

    return new ContainerConfig(
        image, portBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  public ContainerConfig bind(Map<String, String> volumeBinds) {
    Require.nonNull("Container volume binds", volumeBinds);

    return new ContainerConfig(
        image, portBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  public ContainerConfig network(String networkName) {
    Require.nonNull("Container network name", networkName);

    return new ContainerConfig(
        image, portBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  public ContainerConfig shmMemorySize(long shmSize) {
    return new ContainerConfig(
        image, portBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  public ContainerConfig devices(List<Device> devices) {
    Require.nonNull("Container device files", devices);

    return new ContainerConfig(
        image, portBindings, envVars, volumeBinds, devices, networkName, shmSize);
  }

  @Override
  public String toString() {
    return "ContainerConfig{"
        + "image="
        + image
        + ", portBindings="
        + portBindings
        + ", envVars="
        + envVars
        + ", volumeBinds="
        + volumeBinds
        + ", networkName="
        + networkName
        + ", devices="
        + devices
        + ", autoRemove="
        + autoRemove
        + ", shmSize="
        + shmSize
        + '}';
  }

  private Map<String, Object> toJson() {
    List<String> envVars =
        this.envVars.keySet().stream()
            .map(key -> String.format("%s=%s", key, this.envVars.get(key)))
            .collect(Collectors.toList());

    List<String> volumeBinds =
        this.volumeBinds.keySet().stream()
            .map(key -> String.format("%s:%s", key, this.volumeBinds.get(key)))
            .collect(Collectors.toList());

    List<Map<String, String>> devicesMapping =
        this.devices.stream()
            .map(
                device ->
                    ImmutableMap.of(
                        "PathOnHost", device.getPathOnHost(),
                        "PathInContainer", device.getPathInContainer(),
                        "CgroupPermissions", device.getCgroupPermissions()))
            .collect(Collectors.toList());

    Map<String, Object> hostConfig =
        ImmutableMap.of(
            "PortBindings", portBindings.asMap(),
            "AutoRemove", autoRemove,
            "NetworkMode", networkName,
            "ShmSize", shmSize,
            "Binds", volumeBinds,
            "Devices", devicesMapping);

    return ImmutableMap.of(
        "Image", image.getId(),
        "Env", envVars,
        "HostConfig", hostConfig);
  }
}
