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

package org.openqa.selenium.remote.server.handler;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.logging.SessionLogs;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.log.LoggingManager;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.util.Map;

public class GetSessionLogsHandler implements RestishHandler<Map<String, SessionLogs>> {

  private final Response response = new Response();

  public Response getResponse() {
    return response;
  }

  @Override
  public Map<String, SessionLogs> handle() {
    ImmutableMap.Builder<String, SessionLogs> builder = ImmutableMap.builder();
    for (SessionId sessionId : LoggingManager.perSessionLogHandler().getLoggedSessions()) {
      builder.put(sessionId.toString(),
          LoggingManager.perSessionLogHandler().getAllLogsForSession(sessionId));
    }
    return builder.build();
  }

  @Override
  public String toString() {
    return "[fetching session logs]";
  }
}
