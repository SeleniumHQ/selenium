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

import static org.assertj.core.api.Assertions.assertThat;

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
    HubJsonConfiguration jsonConfig = HubJsonConfiguration.loadFromResourceOrFile(GridHubConfiguration.DEFAULT_HUB_CONFIG_FILE);
    checkDefaults(new GridHubConfiguration(jsonConfig));
  }

  @Test
  public void testDefaultsFromCli() {
    GridHubCliOptions cliConfig = new GridHubCliOptions();
    checkDefaults(new GridHubConfiguration(cliConfig));
  }

  private void checkDefaults(GridHubConfiguration ghc) {
    // these values come from the GridHubConfiguration class
    assertThat(ghc.port).isEqualTo(DEFAULT_PORT);
    assertThat(ghc.role).isEqualTo(GridHubConfiguration.ROLE);
    assertThat(ghc.capabilityMatcher.getClass().getCanonicalName())
        .isEqualTo(DEFAULT_CAPABILITY_MATCHER_CLASS);
    assertThat(ghc.newSessionWaitTimeout).isEqualTo(DEFAULT_NEW_SESSION_WAIT_TIMEOUT);
    assertThat(ghc.throwOnCapabilityNotPresent)
        .isEqualTo(DEFAULT_THROW_ON_CAPABILITY_NOT_PRESENT_TOGGLE);
    assertThat(ghc.hubConfig).isNull();
    assertThat(ghc.prioritizer).isNull();

    // these values come from the GridConfiguration base class
    assertThat(ghc.cleanUpCycle).isEqualTo(DEFAULT_CLEANUP_CYCLE);
    assertThat(ghc.host).isEqualTo(DEFAULT_HOST);
    assertThat(ghc.maxSession).isNull();
    assertThat(ghc.custom).isNotNull().isEmpty();
    assertThat(ghc.servlets).isNotNull().isEmpty();
    assertThat(ghc.withoutServlets).isNotNull().isEmpty();

    // these values come from the StandaloneConfiguration base class
    assertThat(ghc.timeout).isEqualTo(DEFAULT_TIMEOUT);
    assertThat(ghc.browserTimeout).isEqualTo(DEFAULT_BROWSER_TIMEOUT);
    assertThat(ghc.debug).isEqualTo(DEFAULT_DEBUG_TOGGLE);
    assertThat(ghc.jettyMaxThreads).isNull();
    assertThat(ghc.log).isNull();
  }

  @Test
  public void testLoadFromJson() throws IOException {
    GridHubConfiguration ghc;

    try (Reader reader = new StringReader("{\"role\":\"hub\", \"host\":\"dummyhost\", \"port\":1234}");
        JsonInput jsonInput = new Json().newInput(reader)) {
          ghc = GridHubConfiguration.loadFromJSON(jsonInput);
    }

    assertThat(ghc.role).isEqualTo("hub");
    assertThat(ghc.port).isEqualTo(1234);
    assertThat(ghc.host).isEqualTo("dummyhost");
    assertThat(ghc.newSessionWaitTimeout).isEqualTo(-1);
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

    assertThat(ghc.capabilityMatcher).isSameAs(other.capabilityMatcher);
    assertThat(ghc.prioritizer).isSameAs(other.prioritizer);
    assertThat(ghc.newSessionWaitTimeout).isEqualTo(other.newSessionWaitTimeout);
    assertThat(ghc.throwOnCapabilityNotPresent).isEqualTo(other.throwOnCapabilityNotPresent);
    // hubConfig is not a merged value
    assertThat(ghc.hubConfig).isNull();
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

    assertThat(ghc.capabilityMatcher).isNotNull();
    assertThat(ghc.newSessionWaitTimeout).isNotNull();
    assertThat(ghc.throwOnCapabilityNotPresent).isNotNull();
    // the default is null -- merge(null, null) = null;
    assertThat(ghc.prioritizer).isNull();
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

    assertThat(ghc.capabilityMatcher).isEqualTo(other.capabilityMatcher);
    assertThat(ghc.newSessionWaitTimeout).isEqualTo(other.newSessionWaitTimeout);
    assertThat(ghc.prioritizer).isEqualTo(other.prioritizer);
    assertThat(ghc.throwOnCapabilityNotPresent).isEqualTo(other.throwOnCapabilityNotPresent);
  }

  @Test
  public void testToString() {
    GridHubConfiguration ghc = new GridHubConfiguration();

    assertThat(ghc.toString()).contains("-role hub").doesNotContain("-servlets", "custom");

    ghc = new GridHubConfiguration();
    String[] args = ("-servlet com.foo.bar.ServletA -servlet com.foo.bar.ServletB"
                     + " -custom foo=bar,bar=baz").split(" ");
    GridHubCliOptions options = new GridHubCliOptions();
    options.parse(args);
    ghc = new GridHubConfiguration(options);

    assertThat(ghc.toString())
        .contains("-servlets com.foo.bar.ServletA -servlets com.foo.bar.ServletB",
                  "custom {", "bar=baz", "foo=bar");
  }

  @Test
  public void testJcommanderConverterCapabilityMatcher() {
    String[] hubArgs = {"-capabilityMatcher", "org.openqa.grid.internal.utils.DefaultCapabilityMatcher",
                        "-prioritizer", "org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer"};
    GridHubCliOptions options = new GridHubCliOptions();
    options.parse(hubArgs);
    GridHubConfiguration ghc = new GridHubConfiguration(options);
    assertThat(ghc.capabilityMatcher.getClass().getCanonicalName())
        .isEqualTo("org.openqa.grid.internal.utils.DefaultCapabilityMatcher");
    assertThat(ghc.prioritizer.getClass().getCanonicalName())
        .isEqualTo("org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer");
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

    assertThat(ghc.port).isEqualTo(1234);
    assertThat(ghc.debug).isEqualTo(true);
    assertThat(ghc.timeout).isEqualTo(1800);
    assertThat(ghc.browserTimeout).isEqualTo(2400);
    assertThat(ghc.cleanUpCycle).isEqualTo(10000);
    assertThat(ghc.newSessionWaitTimeout).isEqualTo(1000);
    assertThat(ghc.throwOnCapabilityNotPresent).isEqualTo(true);
    assertThat(ghc.registry).isEqualTo(DEFAULT_HUB_REGISTRY_CLASS);
    assertThat(ghc.capabilityMatcher.getClass().getName())
        .isEqualTo(DEFAULT_CAPABILITY_MATCHER_CLASS);
    assertThat(ghc.prioritizer.getClass().getName())
        .isEqualTo("org.openqa.grid.internal.utils.configuration.PlaceHolderTestingPrioritizer");
    assertThat(ghc.servlets).isEmpty();
    assertThat(ghc.withoutServlets).isEmpty();
    assertThat(ghc.custom).isEmpty();
  }

}
