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

package org.openqa.selenium.bidi.module;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import org.openqa.selenium.UsernameAndPassword;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.Event;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.BeforeRequestSent;
import org.openqa.selenium.bidi.network.ContinueRequestParameters;
import org.openqa.selenium.bidi.network.ContinueResponseParameters;
import org.openqa.selenium.bidi.network.FetchError;
import org.openqa.selenium.bidi.network.ProvideResponseParameters;
import org.openqa.selenium.bidi.network.ResponseDetails;
import org.openqa.selenium.internal.Require;

public class Network implements AutoCloseable {

  private final Set<String> browsingContextIds;

  private final BiDi bidi;

  private final Event<BeforeRequestSent> beforeRequestSentEvent =
      new Event<>("network.beforeRequestSent", BeforeRequestSent::fromJsonMap);

  private final Event<FetchError> fetchErrorEvent =
      new Event<>("network.fetchError", FetchError::fromJsonMap);

  private final Event<ResponseDetails> responseStarted =
      new Event<>("network.responseStarted", ResponseDetails::fromJsonMap);

  private final Event<ResponseDetails> responseCompleted =
      new Event<>("network.responseCompleted", ResponseDetails::fromJsonMap);

  private final Event<ResponseDetails> authRequired =
      new Event<>("network.authRequired", ResponseDetails::fromJsonMap);

  public Network(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public Network(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public Network(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }

  public String addIntercept(AddInterceptParameters parameters) {
    return this.bidi.send(
        new Command<>(
            "network.addIntercept",
            parameters.toMap(),
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return (String) result.get("intercept");
            }));
  }

  public void removeIntercept(String interceptId) {
    this.bidi.send(new Command<>("network.removeIntercept", Map.of("intercept", interceptId)));
  }

  public void continueWithAuth(String requestId, UsernameAndPassword usernameAndPassword) {
    this.bidi.send(
        new Command<>(
            "network.continueWithAuth",
            Map.of(
                "request",
                requestId,
                "action",
                "provideCredentials",
                "credentials",
                Map.of(
                    "type", "password",
                    "username", usernameAndPassword.username(),
                    "password", usernameAndPassword.password()))));
  }

  public void continueWithAuthNoCredentials(String requestId) {
    this.bidi.send(
        new Command<>(
            "network.continueWithAuth", Map.of("request", requestId, "action", "default")));
  }

  public void cancelAuth(String requestId) {
    this.bidi.send(
        new Command<>(
            "network.continueWithAuth", Map.of("request", requestId, "action", "cancel")));
  }

  public void failRequest(String requestId) {
    this.bidi.send(new Command<>("network.failRequest", Map.of("request", requestId)));
  }

  public void continueRequest(ContinueRequestParameters parameters) {
    this.bidi.send(new Command<>("network.continueRequest", parameters.toMap()));
  }

  public void continueResponse(ContinueResponseParameters parameters) {
    this.bidi.send(new Command<>("network.continueResponse", parameters.toMap()));
  }

  public void provideResponse(ProvideResponseParameters parameters) {
    this.bidi.send(new Command<>("network.provideResponse", parameters.toMap()));
  }

  public void onBeforeRequestSent(Consumer<BeforeRequestSent> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(beforeRequestSentEvent, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, beforeRequestSentEvent, consumer);
    }
  }

  public void onFetchError(Consumer<FetchError> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(fetchErrorEvent, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, fetchErrorEvent, consumer);
    }
  }

  public void onResponseStarted(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(responseStarted, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, responseStarted, consumer);
    }
  }

  public void onResponseCompleted(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(responseCompleted, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, responseCompleted, consumer);
    }
  }

  public long onAuthRequired(Consumer<ResponseDetails> consumer) {
    if (browsingContextIds.isEmpty()) {
      return this.bidi.addListener(authRequired, consumer);
    } else {
      return this.bidi.addListener(browsingContextIds, authRequired, consumer);
    }
  }

  @Override
  public void close() {
    this.bidi.clearListener(beforeRequestSentEvent);
    this.bidi.clearListener(responseStarted);
    this.bidi.clearListener(responseCompleted);
    this.bidi.clearListener(authRequired);
  }
}
