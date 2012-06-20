/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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

package org.openqa.selenium.server;

import org.junit.Test;
import org.openqa.jetty.http.HttpRequest;
import org.openqa.jetty.http.HttpResponse;
import org.openqa.jetty.util.URI;

import java.io.ByteArrayOutputStream;
import java.io.OutputStream;

import static org.easymock.EasyMock.expectLastCall;
import static org.easymock.classextension.EasyMock.createMock;
import static org.easymock.classextension.EasyMock.replay;
import static org.easymock.classextension.EasyMock.verify;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class ProxyHandlerUnitTest {

  private final int port = 8086;

  @Test
  public void sendNotFoundSends404ResponseCode() throws Exception {
    ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false, port, new Object());
    HttpResponse httpResponseMock = createMock(HttpResponse.class);
    httpResponseMock.sendError(HttpResponse.__404_Not_Found, "Not found");
    expectLastCall().once();
    replay(httpResponseMock);
    proxyHandler.sendNotFound(httpResponseMock);
    verify(httpResponseMock);
  }

  @Test
  public void unknownHostExceptionDoesNotBubble() throws Exception {
    ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false, port, new Object());
    final ByteArrayOutputStream out = new ByteArrayOutputStream();
    HttpResponse response = new HttpResponse() {
      @Override
      public OutputStream getOutputStream() {
        return out;
      }
    };
    HttpRequest request = new HttpRequest();
    request.setMethod("GET");
    request.setURI(new URI("http://does-not-exist.invalidtld/"));
    proxyHandler.handle("foo", "bar", request, response);
  }

  @Test
  public void unknownHostExceptionProvidesUsefulErrorMessage() throws Exception {
    ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false, port, new Object());
    final ByteArrayOutputStream out = new ByteArrayOutputStream();
    HttpResponse response = new HttpResponse() {
      @Override
      public OutputStream getOutputStream() {
        return out;
      }
    };
    HttpRequest request = new HttpRequest();
    request.setMethod("GET");
    request.setURI(new URI("http://does-not-exist.invalidtld/"));
    proxyHandler.handle("foo", "bar", request, response);

    String responseText = new String(out.toByteArray());
    assertTrue(responseText.contains("Check the address for typing errors"));
  }

  @Test
  public void connectExceptionDoesNotBubble() throws Exception {
    ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false, port, new Object());
    final ByteArrayOutputStream out = new ByteArrayOutputStream();
    HttpResponse response = new HttpResponse() {
      @Override
      public OutputStream getOutputStream() {
        return out;
      }
    };
    HttpRequest request = new HttpRequest();
    request.setMethod("GET");
    request.setURI(new URI("http://localhost:60999/"));
    proxyHandler.handle("foo", "bar", request, response);
  }

  @Test
  public void connectExceptionProvidesUsefulErrorMessage() throws Exception {
    ProxyHandler proxyHandler = new ProxyHandler(true, "", "", false, false, port, new Object());
    final ByteArrayOutputStream out = new ByteArrayOutputStream();
    HttpResponse response = new HttpResponse() {
      @Override
      public OutputStream getOutputStream() {
        return out;
      }
    };
    HttpRequest request = new HttpRequest();
    request.setMethod("GET");
    request.setURI(new URI("http://localhost:60999/"));
    proxyHandler.handle("foo", "bar", request, response);

    String responseText = new String(out.toByteArray());
    assertTrue(responseText.contains("The site could be temporarily unavailable or too busy"));
  }

  @Test
  public void handleCallsSendNotFoundWhenAskingForNonExistentResource()
      throws Exception {
    ProxyHandler proxyHandlerMock = createMock(ProxyHandler.class,
        ProxyHandler.class.getDeclaredMethod(
            "sendNotFound", HttpResponse.class));

    String pathInContext = "/invalid";
    String pathParams = "";
    HttpRequest httpRequest = new HttpRequest();
    HttpResponse httpResponse = new HttpResponse();
    httpResponse.setAttribute("NotFound", "True");

    proxyHandlerMock.sendNotFound(httpResponse);
    expectLastCall().once();
    replay(proxyHandlerMock);

    proxyHandlerMock.handle(pathInContext, pathParams, httpRequest,
        httpResponse);
    assertNull(httpResponse.getAttribute("NotFound"));
    verify(proxyHandlerMock);
  }
}
