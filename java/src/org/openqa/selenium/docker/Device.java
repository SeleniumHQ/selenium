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

import java.util.Objects;

public class Device {

  private final String pathOnHost;

  private final String pathInContainer;

  private final String cgroupPermissions;

  private Device(String pathOnHost, String pathInContainer, String cgroupPermissions) {
    this.pathOnHost = pathOnHost;
    this.pathInContainer = pathInContainer;
    this.cgroupPermissions = cgroupPermissions;
  }

  public static Device device(String pathOnHost, String pathInContainer, String cgroupPermissions) {
    if (Objects.isNull(cgroupPermissions) || cgroupPermissions.trim().length() == 0) {
      cgroupPermissions = "crw";
    }
    return new Device(pathOnHost, pathInContainer, cgroupPermissions);
  }

  public String getPathOnHost() {
    return pathOnHost;
  }

  public String getPathInContainer() {
    return pathInContainer;
  }

  public String getCgroupPermissions() {
    return cgroupPermissions;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    Device device = (Device) o;
    return Objects.equals(pathOnHost, device.pathOnHost)
        && Objects.equals(pathInContainer, device.pathInContainer)
        && Objects.equals(cgroupPermissions, device.cgroupPermissions);
  }

  @Override
  public int hashCode() {
    return Objects.hash(pathOnHost, pathInContainer, cgroupPermissions);
  }

  @Override
  public String toString() {
    return "Device{"
        + "pathOnHost='"
        + pathOnHost
        + '\''
        + ", pathInContainer='"
        + pathInContainer
        + '\''
        + ", cgroupPermissions='"
        + cgroupPermissions
        + '\''
        + '}';
  }
}
