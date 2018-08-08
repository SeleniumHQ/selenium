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
import static org.openqa.selenium.json.Json.MAP_TYPE;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import com.google.common.collect.ImmutableMap;

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
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

public class GridNodeConfigurationTest {

  static final Integer DEFAULT_TIMEOUT = StandaloneConfigurationTest.DEFAULT_TIMEOUT;
  static final Integer DEFAULT_BROWSER_TIMEOUT = StandaloneConfigurationTest.DEFAULT_BROWSER_TIMEOUT;
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
    checkDefaults(new GridNodeConfiguration(new GridNodeCliOptions(new String[]{})));
  }

  private void checkDefaults(GridNodeConfiguration gnc) {
    assertEquals(GridNodeConfiguration.ROLE, gnc.role);
    assertEquals(DEFAULT_HOST, gnc.host);
    assertEquals(DEFAULT_PORT, gnc.port);
    assertEquals(DEFAULT_NODE_STATUS_CHECK_TIMEOUT, gnc.nodeStatusCheckTimeout);
    assertEquals(DEFAULT_POLLING_INTERVAL, gnc.nodePolling);
    assertEquals(DEFAULT_PROXY, gnc.proxy);
    assertEquals(DEFAULT_REGISTER_TOGGLE, gnc.register);
    assertEquals(DEFAULT_REGISTER_CYCLE, gnc.registerCycle);
    assertEquals(DEFAULT_HUB, gnc.hub);
    assertEquals(DEFAULT_MAX_SESSION, gnc.maxSession);
    assertFalse(gnc.capabilities.isEmpty());
    assertEquals(4, gnc.capabilities.size());
    assertNull(gnc.id);
    assertEquals(DEFAULT_DOWN_POLLING_LIMIT, gnc.downPollingLimit);
    assertNull(gnc.hubHost);
    assertNull(gnc.hubPort);
    assertNull(gnc.nodeConfigFile);
    assertEquals(DEFAULT_UNREGISTER_DELAY, gnc.unregisterIfStillDownAfter);

    assertNull(gnc.cleanUpCycle);
    assertNotNull(gnc.custom);
    assertTrue(gnc.custom.isEmpty());
    assertNotNull(gnc.servlets);
    assertTrue(gnc.servlets.isEmpty());
    assertNotNull(gnc.withoutServlets);
    assertTrue(gnc.withoutServlets.isEmpty());

    assertEquals(DEFAULT_TIMEOUT, gnc.timeout);
    assertEquals(DEFAULT_BROWSER_TIMEOUT, gnc.browserTimeout);
    assertEquals(DEFAULT_DEBUG_TOGGLE, gnc.debug);
    assertNull(gnc.jettyMaxThreads);
    assertNull(gnc.log);

    //not a @Parameter
    assertNull(gnc.remoteHost);
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
                              + "\"port\": 1234"
                              + "}";

    GridNodeConfiguration gnc;
    try (Reader reader = new StringReader(configJson);
        JsonInput jsonInput = new Json().newInput(reader)) {
      gnc = GridNodeConfiguration.loadFromJSON(jsonInput);
    }

    assertEquals("node", gnc.role);
    assertEquals(1234, gnc.port.intValue());
    assertEquals(5, gnc.maxSession.intValue());
    assertEquals("dummyhost", gnc.host);
    assertEquals(1, gnc.capabilities.size());
    assertEquals("firefox", gnc.capabilities.get(0).getBrowserName());
    assertEquals(5L, gnc.capabilities.get(0).getCapability("maxInstances"));
  }

  @Test(expected = GridConfigurationException.class)
  public void testLoadFromOldJson() {
    final String configJson = "{"
                            + "\"configuration\":"
                            + " {"
                            + "\"host\": \"dummyhost\","
                            + "\"maxSession\": 5,"
                            + "\"port\": 1234"
                            + " }"
                            + "}";
    GridNodeConfiguration.loadFromJSON(configJson);
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
        + "\"browserTimeout\":0,"
        + "\"debug\":false,"
        + "\"host\":\"0.0.0.0\","
        + "\"port\":-1,"
        + "\"role\":\"node\","
        + "\"timeout\":1800}",
        MAP_TYPE);

    Map<String, Object> seen = json.toType(json.toJson(gnc.toJson()), MAP_TYPE);

    assertEquals(expected, seen);
  }

  @Test
  public void testWithCapabilitiesArgs() {
    final String[] args = new String[] { "-capabilities",
                                       "browserName=chrome,platform=linux,maxInstances=10,boolean=false" };
    GridNodeConfiguration gnc = new GridNodeConfiguration(new GridNodeCliOptions(args));
    assertTrue(gnc.capabilities.size() == 1);
    assertEquals("chrome", gnc.capabilities.get(0).getBrowserName());
    assertEquals(10L, gnc.capabilities.get(0).getCapability("maxInstances"));
    assertEquals(false, gnc.capabilities.get(0).getCapability("boolean"));
    assertEquals(Platform.LINUX, gnc.capabilities.get(0).getPlatform());
  }

  @Test
  public void testWithCapabilitiesArgsWithExtraSpacing() {
    GridNodeConfiguration gnc = parseCliOptions(
        "-capabilities", "browserName= chrome, platform =linux, maxInstances=10, boolean = false ");
    assertTrue(gnc.capabilities.size() == 1);
    assertEquals("chrome", gnc.capabilities.get(0).getBrowserName());
    assertEquals(10L, gnc.capabilities.get(0).getCapability("maxInstances"));
    assertEquals(false, gnc.capabilities.get(0).getCapability("boolean"));
    assertEquals(Platform.LINUX, gnc.capabilities.get(0).getPlatform());
  }

  @Test
  public void testGetHubHost() {
    GridNodeConfiguration gnc = parseCliOptions("-hubHost", "dummyhost", "-hubPort", "1234");
    assertEquals("dummyhost", gnc.getHubHost());
  }

  @Test
  public void testGetHubHostFromHubOption() {
    GridNodeConfiguration gnc = parseCliOptions("-hub", "http://dummyhost:1234/wd/hub");
    assertEquals("dummyhost", gnc.getHubHost());
  }

  @Test
  public void testHubHostAndHubCannotBeUsedAtTheSameTime() {
    Throwable t = catchThrowable(() -> parseCliOptions(
        "-hub", "http://smarthost:4321/wd/hub", "-hubHost", "dummyhost"));
    assertTrue(t instanceof GridConfigurationException);
  }

  @Test
  public void testHubPortAndHubCannotBeUsedAtTheSameTime() {
    Throwable t = catchThrowable(() -> parseCliOptions(
        "-hub", "http://smarthost:4321/wd/hub", "-hubPort", "1234"));
    assertTrue(t instanceof GridConfigurationException);
  }

  @Test
  public void testHubHostAndPortAndHubCannotBeUsedAtTheSameTime() {
    Throwable t = catchThrowable(() -> parseCliOptions(
        "-hub", "http://smarthost:4321/wd/hub", "-hubHost", "dummyhost", "-hubPort", "1234"));
    assertTrue(t instanceof GridConfigurationException);
  }

  @Test
  public void testGetHubPort() {
    GridNodeConfiguration gnc = parseCliOptions("-hubHost", "dummyhost", "-hubPort", "1234");
    assertEquals(1234, gnc.getHubPort().intValue());
  }

  @Test
  public void testGetHubPortFromHubOption() {
    GridNodeConfiguration gnc = parseCliOptions("-hub", "http://dummyhost:1234/wd/hub");
    assertEquals(1234, gnc.getHubPort().intValue());
  }

  @Test
  public void testGetRemoteHost() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.host = "dummyhost";
    gnc.port = 1234;
    assertEquals("http://dummyhost:1234", gnc.getRemoteHost());
  }

  @Test
  public void testGetRemoteHostOverride() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.host = "containerHost";
    gnc.port = 1234;
    gnc.remoteHost = "http://hostNode:32657";
    assertEquals("http://hostNode:32657", gnc.getRemoteHost());
  }

  @Test(expected = RuntimeException.class)
  public void testGetHubHost_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    gnc.getHubHost();
  }

  @Test(expected = RuntimeException.class)
  public void testGetHubPort_forNullConfig() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.hub = null;
    gnc.getHubPort();
  }

  @Test
  public void testMergeWithRealValues() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    GridNodeConfiguration other = new GridNodeConfiguration();
    other.id = "myid";
    DesiredCapabilities dc =
      new DesiredCapabilities(new ImmutableMap.Builder<String, String>().put("chrome", "foo").build());
    other.capabilities = Arrays.asList(dc);
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

    assertSame(other.capabilities, gnc.capabilities);
    assertEquals(other.id, gnc.id);
    assertEquals(other.downPollingLimit, gnc.downPollingLimit);
    assertEquals(other.getHubHost(), gnc.getHubHost());
    assertEquals(other.getHubPort(), gnc.getHubPort());
    assertEquals(other.nodePolling, gnc.nodePolling);
    assertEquals(other.nodeStatusCheckTimeout, gnc.nodeStatusCheckTimeout);
    assertEquals(other.proxy, gnc.proxy);
    assertEquals(other.register, gnc.register);
    assertEquals(other.registerCycle, gnc.registerCycle);
    assertEquals(other.unregisterIfStillDownAfter, gnc.unregisterIfStillDownAfter);
    // is not a @Parameter
    assertEquals(other.remoteHost, gnc.remoteHost);
    // is not a merged value
    assertNull(gnc.nodeConfigFile);
  }

  @Test
  public void testFixupCapabilitiesAddsUUID() {
    GridNodeConfiguration gnc = new GridNodeConfiguration();
    gnc.fixUpCapabilities();
    assertTrue(gnc.capabilities.stream()
        .allMatch(cap -> cap.getCapability(GridNodeConfiguration.CONFIG_UUID_CAPABILITY) != null));
  }

  @Test
  public void canLoadConfigFile() throws IOException {
    String json = "{\"role\": \"node\", \"capabilities\":[], \"hub\": \"http://dummyhost:1234\"}";
    Path nodeConfig = Files.createTempFile("node", ".json");
    Files.write(nodeConfig, json.getBytes());
    GridNodeConfiguration gnc = parseCliOptions("-nodeConfig", nodeConfig.toString());
    RegistrationRequest request = RegistrationRequest.build(gnc);
    assertEquals("dummyhost", request.getConfiguration().getHubHost());
  }

  @Test
  public void hubOptionHasPrecedenceOverNodeConfig() throws IOException {
    String json = "{\"role\": \"node\", \"capabilities\":[], \"hub\": \"http://dummyhost:1234\"}";
    Path nodeConfig = Files.createTempFile("node", ".json");
    Files.write(nodeConfig, json.getBytes());
    GridNodeConfiguration gnc = parseCliOptions(
        "-nodeConfig", nodeConfig.toString(), "-hub", "http://smarthost:1234");
    RegistrationRequest request = RegistrationRequest.build(gnc);
    assertEquals("smarthost", request.getConfiguration().getHubHost());
  }

  private GridNodeConfiguration parseCliOptions(String... args) {
    return new GridNodeConfiguration(new GridNodeCliOptions(args));
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

    assertEquals(7777, gnc.port.intValue());
    assertEquals("http://dummyhost:1234", gnc.hub);
    assertEquals("dummyhost", gnc.getHubHost());
    assertEquals(1234, gnc.getHubPort().intValue());
    assertEquals(10, gnc.maxSession.intValue());
    assertEquals(true, gnc.register);
    assertEquals(10000, gnc.registerCycle.intValue());
    assertEquals(9000, gnc.nodeStatusCheckTimeout.intValue());
    assertEquals(8000, gnc.nodePolling.intValue());
    assertEquals(7000, gnc.unregisterIfStillDownAfter.intValue());
    assertEquals(5, gnc.downPollingLimit.intValue());
    assertEquals("org.openqa.grid.selenium.proxy.DefaultRemoteProxy", gnc.proxy);
    assertEquals(true, gnc.enablePlatformVerification);
    assertEquals(Collections.EMPTY_LIST, gnc.servlets);
    assertEquals(Collections.EMPTY_LIST, gnc.withoutServlets);
    assertEquals(Collections.EMPTY_MAP, gnc.custom);
  }

}
