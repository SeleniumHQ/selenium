package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.internal.OperatingSystem;
import org.openqa.selenium.remote.Capabilities;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.rest.ResultType;

public class GetSessionCapabilities extends WebDriverHandler {

  private Response response;

  public GetSessionCapabilities(DriverSessions sessions) {
    super(sessions);
  }

  public ResultType handle() {
    Session session = sessions.get(sessionId);

    response = newResponse();
    // Hard code it for HtmlUnit for now
    response.setValue(session.getCapabilities());

    return ResultType.SUCCESS;
  }

  public Response getResponse() {
    return response;
  }

  public class ReadOnlyCapabilities implements Capabilities {

    private final String browser;
    private final String version;
    private final OperatingSystem os;
    private final boolean supportsJavascript;

    public ReadOnlyCapabilities(String browser, String version, OperatingSystem os,
                                boolean supportsJavascript) {
      this.browser = browser;
      this.version = version;
      this.os = os;
      this.supportsJavascript = supportsJavascript;
    }

    public String getBrowserName() {
      return browser;
    }

    public OperatingSystem getOperatingSystem() {
      return os;
    }

    public String getVersion() {
      return version;
    }

    public boolean isJavascriptEnabled() {
      return supportsJavascript;
    }
  }
}
