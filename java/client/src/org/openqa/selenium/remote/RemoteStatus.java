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
package org.openqa.selenium.remote;

import org.openqa.selenium.internal.Require;

import java.util.Map;

public class RemoteStatus {

  private final Map<String, Object> buildInfo;
  private final Map<String, Object> osInfo;

  @SuppressWarnings("unchecked")
  public RemoteStatus(Map<String, Object> status) {
    Require.nonNull("Status", status);
    buildInfo = (Map<String, Object>) status.get("build");
    osInfo = (Map<String, Object>) status.get("os");
  }

  /** @return The release label. */
  public String getReleaseLabel() {
    return (String) buildInfo.get("version");
  }

  /** @return The build revision. */
  public String getBuildRevision() {
    return (String) buildInfo.get("revision");
  }

  /** @return The build time. */
  public String getBuildTime() {
    return (String) buildInfo.get("time");
  }

  /** @return The operating system architecture. */
  public String getOsArch() {
    return (String) osInfo.get("arch");
  }

  /** @return The operating system name. */
  public String getOsName() {
    return (String) osInfo.get("name");
  }

  /** @return The operating system version. */
  public String getOsVersion() {
    return (String) osInfo.get("version");
  }

  public String toString() {
    return String.format(
      "Build info: version: '%s', revision: '%s', time: '%s'%nOS info: arch: '%s', name: '%s', version: '%s'",
      getReleaseLabel(),
      getBuildRevision(),
      getBuildTime(),
      getOsArch(),
      getOsName(),
      getOsVersion());
  }

}
