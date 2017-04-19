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

class Gecko013ProtocolResponse implements HandshakeResponse {

  private final Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> error = tuple -> {
    Object rawMessage = tuple.getData().get("message");
    Object rawError = tuple.getData().get("error");

    if (!(rawError instanceof String) || (!(rawMessage instanceof String))) {
      return Optional.empty();
    }

    Response response = new Response();
    response.setState((String) rawError);
    response.setStatus(new ErrorCodes().toStatus((String) rawError, Optional.of(tuple.getStatusCode())));
    response.setValue(rawMessage);

    new ErrorHandler().throwIfResponseFailed(response, tuple.getRequestDuration().toMillis());
    // We never get this far
    return Optional.empty();
  };

  private final Function<InitialHandshakeResponse, Optional<ProtocolHandshake.Result>> success = tuple -> {
    if (tuple.getData().containsKey("status")) {
      return Optional.empty();
    }

    // Some versions of geckodriver returned "{value: {sessionId: '', value: {}}". Add check.
    Object rawSessionId = tuple.getData().get("sessionId");
    Object rawCapabilities = tuple.getData().get("value");

    if (rawCapabilities instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) rawCapabilities;
      if (map.containsKey("sessionId") && map.containsKey("value")) {
        rawSessionId = map.get("sessionId");
        rawCapabilities = map.get("value");
      }
    }

    if (!(rawSessionId instanceof String) || !(rawCapabilities instanceof Map)) {
      return Optional.empty();
    }


    if (((Map<?, ?>) rawCapabilities).containsKey("value")) {
      Object newValue = ((Map<?, ?>) rawCapabilities).get("value");
      if (newValue instanceof Map) {
        rawCapabilities = newValue;
      }
    }

    // Ensure Map keys are all strings.
    for (Object key : ((Map<?, ?>) rawCapabilities).keySet()) {
      if (!(key instanceof String)) {
        return Optional.empty();
      }
    }

    @SuppressWarnings("unchecked") Map<String, Object> caps = (Map<String, Object>) rawCapabilities;

    String sessionId = (String) rawSessionId;
    return Optional.of(new ProtocolHandshake.Result(Dialect.W3C, sessionId, caps));
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
