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

package org.openqa.selenium.grid.sessionqueue;

import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.grid.data.BrowserInfo;
import org.openqa.selenium.grid.data.PlatformInfo;
import org.openqa.selenium.grid.data.RequestId;
import org.openqa.selenium.grid.data.VersionInfo;
import org.openqa.selenium.internal.Require;

import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.tracing.Tracer;
import org.openqa.selenium.status.HasReadyState;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;

public abstract class NewSessionQueue implements HasReadyState {

  protected final Tracer tracer;

  protected final Duration retryInterval;

  protected final Duration requestTimeout;

  public static final String SESSIONREQUEST_TIMESTAMP_HEADER = "new-session-request-timestamp";

  public static final String SESSIONREQUEST_ID_HEADER = "request-id";

  public abstract boolean offerLast(HttpRequest request, RequestId requestId);

  public abstract boolean offerFirst(HttpRequest request, RequestId requestId);

  public abstract Optional<HttpRequest> remove(RequestId requestId);

  public abstract int clear();

  public abstract int getQueueSize();

  public abstract String getQueueInfo();

  public void addRequestHeaders(HttpRequest request, RequestId reqId) {
    long timestamp = Instant.now().getEpochSecond();
    request.addHeader(SESSIONREQUEST_TIMESTAMP_HEADER, Long.toString(timestamp));

    request.addHeader(SESSIONREQUEST_ID_HEADER, reqId.toString());
  }

  public boolean hasRequestTimedOut(HttpRequest request) {
    String enqueTimestampStr = request.getHeader(SESSIONREQUEST_TIMESTAMP_HEADER);
    Instant enque = Instant.ofEpochSecond(Long.parseLong(enqueTimestampStr));
    Instant deque = Instant.now();
    Duration duration = Duration.between(enque, deque);

    return duration.compareTo(requestTimeout) > 0;
  }

  protected Capabilities validateCaps(Capabilities caps) {
    String browser = caps.getBrowserName().isEmpty() ? "ANY" : caps.getBrowserName();
    Platform platform = caps.getPlatformName() == null ? Platform.ANY : caps.getPlatformName();
    String version = caps.getBrowserVersion().isEmpty() ? "ANY" : caps.getBrowserVersion();

    return new ImmutableCapabilities(
      CapabilityType.BROWSER_NAME, browser,
      CapabilityType.PLATFORM_NAME, platform,
      CapabilityType.BROWSER_VERSION, version);
  }

  protected void setCount(Capabilities caps, Map<String, BrowserInfo> browserInfoMap) {
    String browser = caps.getBrowserName();
    String platform = caps.getPlatformName().name();
    String version = caps.getBrowserVersion();

    // Set browser count
    BrowserInfo browserInfo = browserInfoMap.getOrDefault(browser, new BrowserInfo(browser));
    browserInfo.setCount(browserInfo.getCount() + 1);
    browserInfoMap.putIfAbsent(browser, browserInfo);

    // Set platform count
    Map<String, PlatformInfo> platformMap = browserInfo.getPlatformInfoMap();
    PlatformInfo platformInfo = platformMap.getOrDefault(platform, new PlatformInfo(platform));
    platformInfo.setCount(platformInfo.getCount() + 1);
    platformMap.putIfAbsent(platform, platformInfo);

    // Set version count
    Map<String, VersionInfo> versionMap = platformInfo.getVersionMap();
    VersionInfo versionInfo = versionMap.getOrDefault(version, new VersionInfo(version));
    versionInfo.setCount(versionInfo.getCount() + 1);
    versionMap.putIfAbsent(version, versionInfo);
  }

  protected NewSessionQueue(Tracer tracer, Duration retryInterval, Duration requestTimeout) {
    this.tracer = Require.nonNull("Tracer", tracer);
    this.retryInterval = Require.nonNull("Session request retry interval", retryInterval);
    this.requestTimeout = Require.nonNull("Session request timeout", requestTimeout);
  }

}
