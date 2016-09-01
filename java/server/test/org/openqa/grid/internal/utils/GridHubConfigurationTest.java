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

package org.openqa.grid.internal.utils;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNull;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.servlet.ResourceServlet;

import java.util.ArrayList;

public class GridHubConfigurationTest {

  @Test
  public void testSetTimeout() throws Exception {
    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
    gridHubConfiguration.timeout = 123;
    assertEquals(123, gridHubConfiguration.timeout.longValue());
  }

  @Test
  public void testSetBrowserTimeout() throws Exception {
    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
    gridHubConfiguration.browserTimeout = 1233;
    assertEquals(1233, gridHubConfiguration.browserTimeout.longValue());
  }

  @Test
  public void commandLineParsing() throws Exception {
    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
    String[] args = "-timeout 32123 -browserTimeout 456".split(" ");
    new JCommander(gridHubConfiguration, args);
    assertEquals(32123L, gridHubConfiguration.timeout.longValue());
    assertEquals(456L, gridHubConfiguration.browserTimeout.longValue());
  }

  @Test
  public void testWithOutServlets() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    assertFalse(ghc.isWithOutServlet(ResourceServlet.class));

    ghc.withoutServlets = new ArrayList<>();
    ghc.withoutServlets.add(ResourceServlet.class.getCanonicalName());
    assertTrue(ghc.isWithOutServlet(ResourceServlet.class));
  }

  @Test
  public void testDefaults() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    assertEquals("standalone", ghc.role);
    assertEquals(0L, ghc.browserTimeout.longValue());
    assertEquals(false, ghc.debug);
    assertEquals(false, ghc.help);
    assertEquals(false, ghc.logLongForm);
    assertEquals(1800L, ghc.timeout.longValue());
    assertEquals(5000L, ghc.cleanUpCycle.longValue());
    assertEquals(1L, ghc.maxSession.longValue());
    assertEquals(-1L, ghc.jettyMaxThreads.longValue());
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                    ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals(-1L, ghc.newSessionWaitTimeout.longValue());
    assertEquals(true, ghc.throwOnCapabilityNotPresent);
    assertTrue(ghc.servlets.isEmpty());
    assertTrue(ghc.custom.isEmpty());
    assertNull(ghc.withoutServlets);
    assertNull(ghc.hubConfig);
    assertNull(ghc.log);
    assertNull(ghc.prioritizer);
    assertNull(ghc.host);
    assertNull(ghc.port);
  }

  @Test
  public void testToString() {
    GridHubConfiguration ghc = new GridHubConfiguration();

    assertTrue(ghc.toString().contains("-role standalone "));
    assertFalse(ghc.toString().contains("-servlets"));
    assertFalse(ghc.toString().contains("custom"));

    ghc = new GridHubConfiguration();
    String[] args = ("-servlet com.foo.bar.ServletA -servlet com.foo.bar.ServletB"
                     + " -custom foo=bar,bar=baz").split(" ");
    new JCommander(ghc, args);
    
    assertTrue(ghc.toString().contains("-servlets com.foo.bar.ServletA"
                                       + " -servlets com.foo.bar.ServletB"));
    assertTrue(ghc.toString().contains("custom {"));
    assertTrue(ghc.toString().contains("bar=baz"));
    assertTrue(ghc.toString().contains("foo=bar"));
  }
}
