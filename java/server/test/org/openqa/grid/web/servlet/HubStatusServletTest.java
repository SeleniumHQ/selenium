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
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.DefaultGridRegistry;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.testing.FakeHttpServletResponse;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;

@RunWith(JUnit4.class)
public class HubStatusServletTest extends RegistrationAwareServletTest {

  private static final GridRegistry registry = DefaultGridRegistry
      .newInstance(new Hub(new GridHubConfiguration()));

  @Before
  public void setUp() throws Exception {
    servlet = new HubStatusServlet() {
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
  public void testGetConfiguration() throws IOException, ServletException {
    Map<String, Object> map = invokeCommand("post", null);
    assertTrue("capabilityMatcher should be present", map.containsKey("capabilityMatcher"));
  }

  @Test
  public void testSelectiveGetConfiguration() throws IOException, ServletException {
    Map<String, Object> map = invokeCommand("get",
                                            ImmutableMap.of("configuration", "debug"));
    assertEquals("There should be only 2 keys in the map", 2, map.size());
    assertTrue("debug should be present", map.containsKey("debug"));
  }

  @Test
  public void testGetNodeInformation() throws Exception {
    wireInNode();
    Map<String, Object> map = invokeCommand("get",
                                            ImmutableMap.of("configuration", "nodes"));
    assertFalse("Node configuration should not be empty", map.isEmpty());
    List<?> nodes = (List<?>) map.get("nodes");
    assertEquals("Exactly 1 node info should be present", 1, nodes.size());
    Map<?, ?> node = (Map<?, ?>) nodes.get(0);
    assertEquals("Two keys should be present per node", 2, node.keySet().size());
  }

  private void wireInNode() throws Exception {
    final GridNodeConfiguration config = new GridNodeConfiguration();
    config.id = "http://dummynode:3456";
    final RegistrationRequest request = RegistrationRequest.build(config);
    request.getConfiguration().proxy = null;
    HttpServlet servlet = new RegistrationServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(GridRegistry.KEY, registry);
        return servletContext;
      }
    };
    servlet.init();
    sendCommand(servlet, "POST", "/", request.toJson());
    waitForServletToAddProxy();
  }

  private Map<String, Object> invokeCommand(String method, Map<String, Object> params)
      throws IOException, ServletException {
    FakeHttpServletResponse fakeResponse = sendCommand(method, "/", params);
    Json json = new Json();
    JsonInput jin = json.newInput(new StringReader(fakeResponse.getBody()));
    return jin.read(Json.MAP_TYPE);
  }

}
