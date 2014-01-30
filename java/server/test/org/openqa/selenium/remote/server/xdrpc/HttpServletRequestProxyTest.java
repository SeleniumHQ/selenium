/*
 Copyright 2011 Software Freedom Conservancy.

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

package org.openqa.selenium.remote.server.xdrpc;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.io.CharStreams;

import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

/**
 * Unit tests for {@link HttpServletRequestProxy}.
 */
public class HttpServletRequestProxyTest {

  private static final CrossDomainRpc CROSS_DOMAIN_RPC = new CrossDomainRpc(
      "POST", "/session/foo/url", "foo bar baz");
  
  private static final String RPC_PATH = "/rpc";
  private static final String MIME_TYPE = "application/xdrpc";

  private HttpServletRequest mockRequest;
  private HttpServletRequest proxiedRequest;

  @Before
  public void setUp() throws IOException {
    mockRequest = mock(HttpServletRequest.class);
    proxiedRequest = HttpServletRequestProxy.createProxy(mockRequest,
        CROSS_DOMAIN_RPC, RPC_PATH, MIME_TYPE);
  }

  @Test
  public void overridesRequestMethod() {
    assertEquals(CROSS_DOMAIN_RPC.getMethod(), proxiedRequest.getMethod());
  }

  @Test
  public void overridesRequestUrl() {
    when(mockRequest.getRequestURL()).thenReturn(
        new StringBuffer()
            .append("http://localhost:4444/wd/hub")
            .append(RPC_PATH)
            .append("?queryString=true"));

    assertEquals("http://localhost:4444/wd/hub/session/foo/url",
        proxiedRequest.getRequestURL().toString());
  }

  @Test
  public void overridesRequestUri() {
    when(mockRequest.getRequestURI()).thenReturn("http://localhost:4444/wd/hub" + RPC_PATH);

    assertEquals("http://localhost:4444/wd/hub/session/foo/url",
        proxiedRequest.getRequestURI());
  }

  @Test
  public void overridesRequestPathInfo() {
    assertEquals("/session/foo/url", proxiedRequest.getPathInfo());
  }
  
  @Test
  public void overridesRequestReader() throws IOException {
    assertEquals(CROSS_DOMAIN_RPC.getData(),
        CharStreams.toString(proxiedRequest.getReader()));
  }

  @Test
  public void onlyOverridesAcceptHeader() {
    when(mockRequest.getHeader("x-custom-header")).thenReturn("custom-header-value");

    assertEquals(MIME_TYPE, proxiedRequest.getHeader("accept"));
    assertEquals(MIME_TYPE, proxiedRequest.getHeader("ACCEPT"));
    assertEquals("custom-header-value",
        proxiedRequest.getHeader("x-custom-header"));
  }
  
  @Test
  public void doesNotOverrideNonRpcRelatedMethods() {
    when(mockRequest.getContextPath()).thenReturn("/contextpath");

    assertEquals("/contextpath", proxiedRequest.getContextPath());
  }
}
