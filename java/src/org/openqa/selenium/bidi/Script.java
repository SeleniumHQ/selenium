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
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.bidi.script.EvaluateResult;
import org.openqa.selenium.bidi.script.EvaluateResultExceptionValue;
import org.openqa.selenium.bidi.script.EvaluateResultSuccess;
import org.openqa.selenium.bidi.script.ExceptionDetails;
import org.openqa.selenium.bidi.script.LocalValue;
import org.openqa.selenium.bidi.script.RemoteValue;
import org.openqa.selenium.bidi.script.ResultOwnership;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

public class Script {
  private final Set<String> browsingContextIds;

  private static final Json JSON = new Json();

  private final BiDi bidi;

  private final Function<JsonInput, EvaluateResult> evaluateResultMapper =
      jsonInput -> createEvaluateResult(jsonInput.read(Map.class));

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

    if (type.equals(EvaluateResult.EvaluateResultType.SUCCESS.toString())) {
      RemoteValue remoteValue;
      try (StringReader reader = new StringReader(JSON.toJson(response.get("result")));
          JsonInput input = JSON.newInput(reader)) {
        remoteValue = input.read(RemoteValue.class);
      }

      evaluateResult =
          new EvaluateResultSuccess(
              EvaluateResult.EvaluateResultType.SUCCESS, realmId, remoteValue);
    } else {
      ExceptionDetails exceptionDetails;
      try (StringReader reader = new StringReader(JSON.toJson(response.get("exceptionDetails")));
          JsonInput input = JSON.newInput(reader)) {
        exceptionDetails = input.read(ExceptionDetails.class);
      }

      evaluateResult =
          new EvaluateResultExceptionValue(
              EvaluateResult.EvaluateResultType.EXCEPTION, realmId, exceptionDetails);
    }

    return evaluateResult;
  }
}
