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

import com.google.common.collect.ImmutableMap;
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
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class BrowsingContext {

  private final String id;
  private final BiDi bidi;
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

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = id;
  }

  public BrowsingContext(WebDriver driver, WindowType type) {
    Require.nonNull("WebDriver", driver);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(type);
  }

  public BrowsingContext(WebDriver driver, WindowType type, String referenceContextId) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Reference browsing context id", referenceContextId);
    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.id = this.create(type, referenceContextId);
  }

  public String getId() {
    return this.id;
  }

  private String create(WindowType type) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.create",
            ImmutableMap.of("type", type.toString()),
            browsingContextIdMapper));
  }

  private String create(WindowType type, String referenceContext) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.create",
            ImmutableMap.of("type", type.toString(), "referenceContext", referenceContext),
            browsingContextIdMapper));
  }

  public NavigationResult navigate(String url) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.navigate",
            ImmutableMap.of(CONTEXT, id, "url", url),
            navigationInfoMapper));
  }

  public NavigationResult navigate(String url, ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.navigate",
            ImmutableMap.of(CONTEXT, id, "url", url, "wait", readinessState.toString()),
            navigationInfoMapper));
  }

  public List<BrowsingContextInfo> getTree() {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree", ImmutableMap.of("root", id), browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTree(int maxDepth) {
    return this.bidi.send(
        new Command<>(
            "browsingContext.getTree",
            ImmutableMap.of(
                "root", id,
                "maxDepth", maxDepth),
            browsingContextInfoListMapper));
  }

  public List<BrowsingContextInfo> getTopLevelContexts() {
    return this.bidi.send(
        new Command<>("browsingContext.getTree", new HashMap<>(), browsingContextInfoListMapper));
  }

  public NavigationResult reload() {
    return this.bidi.send(
        new Command<>(RELOAD, ImmutableMap.of(CONTEXT, id), navigationInfoMapper));
  }

  // Yet to be implemented by browser vendors
  private NavigationResult reload(boolean ignoreCache) {
    return this.bidi.send(
        new Command<>(
            RELOAD,
            ImmutableMap.of(CONTEXT, id, "ignoreCache", ignoreCache),
            navigationInfoMapper));
  }

  // TODO: Handle timeouts in case of Readiness state "interactive" and "complete".
  // Refer https://github.com/w3c/webdriver-bidi/issues/188
  public NavigationResult reload(ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            RELOAD,
            ImmutableMap.of(CONTEXT, id, "wait", readinessState.toString()),
            navigationInfoMapper));
  }

  // Yet to be implemented by browser vendors
  private NavigationResult reload(boolean ignoreCache, ReadinessState readinessState) {
    return this.bidi.send(
        new Command<>(
            RELOAD,
            ImmutableMap.of(
                CONTEXT, id, "ignoreCache", ignoreCache, "wait", readinessState.toString()),
            navigationInfoMapper));
  }

  public void handleUserPrompt() {
    this.bidi.send(new Command<>(HANDLE_USER_PROMPT, ImmutableMap.of(CONTEXT, id)));
  }

  public void handleUserPrompt(boolean accept) {
    this.bidi.send(
        new Command<>(HANDLE_USER_PROMPT, ImmutableMap.of(CONTEXT, id, "accept", accept)));
  }

  public void handleUserPrompt(String userText) {
    this.bidi.send(
        new Command<>(HANDLE_USER_PROMPT, ImmutableMap.of(CONTEXT, id, "userText", userText)));
  }

  public void handleUserPrompt(boolean accept, String userText) {
    this.bidi.send(
        new Command<>(
            HANDLE_USER_PROMPT,
            ImmutableMap.of(CONTEXT, id, "accept", accept, "userText", userText)));
  }

  public String captureScreenshot() {
    return this.bidi.send(
        new Command<>(
            "browsingContext.captureScreenshot",
            ImmutableMap.of(CONTEXT, id),
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("data");
            }));
  }

  public void close() {
    // This might need more clean up actions once the behavior is defined.
    // Specially when last tab or window is closed.
    // Refer: https://github.com/w3c/webdriver-bidi/issues/187
    this.bidi.send(new Command<>("browsingContext.close", ImmutableMap.of(CONTEXT, id)));
  }
}
