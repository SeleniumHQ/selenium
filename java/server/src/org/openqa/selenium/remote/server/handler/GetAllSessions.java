package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.rest.Handler;
import org.openqa.selenium.remote.server.rest.ResultType;

import com.google.common.base.Function;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Iterables;

import java.util.Map;
import java.util.Set;

public class GetAllSessions implements Handler {

  private final Response response = new Response();
  private volatile DriverSessions allSessions;

  public GetAllSessions(DriverSessions allSession) {
    this.allSessions = allSession;
  }

  public ResultType handle() throws Exception {
    Set<SessionId> sessions = allSessions.getSessions();
    Iterable<SessionInfo> sessionInfo = Iterables.transform(sessions, toSessionInfo());
    response.setValue(ImmutableList.copyOf(sessionInfo));
    return ResultType.SUCCESS;
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

  private static class SessionInfo {

    private final SessionId id;
    private final Map<String, ?> capabilities;

    public SessionInfo(SessionId id, Map<String, ?> capabilities) {
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
