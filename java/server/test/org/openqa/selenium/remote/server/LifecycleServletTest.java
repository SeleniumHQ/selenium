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

package org.openqa.selenium.remote.server;

import static org.junit.Assert.assertEquals;

import com.google.gson.JsonObject;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.openqa.selenium.BaseServletTest;
import org.openqa.testing.FakeHttpServletResponse;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletResponse;

@RunWith(JUnit4.class)
public class LifecycleServletTest extends BaseServletTest {

  private final Map<String, Boolean> result = new HashMap<>();
  private static final String KEY = "key";

  @Before
  public void setUp() throws ServletException {
    servlet = new LifecycleServlet();
    result.put(KEY, false);
    ((LifecycleServlet) servlet).setShutdown(integer -> result.put(KEY, true));
    servlet.init();
  }

  @Test
  public void testShutdownCall() throws Exception {
    JsonObject parameters = new JsonObject();
    parameters.addProperty("action", "shutdown");
    runTest(parameters, true);
  }

  @Test
  public void testShutdownNegativeCondition() throws Exception {
    JsonObject parameters = new JsonObject();
    parameters.addProperty("action", "");
    runTest(parameters, false);
  }

  private void runTest(JsonObject parameters, boolean expected) throws Exception {
    FakeHttpServletResponse rsp = sendCommand("GET", "/", parameters);
    TimeUnit.SECONDS.sleep(2);
    assertEquals(HttpServletResponse.SC_OK, rsp.getStatus());
    assertEquals(expected, result.get(KEY));
  }

}
