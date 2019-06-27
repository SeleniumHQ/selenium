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
package org.openqa.selenium.devtools.page;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.debugger.model.SearchMatch;
import org.openqa.selenium.devtools.emulation.model.ScreenOrientation;
import org.openqa.selenium.devtools.network.Network;
import org.openqa.selenium.devtools.network.model.Cookies;
import org.openqa.selenium.devtools.network.model.MonotonicTime;
import org.openqa.selenium.devtools.page.model.AppManifest;
import org.openqa.selenium.devtools.page.model.Behavior;
import org.openqa.selenium.devtools.page.model.CompilationCacheProduced;
import org.openqa.selenium.devtools.page.model.ConfigurationEnum;
import org.openqa.selenium.devtools.page.model.DownloadWillBegin;
import org.openqa.selenium.devtools.page.model.ExecutionContextId;
import org.openqa.selenium.devtools.page.model.FontFamilies;
import org.openqa.selenium.devtools.page.model.FontSizes;
import org.openqa.selenium.devtools.page.model.Format;
import org.openqa.selenium.devtools.page.model.FrameAttached;
import org.openqa.selenium.devtools.page.model.FrameId;
import org.openqa.selenium.devtools.page.model.FrameRequestedNavigation;
import org.openqa.selenium.devtools.page.model.FrameResourceTree;
import org.openqa.selenium.devtools.page.model.FrameScheduledNavigation;
import org.openqa.selenium.devtools.page.model.FrameTree;
import org.openqa.selenium.devtools.page.model.JavascriptDialogClosed;
import org.openqa.selenium.devtools.page.model.JavascriptDialogOpening;
import org.openqa.selenium.devtools.page.model.LayoutMetric;
import org.openqa.selenium.devtools.page.model.LifecycleEvent;
import org.openqa.selenium.devtools.page.model.NavigateEntry;
import org.openqa.selenium.devtools.page.model.NavigatedWithinDocument;
import org.openqa.selenium.devtools.page.model.NavigationHistory;
import org.openqa.selenium.devtools.page.model.PrintToPDF;
import org.openqa.selenium.devtools.page.model.ResourceContent;
import org.openqa.selenium.devtools.page.model.ScreencastFrame;
import org.openqa.selenium.devtools.page.model.ScriptIdentifier;
import org.openqa.selenium.devtools.page.model.TransferMode;
import org.openqa.selenium.devtools.page.model.TransitionType;
import org.openqa.selenium.devtools.page.model.Viewport;
import org.openqa.selenium.devtools.page.model.WebLifecycleState;
import org.openqa.selenium.devtools.page.model.WindowOpen;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

/**
 * Actions and events related to the inspected page belong to the page domain.
 */
public class Page {

  /**
   * Deprecated, please use addScriptToEvaluateOnNewDocument instead.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<ScriptIdentifier> addScriptToEvaluateOnLoad(String scriptSource) {
    Objects.requireNonNull(scriptSource, "scriptSource is required");
    return new Command<>(
        "Page.addScriptToEvaluateOnLoad",
        ImmutableMap.of("scriptSource", scriptSource),
        map("identifier", ScriptIdentifier.class));
  }

  /**
   * Evaluates given script in every frame upon creation (before loading frame's scripts).
   */
  public static Command<ScriptIdentifier> addScriptToEvaluateOnNewDocument(
      String source, Optional<String> worldName) {
    Objects.requireNonNull(source, "source is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("source", source);
    worldName.ifPresent(val -> params.put("worldName", val));
    return new Command<>(
        "Page.addScriptToEvaluateOnNewDocument",
        params.build(),
        map("identifier", ScriptIdentifier.class));
  }

  /**
   * Brings page to front (activates tab).
   */
  public static Command<Void> bringToFront() {
    return new Command<>("Page.bringToFront", ImmutableMap.of());
  }

  /**
   * Capture page screenshot.
   */
  public static Command<String> captureScreenshot(
      Optional<String> format,
      Optional<Integer> quality,
      Optional<Viewport> clip,
      Optional<Boolean> fromSurface) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    format.ifPresent(f -> params.put("format", f));
    quality.ifPresent(q -> params.put("quality", q));
    clip.ifPresent(c -> params.put("clip", c));
    fromSurface.ifPresent(fromSure -> params.put("fromSurface", fromSure));
    return new Command<>("Page.captureScreenshot", params.build(), map("data", String.class));
  }

  /**
   * Returns a snapshot of the page as a string. For MHTML format, the serialization includes
   * iframes, shadow DOM, external resources, and element-inline styles.EXPERIMENTAL
   */
  @Beta
  public static Command<String> captureSnapshot(Optional<String> format) {
    return new Command<>(
        "Page.captureSnapshot",
        ImmutableMap.of("format", format.orElse("mhtml")),
        map("data", String.class));
  }

  /**
   * Clears the overriden device metrics.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> clearDeviceMetricsOverride() {
    return new Command<>("Page.clearDeviceMetricsOverride", ImmutableMap.of());
  }

  /**
   * Clears the overridden Device Orientation.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> clearDeviceOrientationOverride() {
    return new Command<>("Page.clearDeviceOrientationOverride", ImmutableMap.of());
  }

  /**
   * Clears the overriden Geolocation Position and Error. DEPRECATED
   */
  @Deprecated
  public static Command<Void> clearGeolocationOverride() {
    return new Command<>("Page.clearGeolocationOverride", ImmutableMap.of());
  }

  /**
   * Creates an isolated world for the given frame.
   */
  public static Command<ExecutionContextId> createIsolatedWorld(
      FrameId frameId, Optional<String> worldName, Optional<Boolean> grantUniveralAccess) {
    Objects.requireNonNull(frameId, "FrameId is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("frameId", frameId);
    worldName.ifPresent(w -> params.put("worldName", w));
    grantUniveralAccess.ifPresent(g -> params.put("grantUniversalAccess", g));
    return new Command<>(
        "Page.grantUniveralAccess",
        params.build(),
        map("executionContextId", ExecutionContextId.class));
  }

  /**
   * Deletes browser cookie with given name, domain and path.EXPERIMENTAL DEPRECATED * Use {@link
   * Network#deleteCookies(String, Optional, Optional, Optional)} ()}
   */
  @Beta
  @Deprecated
  public static Command<Void> deleteCookie(String cookieName, String url) {
    Objects.requireNonNull(cookieName, "cookieName is required");
    Objects.requireNonNull(url, "url is required");
    return new Command<>(
        "Page.deleteCookie", ImmutableMap.of("cookieName", cookieName, "url", url));
  }

  /**
   * Disables page domain notifications.
   */
  public static Command<Void> disable() {
    return new Command<>("Page.disable", ImmutableMap.of());
  }

  /**
   * Enables page domain notifications.
   */
  public static Command<Void> enable() {
    return new Command<>("Page.enable", ImmutableMap.of());
  }

  public static Command<AppManifest> getAppManifest() {
    return new Command<>("Page.getAppManifest", ImmutableMap.of(), map("url", AppManifest.class));
  }

  public static Command<List<String>> getInstallabilityErrors() {
    return new Command<>(
        "Page.getInstallabilityErrors",
        ImmutableMap.of(),
        map("errors", new TypeToken<List<String>>() {
        }.getType()));
  }

  /**
   * Returns all browser cookies. Depending on the backend support, will return detailed cookie
   * information in the cookies field.EXPERIMENTAL DEPRECATED Use {@link Network#getAllCookies()}
   */
  @Beta
  @Deprecated
  public static Command<List<Cookies>> getCookies() {
    return new Command<>(
        "Page.getCookies",
        ImmutableMap.of(),
        map("cookies", new TypeToken<List<Cookies>>() {
        }.getType()));
  }

  /**
   * Returns present frame tree structure.
   */
  public static Command<FrameTree> getFrameTree() {
    return new Command<>("Page.getFrameTree", ImmutableMap.of(), map("frameTree", FrameTree.class));
  }

  /**
   * Returns metrics relating to the layouting of the page, such as viewport bounds/scale.
   */
  public static Command<LayoutMetric> getLayoutMetrics() {
    return new Command<>(
        "Page.getLayoutMetrics", ImmutableMap.of(), map("layoutViewport", LayoutMetric.class));
  }

  /**
   * Returns navigation history for the current page.
   */
  public static Command<NavigationHistory> getNavigationHistory() {
    return new Command<>(
        "Page.getNavigationHistory",
        ImmutableMap.of(),
        map("currentIndex", NavigationHistory.class));
  }

  /**
   * Resets navigation history for the current page.
   */
  public static Command<Void> resetNavigationHistory() {
    return new Command<>("Page.resetNavigationHistory", ImmutableMap.of());
  }

  /**
   * Returns content of the given resource.EXPERIMENTAL
   */
  @Beta
  public static Command<ResourceContent> getResourceContent(FrameId frameId, String url) {
    Objects.requireNonNull(frameId, "frameId is required");
    Objects.requireNonNull(url, "url is required");
    return new Command<>(
        "Page.getResourceContent",
        ImmutableMap.of("frameId", frameId, "url", url),
        map("content", ResourceContent.class));
  }

  /**
   * Returns present frame / resource tree structure.EXPERIMENTAL
   */
  @Beta
  public static Command<FrameResourceTree> getResourceTree() {
    return new Command<>(
        "Page.getResourceTree", ImmutableMap.of(), map("franeTree", FrameResourceTree.class));
  }

  /**
   * Accepts or dismisses a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload).
   */
  public static Command<Void> handleJavaScriptDialog(boolean accept, Optional<String> prompt) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("accept", accept);
    prompt.ifPresent(p -> params.put("prompt", p));
    return new Command<>("Page.handleJavaScriptDialog", params.build());
  }

  /**
   * Navigates current page to the given URL.
   */
  public static Command<NavigateEntry> navigate(
      String url,
      Optional<String> referrer,
      Optional<TransitionType> transitionType,
      Optional<FrameId> frameId) {
    Objects.requireNonNull(url, "url is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("url", url);
    referrer.ifPresent(r -> params.put("referrer", r));
    transitionType.ifPresent(type -> params.put("transitionType", type));
    frameId.ifPresent(frame -> params.put("frameId", frame));
    return new Command<>("Page.navigate", params.build(), map("frameId", NavigateEntry.class));
  }

  /**
   * Navigates current page to the given history entry.
   */
  public static Command<Void> navigateToHistoryEntry(int entryId) {
    return new Command<>("Page.navigateToHistoryEntry", ImmutableMap.of("entryId", entryId));
  }

  /**
   * Print page as PDF.
   */
  public static Command<PrintToPDF> printToPDF(
      Optional<Boolean> landscape,
      Optional<Boolean> displayHeaderFooter,
      Optional<Boolean> printBackground,
      Optional<Double> scale,
      Optional<Double> paperWidth,
      Optional<Double> paperHeight,
      Optional<Double> marginTop,
      Optional<Double> marginBottom,
      Optional<Double> marginLeft,
      Optional<Double> marginRight,
      Optional<String> pageRanges,
      Optional<Boolean> ignoreInvalidPageRanges,
      Optional<String> headerTemplate,
      Optional<String> footerTemplate,
      Optional<Boolean> preferCSSPageSize,
      Optional<String> transferMode) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();

    params.put("landscape", landscape.orElse(false));
    params.put("displayHeaderFooter", displayHeaderFooter.orElse(false));
    params.put("printBackground", printBackground.orElse(false));
    params.put("scale", scale.orElse(1.0));
    params.put("paperWidth", paperWidth.orElse(8.5));
    params.put("paperHeight", paperHeight.orElse(11.0));
    params.put("marginTop", marginTop.orElse(0.4));
    params.put("marginBottom", marginBottom.orElse(0.4));
    params.put("marginLeft", marginLeft.orElse(0.4));
    params.put("marginRight", marginRight.orElse(0.4));
    params.put("ignoreInvalidPageRanges", ignoreInvalidPageRanges.orElse(false));
    params.put("preferCSSPageSize", preferCSSPageSize.orElse(false));
    pageRanges.ifPresent(pr -> params.put("pageRange", pr));
    headerTemplate.ifPresent(ht -> params.put("headerTemplate", "<span class=" + ht + "></span>"));
    footerTemplate.ifPresent(ft -> params.put("footerTemplate", "<span class=" + ft + "></span>"));
    transferMode.ifPresent(
        tm -> params.put("transferMode", TransferMode.getTransferMode(tm).name()));
    return new Command<>("Page.printToPDF", params.build(), map("data", PrintToPDF.class));
  }

  /**
   * Reloads given page optionally ignoring the cache.
   */
  public static Command<Void> reload(
      Optional<Boolean> ignoreCache, Optional<String> scriptToEvaluateOnLoad) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    ignoreCache.ifPresent(cache -> params.put("ignoreCache", cache));
    scriptToEvaluateOnLoad.ifPresent(eval -> params.put("scriptToEvaluateOnLoad", eval));
    return new Command<>("Page.reload", params.build());
  }

  /**
   * Deprecated, please use removeScriptToEvaluateOnNewDocument instead.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> removeScriptToEvaluateOnLoad(ScriptIdentifier identifier) {
    return new Command<>(
        "Page.removeScriptToEvaluateOnLoad", ImmutableMap.of("identifier", identifier));
  }

  /**
   * Removes given script from the list.
   */
  public static Command<Void> removeScriptToEvaluateOnNewDocument(ScriptIdentifier identifier) {
    return new Command<>(
        "Page.removeScriptToEvaluateOnNewDocument", ImmutableMap.of("identifier", identifier));
  }

  /**
   * Acknowledges that a screencast frame has been received by the frontend.EXPERIMENTAL.
   */
  @Beta
  public static Command<Void> screencastFrameAck(int sessionId) {
    return new Command<>("Page.screencastFrameAck", ImmutableMap.of("sessionId", sessionId));
  }

  /**
   * Searches for given string in resource content.EXPERIMENTAL
   */
  @Beta
  public static Command<List<SearchMatch>> searchInResource(
      FrameId frameId,
      String url,
      String query,
      Optional<Boolean> caseSensitive,
      Optional<Boolean> isRegex) {
    Objects.requireNonNull(frameId, "frameId is required");
    Objects.requireNonNull(url, "url is required");
    Objects.requireNonNull(query, "query is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("frameId", frameId);
    params.put("url", url);
    params.put("query", query);
    caseSensitive.ifPresent(c -> params.put("caseSensitive", c));
    isRegex.ifPresent(rgx -> params.put("isRegex", rgx));
    return new Command<>(
        "Page.searchInResource",
        params.build(),
        map("result", new TypeToken<List<SearchMatch>>() {
        }.getType()));
  }

  /**
   * Enable Chrome's experimental ad filter on all sites.EXPERIMENTAL
   */
  public static Command<Void> setAdBlockingEnabled(boolean enable) {
    return new Command<>("Page.setAdBlockingEnabled", ImmutableMap.of("enabled", enable));
  }

  /**
   * Enable page Content Security Policy by-passing.EXPERIMENTAL.
   */
  @Beta
  public static Command<Void> setBypassCSP(boolean enable) {
    return new Command<>("Page.setBypassCSP", ImmutableMap.of("enabled", enable));
  }

  /**
   * Overrides the values of device screen dimensions (window.screen.width, window.screen.height,
   * window.innerWidth, window.innerHeight, and "device-width"/"device-height"-related CSS media
   * query results).EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> setDeviceMetricsOverride(
      int width,
      int height,
      double deviceScaleFactor,
      boolean mobile,
      Optional<Double> scale,
      Optional<Integer> screenWidth,
      Optional<Integer> screenHeight,
      Optional<Integer> positionX,
      Optional<Integer> positionY,
      Optional<Boolean> dontSetVisibleSize,
      Optional<ScreenOrientation> screenOrientation,
      Optional<Viewport> viewport) {
    Objects.requireNonNull(deviceScaleFactor, "deviceScaleFactor is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("width", width);
    params.put("height", height);
    params.put("deviceScaleFactor", deviceScaleFactor);
    params.put("mobile", mobile);
    scale.ifPresent(s -> params.put("scale", s));
    screenWidth.ifPresent(s -> params.put("screenWidth", s));
    screenHeight.ifPresent(s -> params.put("screenHeight", s));
    positionX.ifPresent(p -> params.put("positionX", p));
    positionY.ifPresent(p -> params.put("positionY", p));
    dontSetVisibleSize.ifPresent(ds -> params.put("dontSetVisibleSize", ds));
    screenOrientation.ifPresent(s -> params.put("screenOrientation", s));
    viewport.ifPresent(v -> params.put("viewport", v));
    return new Command<>("Page.setDeviceMetricsOverride", params.build());
  }

  /**
   * Overrides the Device Orientation.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> setDeviceOrientationOverride(
      double alpha, double beta, double gamma) {
    return new Command<>(
        "Page.setDeviceOrientationOverride",
        ImmutableMap.of("alpha", alpha, "beta", beta, "gamma", gamma));
  }

  /**
   * Set generic font families.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> setFontFamilies(FontFamilies fontFamilies) {
    return new Command<>("Page.setFontFamilies", ImmutableMap.of("fontFamilies", fontFamilies));
  }

  /**
   * Set default font sizes.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> setFontSizes(FontSizes fontSizes) {
    return new Command<>("Page.setFontSizes", ImmutableMap.of("fontSizes", fontSizes));
  }

  /**
   * Sets given markup as the document's HTML.
   */
  public static Command<Void> setDocumentContent(FrameId frameId, String html) {
    return new Command<>(
        "Page.setDocumentContent", ImmutableMap.of("frameId", frameId, "html", html));
  }

  /**
   * Set the behavior when downloading a file.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> setDownloadBehavior(String behavior, String downloadPath) {
    Objects.requireNonNull(behavior, "behavior is required");
    Behavior.getBehavior(behavior);
    return new Command<>(
        "Page.setDownloadBehavior",
        ImmutableMap.of("behavior", behavior, "downloadPath", downloadPath));
  }

  /**
   * Overrides the Geolocation Position or Error. Omitting any of the parameters emulates position
   * unavailable. DEPRECATED
   */
  @Deprecated
  public static Command<Void> setGeolocationOverride(
      Double latitude, Double longitude, Double accuracy) {
    return new Command<>(
        "Page.setGeolocationOverride",
        ImmutableMap.of("latitude", latitude, "longitude", longitude, "accuracy", accuracy));
  }

  /**
   * Toggles mouse event-based touch event emulation.EXPERIMENTAL DEPRECATED
   */
  @Beta
  @Deprecated
  public static Command<Void> setTouchEmulationEnabled(
      boolean enabled, Optional<String> configuration) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("enabled", enabled);

    configuration.ifPresent(
        c -> {
          ConfigurationEnum.getConfiguration(c);
          params.put("configuration", configuration);
        });
    return new Command<>("Page.setTouchEmulationEnabled", params.build());
  }

  /**
   * Starts sending each frame using the screencastFrame event.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> startScreencast(
      Optional<String> format,
      Optional<Integer> quality,
      Optional<Integer> maxWidth,
      Optional<Integer> maxHeight,
      Optional<Integer> everyNthFrame) {
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    format.ifPresent(
        f -> {
          Format.getFormat(f);
          params.put("format", f);
        });
    quality.ifPresent(q -> params.put("quality", q));
    maxWidth.ifPresent(max -> params.put("maxWidth", max));
    maxHeight.ifPresent(max -> params.put("maxHeight", max));
    everyNthFrame.ifPresent(e -> params.put("everyNthFrame", e));
    return new Command<>("Page.startScreencast", params.build());
  }

  /**
   * Force the page stop all navigations and pending resource fetches.
   */
  public static Command<Void> stopLoading() {
    return new Command<>("Page.stopLoading", ImmutableMap.of());
  }

  /**
   * Crashes renderer on the IO thread, generates minidumps.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> crash() {
    return new Command<>("Page.crash", ImmutableMap.of());
  }

  /**
   * Tries to close page, running its beforeunload hooks, if any.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> close() {
    return new Command<>("Page.close", ImmutableMap.of());
  }

  /**
   * Tries to update the web lifecycle state of the page. It will transition the page to the given
   * state according to: https://github.com/WICG/web-lifecycle/EXPERIMENTAL.
   */
  @Beta
  public static Command<Void> setWebLifecycleState(String state) {
    Objects.requireNonNull(state, "state is required");
    WebLifecycleState.getWebLifecycleState(state);
    return new Command<>("Page.setWebLifecycleState", ImmutableMap.of("state", state));
  }

  /**
   * Stops sending each frame in the screencastFrame.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> stopScreencast() {
    return new Command<>("Page.stopScreencast", ImmutableMap.of());
  }

  /**
   * Forces compilation cache to be generated for every subresource script.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> setProduceCompilationCache(boolean enabled) {
    return new Command<>("Page.setProduceCompilationCache", ImmutableMap.of("enabled", enabled));
  }

  /**
   * Seeds compilation cache for given url. Compilation cache does not survive cross-process
   * navigation.EXPERIMENTAL
   */
  @Beta
  @Deprecated
  public static Command<Void> addCompilationCache(String data, String url) {
    Objects.requireNonNull(data, "data is required");
    Objects.requireNonNull(url, "url is required");
    return new Command<>("Page.addCompilationCache", ImmutableMap.of("data", data, "url", url));
  }

  /**
   * Clears seeded compilation cache.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> clearCompilationCache() {
    return new Command<>("Page.clearCompilationCache", ImmutableMap.of());
  }

  public static Command<Void> generateTestReport(String message, Optional<String> group) {
    Objects.requireNonNull(message, "data is required");
    final ImmutableMap.Builder<String, Object> params = ImmutableMap.builder();
    params.put("message", message);
    group.ifPresent(g -> params.put("group", g));
    return new Command<>("Page.generateTestReport", params.build());
  }

  /**
   * Pauses page execution. Can be resumed using generic
   * Runtime.runIfWaitingForDebugger.EXPERIMENTAL
   */
  @Beta
  public static Command<Void> waitForDebugger() {
    return new Command<>("Page.waitForDebugger", ImmutableMap.of());
  }

  public static Event<Instant> domContentEventFired() {
    return new Event<>("Page.domContentEventFired", map("timestampe", Instant.class));
  }

  /**
   * Fired when frame has been attached to its parent.
   */
  public static Event<FrameAttached> frameAttached() {
    return new Event<>("Page.frameAttached", map("frameId", FrameAttached.class));
  }

  /**
   * Fired when frame no longer has a scheduled navigation. DEPRECATED
   */
  @Deprecated
  public static Event<FrameId> frameClearedScheduledNavigation() {
    return new Event<>("Page.frameClearedScheduledNavigation", map("frameId", FrameId.class));
  }

  /**
   * Fired when frame has been detached from its parent.
   */
  public static Event<FrameId> frameDetached() {
    return new Event<>("Page.frameDetached", map("frameId", FrameId.class));
  }

  /**
   * Fired once navigation of the frame has completed. Frame is now associated with the new loader.
   */
  public static Event<FrameId> frameNavigated() {
    return new Event<>("Page.frameNavigated", map("frameId", FrameId.class));
  }

  /**
   * Fired when a renderer-initiated navigation is requested. Navigation may still be cancelled
   * after the event is issued.EXPERIMENTAL
   */
  @Beta
  public static Event<FrameRequestedNavigation> frameRequestedNavigation() {
    return new Event<>("Page,frameRequestedNavigation",
                       map("frameId", FrameRequestedNavigation.class));
  }

  /**
   * Fired when frame schedules a potential navigation. DEPRECATED
   */
  @Deprecated
  public static Event<FrameScheduledNavigation> frameScheduledNavigation() {
    return new Event<>("Page.frameScheduledNavigation",
                       map("frameId", FrameScheduledNavigation.class));
  }

  /**
   * Fired when frame has started loading.EXPERIMENTAL
   */
  @Beta
  public static Event<FrameId> frameStartedLoading() {
    return new Event<>("Page.frameStartedLoading", map("frameId", FrameId.class));
  }

  /**
   * Fired when frame has stopped loading.EXPERIMENTAL
   */
  @Beta
  public static Event<FrameId> frameStoppedLoading() {
    return new Event<>("Page.frameStoppedLoading", map("frameId", FrameId.class));
  }

  /**
   * Fired when page is about to start a download.EXPERIMENTAL
   */
  @Beta
  public static Event<DownloadWillBegin> downloadWillBegin() {
    return new Event<>("Page.downloadWillBegin", map("frameId", DownloadWillBegin.class));
  }

  /**
   * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) has been closed.
   */
  public static Event<JavascriptDialogClosed> javascriptDialogClosed() {
    return new Event<>("Page.javascriptDialogClosed", map("result", JavascriptDialogClosed.class));
  }

  /**
   * Fired when a JavaScript initiated dialog (alert, confirm, prompt, or onbeforeunload) is about
   * to open.
   */
  public static Event<JavascriptDialogOpening> javascriptDialogOpening() {
    return new Event<>("Page.javascriptDialogOpening", map("url", JavascriptDialogOpening.class));
  }

  /**
   * Fired for top level page lifecycle events such as navigation, load, paint, etc.@return
   */
  public static Event<LifecycleEvent> lifecycleEvent() {
    return new Event<>("Page.lifecycleEvent", map("frameId", LifecycleEvent.class));
  }

  public static Event<MonotonicTime> loadEventFired() {
    return new Event<>("Page.loadEventFired", map("timestamp", MonotonicTime.class));
  }

  /**
   * Fired when same-document navigation happens, e.g. due to history API usage or anchor
   * navigation.EXPERIMENTAL
   */
  @Beta
  public static Event<NavigatedWithinDocument> navigatedWithinDocument() {
    return new Event<>("Page.navigatedWithinDocument",
                       map("frameId", NavigatedWithinDocument.class));
  }

  /**
   * Compressed image data requested by the startScreencast.EXPERIMENTAL@return
   */
  @Beta
  public static Event<ScreencastFrame> screencastFrame() {
    return new Event<>("Page.screencastFrame", map("data", ScreencastFrame.class));
  }

  /**
   * Fired when the page with currently enabled screencast was shown or hidden `.EXPERIMENTAL@return
   */
  @Beta
  public static Event<Boolean> screencastVisibilityChanged() {
    return new Event<>("Page.screencastVisibilityChanged", map("visible", Boolean.class));
  }

  /**
   * Fired when a new window is going to be opened, via window.open(), link click, form submission,
   * etc.
   */
  public static Event<WindowOpen> windowOpen() {
    return new Event<>("Page.windowOpen", map("url", WindowOpen.class));
  }

  /**
   * Issued for every compilation cache generated. Is only available if
   * Page.setGenerateCompilationCache is enabled.EXPERIMENTAL
   */
  @Beta
  public static Event<CompilationCacheProduced> compilationCacheProduced() {
    return new Event<>("Page.compilationCacheProduced", map("url", CompilationCacheProduced.class));
  }
}
