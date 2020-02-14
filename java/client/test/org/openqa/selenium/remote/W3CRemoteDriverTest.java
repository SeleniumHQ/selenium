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

import static java.util.Collections.EMPTY_MAP;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeNotNull;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import org.junit.Ignore;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeDriverService;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.firefox.GeckoDriverService;
import org.openqa.selenium.firefox.xpi.XpiDriverService;
import org.openqa.selenium.ie.InternetExplorerDriverService;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;
import org.openqa.selenium.remote.service.DriverService;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class W3CRemoteDriverTest {

  @Test
  public void mustSpecifyAtLeastOneSetOfOptions() {
    assertThatExceptionOfType(SessionNotCreatedException.class)
        .isThrownBy(() -> RemoteWebDriver.builder().build());
  }

  @Test
  public void settingAGlobalCapabilityCountsAsAnOption() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .setCapability("browserName", "cheese");

    List<Capabilities> capabilities = listCapabilities(builder);

    assertThat(capabilities).hasSize(1);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("cheese");
  }

  @Test
  public void simpleCaseShouldBeADropIn() {
    List<Capabilities> capabilities =
        listCapabilities(RemoteWebDriver.builder().addAlternative(new FirefoxOptions()));

    assertThat(capabilities).hasSize(1);
    assertThat(capabilities.get(0).getBrowserName()).isEqualTo("firefox");
  }

  @Test
  public void requireAllOptionsAreW3CCompatible() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder()
            .addAlternative(new ImmutableCapabilities("unknownOption", "cake")));
  }

  @Test
  public void shouldRejectOldJsonWireProtocolNames() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder()
            .addAlternative(new ImmutableCapabilities("platform", Platform.getCurrent())));
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
    Map<String, String> expected = singletonMap("cheese", "brie");
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .addMetadata("cloud:options", expected);

    Map<String, Object> payload = getPayload(builder);

    assertThat(payload.get("cloud:options")).isEqualTo(expected);
  }

  @Test
  public void doesNotAllowFirstMatchToBeUsedAsAMetadataNameAsItIsConfusing() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder().addMetadata("firstMatch", EMPTY_MAP));
  }

  @Test
  public void doesNotAllowAlwaysMatchToBeUsedAsAMetadataNameAsItIsConfusing() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder()
            .addMetadata("alwaysMatch", singletonList(EMPTY_MAP)));
  }

  @Test
  public void doesNotAllowCapabilitiesToBeUsedAsAMetadataName() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder()
            .addMetadata("capabilities", singletonList(EMPTY_MAP)));
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

    assertThat(allCaps).hasSize(2);
    assertThat(allCaps.get(0).getCapability("se:cheese")).isEqualTo("brie");
    assertThat(allCaps.get(1).getCapability("se:cheese")).isEqualTo("brie");
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

    assertThat(allCaps).hasSize(2);
    assertThat(allCaps.get(0).getCapability("se:cheese")).isEqualTo("brie");
    assertThat(allCaps.get(1).getCapability("se:cheese")).isEqualTo("brie");
  }

  @Test
  public void additionalCapabilitiesOverrideOnesSetOnCapabilitiesAlready() {
    ChromeOptions options = new ChromeOptions();
    options.setCapability("se:cheese", "cheddar");

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(options)
        .setCapability("se:cheese", "brie");

    List<Capabilities> allCaps = listCapabilities(builder);

    assertThat(allCaps).hasSize(1);
    assertThat(allCaps.get(0).getCapability("se:cheese")).isEqualTo("brie");
  }

  @Test
  public void ifARemoteUrlIsGivenThatIsUsedForTheSession() throws MalformedURLException {
    URL expected = new URL("http://localhost:3000/woohoo/cheese");

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .url(expected.toExternalForm());

    RemoteWebDriverBuilder.Plan plan = builder.getPlan();

    assertThat(plan.isUsingDriverService()).isFalse();
    assertThat(plan.getRemoteHost()).isEqualTo(expected);
  }

  static class FakeDriverService extends DriverService {
    FakeDriverService() throws IOException {
      super(new File("."), 0, DEFAULT_TIMEOUT, null, null);
    }
  }

  @Test
  public void shouldUseADriverServiceIfGivenOneRegardlessOfOtherChoices() throws IOException {
    DriverService expected = new FakeDriverService();

    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new InternetExplorerOptions())
        .withDriverService(expected);

    RemoteWebDriverBuilder.Plan plan = builder.getPlan();

    assertThat(plan.isUsingDriverService()).isTrue();
    assertThat(plan.getDriverService()).isEqualTo(expected);
  }

  @Test
  public void settingBothDriverServiceAndUrlIsAnError() {
    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> RemoteWebDriver.builder()
            .addAlternative(new InternetExplorerOptions())
            .url("http://example.com/cheese/peas/wd")
            .withDriverService(new FakeDriverService()));
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
        ChromeDriverService.createDefaultService();
        caps = new ChromeOptions();
        expectedServiceClass = ChromeDriverService.class;
      } catch (IllegalStateException e) {
        // Fall through
      }
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

    assumeNotNull(caps, expectedServiceClass);

    RemoteWebDriverBuilder.Plan plan = RemoteWebDriver.builder()
        .addAlternative(caps)
        .getPlan();

    assertThat(plan.isUsingDriverService()).isTrue();
    assertThat(plan.getDriverService().getClass()).isEqualTo(expectedServiceClass);
  }

  @Test
  @Ignore
  public void shouldPreferMarionette() {
    // Make sure we have at least one of the services available
    Capabilities caps = new FirefoxOptions();

    RemoteWebDriverBuilder.Plan plan = RemoteWebDriver.builder()
        .addAlternative(caps)
        .getPlan();

    assertThat(new XpiDriverService.Builder().score(caps)).isEqualTo(0);
    assertThat(new GeckoDriverService.Builder().score(caps)).isEqualTo(1);

    assertThat(plan.isUsingDriverService()).isTrue();
    assertThat(plan.getDriverService().getClass()).isEqualTo(GeckoDriverService.class);
  }

  @Test
  public void oneOfWillClearOutTheCurrentlySetCapabilities() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addAlternative(new ChromeOptions())
        .oneOf(new FirefoxOptions());

    List<Capabilities> allCaps = listCapabilities(builder);

    assertThat(allCaps).hasSize(1);
    assertThat(allCaps.get(0).getBrowserName()).isEqualTo("firefox");
  }

  private List<Capabilities> listCapabilities(RemoteWebDriverBuilder builder) {
    Map<String, Object> value = getPayload(builder);
    //noinspection unchecked
    value = (Map<String, Object>) value.get("capabilities");

    @SuppressWarnings("unchecked")
    Map<String, Object> always =
        (Map<String, Object>) value.getOrDefault("alwaysMatch", EMPTY_MAP);
    Capabilities alwaysMatch = new ImmutableCapabilities(always);

    @SuppressWarnings("unchecked")
    Collection<Map<String, Object>> firstMatch =
        (Collection<Map<String, Object>>)
            value.getOrDefault("firstMatch", singletonList(EMPTY_MAP));

    return firstMatch
        .parallelStream()
        .map(ImmutableCapabilities::new)
        .map(alwaysMatch::merge)
        .collect(Collectors.toList());
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
