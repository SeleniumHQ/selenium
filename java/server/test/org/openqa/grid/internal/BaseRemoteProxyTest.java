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

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.gson.Gson;

import com.beust.jcommander.JCommander;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridException;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BaseRemoteProxyTest {

  private RemoteProxy p1 = null;
  private RemoteProxy p2 = null;

  private Map<String, Object> app1Capability = new HashMap<>();
  private Map<String, Object> app2Capability = new HashMap<>();
  private Registry registry = Registry.newInstance();

  @Before
  public void setup() throws Exception {

    app1Capability.put(CapabilityType.APPLICATION_NAME, "app1");
    app2Capability.put(CapabilityType.APPLICATION_NAME, "app2");

    p1 =
        RemoteProxyFactory
            .getNewBasicRemoteProxy(app1Capability, "http://machine1:4444/", registry);
    List<Map<String, Object>> caps = new ArrayList<>();
    caps.add(app1Capability);
    caps.add(app2Capability);
    p2 = RemoteProxyFactory.getNewBasicRemoteProxy(caps, "http://machine4:4444/", registry);

  }

  @Test
  public void testEqual() {
    assertTrue(p1.equals(p1));
    assertFalse(p1.equals(p2));
  }

  @Test(expected = GridException.class)
  public void create() {
    Map<String, Object> cap = new HashMap<>();
    cap.put(CapabilityType.APPLICATION_NAME, "corrupted");

    GridNodeConfiguration config = new Gson().fromJson("{\"remoteHost\":\"ebay.com\"}", GridNodeConfiguration.class);
    config.capabilities.add(new DesiredCapabilities(cap));
    RegistrationRequest request = new RegistrationRequest(config);

    new BaseRemoteProxy(request, registry);
  }

  @Test
  public void proxyConfigIsInheritedFromRegistry() {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().cleanUpCycle = 42;

    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;

    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    // values which are not present in the registration request need to come
    // from the registry
    assertEquals(registry.getConfiguration().cleanUpCycle.longValue(),
                 p.getConfig().cleanUpCycle.longValue());
  }

  @Test
  public void proxyConfigOverwritesRegistryConfig() {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().cleanUpCycle = 42;
    registry.getConfiguration().maxSession = 1;

    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver", "-cleanUpCycle", "100", "-maxSession", "50");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;

    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    // values which are present in both the registration request and the registry need to
    // come from the registration request
    assertEquals(100L, p.getConfig().cleanUpCycle.longValue());
    assertEquals(50L, p.getConfig().maxSession.longValue());
  }

  @Test
  public void proxyTakesRemoteAsIdIfIdNotSpecified() {
    String remoteHost ="http://machine1:5555";
    Registry registry = Registry.newInstance();

    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver","-host", "machine1", "-port", "5555");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals(remoteHost, p.getId());

  }

  @Test
  public void proxyWithIdSpecified() {
    Registry registry = Registry.newInstance();
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver","-host", "machine1", "-port", "5555","-id", "abc");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals("abc", p.getId());

  }

  @Test
  public void timeouts() {
    Registry registry = Registry.newInstance();
    GridNodeConfiguration nodeConfiguration = new GridNodeConfiguration();
    new JCommander(nodeConfiguration, "-role", "webdriver","-host", "machine1", "-port", "5555","-id", "abc","-timeout", "23", "-browserTimeout", "12");
    RegistrationRequest req = RegistrationRequest.build(nodeConfiguration);
    req.getConfiguration().proxy = null;
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
    assertEquals(23000, p.getTimeOut());
  }


  @After
  public void teardown() {
    registry.stop();
  }

}
