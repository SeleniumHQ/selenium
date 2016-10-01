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
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertNull;

import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.beust.jcommander.JCommander;

import org.junit.Test;
import org.openqa.grid.internal.listeners.Prioritizer;

import java.util.Map;

public class GridHubConfigurationTest {

  @Test
  public void testDefaults() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    assertEquals("hub", ghc.role);
    assertEquals(0L, ghc.browserTimeout.longValue());
    assertEquals(5000L, ghc.cleanUpCycle.longValue());
    assertEquals(-1L, ghc.jettyMaxThreads.longValue());
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                    ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals(-1L, ghc.newSessionWaitTimeout.longValue());
    assertEquals(true, ghc.throwOnCapabilityNotPresent);
    assertTrue(ghc.servlets.isEmpty());
    assertNull(ghc.hubConfig);
    assertNull(ghc.prioritizer);
    assertNull(ghc.host);
    assertNull(ghc.port);
  }

  @Test
  public void testLoadFromJson() {
    JsonObject json = new JsonParser()
      .parse("{ \"host\": \"dummyhost\", \"port\": 1234 }").getAsJsonObject();
    GridHubConfiguration ghc = GridHubConfiguration.loadFromJSON(json);

    assertEquals("hub", ghc.role);
    assertEquals(1234, ghc.port.intValue());
    assertEquals("dummyhost", ghc.host);
  }

  @Test
  public void testMergeWithRealValues() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    GridHubConfiguration other = new GridHubConfiguration();
    other.prioritizer = new Prioritizer() {
      @Override
      public int compareTo(Map<String, Object> a, Map<String, Object> b) {
        return 0;
      }
    };
    other.hubConfig = "foo.json";
    other.throwOnCapabilityNotPresent = false;
    other.newSessionWaitTimeout = 100;
    ghc.merge(other);

    assertSame(other.capabilityMatcher, ghc.capabilityMatcher);
    assertSame(other.prioritizer, ghc.prioritizer);
    assertEquals(other.newSessionWaitTimeout, ghc.newSessionWaitTimeout);
    assertEquals(other.throwOnCapabilityNotPresent, ghc.throwOnCapabilityNotPresent);
    // hubConfig is not a merged value
    assertTrue(ghc.hubConfig == null);
  }

  @Test
  public void testMergeNullDoesNotOverrideExistingValues() {
    GridHubConfiguration other = new GridHubConfiguration();
    other.capabilityMatcher = null;
    other.newSessionWaitTimeout = null;
    other.throwOnCapabilityNotPresent = null;
    other.prioritizer = null;
    GridHubConfiguration ghc = new GridHubConfiguration();
    ghc.merge(other);

    assertTrue(ghc.capabilityMatcher != null);
    assertTrue(ghc.newSessionWaitTimeout != null);
    assertTrue(ghc.throwOnCapabilityNotPresent != null);
    // the default is null -- merge(null, null) = null;
    assertTrue(ghc.prioritizer == null);
  }

  @Test
  public void testMergeNullTargetDoesNotProduceNPE() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    ghc.capabilityMatcher = null;
    ghc.newSessionWaitTimeout = null;
    ghc.prioritizer = null;
    ghc.throwOnCapabilityNotPresent = null;
    GridHubConfiguration other = new GridHubConfiguration();
    ghc.merge(other);

    assertEquals(other.capabilityMatcher, ghc.capabilityMatcher);
    assertEquals(other.newSessionWaitTimeout, ghc.newSessionWaitTimeout);
    assertEquals(other.prioritizer, ghc.prioritizer);
    assertEquals(other.throwOnCapabilityNotPresent, ghc.throwOnCapabilityNotPresent);
  }

  @Test
  public void testToString() {
    GridHubConfiguration ghc = new GridHubConfiguration();

    assertTrue(ghc.toString().contains("-role hub"));
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

  @Test
  public void testJcommanderConverterCapabilityMatcher() {
    String[] hubArgs = {"-capabilityMatcher", "org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                        "-prioritizer", "org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer"};
    GridHubConfiguration ghc = new GridHubConfiguration();
    new JCommander(ghc, hubArgs);
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals("org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer",
                 ghc.prioritizer.getClass().getCanonicalName());
  }
}
