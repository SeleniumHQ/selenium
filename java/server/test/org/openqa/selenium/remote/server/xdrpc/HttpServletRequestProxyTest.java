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

import com.google.common.io.CharStreams;

import org.jmock.Expectations;
import org.jmock.Mockery;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;

import static org.junit.Assert.assertEquals;

/**
 * Unit tests for {@link HttpServletRequestProxy}.
 */
public class HttpServletRequestProxyTest {

  private static final CrossDomainRpc CROSS_DOMAIN_RPC = new CrossDomainRpc(
      "POST", "/session/foo/url", "foo bar baz");
  
  private static final String RPC_PATH = "/rpc";
  private static final String MIME_TYPE = "application/xdrpc";

  private Mockery mockery;
  private HttpServletRequest mockRequest;
  private HttpServletRequest proxiedRequest;

  @Before
  public void setUp() throws IOException {
    mockery = new Mockery();
    mockRequest = mockery.mock(HttpServletRequest.class);
    proxiedRequest = HttpServletRequestProxy.createProxy(mockRequest,
        CROSS_DOMAIN_RPC, RPC_PATH, MIME_TYPE);
  }

  @After
  public void tearDown() {
    mockery.assertIsSatisfied();
  }

  @Test
  public void overridesRequestMethod() {
    assertEquals(CROSS_DOMAIN_RPC.getMethod(), proxiedRequest.getMethod());
  }

  @Test
  public void overridesRequestUrl() {
    mockery.checking(new Expectations() {{
      exactly(1).of(mockRequest).getRequestURL();
      will(returnValue(
          new StringBuffer()
              .append("http://localhost:4444/wd/hub")
              .append(RPC_PATH)
              .append("?queryString=true")));
    }});

    assertEquals("http://localhost:4444/wd/hub/session/foo/url",
        proxiedRequest.getRequestURL().toString());
  }

  @Test
  public void overridesRequestUri() {
    mockery.checking(new Expectations() {{
      exactly(1).of(mockRequest).getRequestURI();
      will(returnValue("http://localhost:4444/wd/hub" + RPC_PATH));
    }});

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
    mockery.checking(new Expectations() {{
      exactly(1).of(mockRequest).getHeader("x-custom-header");
      will(returnValue("custom-header-value"));
    }});

    assertEquals(MIME_TYPE, proxiedRequest.getHeader("accept"));
    assertEquals(MIME_TYPE, proxiedRequest.getHeader("ACCEPT"));
    assertEquals("custom-header-value",
        proxiedRequest.getHeader("x-custom-header"));
  }
  
  @Test
  public void doesNotOverrideNonRpcRelatedMethods() {
    mockery.checking(new Expectations() {{
      exactly(1).of(mockRequest).getContextPath();
      will(returnValue("/contextpath"));
    }});

    assertEquals("/contextpath", proxiedRequest.getContextPath());
  }
}
