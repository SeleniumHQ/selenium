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

import static java.util.Collections.EMPTY_LIST;
import static java.util.Collections.EMPTY_MAP;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.DefaultGridRegistry;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.testing.FakeHttpServletResponse;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.util.Map;
import java.util.TreeMap;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

public class RegistrationServletTest extends RegistrationAwareServletTest {

  private Map<String, Object> requestWithoutConfig;
  private Map<String, Object> grid2Request;
  private Map<String, Object> grid3Request;

  @Before
  public void fillBaseRequest() {
    // This base request contains most of the fields we normally see serialised, but lacks the
    // "configuration" and "capabilities" fields.
    Map<String, Object> baseRequest = new TreeMap<>();
    baseRequest.put("name", "proxy-foo");
    baseRequest.put("description", "a fictitious proxy");
    baseRequest.put("class", "com.example.grid.BaseRequest");

    requestWithoutConfig = new TreeMap<>(baseRequest);
    requestWithoutConfig.put("capabilities", EMPTY_LIST);

    grid2Request = new TreeMap<>(baseRequest);
    grid2Request.put("capabilities", EMPTY_LIST);
    grid2Request.put("configuration", EMPTY_MAP);

    grid3Request = new TreeMap<>(baseRequest);
    grid3Request.put("capabilities", EMPTY_LIST);
    grid3Request.put("configuration", new GridNodeConfiguration());
  }

  @Before
  public void setUp() throws ServletException {
    servlet = new RegistrationServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(GridRegistry.KEY, DefaultGridRegistry
            .newInstance(new Hub(new GridHubConfiguration())));
        return servletContext;
      }
    };
    servlet.init();
  }



  /**
   * Tests that the registration request servlet throws an error for a request without a proxy
   * configuration
   */
  @Test
  public void testInvalidV2Registration() {
    requestWithoutConfig.put("capabilities", singletonList(new FirefoxOptions()));
    requestWithoutConfig.put("id", "http://dummynode:1111");

    assertThatExceptionOfType(GridConfigurationException.class)
        .isThrownBy(() -> sendCommand("POST", "/", requestWithoutConfig));
  }

  /**
   * Tests that the registration request servlet can process a V2 RegistrationRequest which
   * contains servlets as a comma separated String.
   */
  @Test
  public void testLegacyV2Registration() throws Exception {
    Map<String, Object> config = new TreeMap<>();
    config.put("servlets", "foo,bar,baz");
    config.put("registerCycle", 30001);
    config.put("proxy", null);
    grid2Request.put("configuration", config);

    grid2Request.put("capabilities", singletonList(new FirefoxOptions()));
    String id = "http://dummynode:1234";
    grid2Request.put("id", id);

    final FakeHttpServletResponse response = sendCommand("POST", "/", grid2Request);
    waitForServletToAddProxy();

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals(((RegistrationServlet) servlet).getRegistry().getAllProxies().size(), 1);

    final RemoteProxy proxy = ((RegistrationServlet) servlet).getRegistry().getAllProxies()
      .getProxyById(id);
    assertNotNull(proxy);
    assertEquals(3, proxy.getConfig().servlets.size());
    assertEquals(1, proxy.getConfig().capabilities.size());
    assertEquals(30001, proxy.getConfig().registerCycle.intValue());
    assertEquals(id, proxy.getConfig().id);
  }


  /**
   * Tests that the registration request servlet can process a V2 RegistrationRequest from
   * a 3.x node.
   */
  @Test
  public void testLegacyV3BetaRegistration() throws Exception {
    GridNodeConfiguration config = new GridNodeConfiguration();
    config.capabilities.clear();
    config.proxy = null;
    grid3Request.put("configuration", config);

    grid3Request.put("capabilities", singletonList(new FirefoxOptions()));
    String id = "http://dummynode:2345";
    grid3Request.put("id", id);
    final FakeHttpServletResponse response = sendCommand("POST", "/", grid3Request);
    waitForServletToAddProxy();

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals(((RegistrationServlet) servlet).getRegistry().getAllProxies().size(), 1);

    final RemoteProxy proxy = ((RegistrationServlet) servlet).getRegistry().getAllProxies()
      .getProxyById(id);
    assertNotNull(proxy);
    assertEquals(0, proxy.getConfig().servlets.size());
    assertEquals(1, proxy.getConfig().capabilities.size());
    assertEquals(config.registerCycle.intValue(), proxy.getConfig().registerCycle.intValue());
    assertEquals(id, proxy.getConfig().id);
  }


  /**
   * Tests that the registration request servlet can process a V3 RegistrationRequest
   */
  @Test
  public void testV3Registration() throws Exception {
    final GridNodeConfiguration config = new GridNodeConfiguration();
    config.id = "http://dummynode:3456";
    final RegistrationRequest request = RegistrationRequest.build(config);
    request.getConfiguration().proxy = null;
    final FakeHttpServletResponse response = sendCommand("POST", "/", request.toJson());
    waitForServletToAddProxy();

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals(((RegistrationServlet) servlet).getRegistry().getAllProxies().size(), 1);

    final RemoteProxy proxy = ((RegistrationServlet) servlet).getRegistry().getAllProxies()
      .getProxyById(request.getConfiguration().id);
    assertNotNull(proxy);
    assertEquals(request.getConfiguration().capabilities.size(), proxy.getConfig().capabilities.size());
    assertEquals(request.getConfiguration().registerCycle, proxy.getConfig().registerCycle);
    assertEquals(request.getConfiguration().id, proxy.getConfig().id);
  }
}
