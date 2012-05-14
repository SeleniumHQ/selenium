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

import static org.openqa.grid.common.RegistrationRequest.APP;
import static org.openqa.grid.common.RegistrationRequest.MAX_INSTANCES;
import static org.openqa.grid.common.RegistrationRequest.MAX_SESSION;
import static org.openqa.grid.common.RegistrationRequest.REMOTE_HOST;

import java.util.HashMap;
import java.util.Map;

import org.junit.Assert;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.mock.MockedRequestHandler;
import org.openqa.grid.web.servlet.handler.RequestHandler;


public class RegistryStateTest {


  static RegistrationRequest req = null;
  static Map<String, Object> app1 = new HashMap<String, Object>();
  static Map<String, Object> app2 = new HashMap<String, Object>();

  /**
   * create a proxy than can host up to 5 tests at the same time. - of type app1 ( max 5 tests at
   * the same time ) could be Firefox for instance - of type app2 ( max 1 test ) could be IE
   */
  @BeforeClass
  public static void prepareReqRequest() {

    Map<String, Object> config = new HashMap<String, Object>();
    app1.put(APP, "app1");
    app1.put(MAX_INSTANCES, 5);

    app2.put(APP, "app2");
    app2.put(MAX_INSTANCES, 1);

    config.put(REMOTE_HOST, "http://machine1:4444");
    config.put(MAX_SESSION, 5);

    req = new RegistrationRequest();
    req.addDesiredCapability(app1);
    req.addDesiredCapability(app2);
    req.setConfiguration(config);
  }


  @Test
  public void sessionIsRemoved() {
    Registry registry = Registry.newInstance();

    RemoteProxy p1 = new BaseRemoteProxy(req, registry);


    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();

      registry.terminateSynchronousFOR_TEST_ONLY(session);
      Assert.assertEquals(0, registry.getActiveSessions().size());
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 5000)
  public void basichecks() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);

    try {
      registry.add(p1);

      Assert.assertEquals(0, registry.getActiveSessions().size());
      Assert.assertEquals(1, registry.getAllProxies().size());
      Assert.assertEquals(0, registry.getUsedProxies().size());

      MockedRequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();

      Assert.assertEquals(1, registry.getActiveSessions().size());
      Assert.assertEquals(1, registry.getAllProxies().size());
      Assert.assertEquals(1, registry.getUsedProxies().size());

      registry.terminateSynchronousFOR_TEST_ONLY(session);
      Assert.assertEquals(0, registry.getActiveSessions().size());
      Assert.assertEquals(1, registry.getAllProxies().size());
      Assert.assertEquals(0, registry.getUsedProxies().size());
    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 4000)
  public void sessionIsRemoved2() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);

    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();
      registry.terminateSynchronousFOR_TEST_ONLY(session);
      Assert.assertEquals(0, registry.getActiveSessions().size());

    } finally {
      registry.stop();
    }
  }

  @Test(timeout = 4000)
  public void sessionByExtKey() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);

    try {
      registry.add(p1);

      RequestHandler newSessionRequest = GridHelper.createNewSessionHandler(registry, app1);
      newSessionRequest.process();
      TestSession session = newSessionRequest.getSession();
      final ExternalSessionKey externalKey = ExternalSessionKey.fromString("1234");
      session.setExternalKey(externalKey);

      TestSession s = registry.getSession(externalKey);
      Assert.assertNotNull(s);
      Assert.assertEquals(s, session);
      registry.terminateSynchronousFOR_TEST_ONLY(session);
      Assert.assertEquals(0, registry.getActiveSessions().size());

      TestSession s2 = registry.getSession(externalKey);
      Assert.assertNull(s2);

      Assert.assertEquals(0, registry.getActiveSessions().size());
    } finally {
      registry.stop();
    }
  }

  @Test
  public void sessionByExtKeyNull() {
    Registry registry = Registry.newInstance();
    RemoteProxy p1 = new BaseRemoteProxy(req, registry);

    try {
      registry.add(p1);

      TestSession s = registry.getSession(ExternalSessionKey.fromString("1234"));
      Assert.assertNull(s);

      s = registry.getSession(ExternalSessionKey.fromString(""));
      Assert.assertNull(s);

      s = registry.getSession(null);
      Assert.assertNull(s);
    } finally {
      registry.stop();
    }
  }

}
