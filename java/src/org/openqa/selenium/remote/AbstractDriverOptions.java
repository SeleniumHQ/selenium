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

import static java.util.Collections.unmodifiableMap;
import static java.util.Objects.requireNonNull;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.BROWSER_VERSION;
import static org.openqa.selenium.remote.CapabilityType.ENABLE_DOWNLOADS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;
import static org.openqa.selenium.remote.CapabilityType.PROXY;
import static org.openqa.selenium.remote.CapabilityType.STRICT_FILE_INTERACTABILITY;
import static org.openqa.selenium.remote.CapabilityType.TIMEOUTS;
import static org.openqa.selenium.remote.CapabilityType.UNHANDLED_PROMPT_BEHAVIOUR;

import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.Proxy;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.internal.Require;

public abstract class AbstractDriverOptions<DO extends AbstractDriverOptions<DO>>
    extends MutableCapabilities {
  public DO setBrowserVersion(String browserVersion) {
    setCapability(BROWSER_VERSION, Require.nonNull("Browser version", browserVersion));
    return self();
  }

  public DO setPlatformName(String platformName) {
    setCapability(PLATFORM_NAME, Require.nonNull("Platform Name", platformName));
    return self();
  }

  public DO setImplicitWaitTimeout(Duration timeout) {
    Map<String, Number> timeouts = getTimeouts();
    timeouts.put("implicit", timeout.toMillis());

    setCapability(TIMEOUTS, unmodifiableMap(timeouts));
    return self();
  }

  public DO setPageLoadTimeout(Duration timeout) {
    Map<String, Number> timeouts = getTimeouts();
    timeouts.put("pageLoad", timeout.toMillis());

    setCapability(TIMEOUTS, unmodifiableMap(timeouts));
    return self();
  }

  public DO setScriptTimeout(Duration timeout) {
    Map<String, Number> timeouts = getTimeouts();
    timeouts.put("script", timeout.toMillis());

    setCapability(TIMEOUTS, unmodifiableMap(timeouts));
    return self();
  }

  public DO setPageLoadStrategy(PageLoadStrategy strategy) {
    setCapability(PAGE_LOAD_STRATEGY, Require.nonNull("Page load strategy", strategy));
    return self();
  }

  public DO setUnhandledPromptBehaviour(UnexpectedAlertBehaviour behaviour) {
    setCapability(
        UNHANDLED_PROMPT_BEHAVIOUR, Require.nonNull("Unhandled prompt behavior", behaviour));
    return self();
  }

  public DO setAcceptInsecureCerts(boolean acceptInsecureCerts) {
    setCapability(ACCEPT_INSECURE_CERTS, acceptInsecureCerts);
    return self();
  }

  public DO setStrictFileInteractability(boolean strictFileInteractability) {
    setCapability(STRICT_FILE_INTERACTABILITY, strictFileInteractability);
    return self();
  }

  public DO setProxy(Proxy proxy) {
    setCapability(PROXY, Require.nonNull("Proxy", proxy));
    return self();
  }

  public DO setEnableDownloads(boolean enableDownloads) {
    setCapability(ENABLE_DOWNLOADS, enableDownloads);
    return self();
  }

  @SuppressWarnings("unchecked")
  private DO self() {
    return (DO) this;
  }

  @Override
  public Set<String> getCapabilityNames() {
    TreeSet<String> names = new TreeSet<>(super.getCapabilityNames());
    names.addAll(getExtraCapabilityNames());
    return Collections.unmodifiableSet(names);
  }

  protected abstract Set<String> getExtraCapabilityNames();

  @Override
  public @Nullable Object getCapability(String capabilityName) {
    Require.nonNull("Capability name", capabilityName);

    if (getExtraCapabilityNames().contains(capabilityName)) {
      return getExtraCapability(capabilityName);
    }
    return super.getCapability(capabilityName);
  }

  @Nullable
  protected abstract Object getExtraCapability(String capabilityName);

  @Override
  public Map<String, Object> asMap() {
    Map<String, Object> toReturn = new TreeMap<>(super.asMap());
    getExtraCapabilityNames()
        .forEach(name -> toReturn.put(name, requireNonNull(getCapability(name))));
    return unmodifiableMap(toReturn);
  }

  private Map<String, Number> getTimeouts() {
    Map<String, Number> newTimeouts = new HashMap<>();
    Object raw = getCapability(TIMEOUTS);
    if (raw != null) {
      ((Map<?, ?>) raw)
          .forEach(
              (key, value) -> {
                if (key instanceof String && value instanceof Number) {
                  newTimeouts.put((String) key, (Number) value);
                }
              });
    }
    return newTimeouts;
  }
}
