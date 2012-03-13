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

import junit.framework.TestCase;

import org.jmock.Expectations;
import org.jmock.Mockery;
import org.json.JSONObject;
import org.junit.Test;
import org.openqa.selenium.remote.ErrorCodes;
import org.openqa.selenium.remote.server.rest.RestishHandler;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;

import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Unit tests for {@link CrossDomainRpcRenderer}
 */
public class CrossDomainRpcRendererTest extends TestCase {
  
  private Mockery mockery;
  private HttpServletRequest mockRequest;
  private HttpServletResponse mockResponse;
  private RestishHandler mockHandler;

  private StringWriter stringWriter;
  private ServletOutputStream servletOutputStream;

  @Override
  protected void setUp() {
    mockery = new Mockery();
    mockRequest = mockery.mock(HttpServletRequest.class);
    mockResponse = mockery.mock(HttpServletResponse.class);
    mockHandler = mockery.mock(RestishHandler.class);
    
    stringWriter = new StringWriter();
    PrintWriter printWriter = new PrintWriter(stringWriter);
    servletOutputStream = new StringServletOutputStream(printWriter);
  }

  @Test
  public void correctlyRendersANormalCrossDomainRpc() throws Exception {
    final String response = new JSONObject().put("foo", "bar").toString();
    final CrossDomainRpc rpc = new CrossDomainRpc("GET", "/session", "");

    mockery.checking(new Expectations() {{
      allowing(mockRequest).getAttribute("rpc");
      will(returnValue(rpc));

      allowing(mockRequest).getAttribute("response");
      will(returnValue(response));

      one(mockResponse).setStatus(200);
      one(mockResponse).setContentType("application/json");
      one(mockResponse).setCharacterEncoding("UTF-8");
      one(mockResponse).setContentLength(response.length());
      allowing(mockResponse).getOutputStream();
      will(returnValue(servletOutputStream));
    }});

    new CrossDomainRpcRenderer(":response", ":error")
        .render(mockRequest, mockResponse, mockHandler);

    mockery.assertIsSatisfied();
    assertEqualsStringPlusTheDifferenceInNullCharacters(
        response, stringWriter.toString());
  }
  
  @Test
  public void correctlyRendersCrossDomainRpcsWithMissingResponseObjects()
      throws Exception {
    final CrossDomainRpc rpc = new CrossDomainRpc("POST", "/session/foo/url",
        "{\"url\":\"http://www.google.com\"}");
    
    mockery.checking(new Expectations() {{
      allowing(mockRequest).getAttribute("rpc");
      will(returnValue(rpc));

      allowing(mockRequest).getAttribute("response");
      will(returnValue(null));
      allowing(mockRequest).getAttribute("error");
      will(returnValue(null));
      
      allowing(mockRequest).getRequestURI();
      will(returnValue("http://localhost:4444/wd/hub/session/foo/url"));

      one(mockResponse).setStatus(200);
      one(mockResponse).setContentType("application/json");
      one(mockResponse).setCharacterEncoding("UTF-8");
      one(mockResponse).setContentLength(with(any(Integer.class)));
      allowing(mockResponse).getOutputStream();
      will(returnValue(servletOutputStream));
    }});

    new CrossDomainRpcRenderer(":response", ":error")
        .render(mockRequest, mockResponse, mockHandler);

    mockery.assertIsSatisfied();

    JSONObject response = new JSONObject(stringWriter.toString());
    assertEquals(ErrorCodes.SUCCESS, response.getInt("status"));
    assertTrue(response.isNull("value"));
    assertEquals("foo", response.getString("sessionId"));
  }

  /**
   * Asserts the actual string is equal to the expected string. If the
   * actual string is of greater length, asserts that extra characters are all
   * the null characters (\0).
   *
   * @param expected Expected string.
   * @param actual Actual string.
   */
  private static void assertEqualsStringPlusTheDifferenceInNullCharacters(
      String expected, String actual) {
    int difference = actual.length() - expected.length();
    assertEquals(expected, actual.substring(0, expected.length()));
    assertEquals(repeat('\0', difference),
        actual.substring(expected.length()));
  }

  private static String repeat(char c, int n) {
    StringBuilder builder = new StringBuilder();
    for (int i = 0; i < n; ++i) {
      builder.append(c);
    }
    return builder.toString();
  }

  private static class StringServletOutputStream extends ServletOutputStream {

    private final PrintWriter printWriter;

    private StringServletOutputStream(PrintWriter printWriter) {
      this.printWriter = printWriter;
    }

    @Override
    public void write(int i) throws IOException {
      printWriter.write(i);
    }
  }
}
