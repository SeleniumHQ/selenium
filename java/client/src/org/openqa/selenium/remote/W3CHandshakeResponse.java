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

package org.openqa.selenium.remote;


import org.openqa.selenium.WebDriverException;

import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

class W3CHandshakeResponse implements HandshakeResponse {

  @Override
  public Function<InitialHandshakeResponse, ProtocolHandshake.Result> errorHandler() {
    return tuple -> {
      Object rawValue = tuple.getData().get("value");
      if (!(rawValue instanceof Map)) {
        return null;
      }

      Map<?, ?> rawMap = (Map<?, ?>) rawValue;

      Object rawMessage = rawMap.get("message");
      Object rawError = rawMap.get("error");
      Object rawStackTrace = rawMap.get("stacktrace");
      rawStackTrace = rawStackTrace == null ? "" : rawStackTrace;

      if (!(rawError instanceof String) || (!(rawMessage instanceof String))) {
        return null;
      }

      if (!(rawStackTrace instanceof String)) {
        rawStackTrace = String.valueOf(rawStackTrace);
      }

      Response response = new Response();
      response.setState((String) rawError);
      response.setStatus(
          new ErrorCodes().toStatus((String) rawError, Optional.of(tuple.getStatusCode())));

      Class<? extends WebDriverException>
          type =
          new ErrorCodes().getExceptionType((String) rawError);
      try {
        WebDriverException exception = type.getConstructor(String.class)
            .newInstance((String) rawMessage);
        exception.addInfo("remote stacktrace", (String) rawStackTrace);
        response.setValue(exception);
      } catch (ReflectiveOperationException e) {
        response.setValue(rawMessage);
      }

      new ErrorHandler().throwIfResponseFailed(response, tuple.getRequestDuration().toMillis());
      // We never get this far
      return null;
    };
  }

  @Override
  public Function<InitialHandshakeResponse, ProtocolHandshake.Result> successHandler() {
    return tuple -> {
      if (tuple.getData().containsKey("status")) {
        return null;
      }

      Object rawValue = tuple.getData().get("value");
      if (!(rawValue instanceof Map)) {
        return null;
      }

      @SuppressWarnings("unchecked") Map<Object, Object> rawMap = (Map<Object, Object>) rawValue;
      Object rawSessionId = rawMap.get("sessionId");
      Object rawCapabilities = rawMap.get("capabilities");

      if (!(rawSessionId instanceof String) || !(rawCapabilities instanceof Map)) {
        return null;
      }

      // Ensure Map keys are all strings.
      for (Object key : ((Map<?, ?>) rawCapabilities).keySet()) {
        if (!(key instanceof String)) {
          return null;
        }
      }

      @SuppressWarnings("unchecked") Map<String, Object>
          caps =
          (Map<String, Object>) rawCapabilities;

      String sessionId = (String) rawSessionId;
      return new ProtocolHandshake.Result(Dialect.W3C, sessionId, caps);
    };
  }
}
