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

package org.openqa.selenium.json;

import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;

import java.lang.reflect.Type;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.BiFunction;

class ResponseCoercer extends TypeCoercer<Response> {

  private final ErrorCodes errorCodes = new ErrorCodes();
  private final JsonTypeCoercer coercer;

  ResponseCoercer(JsonTypeCoercer coercer) {
    this.coercer = Objects.requireNonNull(coercer);
  }

  @Override
  public boolean test(Class<?> aClass) {
    return Response.class.isAssignableFrom(aClass);
  }

  @Override
  public BiFunction<JsonInput, PropertySetting, Response> apply(Type type) {
    return (jsonInput, setting) -> {
      Response response = new Response();

      Map<String, Object> json = coercer.coerce(jsonInput, MAP_TYPE, setting);

      if (json.get("error") instanceof String) {
        String state = (String) json.get("error");
        response.setState(state);
        response.setStatus(errorCodes.toStatus(state, Optional.empty()));
        response.setValue(json.get("message"));
      }

      if (json.get("state") instanceof String) {
        String state = (String) json.get("state");
        response.setState(state);
        response.setStatus(errorCodes.toStatus(state, Optional.empty()));
      }

      if (json.get("status") != null) {
        Object status = json.get("status");
        if (status instanceof String) {
          String state = (String) status;
          response.setState(state);
          response.setStatus(errorCodes.toStatus(state, Optional.empty()));
        } else {
          int intStatus = ((Number) status).intValue();
          response.setState(errorCodes.toState(intStatus));
          response.setStatus(intStatus);
        }
      }

      if (json.get("sessionId") instanceof String) {
        response.setSessionId((String) json.get("sessionId"));
      }

      response.setValue(json.getOrDefault("value", json));

      return response;
    };
  }
}
