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

import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import org.junit.Before;
import org.junit.Test;
import org.openqa.testing.FakeHttpServletResponse;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

public class ResourceServletTest extends BaseServletTest {

  @Before
  public void setUp() throws ServletException {
    servlet = new ResourceServlet();
    servlet.init();
  }

  @Test
  public void testGetResourceSuccess() throws IOException, ServletException {
    FakeHttpServletResponse response = sendCommand("GET",
                                                   "/org/openqa/grid/images/consoleservlet.css");
    assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    assertNotNull(response.getBody());
  }

  @Test
  public void testGetResouceFailed() {
    assertThatExceptionOfType(Error.class)
        .isThrownBy(() -> sendCommand("GET", "/foo/bar"));
  }
}
