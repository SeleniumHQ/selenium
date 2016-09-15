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
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.HashMap;
import java.util.Map;


public class RegistryStateTest {

  private RegistrationRequest req = null;
  private Map<String, Object> app1 = new HashMap<>();
  private Map<String, Object> app2 = new HashMap<>();

  /**
   * create a proxy than can host up to 5 tests at the same time. - of type app1 ( max 5 tests at
   * the same time ) could be Firefox for instance - of type app2 ( max 1 test ) could be IE
   */
  @Before
  public void prepareReqRequest() {

    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(CapabilityType.APPLICATION_NAME, "app2");
    app2.put(MAX_INSTANCES, 1);

    req = new RegistrationRequest();
    req.getConfiguration().host = "machine1";
    req.getConfiguration().port = 4444;
    req.getConfiguration().maxSession = 5;
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app1));
    req.getConfiguration().capabilities.add(new DesiredCapabilities(app2));
  }


  @Test
  public void sessionIsRemoved() {
    Registry registry = Registry.newInstance();

    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);

    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();

      registry.terminateSynchronousFOR_TEST_ONLY(session);
      assertEquals(0, registry.getActiveSessions().size());
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 5000)
  public void basicChecks() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);

    try {
      registry.add(p1);

      assertEquals(0, registry.getActiveSessions().size());
      assertEquals(1, registry.getAllProxies().size());
      assertEquals(0, registry.getUsedProxies().size());

      MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();

      assertEquals(1, registry.getActiveSessions().size());
      assertEquals(1, registry.getAllProxies().size());
      assertEquals(1, registry.getUsedProxies().size());

      registry.terminateSynchronousFOR_TEST_ONLY(session);
      assertEquals(0, registry.getActiveSessions().size());
      assertEquals(1, registry.getAllProxies().size());
      assertEquals(0, registry.getUsedProxies().size());
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 4000)
  public void sessionIsRemoved2() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);

    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();
      registry.terminateSynchronousFOR_TEST_ONLY(session);
      assertEquals(0, registry.getActiveSessions().size());

    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 4000)
  public void sessionByExtKey() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);

    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();
      final ExternalSessionKey externalKey = ExternalSessionKey.fromString("1234");
      session.setExternalKey(externalKey);

      TestSession s = registry.getSession(externalKey);
      assertNotNull(s);
      assertEquals(s, session);
      registry.terminateSynchronousFOR_TEST_ONLY(session);
      assertEquals(0, registry.getActiveSessions().size());

      TestSession s2 = registry.getSession(externalKey);
      assertNull(s2);

      assertEquals(0, registry.getActiveSessions().size());
    } finally {
      registry.stop();
    }
  }

  @Test
  public void sessionByExtKeyNull() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new DetachedRemoteProxy(req, registry);

    try {
      registry.add(p1);

      TestSession s = registry.getSession(ExternalSessionKey.fromString("1234"));
      assertNull(s);

      s = registry.getSession(ExternalSessionKey.fromString(""));
      assertNull(s);

      s = registry.getSession(null);
      assertNull(s);
    } finally {
      registry.stop();
    }
  }
}
