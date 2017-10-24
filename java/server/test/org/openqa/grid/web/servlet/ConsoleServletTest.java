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

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.grid.internal.Registry;
import org.openqa.grid.web.servlet.beta.ConsoleServlet;
import org.openqa.testing.FakeHttpServletResponse;
import org.seleniumhq.jetty9.server.handler.ContextHandler;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public class ConsoleServletTest extends BaseServletTest {
  @Before
  public void setUp() throws ServletException {
    servlet = new ConsoleServlet() {
      @Override
      public ServletContext getServletContext() {
        final ContextHandler.Context servletContext = new ContextHandler().getServletContext();
        servletContext.setAttribute(Registry.KEY, Registry.newInstance());
        return servletContext;
      }
    };
    servlet.init();
  }

  @Test
  public void testGetConsoleResponse() throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("GET", "/");
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertNotNull(response.getBody());
    assertTrue(response.getBody().contains("<title>Grid Console</title>"));
  }
}
