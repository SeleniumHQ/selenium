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

import java.io.StringReader;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
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
  private final WebDriver driver;
  private static final String CONTEXT = "context";
  private static final String RELOAD = "browsingContext.reload";
  private static final String HANDLE_USER_PROMPT = "browsingContext.handleUserPrompt";

  protected static final Type LIST_OF_BROWSING_CONTEXT_INFO =
      new TypeToken<List<BrowsingContextInfo>>() {}.getType();

  private final Function<JsonInput, String> browsingContextIdMapper =
      jsonInput -> {
        Map<String, Object> result = jsonInput.read(Map.class);
        return result.getOrDefault(CONTEXT, "").toString();
      };

  private final Function<JsonInput, NavigationResult> navigationInfoMapper =
      jsonInput -> (NavigationResult) jsonInput.read(NavigationResult.class);

  private final Function<JsonInput, List<BrowsingContextInfo>> browsingContextInfoListMapper =
      jsonInput -> {
        Map<String, Object> result = jsonInput.read(Map.class);
        List<Object> contexts = (List<Object>) result.getOrDefault("contexts", new ArrayList<>());

        if (contexts.isEmpty()) {
          return new ArrayList<>();
        }

        Json json = new Json();
        String dtr = json.toJson(contexts);

        return json.toType(dtr, LIST_OF_BROWSING_CONTEXT_INFO);
      };

  public BrowsingContext(WebDriver driver, String id) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing Context id", id);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    Require.precondition(!id.isEmpty(), "Browsing Context id cannot be empty");

    this.driver = driver;
    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = id;
  }

  public BrowsingContext(WebDriver driver, WindowType type) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.driver = driver;
    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(type);
  }

  /*
   * @deprecated
   * Use {@link #BrowsingContext(WebDriver, CreateParameters)} instead.
   */
  @Deprecated
  public BrowsingContext(WebDriver driver, WindowType type, String referenceContextId) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Reference browsing context id", referenceContextId);

    Require.precondition(!referenceContextId.isEmpty(), "Reference Context id cannot be empty");

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.driver = driver;
    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(new CreateContextParameters(type).referenceContext(referenceContextId));
  }

  public BrowsingContext(WebDriver driver, CreateContextParameters parameters) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.driver = driver;
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
    return this.bidi.send(
        new Command<>(
            "browsingContext.navigate", Map.of(CONTEXT, id, "url", url), navigationInfoMapper));
  }

  public NavigationResult navigate(String url, ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.navigate",
            Map.of(CONTEXT, id, "url", url, "wait", readinessState.toString()),
            navigationInfoMapper));
  }

  public List<BrowsingContextInfo> getTree() {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree", Map.of("root", id), browsingContextInfoListMapper));
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
            }));
  }

  public void setViewport(double width, double height) {
    Require.positive("Viewport width", width);
    Require.positive("Viewport height", height);

    this.bidi.send(
        new Command<>(
            "browsingContext.setViewport",
            Map.of(CONTEXT, id, "viewport", Map.of("width", width, "height", height))));
  }

  public void setViewport(double width, double height, double devicePixelRatio) {
    Require.positive("Viewport width", width);
    Require.positive("Viewport height", height);
    Require.positive("Device pixel ratio.", devicePixelRatio);

    this.bidi.send(
        new Command<>(
            "browsingContext.setViewport",
            Map.of(
                CONTEXT,
                id,
                "viewport",
                Map.of("width", width, "height", height),
                "devicePixelRatio",
                devicePixelRatio)));
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
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
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
    return this.bidi.send(
        new Command<>(
            "browsingContext.locateNodes",
            params,
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              try (StringReader reader = new StringReader(JSON.toJson(result.get("nodes")));
                  JsonInput input = JSON.newInput(reader)) {
                return input.read(new TypeToken<List<RemoteValue>>() {}.getType());
              }
            }));
  }

  public List<RemoteValue> locateNodes(Locator locator) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.locateNodes",
            Map.of("context", id, "locator", locator.toMap()),
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              try (StringReader reader = new StringReader(JSON.toJson(result.get("nodes")));
                  JsonInput input = JSON.newInput(reader)) {
                return input.read(new TypeToken<List<RemoteValue>>() {}.getType());
              }
            }));
  }

  public RemoteValue locateNode(Locator locator) {
    List<RemoteValue> remoteValues =
        this.bidi.send(
            new Command<>(
                "browsingContext.locateNodes",
                Map.of("context", id, "locator", locator.toMap(), "maxNodeCount", 1),
                jsonInput -> {
                  Map<String, Object> result = jsonInput.read(Map.class);
                  try (StringReader reader = new StringReader(JSON.toJson(result.get("nodes")));
                      JsonInput input = JSON.newInput(reader)) {
                    return input.read(new TypeToken<List<RemoteValue>>() {}.getType());
                  }
                }));

    return remoteValues.get(0);
  }

  public void close() {
    // This might need more clean up actions once the behavior is defined.
    // Specially when last tab or window is closed.
    // Refer: https://github.com/w3c/webdriver-bidi/issues/187
    this.bidi.send(new Command<>("browsingContext.close", Map.of(CONTEXT, id)));
  }
}
