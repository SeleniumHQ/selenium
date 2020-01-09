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


import java.util.Map;
import java.util.function.Function;

class JsonWireProtocolResponse implements HandshakeResponse {

  @Override
  public Function<InitialHandshakeResponse, ProtocolHandshake.Result> errorHandler() {
    return tuple -> {
      if (!(tuple.getData().containsKey("status"))) {
        return null;
      }

      Object rawStatus = tuple.getData().get("status");
      if (!(rawStatus instanceof Number)) {
        return null;
      }

      if (((Number) rawStatus).intValue() == 0) {
        return null;
      }

      if (!(tuple.getData().containsKey("value"))) {
        return null;
      }
      Object value = tuple.getData().get("value");
      if (!(value instanceof Map)) {
        return null;
      }

      Response response = new Response(null);
      response.setStatus(((Number) rawStatus).intValue());
      response.setValue(value);

      new ErrorHandler().throwIfResponseFailed(response, tuple.getRequestDuration().toMillis());
      // We never get this far.
      return null;
    };
  }

  @Override
  public Function<InitialHandshakeResponse, ProtocolHandshake.Result> successHandler() {
    return tuple -> {
      Object rawStatus = tuple.getData().get("status");
      if (!(rawStatus instanceof Number)) {
        return null;
      }

      if (0 != ((Number) rawStatus).intValue()) {
        return null;
      }

      Object rawSessionId = tuple.getData().get("sessionId");
      Object rawCapabilities = tuple.getData().get("value");

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
      return new ProtocolHandshake.Result(Dialect.OSS, sessionId, caps);
    };
  }
}
