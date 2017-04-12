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

package org.openqa.selenium.remote.internal;

import static org.junit.Assert.assertEquals;

import com.google.common.collect.HashMultimap;
import com.google.common.collect.ImmutableList;
import com.google.common.collect.Multimap;

import org.junit.Test;
import org.openqa.selenium.net.PortProber;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpMethod;
import org.openqa.selenium.remote.http.HttpRequest;
import org.openqa.selenium.remote.http.HttpResponse;
import org.seleniumhq.jetty9.server.Server;
import org.seleniumhq.jetty9.servlet.ServletContextHandler;
import org.seleniumhq.jetty9.servlet.ServletHolder;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class ApacheHttpClientTest {

  @Test
  public void responseShouldCaptureASingleHeader() throws Exception {
    HashMultimap<String, String> headers = HashMultimap.create();
    headers.put("Cake", "Delicious");

    HttpResponse response = getResponseWithHeaders(headers);

    String value = response.getHeader("Cake");
    assertEquals("Delicious", value);
  }

  /**
   * The HTTP Spec that it should be
   * <a href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">safe to combine them
   * </a>, but things like the <a href="https://www.ietf.org/rfc/rfc2109.txt">cookie spec</a> make
   * this hard (notably when a legal value may contain a comma).
   */
  @Test
  public void responseShouldKeepMultipleHeadersSeparate() throws Exception {
    HashMultimap<String, String> headers = HashMultimap.create();
    headers.put("Cheese", "Cheddar");
    headers.put("Cheese", "Brie, Gouda");

    HttpResponse response = getResponseWithHeaders(headers);

    ImmutableList<String> values = ImmutableList.copyOf(response.getHeaders("Cheese"));

    assertEquals("Cheddar", values.get(0));
    assertEquals("Brie, Gouda", values.get(1));
  }

  private HttpResponse getResponseWithHeaders(final Multimap<String, String> headers)
      throws Exception {
    Server server = new Server(PortProber.findFreePort());
    ServletContextHandler handler = new ServletContextHandler();
    handler.setContextPath("");

    class Headers extends HttpServlet {
      @Override
      protected void doGet(HttpServletRequest req, HttpServletResponse resp)
          throws ServletException, IOException {
        headers.forEach(resp::addHeader);
        resp.setContentLengthLong(0);
      }
    }
    ServletHolder holder = new ServletHolder(new Headers());
    handler.addServlet(holder, "/*");

    server.setHandler(handler);

    server.start();
    try {
      HttpClient client = new ApacheHttpClient.Factory().createClient(server.getURI().toURL());
      HttpRequest request = new HttpRequest(HttpMethod.GET, "/foo");
      return client.execute(request, true);
    } finally {
      server.stop();
    }
  }
}
