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

package org.openqa.grid.internal.utils.configuration;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.grid.web.servlet.ResourceServlet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class GridConfigurationTest {

  static final Integer DEFAULT_TIMEOUT = StandaloneConfigurationTest.DEFAULT_TIMEOUT;
  static final Integer DEFAULT_BROWSER_TIMEOUT = StandaloneConfigurationTest.DEFAULT_BROWSER_TIMEOUT;
  static final String DEFAULT_HOST = StandaloneConfigurationTest.DEFAULT_HOST;
  static final Integer DEFAULT_PORT = StandaloneConfigurationTest.DEFAULT_PORT;
  static final Boolean DEFAULT_DEBUG_TOGGLE = StandaloneConfigurationTest.DEFAULT_DEBUG_TOGGLE;

  @Test
  public void testDefaults() {
    GridConfiguration gc = new GridConfiguration();
    // these values come from the GridConfiguration class
    assertNull(gc.cleanUpCycle);
    assertNull(gc.maxSession);
    assertNotNull(gc.custom);
    assertTrue(gc.custom.isEmpty());
    assertEquals(DEFAULT_HOST, gc.host);
    assertNotNull(gc.servlets);
    assertTrue(gc.servlets.isEmpty());
    assertNotNull(gc.withoutServlets);
    assertTrue(gc.withoutServlets.isEmpty());
    // these values come from the StandaloneConfiguration base class
    assertEquals(DEFAULT_PORT, gc.port);
    assertEquals(DEFAULT_TIMEOUT, gc.timeout);
    assertEquals(DEFAULT_BROWSER_TIMEOUT, gc.browserTimeout);
    assertEquals(DEFAULT_DEBUG_TOGGLE, gc.debug);
    assertNull(gc.jettyMaxThreads);
    assertNull(gc.log);
    assertEquals("standalone", gc.role);
  }

  @Test
  public void testWithOutServlets() {
    GridConfiguration gc = new GridConfiguration();
    assertFalse(gc.isWithOutServlet(ResourceServlet.class));

    gc.withoutServlets = new ArrayList<>();
    gc.withoutServlets.add(ResourceServlet.class.getCanonicalName());
    assertTrue(gc.isWithOutServlet(ResourceServlet.class));
  }

  @Test
  public void testMergeWithRealValues() {
    GridConfiguration gc = new GridConfiguration();
    GridConfiguration other = new GridConfiguration();
    other.cleanUpCycle = 10;
    Map<String, String> custom = new HashMap<>();
    custom.put("foo", "bar");
    other.custom = custom;
    other.host = "10.10.10.1";
    other.maxSession = 20;
    other.servlets = Arrays.asList("com.foo.ServletA");
    other.withoutServlets = Arrays.asList("com.foo.ServletB");
    gc.merge(other);

    assertEquals(other.cleanUpCycle, gc.cleanUpCycle);
    assertTrue(gc.custom.containsKey("foo"));
    assertEquals(other.maxSession, gc.maxSession);
    assertSame(other.servlets, gc.servlets);
    assertTrue(gc.servlets.contains("com.foo.ServletA"));
    assertSame(other.withoutServlets, gc.withoutServlets);
    assertTrue(gc.withoutServlets.contains("com.foo.ServletB"));
    // host is merge protected
    assertNotEquals(other.host, gc.host);
  }
}
