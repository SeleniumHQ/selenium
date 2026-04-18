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

package org.openqa.selenium.bidi.browsingcontext;

import static java.util.Collections.emptyList;
import static java.util.Objects.requireNonNull;

import java.lang.reflect.Type;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;
import org.openqa.selenium.print.PrintOptions;

public class BrowsingContext {

  private static final Json JSON = new Json();

  private final String id;
  private final BiDi bidi;
  private static final String CONTEXT = "context";
  private static final String RELOAD = "browsingContext.reload";
  private static final String HANDLE_USER_PROMPT = "browsingContext.handleUserPrompt";

  private static final Function<JsonInput, String> browsingContextIdMapper =
      json -> {
        return json.readMap().getOrDefault(CONTEXT, "").toString();
      };

  private static final Function<JsonInput, NavigationResult> navigationInfoMapper =
      json -> (NavigationResult) json.readNonNull(NavigationResult.class);

  private static final Function<JsonInput, List<BrowsingContextInfo>>
      browsingContextInfoListMapper =
          json -> {
            Type type = new TypeToken<Map<String, List<BrowsingContextInfo>>>() {}.getType();
            Map<String, List<BrowsingContextInfo>> result = json.readNonNull(type);
            return result.getOrDefault("contexts", emptyList());
          };

  private static final Function<JsonInput, List<RemoteValue>> nodesMapper =
      json -> {
        Type type = new TypeToken<Map<String, List<RemoteValue>>>() {}.getType();
        Map<String, List<RemoteValue>> result = json.readNonNull(type);
        return result.get("nodes");
      };

  public BrowsingContext(WebDriver driver, String id) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing Context id", id);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    Require.precondition(!id.isEmpty(), "Browsing Context id cannot be empty");

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = id;
  }

  public BrowsingContext(WebDriver driver, WindowType type) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("WindowType", type);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(type);
  }

  public BrowsingContext(WebDriver driver, CreateContextParameters parameters) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("CreateContextParameters", parameters);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(parameters);
  }

  public String getId() {
    return this.id;
  }

  private String create(WindowType type) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.create", Map.of("type", type.toString()), browsingContextIdMapper));
  }

  private String create(CreateContextParameters parameters) {
    return this.bidi.send(
        new Command<>("browsingContext.create", parameters.toMap(), browsingContextIdMapper));
  }

  public NavigationResult navigate(String url) {
    return navigate(url, ReadinessState.NONE);
  }

  public NavigationResult navigate(String url, ReadinessState readinessState) {
    return this.bidi.send(navigateCommand(url, readinessState));
  }

  public NavigationResult navigate(String url, ReadinessState readinessState, Duration timeout) {
    return this.bidi.send(navigateCommand(url, readinessState), timeout);
  }

  private Command<NavigationResult> navigateCommand(String url, ReadinessState readinessState) {
    return new Command<>(
        "browsingContext.navigate",
        Map.of(CONTEXT, id, "url", url, "wait", readinessState.toString()),
        navigationInfoMapper);
  }

  public List<BrowsingContextInfo> getTree() {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree", Map.of("root", id), browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTree(String root) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree", Map.of("root", root), browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTree(int maxDepth) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree",
            Map.of(
                "root", id,
                "maxDepth", maxDepth),
            browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTree(String root, int maxDepth) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree",
            Map.of(
                "root", root,
                "maxDepth", maxDepth),
            browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTopLevelContexts() {
    return this.bidi.send(
        new Command<>("browsingContext.getTree", new HashMap<>(), browsingContextInfoListMapper));
  }

  public NavigationResult reload() {
    return this.bidi.send(new Command<>(RELOAD, Map.of(CONTEXT, id), navigationInfoMapper));
  }

  // Yet to be implemented by browser vendors
  private NavigationResult reload(boolean ignoreCache) {
    return this.bidi.send(
        new Command<>(
            RELOAD, Map.of(CONTEXT, id, "ignoreCache", ignoreCache), navigationInfoMapper));
  }

  // TODO: Handle timeouts in case of Readiness state "interactive" and "complete".
  // Refer https://github.com/w3c/webdriver-bidi/issues/188
  public NavigationResult reload(ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            RELOAD, Map.of(CONTEXT, id, "wait", readinessState.toString()), navigationInfoMapper));
  }

  // Yet to be implemented by browser vendors
  private NavigationResult reload(boolean ignoreCache, ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            RELOAD,
            Map.of(CONTEXT, id, "ignoreCache", ignoreCache, "wait", readinessState.toString()),
            navigationInfoMapper));
  }

  public void handleUserPrompt() {
    this.bidi.send(new Command<>(HANDLE_USER_PROMPT, Map.of(CONTEXT, id)));
  }

  public void handleUserPrompt(boolean accept) {
    this.bidi.send(new Command<>(HANDLE_USER_PROMPT, Map.of(CONTEXT, id, "accept", accept)));
  }

  public void handleUserPrompt(String userText) {
    this.bidi.send(new Command<>(HANDLE_USER_PROMPT, Map.of(CONTEXT, id, "userText", userText)));
  }

  public void handleUserPrompt(boolean accept, String userText) {
    this.bidi.send(
        new Command<>(
            HANDLE_USER_PROMPT, Map.of(CONTEXT, id, "accept", accept, "userText", userText)));
  }

  public String captureScreenshot() {
    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            Map.of(CONTEXT, id),
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public String captureScreenshot(CaptureScreenshotParameters parameters) {
    Map<String, Object> params = new HashMap<>();
    params.put(CONTEXT, id);
    params.putAll(parameters.toMap());

    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            params,
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public String captureBoxScreenshot(double x, double y, double width, double height) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            Map.of(
                CONTEXT,
                id,
                "clip",
                Map.of(
                    "type", "box",
                    "x", x,
                    "y", y,
                    "width", width,
                    "height", height)),
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public String captureElementScreenshot(String elementId) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            Map.of(
                CONTEXT,
                id,
                "clip",
                Map.of("type", "element", "element", Map.of("sharedId", elementId))),
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public String captureElementScreenshot(String elementId, String handle) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            Map.of(
                CONTEXT,
                id,
                "clip",
                Map.of(
                    "type", "element", "element", Map.of("sharedId", elementId, "handle", handle))),
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public void setViewport(int width, int height) {
    setViewport((double) width, (double) height);
  }

  public void setViewport(int width, int height, double devicePixelRatio) {
    setViewport((double) width, (double) height, devicePixelRatio);
  }

  /**
   * Set viewport size to given width and height (aka "mobile emulation" mode).
   *
   * <p>If both {@code width} and {@code height} are null, then resets viewport to the initial size
   * (aka "desktop" mode).
   *
   * @param width null or positive
   * @param height null or positive
   */
  public void setViewport(@Nullable Double width, @Nullable Double height) {
    validate(width, height);

    Map<String, @Nullable Object> params = new HashMap<>();
    params.put(CONTEXT, id);
    params.put(
        "viewport",
        width == null ? null : Map.of("width", width, "height", requireNonNull(height)));
    this.bidi.send(new Command<>("browsingContext.setViewport", params));
  }

  /**
   * Set viewport's size and pixel ratio (aka "mobile emulation" mode).
   *
   * <p>If both {@code width} and {@code height} are null then resets viewport to the initial size
   * (aka "desktop" mode).
   *
   * <p>If {@code devicePixelRatio} is null then resets DPR to browser’s default DPR (usually 1.0 on
   * desktop).
   *
   * @param width null or positive
   * @param height null or positive
   * @param devicePixelRatio null or positive
   */
  public void setViewport(
      @Nullable Double width, @Nullable Double height, @Nullable Double devicePixelRatio) {
    validate(width, height);
    validate(devicePixelRatio);

    Map<String, @Nullable Object> params = new HashMap<>();
    params.put(CONTEXT, id);
    params.put(
        "viewport",
        width == null ? null : Map.of("width", width, "height", requireNonNull(height)));
    params.put("devicePixelRatio", devicePixelRatio);
    this.bidi.send(new Command<>("browsingContext.setViewport", params));
  }

  private void validate(@Nullable Double width, @Nullable Double height) {
    if (width != null || height != null) {
      Require.positive("Viewport width", width);
      Require.positive("Viewport height", height);
    }
  }

  private void validate(@Nullable Double devicePixelRatio) {
    if (devicePixelRatio != null) {
      Require.positive("Device pixel ratio.", devicePixelRatio);
    }
  }

  public void activate() {
    this.bidi.send(new Command<>("browsingContext.activate", Map.of(CONTEXT, id)));
  }

  public String print(PrintOptions printOptions) {
    Map<String, Object> printOptionsParams = printOptions.toMap();
    printOptionsParams.put(CONTEXT, id);

    return this.bidi.send(
        new Command<>(
            "browsingContext.print",
            printOptionsParams,
            jsonInput -> {
              return (String) jsonInput.readMap().get("data");
            }));
  }

  public void traverseHistory(long delta) {
    this.bidi.send(
        new Command<>("browsingContext.traverseHistory", Map.of(CONTEXT, id, "delta", delta)));
  }

  public void back() {
    this.traverseHistory(-1);
  }

  public void forward() {
    this.traverseHistory(1);
  }

  public List<RemoteValue> locateNodes(LocateNodeParameters parameters) {
    Map<String, Object> params = new HashMap<>(parameters.toMap());
    params.put("context", id);
    return this.bidi.send(new Command<>("browsingContext.locateNodes", params, nodesMapper));
  }

  public List<RemoteValue> locateNodes(Locator locator) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.locateNodes",
            Map.of("context", id, "locator", locator.toMap()),
            nodesMapper));
  }

  public RemoteValue locateNode(Locator locator) {
    List<RemoteValue> remoteValues =
        this.bidi.send(
            new Command<>(
                "browsingContext.locateNodes",
                Map.of("context", id, "locator", locator.toMap(), "maxNodeCount", 1),
                nodesMapper));

    return remoteValues.get(0);
  }

  public void close() {
    // This might need more clean up actions once the behavior is defined.
    // Specially when last tab or window is closed.
    // Refer: https://github.com/w3c/webdriver-bidi/issues/187
    this.bidi.send(new Command<>("browsingContext.close", Map.of(CONTEXT, id)));
  }
}
