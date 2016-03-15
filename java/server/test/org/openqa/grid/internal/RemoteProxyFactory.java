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

package org.openqa.grid.internal;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;
import java.util.Map;

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
  public static RemoteProxy getNewBasicRemoteProxy(String browser, String url, Registry registry) throws MalformedURLException {

    GridNodeConfiguration config = new GridNodeConfiguration();
    URL u = new URL(url);
    config.host = u.getHost();
    config.port = u.getPort();
    config.role = "webdriver";
    RegistrationRequest req = RegistrationRequest.build(config);
    req.getCapabilities().clear();

    DesiredCapabilities capability = new DesiredCapabilities();
    capability.setBrowserName(browser);
    req.addDesiredCapability(capability);

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
                                                   Registry registry) throws MalformedURLException {
    GridNodeConfiguration configuration = new GridNodeConfiguration();
    configuration.role = "webdriver";
    URL u = new URL(url);
    configuration.host = u.getHost();
    configuration.port = u.getPort();
    configuration.hub = "http://localhost:4444";
    RegistrationRequest req = RegistrationRequest.build(configuration);
    req.getCapabilities().clear();
    req.addDesiredCapability(cap);
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
      Registry registry) throws MalformedURLException {

    GridNodeConfiguration configuration = new GridNodeConfiguration();
    configuration.role = "webdriver";
    URL u = new URL(url);
    configuration.host = u.getHost();
    configuration.port = u.getPort();
    configuration.hub = "http://localhost:4444";
    RegistrationRequest req = RegistrationRequest.build(configuration);
    req.getCapabilities().clear();
    for (Map<String, Object> c : caps) {
      req.addDesiredCapability(c);
    }
    return createProxy(registry, req);

  }

  private static RemoteProxy createProxy(Registry registry, RegistrationRequest req) {
    final RemoteProxy remoteProxy = new DetachedRemoteProxy(req, registry);
    remoteProxy.setupTimeoutListener();
    return remoteProxy;
  }

}
