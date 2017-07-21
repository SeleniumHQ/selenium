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

package org.openqa.selenium.ie;

import static org.openqa.selenium.ie.InternetExplorerDriver.BROWSER_ATTACH_TIMEOUT;
import static org.openqa.selenium.ie.InternetExplorerDriver.ELEMENT_SCROLL_BEHAVIOR;
import static org.openqa.selenium.ie.InternetExplorerDriver.ENABLE_PERSISTENT_HOVERING;
import static org.openqa.selenium.ie.InternetExplorerDriver.FORCE_CREATE_PROCESS;
import static org.openqa.selenium.ie.InternetExplorerDriver.IE_ENSURE_CLEAN_SESSION;
import static org.openqa.selenium.ie.InternetExplorerDriver.IE_SWITCHES;
import static org.openqa.selenium.ie.InternetExplorerDriver.IE_USE_PER_PROCESS_PROXY;
import static org.openqa.selenium.ie.InternetExplorerDriver.IGNORE_ZOOM_SETTING;
import static org.openqa.selenium.ie.InternetExplorerDriver.INITIAL_BROWSER_URL;
import static org.openqa.selenium.ie.InternetExplorerDriver.INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS;
import static org.openqa.selenium.ie.InternetExplorerDriver.NATIVE_EVENTS;
import static org.openqa.selenium.ie.InternetExplorerDriver.REQUIRE_WINDOW_FOCUS;
import static org.openqa.selenium.remote.CapabilityType.PAGE_LOAD_STRATEGY;
import static org.openqa.selenium.remote.CapabilityType.UNHANDLED_PROMPT_BEHAVIOUR;

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSortedSet;
import com.google.common.collect.Streams;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.internal.ElementScrollBehavior;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.time.Duration;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Stream;

/**
 * Options for configuring the use of IE. Can be used like so:
 * <pre>InternetExplorerOptions options = new InternetExplorerOptions()
 *   .requireWindowFocus();
 *
 *new InternetExplorerDriver(options);</pre>
 */
@Beta
public class InternetExplorerOptions extends MutableCapabilities {

  private final static String IE_OPTIONS = "se:ieOptions";

  private static final String FULL_PAGE_SCREENSHOT = "ie.enableFullPageScreenshot";
  private static final String UPLOAD_DIALOG_TIMEOUT = "ie.fileUploadDialogTimeout";
  private static final String FORCE_WINDOW_SHELL_API = "ie.forceShellWindowsApi";
  private static final String VALIDATE_COOKIE_DOCUMENT_TYPE = "ie.validateCookieDocumentType";

  private final static Set<String> CAPABILITY_NAMES = ImmutableSortedSet.<String>naturalOrder()
      .add(BROWSER_ATTACH_TIMEOUT)
      .add(ELEMENT_SCROLL_BEHAVIOR)
      .add(ENABLE_PERSISTENT_HOVERING)
      .add(FULL_PAGE_SCREENSHOT)
      .add(FORCE_CREATE_PROCESS)
      .add(FORCE_WINDOW_SHELL_API)
      .add(IE_ENSURE_CLEAN_SESSION)
      .add(IE_SWITCHES)
      .add(IE_USE_PER_PROCESS_PROXY)
      .add(IGNORE_ZOOM_SETTING)
      .add(INITIAL_BROWSER_URL)
      .add(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS)
      .add(REQUIRE_WINDOW_FOCUS)
      .add(UPLOAD_DIALOG_TIMEOUT)
      .add(VALIDATE_COOKIE_DOCUMENT_TYPE)
      .build();

  private Map<String, Object> ieOptions = new HashMap<>();

  public InternetExplorerOptions() {
    this(DesiredCapabilities.internetExplorer());
  }

  public InternetExplorerOptions(Capabilities source) {
    super();

    setCapability(IE_OPTIONS, ieOptions);

    merge(source);
  }

  public InternetExplorerOptions withAttachTimeout(long duration, TimeUnit unit) {
    return withAttachTimeout(Duration.ofMillis(unit.toMillis(duration)));
  }

  public InternetExplorerOptions withAttachTimeout(Duration duration) {
    return amend(BROWSER_ATTACH_TIMEOUT, duration.toMillis());
  }

  public InternetExplorerOptions elementScrollTo(ElementScrollBehavior behavior) {
    return amend(ELEMENT_SCROLL_BEHAVIOR, behavior.getValue());
  }

  /**
   * Enable persistently sending {@code WM_MOUSEMOVE} messages to the IE window during a mouse
   * hover.
   */
  public InternetExplorerOptions enablePersistentHovering() {
    return amend(ENABLE_PERSISTENT_HOVERING, true);
  }

  /**
   * Force the use of the Windows CreateProcess API when launching Internet Explorer.
   */
  public InternetExplorerOptions useCreateProcessApiToLaunchIe() {
    return amend(FORCE_CREATE_PROCESS, true);
  }

  /**
   * Use the Windows ShellWindows API when attaching to Internet Explorer.
   */
  public InternetExplorerOptions useShellWindowsApiToAttachToIe() {
    return amend(FORCE_WINDOW_SHELL_API, true);
  }

  /**
   * Clear the Internet Explorer cache before launching the browser. When set clears the system
   * cache for all instances of Internet Explorer, even those already running when the driven
   * instance is launched.
   */
  public InternetExplorerOptions destructivelyEnsureCleanSession() {
    return amend(IE_ENSURE_CLEAN_SESSION, true);
  }

  public InternetExplorerOptions addCommandSwitches(String... switches) {
    Object raw = getCapability(IE_SWITCHES);
    if (raw == null) {
      raw = new LinkedList<>();
    }

    return amend(
        IE_SWITCHES,
        Streams.concat((Stream<?>) List.class.cast(raw).stream(), Stream.of(switches))
            .filter(i -> i instanceof String)
            .map(String.class::cast)
            .collect(ImmutableList.toImmutableList()));
  }

  /**
   *  Use the {@link org.openqa.selenium.Proxy} defined in other {@link Capabilities} on a
   *  per-process basis, not updating the system installed proxy setting. This is only valid when
   *  setting a {@link org.openqa.selenium.Proxy} where the
   *  {@link org.openqa.selenium.Proxy.ProxyType} is one of
   *  <ul>
   *    <li>{@link org.openqa.selenium.Proxy.ProxyType#DIRECT}
   *    <li>{@link org.openqa.selenium.Proxy.ProxyType#MANUAL}
   *    <li>{@link org.openqa.selenium.Proxy.ProxyType#SYSTEM}
   * </ul>
   */
  public InternetExplorerOptions usePerProcessProxy() {
    return amend(IE_USE_PER_PROCESS_PROXY, true);
  }

  public InternetExplorerOptions withInitialBrowserUrl(String url) {
    return amend(INITIAL_BROWSER_URL, Preconditions.checkNotNull(url));
  }

  public InternetExplorerOptions requireWindowFocus() {
    return amend(REQUIRE_WINDOW_FOCUS, true);
  }

  public InternetExplorerOptions waitForUploadDialogUpTo(long duration, TimeUnit unit) {
    return waitForUploadDialogUpTo(Duration.ofMillis(unit.toMillis(duration)));
  }

  public InternetExplorerOptions waitForUploadDialogUpTo(Duration duration) {
    return amend(UPLOAD_DIALOG_TIMEOUT, duration.toMillis());
  }

  public InternetExplorerOptions introduceFlakinessByIgnoringSecurityDomains() {
    return amend(INTRODUCE_FLAKINESS_BY_IGNORING_SECURITY_DOMAINS, true);
  }

  public InternetExplorerOptions enableNativeEvents() {
    return amend(NATIVE_EVENTS, true);
  }

  public InternetExplorerOptions ignoreZoomSettings() {
    return amend(IGNORE_ZOOM_SETTING, true);
  }

  public InternetExplorerOptions takeFullPageScreenshot() {
    return amend(FULL_PAGE_SCREENSHOT, true);
  }

  public InternetExplorerOptions setPageLoadStrategy(PageLoadStrategy strategy) {
    return amend(PAGE_LOAD_STRATEGY, strategy);
  }

  public InternetExplorerOptions setUnhandledPromptBehaviour(UnexpectedAlertBehaviour behaviour) {
    return amend(UNHANDLED_PROMPT_BEHAVIOUR, behaviour);
  }

  private InternetExplorerOptions amend(String optionName, Object value) {
    setCapability(optionName, value);
    return this;
  }

  @Override
  public void setCapability(String key, Object value) {
    super.setCapability(key, value);

    if (IE_SWITCHES.equals(key)) {
      if (!(value instanceof List)) {
        throw new IllegalArgumentException("Command line switches must be a list");
      }
    }

    if (CAPABILITY_NAMES.contains(key)) {
      ieOptions.put(key, value);
    }

    if (IE_OPTIONS.equals(key)) {
      ieOptions.clear();
      Map<?, ?> streamFrom;
      if (value instanceof Map) {
        streamFrom = (Map<?, ?>) value;
      } else if (value instanceof Capabilities) {
        streamFrom = ((Capabilities) value).asMap();
      } else {
        throw new IllegalArgumentException("Value must not be null for " + key);
      }

      streamFrom.entrySet().stream()
          .filter(e -> CAPABILITY_NAMES.contains(e.getKey()))
          .filter(e -> e.getValue() != null)
          .forEach(e -> setCapability((String) e.getKey(), e.getValue()));
    }
  }
}
