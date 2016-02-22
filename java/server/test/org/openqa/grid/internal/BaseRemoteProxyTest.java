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
import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridException;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class BaseRemoteProxyTest {

  private static RemoteProxy p1 = null;
  private static RemoteProxy p2 = null;

  private static Map<String, Object> app1Capability = new HashMap<>();
  private static Map<String, Object> app2Capability = new HashMap<>();
  private static Registry registry = Registry.newInstance();

  @BeforeClass
  public static void setup() {

    app1Capability.put(APP, "app1");
    app2Capability.put(APP, "app2");

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
    cap.put(APP, "corrupted");

    Map<String, Object> config = new HashMap<>();
    config.put(REMOTE_HOST, "ebay.com");

    RegistrationRequest request = new RegistrationRequest();
    request.addDesiredCapability(cap);
    request.setConfiguration(config);

    new BaseRemoteProxy(request, registry);
  }

  @Test
  public void proxyConfigIsInheritedFromRegistry() {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().getAllParams().put("String", "my string");
    registry.getConfiguration().getAllParams().put("Boolean", true);
    registry.getConfiguration().getAllParams().put("Integer", 42);

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver", "-A", "valueA","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);

    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals("my string", p.getConfig().get("String"));
    assertEquals(true, p.getConfig().get("Boolean"));
    assertEquals(42, p.getConfig().get("Integer"));
    assertEquals("valueA", p.getConfig().get("A"));

  }


  @Test
  public void proxyConfigOverWritesRegistryConfig() {
    Registry registry = Registry.newInstance();
    registry.getConfiguration().getAllParams().put("A", "A1");

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver", "-A", "A2","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);

    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals("A2", p.getConfig().get("A"));

  }

  @Test
  public void proxyTakesRemoteAsIdIfIdNotSpecified() {
    String remoteHost ="http://machine1:5555";
    Registry registry = Registry.newInstance();

    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.REMOTE_HOST, remoteHost,"-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals(remoteHost, p.getId());

  }

  @Test
  public void proxyWithIdSpecified() {
    String remoteHost ="http://machine1:5555";
    Registry registry = Registry.newInstance();
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.REMOTE_HOST, remoteHost,"-"+RegistrationRequest.ID, "abc","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);

    assertEquals("abc", p.getId());

  }

  @Test
  public void timeouts() {
    String remoteHost ="http://machine1:5555";
    Registry registry = Registry.newInstance();
    RegistrationRequest req = RegistrationRequest.build("-role", "webdriver","-"+RegistrationRequest.REMOTE_HOST, remoteHost,"-"+RegistrationRequest.ID, "abc", "-timeout", "23", "-browserTimeout", "12","-host","localhost");
    req.getConfiguration().put(RegistrationRequest.PROXY_CLASS, null);
    RemoteProxy p = BaseRemoteProxy.getNewInstance(req, registry);
    assertEquals(23000, p.getTimeOut());
  }


  @AfterClass
  public static void teardown() {
    registry.stop();
  }

}
