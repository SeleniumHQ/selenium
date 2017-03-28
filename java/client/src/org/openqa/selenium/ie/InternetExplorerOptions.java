package org.openqa.selenium.ie;

import static java.util.stream.Collectors.toMap;
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

import com.google.common.base.Preconditions;
import com.google.common.collect.ImmutableSortedSet;

import org.openqa.selenium.Beta;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.ElementScrollBehavior;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Options for configuring the use of IE. Can be used like so:
 * <pre>InternetExplorerOptions options = new InternetExplorerOptions()
 *   .requireWindowFocus();
 *
 *new InternetExplorerDriver(options.merge(DesiredCapabilities.internetExplorer());</pre>
 */
@Beta
public class InternetExplorerOptions {

  private final static String IE_OPTIONS = "se:ieOptions";

  private static final String FULL_PAGE_SCREENSHOT = "ie.enableFullPageScreenshot";
  private static final String UPLOAD_DIALOG_TIMEOUT = "ie.fileUploadDialogTimeout";
  private static final String FORCE_WINDOW_SHELL_API = "ie.forceShellWindowsApi";
  private static final String VALIDATE_COOKIE_DOCUMENT_TYPE = "ie.validateCookieDocumentType";

  private final static Set<String> CAPABILIITY_NAMES = ImmutableSortedSet.<String>naturalOrder()
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

  private final Map<String, Object> renderedView;
  private final Map<String, Object> options;

  public InternetExplorerOptions() {
    this(new ImmutableCapabilities(new HashMap<>()));
  }

  public InternetExplorerOptions(Capabilities source) {
    Preconditions.checkNotNull(source, "Source capabilities must not be null");
    renderedView = new HashMap<>(source.asMap());

    // We rely on the fact that the legacy names and the new names are the same. We want any options
    // set in the raw capabilities to take precedence.
    Object raw = source.getCapability(IE_OPTIONS);
    Map<String, ?> existing;
    if (raw instanceof Map) {
      //noinspection unchecked
      existing = (Map<String, ?>) raw;
    } else if (raw == null) {
      existing = new HashMap<>();
    } else {
      throw new IllegalArgumentException("Existing options are not of expected type: " + raw);
    }

    Map<String, ?> originalCapabilities = source.asMap();

    options = CAPABILIITY_NAMES.stream()
        .filter(originalCapabilities::containsKey)
        .filter(key -> originalCapabilities.get(key) != null)
        .collect(toMap(key -> key, originalCapabilities::get));

    options.putAll(CAPABILIITY_NAMES.stream()
        .filter(existing::containsKey)
        .filter(name -> existing.get(name) != null)
        .collect(toMap(key -> key, existing::get)));

    renderedView.putAll(options);
    renderedView.put(IE_OPTIONS, options);
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
    //noinspection unchecked
    List<String> flags = (List<String>) options.getOrDefault(IE_SWITCHES, new ArrayList<>());

    flags.addAll(Arrays.asList(switches));
    return amend(IE_SWITCHES, flags);
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

  private InternetExplorerOptions amend(String optionName, Object value) {
    renderedView.put(optionName, value);
    options.put(optionName, value);
    return this;
  }

  public Capabilities merge(Capabilities other) {
    Map<String, Object> caps = new HashMap<>(other.asMap());

    caps.putAll(renderedView);

    return new ImmutableCapabilities(caps);
  }

  public Map<String, ?> asMap() {
    return options;
  }
}
