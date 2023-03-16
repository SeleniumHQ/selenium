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

import com.google.auto.service.AutoService;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.devtools.noop.NoOpCdpInfo;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;

import java.net.URI;
import java.util.Optional;
import java.util.function.Predicate;

@AutoService(AugmenterProvider.class)
public class DevToolsProvider implements AugmenterProvider<HasDevTools> {

  @Override
  public Predicate<Capabilities> isApplicable() {
    return caps -> getCdpUrl(caps) != null;
  }

  @Override
  public Class<HasDevTools> getDescribedInterface() {
    return HasDevTools.class;
  }

  @Override
  public HasDevTools getImplementation(Capabilities caps, ExecuteMethod executeMethod) {
    Object cdpVersion = caps.getCapability("se:cdpVersion");
    String version = cdpVersion instanceof String ? (String) cdpVersion : caps.getBrowserVersion();

    CdpInfo info = new CdpVersionFinder().match(version).orElseGet(NoOpCdpInfo::new);
    Optional<DevTools> devTools = SeleniumCdpConnection.create(caps).map(conn -> new DevTools(info::getDomains, conn));

    return () -> devTools;
  }

  private String getCdpUrl(Capabilities caps) {
    Object cdpEnabled = caps.getCapability("se:cdpEnabled");
    if (cdpEnabled != null && !Boolean.parseBoolean(cdpEnabled.toString())) {
      return null;
    }

    Object cdp = caps.getCapability("se:cdp");
    if (cdp instanceof String) {
      return (String) cdp;
    }

    Optional<URI> reportedUri = CdpEndpointFinder.getReportedUri(caps);

    return reportedUri.map(URI::toString).orElse(null);
  }
}
