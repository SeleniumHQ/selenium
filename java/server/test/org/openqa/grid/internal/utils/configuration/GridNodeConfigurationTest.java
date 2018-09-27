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

import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.junit.Test;
import org.openqa.grid.common.RegistrationRequest;
import org.openqa.grid.common.exception.GridConfigurationException;
import org.openqa.grid.internal.cli.GridNodeCliOptions;
import org.openqa.grid.internal.utils.configuration.json.NodeJsonConfiguration;
import org.openqa.selenium.Platform;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.io.IOException;
import java.io.Reader;
import java.io.StringReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

public class GridNodeConfigurationTest {

  static final String DEFAULT_HOST = StandaloneConfigurationTest.DEFAULT_HOST;
  static final Integer DEFAULT_PORT = -1;
  static final Boolean DEFAULT_DEBUG_TOGGLE = StandaloneConfigurationTest.DEFAULT_DEBUG_TOGGLE;

  static final Integer DEFAULT_POLLING_INTERVAL = 5000;
  static final Integer DEFAULT_MAX_SESSION = 5;
  static final Integer DEFAULT_REGISTER_CYCLE = 5000;
  static final Boolean DEFAULT_REGISTER_TOGGLE = true;
  static final String DEFAULT_HUB = "http://localhost:4444";
  static final Integer DEFAULT_NODE_STATUS_CHECK_TIMEOUT = 5000;
  static final Integer DEFAULT_UNREGISTER_DELAY = 60000;
  static final Integer DEFAULT_DOWN_POLLING_LIMIT = 2;
  static final String DEFAULT_PROXY = "org.openqa.grid.selenium.proxy.DefaultRemoteProxy";

  @Test
  public void testDefaults() {
    checkDefaults(new GridNodeConfiguration());
  }

  @Test
  public void testConstructorEqualsDefaultConfig() {
    checkDefaults(new GridNodeConfiguration(
        NodeJsonConfiguration.loadFromResourceOrFile(GridNodeConfiguration.DEFAULT_NODE_CONFIG_FILE)));
  }

  @Test
  public void testDefaultsFromCli() {
    checkDefaults(new GridNodeConfiguration(new GridNodeCliOptions()));
  }

  private void checkDefaults(GridNodeConfiguration gnc) {
    assertThat(gnc.role).isEqualTo(GridNodeConfiguration.ROLE);
    assertThat(gnc.host).isEqualTo(DEFAULT_HOST);
    assertThat(gnc.port).isEqualTo(DEFAULT_PORT);
    assertThat(gnc.nodeStatusCheckTimeout).isEqualTo(DEFAULT_NODE_STATUS_CHECK_TIMEOUT);
    assertThat(gnc.nodePolling).isEqualTo(DEFAULT_POLLING_INTERVAL);
    assertThat(gnc.proxy).isEqualTo(DEFAULT_PROXY);
    assertThat(gnc.register).isEqualTo(DEFAULT_REGISTER_TOGGLE);
    assertThat(gnc.registerCycle).isEqualTo(DEFAULT_REGISTER_CYCLE);
    assertThat(gnc.hub).isEqualTo(DEFAULT_HUB);
    assertThat(gnc.maxSession).isEqualTo(DEFAULT_MAX_SESSION);
    assertThat(gnc.capabilities).hasSize(4);
    assertThat(gnc.id).isNull();
    assertThat(gnc.downPollingLimit).isEqualTo(DEFAULT_DOWN_POLLING_LIMIT);
    assertThat(gnc.hubHost).isNull();
    assertThat(gnc.hubPort).isNull();
    assertThat(gnc.nodeConfigFile).isNull();
    assertThat(gnc.unregisterIfStillDownAfter).isEqualTo(DEFAULT_UNREGISTER_DELAY);

    assertThat(gnc.cleanUpCycle).isNull();
    assertThat(gnc.custom).isNotNull().isEmpty();
    assertThat(gnc.servlets).isNotNull().isEmpty();
    assertThat(gnc.withoutServlets).isNotNull().isEmpty();

    // A node has no default timeout/browserTimeout, they are fetched from the hub
    // If a node conf specifies timeout/browserTimeout, they have precedence over the hub values
    assertThat(gnc.timeout).isNull();
    assertThat(gnc.browserTimeout).isNull();

    assertThat(gnc.debug).isEqualTo(DEFAULT_DEBUG_TOGGLE);
    assertThat(gnc.jettyMaxThreads).isNull();
    assertThat(gnc.log).isNull();

    //not a @Parameter
    assertThat(gnc.remoteHost).isNull();
  }

  @Test
  public void testLoadFromJson() throws IOException {
    final String configJson = "{"
                              + "\"role\": \"node\","
                              + "\"capabilities\":"
                              + " ["
                              + "   {"
                              + "    \"browserName\": \"firefox\","
                              + "    \"maxInstances\": 5,"
                              + "    \"javascriptEnabled\": true"
                              + "   }"
                              + " ],"
                              + "\"host\": \"dummyhost\","
                              + "\"hub\": \"http://dummyhost:1234\","
                              + "\"maxSession\": 5,"
                              + "\"browserTimeout\": 30,"
                              + "\"timeout\": 60,"
                              + "\"port\": 1234"
                              + "}";

    GridNodeConfiguration gnc;
    try (Reader reader = new StringReader(configJson);
        JsonInput jsonInput = new Json().newInput(reader)) {
      gnc = GridNodeConfiguration.loadFromJSON(jsonInput);
    }

    assertThat(gnc.role).isEqualTo("node");
    assertThat(gnc.port).isEqualTo(1234);
    assertThat(gnc.browserTimeout).isEqualTo(30);
    assertThat(gnc.timeout).isEqualTo(60);
    assertThat(gnc.maxSession).isEqualTo(5);
    assertThat(gnc.host).isEqualTo("dummyhost");
    assertThat(gnc.capabilities).hasSize(1);
    assertThat(gnc.capabilities.get(0).getBrowserName()).isEqualTo("firefox");
    assertThat(gnc.capabilities.get(0).getCapability("maxInstances")).isEqualTo(5L);
  }

  @Test
  public void testLoadFromOldJson() {
    final String configJson = "{"
                            + "\"configuration\":"
                            + " {"
                            + "\"host\": \"dummyhost\","
                            + "\"maxSession\": 5,"
                            + "\"port\": 1234"
                            + " }"
                            + "}";

    assertThatExceptionOfType(GridConfigurationException.class)
        .isThrownBy(() -> GridNodeConfiguration.loadFromJSON(configJson));
  }

  @Test
  public void testAsJson() {
    GridNodeConfiguration gnc = parseCliOptions(
        "-capabilities", "browserName=chrome,platform=linux");

    Json json = new Json();
    Map<String, Object> expected = json.toType(
        "{\"capabilities\":"
        + "[{\"browserName\":\"chrome\",\"platform\":\"LINUX\"}],"
        + "\"downPollingLimit\":2,"
        + "\"hub\":\"http://localhost:4444\","
        + "\"nodePolling\":5000,"
        + "\"nodeStatusCheckTimeout\":5000,"
        + "\"proxy\":\"org.openqa.grid.selenium.proxy.DefaultRemoteProxy\","
        + "\"register\":true,"
        + "\"registerCycle\":5000,"
        + "\"unregisterIfStillDownAfter\":60000,"
        + "\"enablePlatformVerification\":true,"
        + "\"custom\":{},"
        + "\"maxSession\":5,"
        + "\"servlets\":[],"
        + "\"withoutServlets\":[],"
        + "\"debug\":false,"
        + "\"host\":\"0.0.0.0\","
        + "\"port\":-1,"
        + "\"role\":\"node\"}",
        MAP_TYPE);

    Map<String, Object> seen = json.toType(json.toJson(gnc.toJson()), MAP_TYPE);

    assertThat(seen).isEqualTo(expected);
  }

  @Test
  public void testWithCapabilitiesArgs() {
    final String[] args = new String[] { "-capabilities",
                                       "browserName=chrome,platform=linux,maxInstances=10,boolean=false" };

    GridNodeCliOptions options = new GridNodeCliOptions();
    options.parse(args);
    GridNodeConfiguration gnc = new GridNodeConfiguration(options);
    assertThat(gnc.capabilities).hasSize(1);
    assertThat(gnc.capabilities.get(0).getBrowserName()).isEqualTo("chrome");
    assertThat(gnc.capabilities.get(0).getCapability("maxInstances")).isEqualTo(10L);
    assertThat(gnc.capabilities.get(0).getCapability("boolean")).isEqualTo(false);
    assertThat(gnc.capabilities.get(0).getPlatform()).isEqualTo(Platform.LINUX);
  }

  @Test
  public void testWithCapabilitiesArgsWithExtraSpacing() {
    GridNodeConfiguration gnc = parseCliOptions(
        "-capabilities", "browserName= chrome, platform =linux, maxInstances=10, boolean = false ");
    assertThat(gnc.capabilities).hasSize(1);
    assertThat(gnc.capabilities.get(0).getBrowserName()).isEqualTo("chrome");
    assertThat(gnc.capabilities.get(0).getCapability("maxInstances")).isEqualTo(10L);
    assertThat(gnc.capabilities.get(0).getCapability("boolean")).isEqualTo(false);
    assertThat(gnc.capabilities.get(0).getPlatform()).isEqualTo(Platform.LINUX);
  }

  @Test
  public void testTimeoutAndBrowserTimeout() {
    GridNodeConfiguration gnc = parseCliOptions("-timeout", "350", "-browserTimeout", "600");
    assertThat(gnc.timeout.intValue()).isEqualTo(350);
    assertThat(gnc.browserTimeout.intValue()).isEqualTo(600);
  }

  @Test
  public void testGetHubHost() {
    GridNodeConfiguration gnc = parseCliOptions("-hubHost", "dummyhost", "-hubPort", "1234");
    assertThat(gnc.getHubHost()).isEqualTo("dummyhost");
  }

  @Test
  public void testGetHubHostFromHubOption() {
    GridNodeConfiguration gnc = parseCliOptions("-hub", "http://dummyhost:1234/wd/hub");
    assertThat(gnc.getHubHost()).isEqualTo("dummyhost");
  }

  @Test
  public void testGetHubPort() {
    GridNodeConfiguration gnc = parseCliOptions("-hubHost", "dummyhost", "-hubPort", "1234");
    assertThat(gnc.getHubPort().intValue()).isEqualTo(1234);
  }

  @Test
  public void testGetHubPortFromHubOption() {
    GridNodeConfiguration gnc = parseCliOptions("-hub", "http://dummyhost:1234/wd/hub");
    assertThat(gnc.getHubPort().intValue()).isEqualTo(1234);
  }

  @Test
  public void testGetRemoteHost() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.host = "dummyhost";
    gnc.port = 1234;
    assertThat(gnc.getRemoteHost()).isEqualTo("http://dummyhost:1234");
  }

  @Test
  public void testGetRemoteHostOverride() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.host = "containerHost";
    gnc.port = 1234;
    gnc.remoteHost = "http://hostNode:32657";
    assertThat(gnc.getRemoteHost()).isEqualTo("http://hostNode:32657");
  }

  @Test
  public void testGetHubHost_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    assertThatExceptionOfType(RuntimeException.class).isThrownBy(gnc::getHubHost);
  }

  @Test
  public void testGetHubPort_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    assertThatExceptionOfType(RuntimeException.class).isThrownBy(gnc::getHubPort);
  }

  @Test
  public void testMergeWithRealValues() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    GridNodeConfiguration other = new GridNodeConfiguration();
    other.id = "myid";
    other.capabilities = singletonList(new DesiredCapabilities(singletonMap("chrome", "foo")));
    other.downPollingLimit = 50;
    other.hub = "http://dummyhost";
    other.hubHost = "dummyhost";
    other.hubPort = 1234;
    other.nodeConfigFile = "foo.json";
    other.nodePolling = 100;
    other.nodeStatusCheckTimeout = 2000;
    other.proxy = "com.foo.bar.MyProxy";
    other.register = false;
    other.registerCycle = 3000;
    other.unregisterIfStillDownAfter = 4000;
    // is not a @Parameter but is a mergable value
    other.remoteHost = "mylocalhost";
    gnc.merge(other);

    assertThat(gnc.capabilities).isSameAs(other.capabilities);
    assertThat(gnc.id).isEqualTo(other.id);
    assertThat(gnc.downPollingLimit).isEqualTo(other.downPollingLimit);
    assertThat(gnc.getHubHost()).isEqualTo(other.getHubHost());
    assertThat(gnc.getHubPort()).isEqualTo(other.getHubPort());
    assertThat(gnc.nodePolling).isEqualTo(other.nodePolling);
    assertThat(gnc.nodeStatusCheckTimeout).isEqualTo(other.nodeStatusCheckTimeout);
    assertThat(gnc.proxy).isEqualTo(other.proxy);
    assertThat(gnc.register).isEqualTo(other.register);
    assertThat(gnc.registerCycle).isEqualTo(other.registerCycle);
    assertThat(gnc.unregisterIfStillDownAfter).isEqualTo(other.unregisterIfStillDownAfter);
    // is not a @Parameter
    assertThat(gnc.remoteHost).isEqualTo(other.remoteHost);
    // is not a merged value
    assertThat(gnc.nodeConfigFile).isNull();
  }

  @Test
  public void testFixupCapabilitiesAddsUUID() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.fixUpCapabilities();
    assertThat(gnc.capabilities.stream()
                   .allMatch(cap -> cap.getCapability(GridNodeConfiguration.CONFIG_UUID_CAPABILITY)
                                    != null)).isTrue();
  }

  @Test
  public void canLoadConfigFile() throws IOException {
    String json = "{\"role\": \"node\", \"capabilities\":[], \"hub\": \"http://dummyhost:1234\"}";
    Path nodeConfig = Files.createTempFile("node", ".json");
    Files.write(nodeConfig, json.getBytes());
    GridNodeConfiguration gnc = parseCliOptions("-nodeConfig", nodeConfig.toString());
    RegistrationRequest request = RegistrationRequest.build(gnc);
    assertThat(request.getConfiguration().getHubHost()).isEqualTo("dummyhost");
  }

  @Test
  public void hubOptionHasPrecedenceOverNodeConfig() throws IOException {
    String json = "{\"role\": \"node\", \"capabilities\":[], \"hub\": \"http://dummyhost:1234\"}";
    Path nodeConfig = Files.createTempFile("node", ".json");
    Files.write(nodeConfig, json.getBytes());
    GridNodeConfiguration gnc = parseCliOptions(
        "-nodeConfig", nodeConfig.toString(), "-hub", "http://smarthost:1234");
    RegistrationRequest request = RegistrationRequest.build(gnc);
    assertThat(request.getConfiguration().getHubHost()).isEqualTo("smarthost");
  }

  private GridNodeConfiguration parseCliOptions(String... args) {
    GridNodeCliOptions options = new GridNodeCliOptions();
    options.parse(args);
    return new GridNodeConfiguration(options);
  }

  @Test
  public void canLoadFromFile() throws IOException {
    String json = "{\"role\":\"node\","
                  + "\"capabilities\":[{\"browserName\":\"firefox\", \"marionette\":true, \"maxInstances\":5}],"
                  + "\"hub\":\"http://dummyhost:1234\", \"port\":7777, \"debug\":true, \"maxSession\":10,"
                  + "\"register\":true, \"registerCycle\":10000, \"nodeStatusCheckTimeout\":9000,"
                  + "\"nodePolling\":8000, \"unregisterIfStillDownAfter\":7000, \"downPollingLimit\":5,"
                  + "\"proxy\":\"org.openqa.grid.selenium.proxy.DefaultRemoteProxy\", \"enablePlatformVerification\": true,"
                  + "\"servlets\":[], \"withoutServlets\":[], \"custom\":{}}";
    Path nodeConfig = Files.createTempFile("node", ".json");
    Files.write(nodeConfig, json.getBytes());

    GridNodeConfiguration gnc = new GridNodeConfiguration(
        NodeJsonConfiguration.loadFromResourceOrFile(nodeConfig.toString()));

    assertThat(gnc.port).isEqualTo(7777);
    assertThat(gnc.hub).isEqualTo("http://dummyhost:1234");
    assertThat(gnc.getHubHost()).isEqualTo("dummyhost");
    assertThat(gnc.getHubPort()).isEqualTo(1234);
    assertThat(gnc.maxSession).isEqualTo(10);
    assertThat(gnc.register).isEqualTo(true);
    assertThat(gnc.registerCycle).isEqualTo(10000);
    assertThat(gnc.nodeStatusCheckTimeout).isEqualTo(9000);
    assertThat(gnc.nodePolling).isEqualTo(8000);
    assertThat(gnc.unregisterIfStillDownAfter).isEqualTo(7000);
    assertThat(gnc.downPollingLimit).isEqualTo(5);
    assertThat(gnc.proxy).isEqualTo("org.openqa.grid.selenium.proxy.DefaultRemoteProxy");
    assertThat(gnc.enablePlatformVerification).isEqualTo(true);
    assertThat(gnc.servlets).isEmpty();
    assertThat(gnc.withoutServlets).isEmpty();
    assertThat(gnc.custom).isEmpty();
  }

}
