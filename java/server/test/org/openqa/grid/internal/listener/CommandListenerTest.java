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

package org.openqa.grid.internal.listener;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.Before;
import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.internal.BaseRemoteProxy;
import org.openqa.grid.internal.DefaultGridRegistry;
import org.openqa.grid.internal.GridRegistry;
import org.openqa.grid.internal.TestSession;
import org.openqa.grid.internal.listeners.CommandListener;
import org.openqa.grid.internal.mock.GridHelper;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.internal.utils.configuration.GridNodeConfiguration;
import org.openqa.grid.web.Hub;
import org.openqa.grid.web.servlet.handler.RequestHandler;
import org.openqa.grid.web.servlet.handler.SeleniumBasedRequest;
import org.openqa.grid.web.servlet.handler.SeleniumBasedResponse;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpResponse;

import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.Charset;
import java.util.Collections;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class CommandListenerTest {

  private static final byte[] responseBytes = new byte[] { 0, 0, 0, 0, 0 };

  static class MyRemoteProxy extends BaseRemoteProxy implements CommandListener {

    public MyRemoteProxy(RegistrationRequest request, GridRegistry registry) {
      super(request, registry);
    }

    @Override
    public void afterCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
      ((SeleniumBasedResponse) response).setForwardedContent(responseBytes);
    }

    @Override
    public void beforeCommand(TestSession session, HttpServletRequest request, HttpServletResponse response) {
      // no-op
    }

    @Override
    public URL getRemoteHost() {
      try {
        return new URL("http://machine1");
      } catch (MalformedURLException e) {
        e.printStackTrace();
      }

      return null;
    }

    @Override
    public HttpClient getHttpClient(URL url, int connectionTimeout, int readTimeout) {
      // Create mocks for network traffic
      HttpClient client = mock(HttpClient.class);
      HttpResponse response = mock(HttpResponse.class);

      when(response.getStatus()).thenReturn(200);
      when(response.getHeaderNames()).thenReturn(Collections.emptyList());
      when(response.getContent()).thenReturn("Done".getBytes());
      when(response.getContentString()).thenReturn("Done");
      when(response.getContentEncoding()).thenReturn(Charset.defaultCharset());
      try {
        when(client.execute(any())).thenReturn(response);
      } catch (IOException e) {
        e.printStackTrace();
      }

      return client;
    }
  }

  private RegistrationRequest req = null;
  private Map<String, Object> app1 = new HashMap<>();

  @Before
  public void prepare() {
    app1.put(CapabilityType.APPLICATION_NAME, "app1");
    GridNodeConfiguration config = new GridNodeConfiguration();
    config.capabilities.add(new DesiredCapabilities(app1));
    req = new RegistrationRequest(config);
  }

  @Test
  public void canModifyResponseWithListener() throws IOException {
    GridRegistry registry = DefaultGridRegistry.newInstance(new Hub(new GridHubConfiguration()));
    registry.add(new MyRemoteProxy(req, registry));

    RequestHandler req = GridHelper.createNewSessionHandler(registry, app1);
    req.process();
    TestSession session = req.getSession();

    // Mock the request so it seems like a new session
    SeleniumBasedRequest request = mock(SeleniumBasedRequest.class);
    when(request.getRequestURI()).thenReturn("session");
    when(request.getServletPath()).thenReturn("session");
    when(request.getContextPath()).thenReturn("");
    when(request.getMethod()).thenReturn("GET");

    Enumeration<String> strings = Collections.emptyEnumeration();
    when(request.getHeaderNames()).thenReturn(strings);

    HttpServletResponse response = mock(HttpServletResponse.class);
    ServletOutputStream stream = mock(ServletOutputStream.class);
    when(response.getOutputStream()).thenReturn(stream);

    session.forward(request, response, true);

    // When the output stream is being written back to the remote, it should
    // only contain the bits we modified in
    // MyRemoteProxy's afterCommand method
    verify(stream).write(responseBytes);
  }
}
