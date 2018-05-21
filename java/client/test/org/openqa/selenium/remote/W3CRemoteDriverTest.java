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

package org.openqa.selenium.remote;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeNotNull;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.ie.InternetExplorerDriverService;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.service.DriverService;

import java.io.IOException;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

public class W3CRemoteDriverTest {

  @Test
  public void mustSpecifyAtLeastOneSetOfOptions() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder();

    try {
      builder.build();
      fail("This is unexpected");
    } catch (SessionNotCreatedException expected) {
      // Fine
    }
  }

  @Test
  public void simpleCaseShouldBeADropIn() {
    List<Capabilities> caps =
        listCapabilities(RemoteWebDriver.builder().addAlternative(new FirefoxOptions()));

    assertEquals(1, caps.size());
    assertEquals("firefox", caps.get(0).getBrowserName());
  }

  @Test(expected = IllegalArgumentException.class)
  public void requireAllOptionsAreW3CCompatible() {
    RemoteWebDriver.builder().addAlternative(new ImmutableCapabilities("unknownOption", "cake"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldRejectOldJsonWireProtocolNames() {
    RemoteWebDriver.builder()
        .addAlternative(new ImmutableCapabilities("platform", Platform.getCurrent()));
  }

  @Test
  public void ensureEachOfTheKeyOptionTypesAreSafe() {
    // Only include the options where we expect to get a w3c session
    Stream.of(
        new ChromeOptions(),
        new FirefoxOptions(),
        new InternetExplorerOptions())
        .map(options -> RemoteWebDriver.builder().addAlternative(options))
        .forEach(this::listCapabilities);
  }

  @Test
  public void shouldAllowMetaDataToBeSet() {
    Map<String, String> expected = ImmutableMap.of("cheese", "brie");
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .addMetadata("cloud:options", expected);

    Map<String, Object> payload = getPayload(builder);

    assertEquals(expected, payload.get("cloud:options"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void doesNotAllowFirstMatchToBeUsedAsAMetadataName() {
    RemoteWebDriver.builder().addMetadata("firstMatch", new HashMap<>());
  }

  @Test(expected = IllegalArgumentException.class)
  public void doesNotAllowAlwaysMatchToBeUsedAsAMetadataName() {
    RemoteWebDriver.builder().addMetadata("alwaysMatch", ImmutableList.of(ImmutableMap.of()));
  }

  @Test
  public void shouldAllowCapabilitiesToBeSetGlobally() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new FirefoxOptions())
        .addAlternative(new ChromeOptions())
        .setCapability("se:cheese", "brie");

    // We expect the global to be in the "alwaysMatch" section for obvious reasons, but that's not
    // a requirement. Get the capabilities and check each of them.
    List<Capabilities> allCaps = listCapabilities(builder);

    assertEquals(2, allCaps.size());
    assertEquals("brie", allCaps.get(0).getCapability("se:cheese"));
    assertEquals("brie", allCaps.get(1).getCapability("se:cheese"));
  }

  @Test
  public void shouldSetCapabilityToOptionsAddedAfterTheCallToSetCapabilities() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new FirefoxOptions())
        .setCapability("se:cheese", "brie")
        .addAlternative(new ChromeOptions());

    // We expect the global to be in the "alwaysMatch" section for obvious reasons, but that's not
    // a requirement. Get the capabilities and check each of them.
    List<Capabilities> allCaps = listCapabilities(builder);

    assertEquals(2, allCaps.size());
    assertEquals("brie", allCaps.get(0).getCapability("se:cheese"));
    assertEquals("brie", allCaps.get(1).getCapability("se:cheese"));
  }

  @Test
  public void additionalCapabilitiesOverrideOnesSetOnCapabilitiesAlready() {
    ChromeOptions options = new ChromeOptions();
    options.setCapability("se:cheese", "cheddar");

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(options)
        .setCapability("se:cheese", "brie");

    List<Capabilities> allCaps = listCapabilities(builder);

    assertEquals(1, allCaps.size());
    assertEquals("brie", allCaps.get(0).getCapability("se:cheese"));
  }

  @Test
  public void ifARemoteUrlIsGivenThatIsUsedForTheSession() throws MalformedURLException {
    URL expected = new URL("http://localhost:3000/woohoo/cheese");

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .url(expected.toExternalForm());

    RemoteWebDriverBuilder.Plan plan = builder.getPlan();

    assertFalse(plan.isUsingDriverService());
    assertEquals(expected, plan.getRemoteHost());
  }

  @Test
  public void shouldUseADriverServiceIfGivenOneRegardlessOfOtherChoices() {
    GeckoDriverService expected = GeckoDriverService.createDefaultService();

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .withDriverService(expected);

    RemoteWebDriverBuilder.Plan plan = builder.getPlan();

    assertTrue(plan.isUsingDriverService());
    assertEquals(expected, plan.getDriverService());
  }

  @Test(expected = IllegalArgumentException.class)
  public void settingBothDriverServiceAndUrlIsAnError() {
    RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .url("http://example.com/cheese/peas/wd")
        .withDriverService(GeckoDriverService.createDefaultService());
  }

  @Test
  public void shouldDetectDriverServicesAndUseThoseIfNoOtherChoiceMade() {
    // Make sure we have at least one of the services available
    Capabilities caps = null;
    Class<? extends DriverService> expectedServiceClass = null;

    try {
      InternetExplorerDriverService.createDefaultService();
      caps = new InternetExplorerOptions();
      expectedServiceClass = InternetExplorerDriverService.class;
    } catch (IllegalStateException e) {
      // Fall through
    }

    if (caps == null) {
      try {
        GeckoDriverService.createDefaultService();
        caps = new FirefoxOptions();
        expectedServiceClass = GeckoDriverService.class;
      } catch (IllegalStateException e) {
        // Fall through
      }
    }

    if (caps == null) {
      try {
        ChromeDriverService.createDefaultService();
        caps = new ChromeOptions();
        expectedServiceClass = ChromeDriverService.class;
      } catch (IllegalStateException e) {
        // Fall through
      }
    }

    assumeNotNull(caps, expectedServiceClass);

    RemoteWebDriverBuilder.Plan plan = RemoteWebDriver.builder().addAlternative(caps).getPlan();

    assertTrue(plan.isUsingDriverService());
    assertEquals(expectedServiceClass, plan.getDriverService().getClass());
  }

  @Test
  public void oneOfWillClearOutTheCurrentlySetCapabilities() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new ChromeOptions())
        .oneOf(new FirefoxOptions());

    List<Capabilities> allCaps = listCapabilities(builder);

    assertEquals(1, allCaps.size());
    assertEquals("firefox", allCaps.get(0).getBrowserName());
  }

  private List<Capabilities> listCapabilities(RemoteWebDriverBuilder builder) {
    Map<String, Object> value = getPayload(builder);

    @SuppressWarnings("unchecked")
    Map<String, Object> always =
        (Map<String, Object>) value.getOrDefault("alwaysMatch", ImmutableMap.of());
    Capabilities alwaysMatch = new ImmutableCapabilities(always);

    @SuppressWarnings("unchecked")
    Collection<Map<String, Object>> firstMatch =
        (Collection<Map<String, Object>>)
            value.getOrDefault("firstMatch", ImmutableList.of(ImmutableMap.of()));

    return firstMatch
        .parallelStream()
        .map(ImmutableCapabilities::new)
        .map(alwaysMatch::merge)
        .collect(ImmutableList.toImmutableList());
  }

  private Map<String, Object> getPayload(RemoteWebDriverBuilder builder) {
    Json json = new Json();

    try (Writer writer = new StringWriter();
         JsonOutput jsonOutput = json.newOutput(writer)) {
      builder.getPlan().writePayload(jsonOutput);

      return json.toType(writer.toString(), MAP_TYPE);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

}
