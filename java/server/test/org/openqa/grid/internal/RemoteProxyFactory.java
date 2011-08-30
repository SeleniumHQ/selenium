package org.openqa.grid.internal;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.selenium.remote.DesiredCapabilities;

@SuppressWarnings({"JavaDoc"})
public class RemoteProxyFactory {

  /**
   * Create a simple proxy with 1 capability : {"browserName=appName"} and the configuration
   * {"url=url"}
   * 
   * @param browser
   * @param url
   * @param registry
   * @return
   */
  public static RemoteProxy getNewBasicRemoteProxy(String browser, String url, Registry registry) {

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver");
    req.getCapabilities().clear();

    DesiredCapabilities capability = new DesiredCapabilities();
    capability.setBrowserName(browser);
    req.addDesiredCapabilitiy(capability);

    Map<String, Object> config = new HashMap<String, Object>();
    config.put("url", url);
    req.setConfiguration(config);
    return createProxy(registry, req);

  }

  /**
   * Create a simple proxy with the 1 capability specified as parameter and the configuration
   * {"url=url"}
   * 
   * @param cap
   * @param url
   * @param registry
   * @return
   */
  public static RemoteProxy getNewBasicRemoteProxy(Map<String, Object> cap, String url,
      Registry registry) {
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver");
    req.getCapabilities().clear();
    req.addDesiredCapabilitiy(cap);
    req.getConfiguration().put(RegistrationRequest.REMOTE_URL, url);
    return createProxy(registry, req);

  }

  /**
   * Create a simple proxy with the the list of capabilities specified as parameter and the
   * configuration {"url=url"}
   * 
   * @param caps
   * @param url
   * @param registry
   * @return
   */
  public static RemoteProxy getNewBasicRemoteProxy(List<Map<String, Object>> caps, String url,
      Registry registry) {

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver");
    req.getCapabilities().clear();
    for (Map<String, Object> c : caps) {
      req.addDesiredCapabilitiy(c);
    }

    req.getConfiguration().put(RegistrationRequest.REMOTE_URL, url);
    return createProxy(registry, req);

  }

  private static RemoteProxy createProxy(Registry registry, RegistrationRequest req) {
    final RemoteProxy remoteProxy = new RemoteProxy(req, registry);
    remoteProxy.setupTimeoutListener();
    return remoteProxy;
  }

}
