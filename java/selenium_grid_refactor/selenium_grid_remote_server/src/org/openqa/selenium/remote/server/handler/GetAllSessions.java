/*
Copyright 2007-2011 Selenium committers

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium.remote.server.handler;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.util.List;
import java.util.Map;
import java.util.Set;

public class GetAllSessions implements RestishHandler<List<GetAllSessions.SessionInfo>> {

  private final Response response = new Response();
  private volatile DriverSessions allSessions;

  public GetAllSessions(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  @Override
  public List<SessionInfo> handle() throws Exception {
    Set<SessionId> sessions = allSessions.getSessions();
    Iterable<SessionInfo> sessionInfo = Iterables.transform(sessions, toSessionInfo());
    return ImmutableList.copyOf(sessionInfo);
  }

  public Response getResponse() {
    return response;
  }

  private Function<SessionId, SessionInfo> toSessionInfo() {
    return new Function<SessionId, SessionInfo>() {
      public SessionInfo apply(SessionId id) {
        Map<String, ?> capabilities = allSessions.get(id).getCapabilities().asMap();
        return new SessionInfo(id, capabilities);
      }
    };
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
