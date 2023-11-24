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

package org.openqa.selenium.devtools;

import java.util.function.Function;
import org.openqa.selenium.devtools.idealized.Domains;
import org.openqa.selenium.internal.Require;

public abstract class CdpInfo implements Comparable<CdpInfo> {

  private final int majorVersion;
  private final Function<DevTools, Domains> domains;

  protected CdpInfo(int majorVersion, Function<DevTools, Domains> domains) {
    this.majorVersion = majorVersion;
    this.domains = Require.nonNull("Domain supplier", domains);
  }

  public int getMajorVersion() {
    return majorVersion;
  }

  public Domains getDomains(DevTools devTools) {
    Require.nonNull("DevTools", devTools);
    return domains.apply(devTools);
  }

  @Override
  public int compareTo(CdpInfo that) {
    return Integer.compare(this.getMajorVersion(), that.getMajorVersion());
  }

  @Override
  public String toString() {
    return "CDP version: " + getMajorVersion();
  }
}
