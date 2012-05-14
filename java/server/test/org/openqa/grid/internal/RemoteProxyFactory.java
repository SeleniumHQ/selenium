/*
Copyright 2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

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

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-host","localhost");
    req.getCapabilities().clear();

    DesiredCapabilities capability = new DesiredCapabilities();
    capability.setBrowserName(browser);
    req.addDesiredCapability(capability);

    Map<String, Object> config = new HashMap<String, Object>();
    config.put(RegistrationRequest.REMOTE_HOST, url);
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
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-host","localhost");
    req.getCapabilities().clear();
    req.addDesiredCapability(cap);
    req.getConfiguration().put(RegistrationRequest.REMOTE_HOST, url);
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

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-host","localhost");
    req.getCapabilities().clear();
    for (Map<String, Object> c : caps) {
      req.addDesiredCapability(c);
    }

    req.getConfiguration().put(RegistrationRequest.REMOTE_HOST, url);
    return createProxy(registry, req);

  }

  private static RemoteProxy createProxy(Registry registry, RegistrationRequest req) {
    final RemoteProxy remoteProxy = new BaseRemoteProxy(req, registry);
    remoteProxy.setupTimeoutListener();
    return remoteProxy;
  }

}
