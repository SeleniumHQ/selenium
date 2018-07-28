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

package org.openqa.grid.web.servlet;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.ImmutableMap;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.testing.FakeHttpServletResponse;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public class LifecycleServletTest extends RegistrationAwareServletTest {

  private static final String KEY = "result";

  @Before
  public void setUp() throws ServletException {
    servlet = new LifecycleServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(GridRegistry.KEY, registry);
        return servletContext;
      }
    };
    servlet.init();
  }

  @Test
  public void testInvalidAction() throws IOException, ServletException {
    Map<String, Object> params = ImmutableMap.of("action", "invalidAction");
    FakeHttpServletResponse fakeResponse = sendCommand("get", "/", params);
    assertEquals(400, fakeResponse.getStatus());
  }

  @Test
  public void testShutdown() throws Exception {
    wireInNode();
    final Map<String, Boolean> result = createFakeShutdownMechanism();
    Map<String, Object> params = ImmutableMap.of("action", "shutdown");
    FakeHttpServletResponse fakeResponse = sendCommand("get", "/", params);
    assertEquals(200, fakeResponse.getStatus());
    //wait for the shutdown thread to kick start. Else the assertion will fail
    TimeUnit.SECONDS.sleep(2);
    assertEquals(true, result.get(KEY));
  }

  @Test
  public void testQuiesceNode() throws Exception {
    wireInNode();
    TimeUnit.SECONDS.sleep(5);
    String id = registry.getAllProxies().iterator().next().getId();
    Map<String, Object> params = ImmutableMap.of("action", "quiescenode", "proxyid", id);
    FakeHttpServletResponse fakeResponse = sendCommand("get", "/", params);
    assertEquals(200, fakeResponse.getStatus());
    assertTrue(registry.getAllProxies().getProxyById(id).isNodeQuiesced());
  }

  @Test
  public void testQuiesceNodeNullProxyId() throws Exception {
    testQuiesceNodeNegativeConditions(null);
  }

  @Test
  public void testQuiesceNodeEmptyProxyId() throws Exception {
    testQuiesceNodeNegativeConditions("  ");
  }

  @Test
  public void testQuiesceNodeInvalidProxyId() throws Exception {
    testQuiesceNodeNegativeConditions("idontExist");
  }

  @Test
  public void testQuiesceNodeWithAutoShutdown() throws Exception {
    Map<String, Boolean> result = new HashMap<>();
    result.put(KEY, false);
    servlet = newInstance(result);
    String id = registry.getAllProxies().iterator().next().getId();
    Map<String, Object> params = ImmutableMap.of("action", "quiescenode",
                                                 "proxyid", id,
                                                 "autoshutdown", true);
    FakeHttpServletResponse fakeResponse = sendCommand("get", "/", params);
    assertEquals(200, fakeResponse.getStatus());
    assertTrue(result.get(KEY));
  }

  @Test
  public void testQuiesceNodeWithAutoShutdownNegativeConditions() throws Exception {
    Map<String, Boolean> result = new HashMap<>();
    result.put(KEY, false);
    servlet = newInstance(result);
    String id = registry.getAllProxies().iterator().next().getId();
    Map<String, Object> params = new HashMap<>();
    params.put("action", "quiescenode");
    params.put("proxyid", id);
    String[] invalidAutoshutdowns = {null, "", "false"};
    for (String each : invalidAutoshutdowns) {
      params.put("autoshutdown", each);
      FakeHttpServletResponse fakeResponse = sendCommand("get", "/", params);
      assertEquals(200, fakeResponse.getStatus());
      assertFalse(result.get(KEY));
    }
  }

  private void testQuiesceNodeNegativeConditions(String proxyId) throws Exception {
    Map<String, Object> params = new HashMap<>();
    params.put("action", "quiescenode");
    params.put("proxyid", proxyId);
    FakeHttpServletResponse fakeResponse = quiesceNode(params);
    assertEquals(400, fakeResponse.getStatus());
  }

  private FakeHttpServletResponse quiesceNode(Map<String, Object> params) throws Exception {
    wireInNode();
    TimeUnit.SECONDS.sleep(5);
    return sendCommand("get", "/", params);
  }

  private Map<String, Boolean> createFakeShutdownMechanism() {
    final Map<String, Boolean> result = new HashMap<>();
    result.put(KEY, Boolean.FALSE);
    ((LifecycleServlet) servlet).setShutdown(integer -> result.put(KEY, Boolean.TRUE));
    return result;
  }

  private LifecycleServlet newInstance(Map<String, Boolean> result) throws Exception {
    LifecycleServlet servlet = new LifecycleServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(GridRegistry.KEY, registry);
        return servletContext;
      }

      @Override
      protected void autoShutdownNode(RemoteProxy proxy, HttpServletResponse rsp) {
        result.put(KEY, true);
      }
    };
    servlet.init();
    wireInNode();
    TimeUnit.SECONDS.sleep(5);
    return servlet;
  }

}
