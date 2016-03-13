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

package org.openqa.grid.plugin;

import static org.junit.Assert.assertEquals;

import com.beust.jcommander.JCommander;

import org.junit.After;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.CapabilityType;

import java.security.InvalidParameterException;
import java.util.HashMap;
import java.util.Map;

public class RemoteProxyInheritanceTest {
  private Registry registry = Registry.newInstance();

  @Test
  public void defaultToRemoteProxy() {
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver", "-host", "localhost");
    RegistrationRequest res = RegistrationRequest.build(nodeConfiguration);
    res.getCapabilities().clear();
    RegistrationRequest req = res;

    Map<String, Object> app1 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");

    req.addDesiredCapability(app1);
    req.setConfiguration(config);

    // requires Custom1 & Custom1 set in config to work.
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
    assertEquals(BaseRemoteProxy.class, p.getClass());
  }

  @Test
  public void existing() {
    Map<String, Object> app1 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    config.proxy = "org.openqa.grid.plugin.MyRemoteProxy";

    config.custom.put("Custom1", "A");
    config.custom.put("Custom2", "B");

    RegistrationRequest req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);

    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals(p.getClass(), MyRemoteProxy.class);
    MyRemoteProxy myRemoteProxy = (MyRemoteProxy) p;
    assertEquals("A", myRemoteProxy.getCustom1());
    assertEquals("B", myRemoteProxy.getCustom2());
    assertEquals("A", myRemoteProxy.getConfig().custom.get("Custom1"));
    assertEquals("B", myRemoteProxy.getConfig().custom.get("Custom2"));
  }

  @Test(expected = InvalidParameterException.class)
  public void notExisting() {
    Map<String, Object> app1 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    config.proxy = "I Don't exist";

    RegistrationRequest req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);

    BaseRemoteProxy.getNewInstance(req, registry);
  }

  @Test(expected = InvalidParameterException.class)
  public void notExtendingProxyExisting() {
    Map<String, Object> app1 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    config.proxy = "java.lang.String";

    RegistrationRequest req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);

    BaseRemoteProxy.getNewInstance(req, registry);
  }

  // when some mandatory param are missing -> InvalidParameterException
  @Test(expected = InvalidParameterException.class)
  public void badConfig() {
    Map<String, Object> app1 = new HashMap<>();
    GridNodeConfiguration config = new GridNodeConfiguration();
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    config.proxy = "I Don't exist";

    RegistrationRequest req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.setConfiguration(config);

    // requires Custom1 & Custom1 set in config to work.
    BaseRemoteProxy.getNewInstance(req, registry);
  }

  @After
  public void tearDown() {
    registry.stop();
  }
}
