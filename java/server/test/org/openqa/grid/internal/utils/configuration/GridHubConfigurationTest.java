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
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.openqa.grid.internal.cli.GridHubCliOptions;
import org.openqa.grid.internal.utils.configuration.json.HubJsonConfiguration;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Collections;

public class GridHubConfigurationTest {

  static final Integer DEFAULT_TIMEOUT = StandaloneConfigurationTest.DEFAULT_TIMEOUT;
  static final Integer DEFAULT_BROWSER_TIMEOUT = StandaloneConfigurationTest.DEFAULT_BROWSER_TIMEOUT;
  static final String DEFAULT_HOST = StandaloneConfigurationTest.DEFAULT_HOST;
  static final Integer DEFAULT_PORT = StandaloneConfigurationTest.DEFAULT_PORT;
  static final Boolean DEFAULT_DEBUG_TOGGLE = StandaloneConfigurationTest.DEFAULT_DEBUG_TOGGLE;

  static final Integer DEFAULT_CLEANUP_CYCLE = 5000;
  static final Integer DEFAULT_NEW_SESSION_WAIT_TIMEOUT = -1;
  static final Boolean DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE = true;
  static final String DEFAULT_HUB_REGISTRY_CLASS = "org.openqa.grid.internal.DefaultGridRegistry";
  static final String DEFAULT_CAPABILITY_MATCHER_CLASS = "org.openqa.grid.internal.utils.DefaultCapabilityMatcher";

  @Test
  public void testDefaults() {
    checkDefaults(new GridHubConfiguration());
  }

  @Test
  public void testDefaultsFromConfig() {
    checkDefaults(new GridHubConfiguration(
        HubJsonConfiguration.loadFromResourceOrFile(GridHubConfiguration.DEFAULT_HUB_CONFIG_FILE)));
  }

  @Test
  public void testDefaultsFromCli() {
    checkDefaults(new GridHubCliOptions.Parser().parse(new String[]{}).toConfiguration());
  }

  private void checkDefaults(GridHubConfiguration ghc) {
    // these values come from the GridHubConfiguration class
    assertEquals(DEFAULT_PORT, ghc.port);
    assertEquals(GridHubConfiguration.ROLE, ghc.role);
    assertEquals(DEFAULT_CAPABILITY_MATCHER_CLASS, ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals(DEFAULT_NEW_SESSION_WAIT_TIMEOUT, ghc.newSessionWaitTimeout);
    assertEquals(DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE, ghc.throwOnCapabilityNotPresent);
    assertNull(ghc.hubConfig);
    assertNull(ghc.prioritizer);

    // these values come from the GridConfiguration base class
    assertEquals(DEFAULT_CLEANUP_CYCLE, ghc.cleanUpCycle);
    assertEquals(DEFAULT_HOST, ghc.host);
    assertNull(ghc.maxSession);
    assertNotNull(ghc.custom);
    assertTrue(ghc.custom.isEmpty());
    assertNotNull(ghc.servlets);
    assertTrue(ghc.servlets.isEmpty());
    assertNotNull(ghc.withoutServlets);
    assertTrue(ghc.withoutServlets.isEmpty());

    // these values come from the StandaloneConfiguration base class
    assertEquals(DEFAULT_TIMEOUT, ghc.timeout);
    assertEquals(DEFAULT_BROWSER_TIMEOUT, ghc.browserTimeout);
    assertEquals(DEFAULT_DEBUG_TOGGLE, ghc.debug);
    assertNull(ghc.jettyMaxThreads);
    assertNull(ghc.log);
  }

  @Test
  public void testLoadFromJson() throws IOException {
    GridHubConfiguration ghc;

    try (Reader reader = new StringReader("{\"role\":\"hub\", \"host\":\"dummyhost\", \"port\":1234}");
        JsonInput jsonInput = new Json().newInput(reader)) {
          ghc = GridHubConfiguration.loadFromJSON(jsonInput);
    }

    assertEquals("hub", ghc.role);
    assertEquals(1234, ghc.port.intValue());
    assertEquals("dummyhost", ghc.host);
    assertEquals(-1, ghc.newSessionWaitTimeout.intValue());
  }

  @Test
  public void testMergeWithRealValues() {
    GridHubConfiguration ghc = new GridHubConfiguration();
    GridHubConfiguration other = new GridHubConfiguration();
    other.prioritizer = (a, b) -> 0;
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
    ghc = new GridHubCliOptions.Parser().parse(args).toConfiguration();

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
    GridHubConfiguration ghc = new GridHubCliOptions.Parser().parse(hubArgs).toConfiguration();
    assertEquals("org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                 ghc.capabilityMatcher.getClass().getCanonicalName());
    assertEquals("org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer",
                 ghc.prioritizer.getClass().getCanonicalName());
  }

  @Test
  public void testLoadFromFile() throws IOException {
    String json = "{\"role\":\"hub\", \"port\":1234, \"debug\":true, \"timeout\":1800, \"browserTimeout\":2400,"
                  + "\"cleanUpCycle\":10000, \"newSessionWaitTimeout\":1000, \"throwOnCapabilityNotPresent\":true,"
                  + "\"registry\":\"org.openqa.grid.internal.DefaultGridRegistry\","
                  + "\"capabilityMatcher\":\"org.openqa.grid.internal.utils.DefaultCapabilityMatcher\","
                  + "\"prioritizer\":\"org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer\","
                  + "\"servlets\":[], \"withoutServlets\":[], \"custom\":{}}";
    Path nodeConfig = Files.createTempFile("hub", ".json");
    Files.write(nodeConfig, json.getBytes());

    GridHubConfiguration ghc = new GridHubConfiguration(HubJsonConfiguration.loadFromResourceOrFile(json));

    assertEquals(1234, ghc.port.intValue());
    assertEquals(true, ghc.debug);
    assertEquals(1800, ghc.timeout.intValue());
    assertEquals(2400, ghc.browserTimeout.intValue());
    assertEquals(10000, ghc.cleanUpCycle.intValue());
    assertEquals(1000, ghc.newSessionWaitTimeout.intValue());
    assertEquals(true, ghc.throwOnCapabilityNotPresent);
    assertEquals(DEFAULT_HUB_REGISTRY_CLASS, ghc.registry);
    assertEquals(DEFAULT_CAPABILITY_MATCHER_CLASS, ghc.capabilityMatcher.getClass().getName());
    assertEquals("org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer", ghc.prioritizer.getClass().getName());
    assertEquals(Collections.EMPTY_LIST, ghc.servlets);
    assertEquals(Collections.EMPTY_LIST, ghc.withoutServlets);
    assertEquals(Collections.EMPTY_MAP, ghc.custom);
  }

}
