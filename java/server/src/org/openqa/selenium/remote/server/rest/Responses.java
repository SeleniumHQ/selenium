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

package org.openqa.selenium.remote.server.rest;

import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.openqa.selenium.json.Json;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

import java.util.Map;
import java.util.Optional;

/**
 * Contains factory methods for creating {@link Response} objects.
 */
class Responses {

  private static final ErrorCodes ERROR_CODES = new ErrorCodes();

  private Responses() {}  // Utility class.

  /**
   * Creates a response object for a successful command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param value the command result value.
   * @return the new response object.
   */
  public static Response success(SessionId sessionId, Object value) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setValue(value);
    response.setStatus(ErrorCodes.SUCCESS);
    response.setState(ErrorCodes.SUCCESS_STRING);
    return response;
  }

  /**
   * Creates a response object for a failed command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param reason the failure reason.
   * @return the new response object.
   */
  public static Response failure(SessionId sessionId, Throwable reason) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setValue(reason);
    response.setStatus(ERROR_CODES.toStatusCode(reason));
    response.setState(ERROR_CODES.toState(response.getStatus()));
    return response;
  }

  /**
   * Creates a response object for a failed command execution.
   *
   * @param sessionId ID of the session that executed the command.
   * @param reason the failure reason.
   * @param screenshot a base64 png screenshot to include with the failure.
   * @return the new response object.
   */
  public static Response failure(
      SessionId sessionId, Throwable reason, Optional<String> screenshot) {
    Response response = new Response();
    response.setSessionId(sessionId != null ? sessionId.toString() : null);
    response.setStatus(ERROR_CODES.toStatusCode(reason));
    response.setState(ERROR_CODES.toState(response.getStatus()));

    if (reason != null) {
      Json json = new Json();
      String raw = json.toJson(reason);
      Map<String, Object> value = json.toType(raw, MAP_TYPE);
      screenshot.ifPresent(screen -> value.put("screen", screen));
      response.setValue(value);
    }
    return response;
  }
}
