package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.Platform;
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

  public ResultType call() {
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
    private final Platform platform;
    private final boolean supportsJavascript;

    public ReadOnlyCapabilities(String browser, String version, Platform platform,
                                boolean supportsJavascript) {
      this.browser = browser;
      this.version = version;
      this.platform = platform;
      this.supportsJavascript = supportsJavascript;
    }

    public String getBrowserName() {
      return browser;
    }

    public Platform getPlatform() {
      return platform;
    }

    public String getVersion() {
      return version;
    }

    public boolean isJavascriptEnabled() {
      return supportsJavascript;
    }
  }
}
