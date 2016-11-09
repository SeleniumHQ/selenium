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
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.gson.GsonBuilder;
import com.google.gson.JsonObject;
import com.google.gson.annotations.SerializedName;

import org.junit.Before;
import org.junit.Test;

import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.internal.RemoteProxy;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.testing.FakeHttpServletResponse;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

public class RegistrationServletTest extends BaseServletTest {
  private class BaseRequest {
    final String name = "proxy-foo";
    final String description = "a fictitious proxy";
    @SerializedName( "class" )
    final String clazz = BaseRequest.class.getCanonicalName();
    String id;
  }

  private final class RequestV2 extends BaseRequest {
    final Map<String, Object> configuration = new HashMap<>();
    final List<DesiredCapabilities> capabilities = new ArrayList<>();
  }

  private final class InvalidV2Request extends BaseRequest {
    final List<DesiredCapabilities> capabilities = new ArrayList<>();
  }

  private final class RequestV3Beta extends BaseRequest {
    final GridNodeConfiguration configuration = new GridNodeConfiguration();
    final List<DesiredCapabilities> capabilities = new ArrayList<>();
  }

  @Before
  public void setUp() throws ServletException {
    servlet = new RegistrationServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(Registry.KEY, Registry.newInstance());
        return servletContext;
      }
    };
    servlet.init();
  }

  /**
   * Gives the servlet some time to add the proxy -- which happens on a separate thread.
   */
  private void waitForServletToAddProxy() throws Exception {
    int tries = 0;
    int size;
    while (tries < 10) {
      size = ((RegistrationServlet) servlet).getRegistry().getAllProxies().size();
      if (size > 0) {
        break;
      }
      Thread.sleep(1000);
      tries += 1;
    }
  }

  /**
   * Tests that the registration request servlet throws an error for a request without a proxy
   * configuration
   */
  @Test(expected = GridConfigurationException.class)
  public void testInvalidV2Registration() throws Exception {
    final InvalidV2Request request = new InvalidV2Request();
    request.capabilities.add(DesiredCapabilities.firefox());
    request.id = "http://dummynode:1111";
    final JsonObject json =  new GsonBuilder().serializeNulls().create()
      .toJsonTree(request, InvalidV2Request.class).getAsJsonObject();
    sendCommand("POST", "/", json);
  }


  /**
   * Tests that the registration request servlet can process a V2 RegistrationRequest which
   * contains servlets as a comma separated String.
   */
  @Test
  public void testLegacyV2Registration() throws Exception {
    final RequestV2 request = new RequestV2();
    request.configuration.put("servlets", "foo,bar,baz");
    request.configuration.put("registerCycle", 30001);
    request.configuration.put("proxy", null);
    request.capabilities.add(DesiredCapabilities.firefox());
    request.id = "http://dummynode:1234";
    final JsonObject json = new GsonBuilder().serializeNulls().create()
      .toJsonTree(request, RequestV2.class).getAsJsonObject();
    final FakeHttpServletResponse response = sendCommand("POST", "/", json);
    waitForServletToAddProxy();

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals(((RegistrationServlet) servlet).getRegistry().getAllProxies().size(), 1);

    final RemoteProxy proxy = ((RegistrationServlet) servlet).getRegistry().getAllProxies()
      .getProxyById(request.id);
    assertNotNull(proxy);
    assertEquals(3, proxy.getConfig().servlets.size());
    assertEquals(1, proxy.getConfig().capabilities.size());
    assertEquals(30001, proxy.getConfig().registerCycle.intValue());
    assertEquals(request.id, proxy.getConfig().id);
  }


  /**
   * Tests that the registration request servlet can process a V2 RegistrationRequest from
   * a 3.0.0-beta node.
   */
  @Test
  public void testLegacyV3BetaRegistration() throws Exception {
    final RequestV3Beta request = new RequestV3Beta();
    request.configuration.capabilities.clear();
    request.configuration.proxy = null;
    request.capabilities.add(DesiredCapabilities.firefox());
    request.id = "http://dummynode:2345";
    final JsonObject json = new GsonBuilder().serializeNulls().create()
      .toJsonTree(request, RequestV3Beta.class).getAsJsonObject();
    final FakeHttpServletResponse response = sendCommand("POST", "/", json);
    waitForServletToAddProxy();

    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertEquals(((RegistrationServlet) servlet).getRegistry().getAllProxies().size(), 1);

    final RemoteProxy proxy = ((RegistrationServlet) servlet).getRegistry().getAllProxies()
      .getProxyById(request.id);
    assertNotNull(proxy);
    assertEquals(0, proxy.getConfig().servlets.size());
    assertEquals(1, proxy.getConfig().capabilities.size());
    assertEquals(request.configuration.registerCycle.intValue(), proxy.getConfig().registerCycle.intValue());
    assertEquals(request.id, proxy.getConfig().id);
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
