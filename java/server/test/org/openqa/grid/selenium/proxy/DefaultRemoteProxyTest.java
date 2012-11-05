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

package org.openqa.grid.selenium.proxy;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.TestSession;

import java.util.HashMap;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;


public class DefaultRemoteProxyTest {

  @Test(expected = IllegalArgumentException.class)
  public void invalidNodePollingValue() {
    Map<String, Object> config = new HashMap<String, Object>();
    config.put(RegistrationRequest.NODE_POLLING, "abc");

    RegistrationRequest req = new RegistrationRequest();
    req.setConfiguration(config);

    new DefaultRemoteProxy(req, Registry.newInstance());
  }

  @Test(expected = IllegalArgumentException.class)
  public void invalidUnregisterIfStillDownValue() {
    Map<String, Object> config = new HashMap<String, Object>();
    config.put(RegistrationRequest.NODE_POLLING, 100);
    config.put(RegistrationRequest.UNREGISTER_IF_STILL_DOWN_AFTER, "abc");

    RegistrationRequest req = new RegistrationRequest();
    req.setConfiguration(config);

    new DefaultRemoteProxy(req, Registry.newInstance());
  }

  @Test
  public void proxyTimeout() throws InterruptedException {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().getAllParams().put(RegistrationRequest.TIME_OUT, 1);
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver", "-A", "valueA");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, DefaultRemoteProxy.class.getName());

    BaseRemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
    TestSession newSession = p.getNewSession(new HashMap<String, Object>());
    assertNotNull(newSession );
    Thread.sleep(2);
    p.forceSlotCleanerRun();
    assertTrue(p.getRegistry().getActiveSessions().isEmpty());
  }
}
