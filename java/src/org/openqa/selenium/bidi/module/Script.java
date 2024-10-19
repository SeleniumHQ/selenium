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

import java.io.Closeable;
import java.io.StringReader;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;
import java.util.function.Function;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.Command;
import org.openqa.selenium.bidi.Event;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.script.*;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.TypeToken;

public class Script implements Closeable {
  private final Set<String> browsingContextIds;

  private static final Json JSON = new Json();

  private final BiDi bidi;

  private final Function<JsonInput, EvaluateResult> evaluateResultMapper =
      jsonInput -> createEvaluateResult(jsonInput.read(Map.class));

  private final Function<JsonInput, List<RealmInfo>> realmInfoMapper =
      jsonInput -> {
        Map<String, Object> response = jsonInput.read(Map.class);
        try (StringReader reader = new StringReader(JSON.toJson(response.get("realms")));
            JsonInput input = JSON.newInput(reader)) {
          return input.read(new TypeToken<List<RealmInfo>>() {}.getType());
        }
      };

  private final Event<Message> messageEvent =
      new Event<>(
          "script.message",
          params -> {
            try (StringReader reader = new StringReader(JSON.toJson(params));
                JsonInput input = JSON.newInput(reader)) {
              return input.read(Message.class);
            }
          });

  private final Event<RealmInfo> realmCreated =
      new Event<>(
          "script.realmCreated",
          params -> {
            try (StringReader reader = new StringReader(JSON.toJson(params));
                JsonInput input = JSON.newInput(reader)) {
              return input.read(RealmInfo.class);
            }
          });

  private final Event<RealmInfo> realmDestroyed =
      new Event<>(
          "script.realmDestroyed",
          params -> {
            try (StringReader reader = new StringReader(JSON.toJson(params));
                JsonInput input = JSON.newInput(reader)) {
              return input.read(RealmInfo.class);
            }
          });

  public Script(WebDriver driver) {
    this(new HashSet<>(), driver);
  }

  public Script(String browsingContextId, WebDriver driver) {
    this(Collections.singleton(Require.nonNull("Browsing context id", browsingContextId)), driver);
  }

  public Script(Set<String> browsingContextIds, WebDriver driver) {
    Require.nonNull("WebDriver", driver);
    Require.nonNull("Browsing context id list", browsingContextIds);

    if (!(driver instanceof HasBiDi)) {
      throw new IllegalArgumentException("WebDriver instance must support BiDi protocol");
    }

    this.bidi = ((HasBiDi) driver).getBiDi();
    this.browsingContextIds = browsingContextIds;
  }

  public EvaluateResult callFunction(CallFunctionParameters parameters) {
    return this.bidi.send(
        new Command<>("script.callFunction", parameters.toMap(), evaluateResultMapper));
  }

  public EvaluateResult callFunctionInRealm(
      String realmId,
      String functionDeclaration,
      boolean awaitPromise,
      Optional<List<LocalValue>> arguments,
      Optional<LocalValue> thisParameter,
      Optional<ResultOwnership> resultOwnership) {
    Map<String, Object> params =
        getCallFunctionParams(
            "realm",
            realmId,
            null,
            functionDeclaration,
            awaitPromise,
            arguments,
            thisParameter,
            resultOwnership);

    return this.bidi.send(new Command<>("script.callFunction", params, evaluateResultMapper));
  }

  public EvaluateResult callFunctionInBrowsingContext(
      String browsingContextId,
      String functionDeclaration,
      boolean awaitPromise,
      Optional<List<LocalValue>> argumentValueList,
      Optional<LocalValue> thisParameter,
      Optional<ResultOwnership> resultOwnership) {
    return this.callFunctionInBrowsingContext(
        browsingContextId,
        null,
        functionDeclaration,
        awaitPromise,
        argumentValueList,
        thisParameter,
        resultOwnership);
  }

  public EvaluateResult callFunctionInBrowsingContext(
      String browsingContextId,
      String sandbox,
      String functionDeclaration,
      boolean awaitPromise,
      Optional<List<LocalValue>> argumentValueList,
      Optional<LocalValue> thisParameter,
      Optional<ResultOwnership> resultOwnership) {

    Map<String, Object> params =
        getCallFunctionParams(
            "contextTarget",
            browsingContextId,
            sandbox,
            functionDeclaration,
            awaitPromise,
            argumentValueList,
            thisParameter,
            resultOwnership);

    return this.bidi.send(new Command<>("script.callFunction", params, evaluateResultMapper));
  }

  public EvaluateResult evaluateFunction(EvaluateParameters parameters) {
    return this.bidi.send(
        new Command<>("script.evaluate", parameters.toMap(), evaluateResultMapper));
  }

  public EvaluateResult evaluateFunctionInRealm(
      String realmId,
      String expression,
      boolean awaitPromise,
      Optional<ResultOwnership> resultOwnership) {
    Map<String, Object> params =
        getEvaluateParams("realm", realmId, null, expression, awaitPromise, resultOwnership);

    return this.bidi.send(new Command<>("script.evaluate", params, evaluateResultMapper));
  }

  public EvaluateResult evaluateFunctionInBrowsingContext(
      String browsingContextId,
      String expression,
      boolean awaitPromise,
      Optional<ResultOwnership> resultOwnership) {
    return this.evaluateFunctionInBrowsingContext(
        browsingContextId, null, expression, awaitPromise, resultOwnership);
  }

  public EvaluateResult evaluateFunctionInBrowsingContext(
      String browsingContextId,
      String sandbox,
      String expression,
      boolean awaitPromise,
      Optional<ResultOwnership> resultOwnership) {
    Map<String, Object> params =
        getEvaluateParams(
            "contextTarget", browsingContextId, sandbox, expression, awaitPromise, resultOwnership);

    return this.bidi.send(new Command<>("script.evaluate", params, evaluateResultMapper));
  }

  public void disownRealmScript(String realmId, List<String> handles) {
    this.bidi.send(
        new Command<>(
            "script.disown", Map.of("handles", handles, "target", Map.of("realm", realmId))));
  }

  public void disownBrowsingContextScript(String browsingContextId, List<String> handles) {
    this.bidi.send(
        new Command<>(
            "script.disown",
            Map.of("handles", handles, "target", Map.of("context", browsingContextId))));
  }

  public void disownBrowsingContextScript(
      String browsingContextId, String sandbox, List<String> handles) {
    this.bidi.send(
        new Command<>(
            "script.disown",
            Map.of(
                "handles",
                handles,
                "target",
                Map.of(
                    "context", browsingContextId,
                    "sandbox", sandbox))));
  }

  public List<RealmInfo> getAllRealms() {
    return this.bidi.send(new Command<>("script.getRealms", new HashMap<>(), realmInfoMapper));
  }

  public List<RealmInfo> getRealmsByType(RealmType type) {
    return this.bidi.send(
        new Command<>("script.getRealms", Map.of("type", type.toString()), realmInfoMapper));
  }

  public List<RealmInfo> getRealmsInBrowsingContext(String browsingContext) {
    return this.bidi.send(
        new Command<>("script.getRealms", Map.of("context", browsingContext), realmInfoMapper));
  }

  public List<RealmInfo> getRealmsInBrowsingContextByType(String browsingContext, RealmType type) {
    return this.bidi.send(
        new Command<>(
            "script.getRealms",
            Map.of("context", browsingContext, "type", type.toString()),
            realmInfoMapper));
  }

  public String addPreloadScript(String functionDeclaration) {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("functionDeclaration", functionDeclaration);

    if (!browsingContextIds.isEmpty()) {
      parameters.put("contexts", this.browsingContextIds);
    }

    return this.bidi.send(
        new Command<>(
            "script.addPreloadScript",
            parameters,
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return result.get("script").toString();
            }));
  }

  public String addPreloadScript(String functionDeclaration, List<ChannelValue> arguments) {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("functionDeclaration", functionDeclaration);
    parameters.put("arguments", arguments);

    if (!browsingContextIds.isEmpty()) {
      parameters.put("contexts", this.browsingContextIds);
    }

    return this.bidi.send(
        new Command<>(
            "script.addPreloadScript",
            parameters,
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return result.get("script").toString();
            }));
  }

  public String addPreloadScript(String functionDeclaration, String sandbox) {

    Map<String, Object> parameters = new HashMap<>();
    parameters.put("functionDeclaration", functionDeclaration);
    parameters.put("sandbox", sandbox);

    if (!browsingContextIds.isEmpty()) {
      parameters.put("contexts", this.browsingContextIds);
    }

    return this.bidi.send(
        new Command<>(
            "script.addPreloadScript",
            parameters,
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return result.get("script").toString();
            }));
  }

  public String addPreloadScript(
      String functionDeclaration, List<ChannelValue> arguments, String sandbox) {
    Map<String, Object> parameters = new HashMap<>();
    parameters.put("functionDeclaration", functionDeclaration);
    parameters.put("arguments", arguments);
    parameters.put("sandbox", sandbox);

    if (!browsingContextIds.isEmpty()) {
      parameters.put("contexts", this.browsingContextIds);
    }

    return this.bidi.send(
        new Command<>(
            "script.addPreloadScript",
            parameters,
            jsonInput -> {
              Map<String, Object> result = jsonInput.read(Map.class);
              return result.get("script").toString();
            }));
  }

  public void removePreloadScript(String id) {
    this.bidi.send(new Command<>("script.removePreloadScript", Map.of("script", id)));
  }

  public long onMessage(Consumer<Message> consumer) {
    if (browsingContextIds.isEmpty()) {
      return this.bidi.addListener(messageEvent, consumer);
    } else {
      return this.bidi.addListener(browsingContextIds, messageEvent, consumer);
    }
  }

  public void onRealmCreated(Consumer<RealmInfo> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(realmCreated, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, realmCreated, consumer);
    }
  }

  public void onRealmDestroyed(Consumer<RealmInfo> consumer) {
    if (browsingContextIds.isEmpty()) {
      this.bidi.addListener(realmDestroyed, consumer);
    } else {
      this.bidi.addListener(browsingContextIds, realmDestroyed, consumer);
    }
  }

  private Map<String, Object> getCallFunctionParams(
      String targetType,
      String id,
      String sandbox,
      String functionDeclaration,
      boolean awaitPromise,
      Optional<List<LocalValue>> argumentValueList,
      Optional<LocalValue> thisParameter,
      Optional<ResultOwnership> resultOwnership) {
    Map<String, Object> params = new HashMap<>();
    params.put("functionDeclaration", functionDeclaration);
    params.put("awaitPromise", awaitPromise);
    if (targetType.equals("contextTarget")) {
      if (sandbox != null) {
        params.put("target", Map.of("context", id, "sandbox", sandbox));
      } else {
        params.put("target", Map.of("context", id));
      }
    } else {
      params.put("target", Map.of("realm", id));
    }

    argumentValueList.ifPresent(argumentValues -> params.put("arguments", argumentValues));

    thisParameter.ifPresent(value -> params.put("this", value));

    resultOwnership.ifPresent(value -> params.put("resultOwnership", value.toString()));

    return params;
  }

  private Map<String, Object> getEvaluateParams(
      String targetType,
      String id,
      String sandbox,
      String expression,
      boolean awaitPromise,
      Optional<ResultOwnership> resultOwnership) {
    Map<String, Object> params = new HashMap<>();
    params.put("expression", expression);
    params.put("awaitPromise", awaitPromise);
    if (targetType.equals("contextTarget")) {
      if (sandbox != null) {
        params.put("target", Map.of("context", id, "sandbox", sandbox));
      } else {
        params.put("target", Map.of("context", id));
      }
    } else {
      params.put("target", Map.of("realm", id));
    }

    resultOwnership.ifPresent(value -> params.put("resultOwnership", value.toString()));

    return params;
  }

  private EvaluateResult createEvaluateResult(Map<String, Object> response) {
    String type = (String) response.get("type");
    EvaluateResult evaluateResult;
    String realmId = (String) response.get("realm");

    if (type.equals(EvaluateResult.Type.SUCCESS.toString())) {
      RemoteValue remoteValue;
      try (StringReader reader = new StringReader(JSON.toJson(response.get("result")));
          JsonInput input = JSON.newInput(reader)) {
        remoteValue = input.read(RemoteValue.class);
      }

      evaluateResult = new EvaluateResultSuccess(EvaluateResult.Type.SUCCESS, realmId, remoteValue);
    } else {
      ExceptionDetails exceptionDetails;
      try (StringReader reader = new StringReader(JSON.toJson(response.get("exceptionDetails")));
          JsonInput input = JSON.newInput(reader)) {
        exceptionDetails = input.read(ExceptionDetails.class);
      }

      evaluateResult =
          new EvaluateResultExceptionValue(
              EvaluateResult.Type.EXCEPTION, realmId, exceptionDetails);
    }

    return evaluateResult;
  }

  @Override
  public void close() {
    this.bidi.clearListener(messageEvent);
  }
}
