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

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.openqa.selenium.internal.Require;

public class ContainerInfo {

  private final String ip;
  private final ContainerId id;
  private final List<Map<String, Object>> mountedVolumes;
  private final String networkName;

  public ContainerInfo(
      ContainerId id, String ip, List<Map<String, Object>> mountedVolumes, String networkName) {
    this.ip = Require.nonNull("Container ip address", ip);
    this.id = Require.nonNull("Container id", id);
    this.mountedVolumes = Require.nonNull("Mounted volumes", mountedVolumes);
    this.networkName = Require.nonNull("Network name", networkName);
  }

  public String getIp() {
    return ip;
  }

  public ContainerId getId() {
    return id;
  }

  public List<Map<String, Object>> getMountedVolumes() {
    return mountedVolumes;
  }

  public String getNetworkName() {
    return networkName;
  }

  @Override
  public String toString() {
    return "ContainerInfo{"
        + "ip="
        + ip
        + ", id="
        + id
        + ", networkName="
        + networkName
        + ", mountedVolumes="
        + Arrays.toString(mountedVolumes.toArray())
        + '}';
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof ContainerInfo)) {
      return false;
    }
    ContainerInfo that = (ContainerInfo) o;
    return Objects.equals(this.ip, that.ip)
        && Objects.equals(this.id, that.id)
        && Objects.equals(this.networkName, that.networkName);
  }

  @Override
  public int hashCode() {
    return Objects.hash(ip, id, networkName);
  }
}
