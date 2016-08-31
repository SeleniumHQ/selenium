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

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.internal.utils.configuration.GridHubConfiguration;
import org.openqa.grid.web.servlet.ResourceServlet;

import java.util.ArrayList;

public class GridHubConfigurationTest {

  @Test
  public void testGetTimeout() throws Exception {
    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
    assertEquals(1800, gridHubConfiguration.timeout.longValue()); // From the configuration default value
    gridHubConfiguration.timeout = 123;
    assertEquals(123, gridHubConfiguration.timeout.longValue());
  }

  @Test
  public void testGetBrowserTimeout() throws Exception {
    GridHubConfiguration gridHubConfiguration = new GridHubConfiguration();
    assertEquals(0, gridHubConfiguration.browserTimeout.longValue());// From DefaultHub.json file
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
}
