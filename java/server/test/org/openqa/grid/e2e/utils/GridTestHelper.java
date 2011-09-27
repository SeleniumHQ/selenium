package org.openqa.grid.e2e.utils;

import org.openqa.grid.common.GridRole;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.utils.GridHubConfiguration;
import org.openqa.grid.internal.utils.SelfRegisteringRemote;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.RemoteWebDriver;

import java.net.MalformedURLException;
import java.net.URL;

public class GridTestHelper {

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(Hub hub, GridRole role) {
    return getRemoteWithoutCapabilities(hub.getUrl(), role);
  }

  public static SelfRegisteringRemote getRemoteWithoutCapabilities(URL hub, GridRole role) {
    RegistrationRequest req;
    if (role == GridRole.REMOTE_CONTROL) {
      req = RegistrationRequest.build("-role", "rc");
    } else {
      req = RegistrationRequest.build("-role", "wd");
    }

    req.getConfiguration().put(RegistrationRequest.PORT, PortProber.findFreePort());

    // some values have to be computed again after changing internals.
    String base =
        "http://" + req.getConfiguration().get(RegistrationRequest.HOST) + ":" +
        req.getConfiguration().get(RegistrationRequest.PORT);
    String url;
    switch (req.getRole()) {
      case REMOTE_CONTROL:
        url = base + "/selenium-server/driver";
        break;
      case WEBDRIVER:
        url = base + "/wd/hub";
        break;
      default:
        throw new GridConfigurationException("Cannot launch a node with role " + req.getRole());
    }
    req.getConfiguration().put(RegistrationRequest.REMOTE_URL, url);

    req.getConfiguration().put(RegistrationRequest.HUB_HOST, hub.getHost());
    req.getConfiguration().put(RegistrationRequest.HUB_PORT, hub.getPort());

    SelfRegisteringRemote remote = new SelfRegisteringRemote(req);
    remote.deleteAllBrowsers();
    return remote;
  }

  public static Hub getHub() throws Exception {
    GridHubConfiguration config = new GridHubConfiguration();
    config.setPort(PortProber.findFreePort());
    return getHub(config);
  }

  public static Hub getHub(GridHubConfiguration config) throws Exception {
    Hub hub = new Hub(config);
    hub.start();
    return hub;
  }

  public static void getRemoteWebDriver(DesiredCapabilities ff, Hub hub) throws
                                                                         MalformedURLException {
    new RemoteWebDriver(getGridDriver(hub), ff);
  }

  public static URL getGridDriver(Hub hub) throws MalformedURLException {
    return new URL(hub.getUrl() + "/grid/driver");
  }
}
