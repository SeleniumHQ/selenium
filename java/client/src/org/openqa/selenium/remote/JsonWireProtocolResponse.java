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
import java.util.Optional;
import java.util.function.Function;

class JsonWireProtocolResponse implements HandshakeResponse {

  private final Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> error = tuple -> {
    if (!(tuple.getData().containsKey("status"))) {
      return Optional.empty();
    }

    Object rawStatus = tuple.getData().get("status");
    if (!(rawStatus instanceof Number)) {
      return Optional.empty();
    }

    if (((Number) rawStatus).intValue() == 0) {
      return Optional.empty();
    }

    if (!(tuple.getData().containsKey("value"))) {
      return Optional.empty();
    }
    Object value = tuple.getData().get("value");
    if (!(value instanceof Map)) {
      return Optional.empty();
    }

    Response response = new Response(null);
    response.setStatus(((Number) rawStatus).intValue());
    response.setValue(value);

    new ErrorHandler().throwIfResponseFailed(response, tuple.getRequestDuration().toMillis());
    // We never get this far.
    return Optional.empty();
  };

  private final Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> success = tuple -> {
    Object rawStatus = tuple.getData().get("status");
    if (!(rawStatus instanceof Number)) {
      return Optional.empty();
    }

    if (0 != ((Number) rawStatus).intValue()) {
      return Optional.empty();
    }

    Object rawSessionId = tuple.getData().get("sessionId");
    Object rawCapabilities = tuple.getData().get("value");

    if (!(rawSessionId instanceof String) || !(rawCapabilities instanceof Map)) {
      return Optional.empty();
    }

    // Ensure Map keys are all strings.
    for (Object key : ((Map<?, ?>) rawCapabilities).keySet()) {
      if (!(key instanceof String)) {
        return Optional.empty();
      }
    }

    @SuppressWarnings("unchecked") Map<String, Object> caps = (Map<String, Object>) rawCapabilities;

    String sessionId = (String) rawSessionId;
    return Optional.of(new ProtocolHandshake.Result(Dialect.OSS, sessionId, caps));
  };

  @Override
  public Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> getResponseFunction() {
    return resp -> {
      Optional<ProtocolHandshake.Result> result = error.apply(resp);
      if (!result.isPresent()) {
        result = success.apply(resp);
      }
      return result;
    };
  }
}
