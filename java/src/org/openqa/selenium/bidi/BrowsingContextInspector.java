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

package org.openqa.selenium.bidi;

import java.io.StringReader;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContextInfo;
import org.openqa.selenium.bidi.browsingcontext.NavigationInfo;
import org.openqa.selenium.bidi.browsingcontext.UserPromptClosed;
import org.openqa.selenium.bidi.browsingcontext.UserPromptOpened;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class BrowsingContextInspector implements AutoCloseable {

  private static final Json JSON = new Json();

  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  private final Function<Map<String, Object>, BrowsingContextInfo> browsingContextInfoMapper =
      params -> {
        try (StringReader reader = new StringReader(JSON.toJson(params));
            JsonInput input = JSON.newInput(reader)) {
          return input.read(BrowsingContextInfo.class);
        }
      };

  private final Function<Map<String, Object>, NavigationInfo> navigationInfoMapper =
      params -> {
        try (StringReader reader = new StringReader(JSON.toJson(params));
            JsonInput input = JSON.newInput(reader)) {
          return input.read(NavigationInfo.class);
        }
      };

  private final Event<BrowsingContextInfo> browsingContextCreated =
      new Event<>("browsingContext.contextCreated", browsingContextInfoMapper);

  private final Event<BrowsingContextInfo> browsingContextDestroyed =
      new Event<>("browsingContext.contextDestroyed", browsingContextInfoMapper);

  private final Event<UserPromptClosed> userPromptClosed =
      new Event<>(
          "browsingContext.userPromptClosed",
          params -> {
            try (StringReader reader = new StringReader(JSON.toJson(params));
                JsonInput input = JSON.newInput(reader)) {
              return input.read(UserPromptClosed.class);
            }
          });

  private final Set<Event<NavigationInfo>> navigationEventSet = new HashSet<>();

  private final Event<UserPromptOpened> userPromptOpened =
      new Event<>(
          "browsingContext.userPromptOpened",
          params -> {
            try (StringReader reader = new StringReader(JSON.toJson(params));
                JsonInput input = JSON.newInput(reader)) {
              return input.read(UserPromptOpened.class);
            }
          });

  public BrowsingContextInspector(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public BrowsingContextInspector(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public BrowsingContextInspector(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }

  public void onBrowsingContextCreated(Consumer<BrowsingContextInfo> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(browsingContextCreated, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, browsingContextCreated, consumer);
    }
  }

  private void onBrowsingContextDestroyed(Consumer<BrowsingContextInfo> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(browsingContextDestroyed, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, browsingContextDestroyed, consumer);
    }
  }

  private void onNavigationStarted(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.navigationStarted", consumer);
  }

  private void onFragmentNavigated(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.fragmentNavigated", consumer);
  }

  public void onDomContentLoaded(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.domContentLoaded", consumer);
  }

  public void onBrowsingContextLoaded(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.load", consumer);
  }

  private void onDownloadWillBegin(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.downloadWillBegin", consumer);
  }

  private void onNavigationAborted(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.navigationAborted", consumer);
  }

  private void onNavigationFailed(Consumer<NavigationInfo> consumer) {
    addNavigationEventListener("browsingContext.navigationFailed", consumer);
  }

  private void onUserPromptClosed(Consumer<UserPromptClosed> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(userPromptClosed, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, userPromptClosed, consumer);
    }
  }

  private void onUserPromptOpened(Consumer<UserPromptOpened> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(userPromptOpened, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, userPromptOpened, consumer);
    }
  }

  private void addNavigationEventListener(String name, Consumer<NavigationInfo> consumer) {
    Event<NavigationInfo> navigationEvent = new Event<>(name, navigationInfoMapper);

    navigationEventSet.add(navigationEvent);

    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(navigationEvent, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, navigationEvent, consumer);
    }
  }

  @Override
  public void close() {
    this.bidi.clearListener(browsingContextCreated);
    this.bidi.clearListener(browsingContextDestroyed);
    this.bidi.clearListener(userPromptOpened);
    this.bidi.clearListener(userPromptClosed);

    navigationEventSet.forEach(this.bidi::clearListener);
  }
}
