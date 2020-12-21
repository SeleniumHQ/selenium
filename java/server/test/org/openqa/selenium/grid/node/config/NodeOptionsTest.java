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

package org.openqa.selenium.grid.node.config;

import org.assertj.core.api.Condition;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.WebDriverInfo;
import org.openqa.selenium.chrome.ChromeDriverInfo;
import org.openqa.selenium.grid.config.Config;
import org.openqa.selenium.grid.config.ConfigException;
import org.openqa.selenium.grid.config.MapConfig;
import org.openqa.selenium.grid.config.TomlConfig;
import org.openqa.selenium.grid.data.CreateSessionRequest;
import org.openqa.selenium.grid.node.ActiveSession;
import org.openqa.selenium.grid.node.SessionFactory;
import org.openqa.selenium.json.Json;

import java.io.StringReader;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.Collections.emptyMap;
import static java.util.Collections.emptySet;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.Assert.fail;
import static org.junit.Assume.assumeFalse;
import static org.junit.Assume.assumeTrue;

import com.google.common.collect.ImmutableMap;

@SuppressWarnings("DuplicatedCode")
public class NodeOptionsTest {

  @Test
  public void canConfigureNodeWithDriverDetection() {
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.parseBoolean(System.getenv("GITHUB_ACTIONS")));
    assumeTrue("ChromeDriver needs to be available", new ChromeDriverInfo().isAvailable());

    Config config = new MapConfig(singletonMap("node", singletonMap("detect-drivers", "true")));

    List<WebDriverInfo> reported = new ArrayList<>();
    new NodeOptions(config).getSessionFactories(info -> {
      reported.add(info);
      return Collections.emptySet();
    });

    String expected = new ChromeDriverInfo().getDisplayName();

    reported.stream()
      .filter(info -> expected.equals(info.getDisplayName()))
      .findFirst()
      .orElseThrow(() -> new AssertionError("Unable to find Chrome info"));
  }

  @Test
  public void shouldDetectCorrectDriversOnWindows() {
    assumeTrue(Platform.getCurrent().is(Platform.WINDOWS));
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.parseBoolean(System.getenv("GITHUB_ACTIONS")));

    Config config = new MapConfig(singletonMap("node", singletonMap("detect-drivers", "true")));

    List<WebDriverInfo> reported = new ArrayList<>();
    new NodeOptions(config).getSessionFactories(info -> {
      reported.add(info);
      return Collections.emptySet();
    });

    assertThat(reported).is(supporting("chrome"));
    assertThat(reported).is(supporting("firefox"));
    assertThat(reported).is(supporting("internet explorer"));
    assertThat(reported).is(supporting("MicrosoftEdge"));
    assertThat(reported).isNot(supporting("safari"));
  }


  @Test
  public void shouldDetectCorrectDriversOnMac() {
    assumeTrue(Platform.getCurrent().is(Platform.MAC));
    assumeFalse("We don't have driver servers in PATH when we run unit tests",
                Boolean.parseBoolean(System.getenv("GITHUB_ACTIONS")));

    Config config = new MapConfig(singletonMap("node", singletonMap("detect-drivers", "true")));

    List<WebDriverInfo> reported = new ArrayList<>();
    new NodeOptions(config).getSessionFactories(info -> {
      reported.add(info);
      return Collections.emptySet();
    });

    assertThat(reported).is(supporting("chrome"));
    assertThat(reported).is(supporting("firefox"));
    assertThat(reported).isNot(supporting("internet explorer"));
    assertThat(reported).is(supporting("MicrosoftEdge"));
    assertThat(reported).is(supporting("safari"));
  }

  @Test
  public void canConfigureNodeWithoutDriverDetection() {
    Config config = new MapConfig(singletonMap("node", singletonMap("detect-drivers", "false")));
    List<WebDriverInfo> reported = new ArrayList<>();
    new NodeOptions(config).getSessionFactories(info -> {
      reported.add(info);
      return Collections.emptySet();
    });

    assertThat(reported).isEmpty();
  }

  @Test
  public void shouldThrowConfigExceptionIfDetectDriversIsFalseAndSpecificDriverIsAdded() {
    Config config = new MapConfig(
      singletonMap("node",
                   ImmutableMap.of(
                     "detect-drivers", "false",
                     "drivers", "[chrome]"
                   )));
    List<WebDriverInfo> reported = new ArrayList<>();
    try {
      new NodeOptions(config).getSessionFactories(info -> {
        reported.add(info);
        return Collections.emptySet();
      });
      fail("Should have not executed 'getSessionFactories' successfully");
    } catch (ConfigException e) {
      // Fall through
    }

    assertThat(reported).isEmpty();
  }

  @Test
  public void detectDriversByDefault() {
    Config config = new MapConfig(emptyMap());

    List<WebDriverInfo> reported = new ArrayList<>();
    new NodeOptions(config).getSessionFactories(info -> {
      reported.add(info);
      return Collections.emptySet();
    });

    assertThat(reported).isNotEmpty();
  }

  @Test
  public void canBeConfiguredToUseHelperClassesToCreateSessionFactories() {
    Capabilities caps = new ImmutableCapabilities("browserName", "cheese");
    StringBuilder capsString = new StringBuilder();
    new Json().newOutput(capsString).setPrettyPrint(false).write(caps);

    Config config = new TomlConfig(new StringReader(String.format(
      "[node]\n" +
        "detect-drivers = false\n" +
        "driver-factories = [" +
        "  \"%s\",\n" +
        "  \"%s\"\n" +
        "]",
      HelperFactory.class.getName(),
      capsString.toString().replace("\"", "\\\""))));


    NodeOptions options = new NodeOptions(config);
    Map<Capabilities, Collection<SessionFactory>> factories = options.getSessionFactories(info -> emptySet());

    Collection<SessionFactory> sessionFactories = factories.get(caps);
    assertThat(sessionFactories).size().isEqualTo(1);
    assertThat(sessionFactories.iterator().next()).isInstanceOf(SessionFactory.class);
  }

  private Condition<? super List<? extends WebDriverInfo>> supporting(String name) {
    return new Condition<>(
      infos -> infos.stream().anyMatch(info -> name.equals(info.getCanonicalCapabilities().getBrowserName())),
      "supporting %s",
      name);
  }

  public static class HelperFactory {

    public static SessionFactory create(Config config, Capabilities caps) {
      return new SessionFactory() {
        @Override
        public Optional<ActiveSession> apply(CreateSessionRequest createSessionRequest) {
          return Optional.empty();
        }

        @Override
        public boolean test(Capabilities capabilities) {
          return true;
        }
      };
    }
  }
}
