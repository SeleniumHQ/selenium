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

import com.google.common.collect.ImmutableList;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class GetAllSessions implements RestishHandler<List<GetAllSessions.SessionInfo>> {

  private final Response response = new Response();
  private volatile DriverSessions allSessions;

  public GetAllSessions(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  @Override
  public List<SessionInfo> handle() {
    Set<SessionId> sessions = allSessions.getSessions();
    List<SessionInfo> sessionInfo =
        sessions.stream().map(id -> new SessionInfo(id, allSessions.get(id).getCapabilities()))
            .collect(Collectors.toList());
    return ImmutableList.copyOf(sessionInfo);
  }

  public Response getResponse() {
    return response;
  }

  public static class SessionInfo {

    private final SessionId id;
    private final Map<String, ?> capabilities;

    private SessionInfo(SessionId id, Map<String, ?> capabilities) {
      this.id = id;
      this.capabilities = capabilities;
    }

    public String getId() {
      return id.toString();
    }

    public Map<String, ?> getCapabilities() {
      return capabilities;
    }
  }
}
