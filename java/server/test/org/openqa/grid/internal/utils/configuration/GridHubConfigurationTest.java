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
import static org.junit.Assert.assertNotNull;
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
    // these values come from the GridHubConfiguration class
    assertEquals(GridHubConfiguration.DEFAULT_PORT, ghc.port);
    assertEquals(GridHubConfiguration.DEFAULT_ROLE, ghc.role);
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                    ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals(GridHubConfiguration.DEFAULT_NEW_SESSION_WAIT_TIMEOUT,
                 ghc.newSessionWaitTimeout);
    assertEquals(GridHubConfiguration.DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE,
                 ghc.throwOnCapabilityNotPresent);
    assertNull(ghc.hubConfig);
    assertNull(ghc.prioritizer);

    // these values come from the GridConfiguration base class
    assertEquals(GridHubConfiguration.DEFAULT_CLEANUP_CYCLE, ghc.cleanUpCycle);
    assertNull(ghc.host);
    assertNull(ghc.maxSession);
    assertNotNull(ghc.custom);
    assertTrue(ghc.custom.isEmpty());
    assertNotNull(ghc.servlets);
    assertTrue(ghc.servlets.isEmpty());
    assertNotNull(ghc.withoutServlets);
    assertTrue(ghc.withoutServlets.isEmpty());

    // these values come from the StandaloneConfiguration base class
    assertEquals(GridHubConfiguration.DEFAULT_TIMEOUT, ghc.timeout);
    assertEquals(GridHubConfiguration.DEFAULT_BROWSER_TIMEOUT, ghc.browserTimeout);
    assertFalse(ghc.debug);
    assertFalse(ghc.help);
    assertNull(ghc.jettyMaxThreads);
    assertNull(ghc.log);
  }

  @Test
  public void testConstructorEqualsDefaultConfig() {
    GridHubConfiguration actual = new GridHubConfiguration();
    GridHubConfiguration expected =
      GridHubConfiguration.loadFromJSON(GridHubConfiguration.DEFAULT_HUB_CONFIG_FILE);

    assertEquals(expected.role, actual.role);
    assertEquals(expected.port, actual.port);
    assertEquals(expected.capabilityMatcher.getClass().getCanonicalName(),
                 actual.capabilityMatcher.getClass().getCanonicalName());
    assertEquals(expected.newSessionWaitTimeout, actual.newSessionWaitTimeout);
    assertEquals(expected.throwOnCapabilityNotPresent, actual.throwOnCapabilityNotPresent);
    assertEquals(expected.hubConfig, actual.hubConfig);
    assertEquals(expected.prioritizer, actual.prioritizer);
    assertEquals(expected.cleanUpCycle, actual.cleanUpCycle);
    assertEquals(expected.host, actual.host);
    assertEquals(expected.maxSession, actual.maxSession);
    assertEquals(expected.custom.size(), actual.custom.size());
    assertEquals(expected.servlets.size(), actual.servlets.size());
    assertEquals(expected.withoutServlets.size(), actual.withoutServlets.size());
    assertEquals(expected.timeout, actual.timeout);
    assertEquals(expected.browserTimeout, actual.browserTimeout);
    assertEquals(expected.debug, actual.debug);
    assertEquals(expected.help, actual.help);
    assertEquals(expected.jettyMaxThreads, actual.jettyMaxThreads);
    assertEquals(expected.log, actual.log);
  }

  @Test
  public void testLoadFromJson() {
    JsonObject json = new JsonParser()
      .parse("{ \"host\": \"dummyhost\", \"port\": 1234 }").getAsJsonObject();
    GridHubConfiguration ghc = GridHubConfiguration.loadFromJSON(json);

    assertEquals("hub", ghc.role);
    assertEquals(1234, ghc.port.intValue());
    assertEquals("dummyhost", ghc.host);
    assertEquals(-1, ghc.newSessionWaitTimeout.intValue());
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
