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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import com.google.common.collect.Maps;

import org.junit.Test;
import org.openqa.grid.web.servlet.ResourceServlet;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map;

public class GridConfigurationTest {
  @Test
  public void testDefaults() {
    GridConfiguration gc = new GridConfiguration();
    assertNull(gc.cleanUpCycle);
    assertTrue(gc.custom.isEmpty());
    assertNull(gc.host);
    assertEquals(1, gc.maxSession.intValue());
    assertNull(gc.servlets);
    assertNull(gc.withoutServlets);
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
    Map<String, String> custom = Maps.newHashMap();
    custom.put("foo", "bar");
    other.custom = custom;
    other.host = "10.10.10.1";
    other.maxSession = 20;
    other.servlets = Arrays.asList(new String[] { "com.foo.ServletA" });
    other.withoutServlets = Arrays.asList(new String[] { "com.foo.ServletB" });
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
