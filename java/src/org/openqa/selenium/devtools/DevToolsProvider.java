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

import static java.util.logging.Level.INFO;
import static org.openqa.selenium.concurrent.Lazy.lazy;

import com.google.auto.service.AutoService;
import java.net.URI;
import java.util.Optional;
import java.util.function.Predicate;
import java.util.logging.Logger;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.concurrent.Lazy;
import org.openqa.selenium.remote.AugmenterProvider;
import org.openqa.selenium.remote.ExecuteMethod;
import org.openqa.selenium.remote.RemoteExecuteMethod;

@SuppressWarnings({"rawtypes", "RedundantSuppression"})
@AutoService(AugmenterProvider.class)
public class DevToolsProvider implements AugmenterProvider<HasDevTools> {
  private static final Logger LOG = Logger.getLogger(DevToolsProvider.class.getName());

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
    final Lazy<DevTools> devTools = lazy(() -> establishDevToolsConnection(caps, executeMethod));

    LOG.log(
        INFO,
        "WebDriver augmented with DevTools interface; connection will not be verified until first"
            + " use.");

    return new HasDevTools() {
      @Override
      public Optional<DevTools> maybeGetDevTools() {
        return devTools.getIfInitialized();
      }

      @Override
      public DevTools getDevTools() {
        return devTools.get();
      }
    };
  }

  private DevTools establishDevToolsConnection(Capabilities caps, ExecuteMethod executeMethod) {
    Object cdpVersion = caps.getCapability("se:cdpVersion");
    String version = cdpVersion instanceof String ? (String) cdpVersion : caps.getBrowserVersion();

    CdpInfo info = new CdpVersionFinder().findMatchingVersion(version);
    return SeleniumCdpConnection.create(
            caps, ((RemoteExecuteMethod) executeMethod).getWrappedDriver().getClientConfig())
        .map(conn -> new DevTools(info::getDomains, conn))
        .orElseThrow(() -> new DevToolsException("Unable to create DevTools connection"));
  }

  @Nullable
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
