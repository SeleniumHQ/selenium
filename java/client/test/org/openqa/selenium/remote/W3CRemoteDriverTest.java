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
import static org.junit.Assert.fail;
import static org.openqa.selenium.json.Json.MAP_TYPE;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.ie.InternetExplorerOptions;
import org.openqa.selenium.json.Json;
import org.openqa.selenium.json.JsonOutput;

import java.io.IOException;
import java.io.StringWriter;
import java.io.UncheckedIOException;
import java.io.Writer;
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
        listCapabilities(RemoteWebDriver.builder().addOptions(new FirefoxOptions()));

    assertEquals(1, caps.size());
    assertEquals("firefox", caps.get(0).getBrowserName());
  }

  @Test(expected = IllegalArgumentException.class)
  public void requireAllOptionsAreW3CCompatible() {
    RemoteWebDriver.builder().addOptions(new ImmutableCapabilities("unknownOption", "cake"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void shouldRejectOldJsonWireProtocolNames() {
    RemoteWebDriver.builder()
        .addOptions(new ImmutableCapabilities("platform", Platform.getCurrent()));
  }

  @Test
  public void ensureEachOfTheKeyOptionTypesAreSafe() {
    // Only include the options where we expect to get a w3c session
    Stream.of(
        new ChromeOptions(),
        new FirefoxOptions(),
        new InternetExplorerOptions())
        .map(options -> RemoteWebDriver.builder().addOptions(options))
        .forEach(this::listCapabilities);
  }

  @Test
  public void shouldAllowMetaDataToBeSet() {
    Map<String, String> expected = ImmutableMap.of("cheese", "brie");
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addOptions(new InternetExplorerOptions())
        .addMetadata("cloud:options", expected);

    Map<String, Object> payload = getPayload(builder);

    assertEquals(expected, payload.get("cloud:options"));
  }

  @Test(expected = IllegalArgumentException.class)
  public void doesNotAllowFirstMatchToBeUsedAsAMetadataName() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addMetadata("firstMatch", new HashMap<>());
  }

  @Test(expected = IllegalArgumentException.class)
  public void doesNotAllowAlwaysMatchToBeUsedAsAMetadataName() {
    RemoteWebDriverBuilder builder = RemoteWebDriver.builder()
        .addMetadata("alwaysMatch", ImmutableList.of(ImmutableMap.of()));
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
      builder.writePayload(jsonOutput);

      return json.toType(writer.toString(), MAP_TYPE);
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

}
