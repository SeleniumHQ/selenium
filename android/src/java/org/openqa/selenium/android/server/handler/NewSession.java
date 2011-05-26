package org.openqa.selenium.android.server.handler;

import java.util.Map;

import org.openqa.selenium.android.ActivityController;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.server.DriverSessions;

public class NewSession extends org.openqa.selenium.remote.server.handler.NewSession {

  public NewSession(DriverSessions allSession) {
    super(allSession);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters)
      throws Exception {
    super.setJsonParameters(allParameters);
    ActivityController.getInstance().setCapabilities(new DesiredCapabilities(
        (Map<String, Object>) allParameters.get("desiredCapabilities")));
  }
  
}
