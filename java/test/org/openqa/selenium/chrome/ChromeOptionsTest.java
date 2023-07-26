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

package org.openqa.selenium.chrome;

import static java.util.stream.Collectors.toSet;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.assertj.core.api.InstanceOfAssertFactories.STRING;
import static org.openqa.selenium.chromium.ChromiumDriverLogLevel.OFF;
import static org.openqa.selenium.chromium.ChromiumDriverLogLevel.SEVERE;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;
import static org.openqa.selenium.remote.CapabilityType.TIMEOUTS;

import java.io.File;
import java.time.Duration;
import java.util.Arrays;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.AcceptedW3CCapabilityKeys;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.chromium.ChromiumDriverLogLevel;
import org.openqa.selenium.testing.TestUtilities;

@Tag("UnitTests")
class ChromeOptionsTest {

  @Test
  void optionsAsMapShouldBeImmutable() {
    Map<String, Object> options = new ChromeOptions().asMap();
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> options.put("browserType", "firefox"));

    Map<String, Object> googOptions = (Map<String, Object>) options.get(ChromeOptions.CAPABILITY);
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> googOptions.put("binary", ""));

    List<String> extensions = (List<String>) googOptions.get("extensions");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> extensions.add("x"));

    List<String> args = (List<String>) googOptions.get("args");
    assertThatExceptionOfType(UnsupportedOperationException.class)
        .isThrownBy(() -> args.add("-help"));
  }

  @Test
  void canBuildLogLevelFromStringRepresentation() {
    assertThat(ChromiumDriverLogLevel.fromString("off")).isEqualTo(OFF);
    assertThat(ChromiumDriverLogLevel.fromString("SEVERE")).isEqualTo(SEVERE);
  }

  @Test
  void canAddW3CCompliantOptions() {
    ChromeOptions chromeOptions = new ChromeOptions();
    chromeOptions
        .setBrowserVersion("99")
        .setPlatformName("9 3/4")
        .setUnhandledPromptBehaviour(UnexpectedAlertBehaviour.IGNORE)
        .setAcceptInsecureCerts(true)
        .setPageLoadStrategy(PageLoadStrategy.EAGER)
        .setStrictFileInteractability(true)
        .setImplicitWaitTimeout(Duration.ofSeconds(1))
        .setPageLoadTimeout(Duration.ofSeconds(2))
        .setScriptTimeout(Duration.ofSeconds(3));

    Map<String, Object> mappedOptions = chromeOptions.asMap();
    assertThat(mappedOptions.get("browserName")).isEqualTo("chrome");
    assertThat(mappedOptions.get("browserVersion")).isEqualTo("99");
    assertThat(mappedOptions.get("platformName")).isEqualTo("9 3/4");
    assertThat(mappedOptions.get("unhandledPromptBehavior")).hasToString("ignore");
    assertThat(mappedOptions.get("acceptInsecureCerts")).isEqualTo(true);
    assertThat(mappedOptions.get("pageLoadStrategy")).hasToString("eager");
    assertThat(mappedOptions.get("strictFileInteractability")).isEqualTo(true);

    Map<String, Long> expectedTimeouts = new HashMap<>();
    expectedTimeouts.put("implicit", 1000L);
    expectedTimeouts.put("pageLoad", 2000L);
    expectedTimeouts.put("script", 3000L);

    assertThat(expectedTimeouts).isEqualTo(mappedOptions.get("timeouts"));
  }

  @Test
  void canAddSequentialTimeouts() {
    ChromeOptions chromeOptions = new ChromeOptions();
    chromeOptions.setImplicitWaitTimeout(Duration.ofSeconds(1));

    Map<String, Object> mappedOptions = chromeOptions.asMap();
    Map<String, Long> expectedTimeouts = new HashMap<>();

    expectedTimeouts.put("implicit", 1000L);
    assertThat(expectedTimeouts).isEqualTo(mappedOptions.get("timeouts"));

    chromeOptions.setPageLoadTimeout(Duration.ofSeconds(2));
    expectedTimeouts.put("pageLoad", 2000L);
    Map<String, Object> mappedOptions2 = chromeOptions.asMap();
    assertThat(expectedTimeouts).isEqualTo(mappedOptions2.get("timeouts"));
  }

  @Test
  void mixAddingTimeoutsCapsAndSetter() {
    ChromeOptions chromeOptions = new ChromeOptions();
    chromeOptions.setCapability(TIMEOUTS, Map.of("implicit", 1000));
    chromeOptions.setPageLoadTimeout(Duration.ofSeconds(2));

    Map<String, Number> expectedTimeouts = new HashMap<>();
    expectedTimeouts.put("implicit", 1000);
    expectedTimeouts.put("pageLoad", 2000L);

    assertThat(chromeOptions.asMap().get("timeouts")).isEqualTo(expectedTimeouts);
  }

  @Test
  void mergingOptionsMergesArguments() {
    ChromeOptions one = new ChromeOptions().addArguments("verbose");
    ChromeOptions two = new ChromeOptions().addArguments("silent");
    ChromeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("--remote-allow-origins=*", "verbose", "silent");
  }

  @Test
  void mergingOptionsMergesEncodedExtensions() {
    String ext1 = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    ChromeOptions one = new ChromeOptions().addEncodedExtensions(ext1);
    ChromeOptions two = new ChromeOptions().addEncodedExtensions(ext2);
    ChromeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1, ext2);
  }

  @Test
  void mergingOptionsMergesExtensions() {
    File ext1 = TestUtilities.createTmpFile("ext1");
    String ext1Encoded = Base64.getEncoder().encodeToString("ext1".getBytes());
    File ext2 = TestUtilities.createTmpFile("ext2");
    String ext2Encoded = Base64.getEncoder().encodeToString("ext2".getBytes());

    ChromeOptions one = new ChromeOptions().addExtensions(ext1);
    ChromeOptions two = new ChromeOptions().addExtensions(ext2);
    ChromeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2Encoded);
  }

  @Test
  void mergingOptionsMergesEncodedExtensionsAndFileExtensions() {
    File ext1 = TestUtilities.createTmpFile("ext1");
    String ext1Encoded = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    ChromeOptions one = new ChromeOptions().addExtensions(ext1);
    ChromeOptions two = new ChromeOptions().addEncodedExtensions(ext2);
    ChromeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2);
  }

  @Test
  void mergingOptionsMergesExperimentalOptions() {
    ChromeOptions one =
        new ChromeOptions()
            .setExperimentalOption("opt1", "val1")
            .setExperimentalOption("opt2", "val2");
    ChromeOptions two =
        new ChromeOptions()
            .setExperimentalOption("opt2", "val4")
            .setExperimentalOption("opt3", "val3");
    ChromeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val4")
        .containsEntry("opt3", "val3");
  }

  @Test
  void mergingOptionsWithMutableCapabilities() {
    File ext1 = TestUtilities.createTmpFile("ext1");
    String ext1Encoded = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    MutableCapabilities one = new MutableCapabilities();

    ChromeOptions options = new ChromeOptions();
    options.addArguments("verbose");
    options.addArguments("silent");
    options.setExperimentalOption("opt1", "val1");
    options.setExperimentalOption("opt2", "val4");
    options.addExtensions(ext1);
    options.addEncodedExtensions(ext2);
    options.setAcceptInsecureCerts(true);
    File binary = TestUtilities.createTmpFile("binary");
    options.setBinary(binary);

    one.setCapability(ChromeOptions.CAPABILITY, options);

    ChromeOptions two = new ChromeOptions();
    two.addArguments("verbose");
    two.setExperimentalOption("opt2", "val2");
    two.setExperimentalOption("opt3", "val3");
    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("--remote-allow-origins=*", "verbose", "silent");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("opt1", "val1")
        .containsEntry("opt2", "val4")
        .containsEntry("opt3", "val3");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ACCEPT_INSECURE_CERTS)
        .isExactlyInstanceOf(Boolean.class);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo(binary.getPath());
  }

  @Test
  void mergingOptionsWithOptionsAsMutableCapabilities() {
    File ext1 = TestUtilities.createTmpFile("ext1");
    String ext1Encoded = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    MutableCapabilities browserCaps = new MutableCapabilities();

    File binary = TestUtilities.createTmpFile("binary");

    browserCaps.setCapability("binary", binary.getPath());
    browserCaps.setCapability("opt1", "val1");
    browserCaps.setCapability("opt2", "val4");
    browserCaps.setCapability("args", Arrays.asList("silent", "verbose"));
    browserCaps.setCapability("extensions", Arrays.asList(ext1, ext2));

    MutableCapabilities one = new MutableCapabilities();
    one.setCapability(ChromeOptions.CAPABILITY, browserCaps);

    ChromeOptions two = new ChromeOptions();
    two.addArguments("verbose");
    two.setExperimentalOption("opt2", "val2");
    two.setExperimentalOption("opt3", "val3");
    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("--remote-allow-origins=*", "verbose", "silent");

    assertThat(map).asInstanceOf(MAP).containsEntry("opt1", "val1");

    assertThat(map).asInstanceOf(MAP).containsEntry("opt2", "val4");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("opt2", "val2")
        .containsEntry("opt3", "val3");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo(binary.getPath());
  }

  @Test
  void isW3CSafe() {
    Map<String, Object> converted =
        new ChromeOptions().setBinary("some/path").addArguments("--headless").asMap();

    Predicate<String> badKeys = new AcceptedW3CCapabilityKeys().negate();
    Set<String> seen = converted.keySet().stream().filter(badKeys).collect(toSet());

    assertThat(seen).isEmpty();
  }

  @Test
  void shouldBeAbleToSetAnAndroidOption() {
    Map<String, Object> converted =
        new ChromeOptions().setAndroidActivity("com.cheese.nom").asMap();

    assertThat(converted)
        .extractingByKey(ChromeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("androidActivity")
        .isEqualTo("com.cheese.nom");
  }
}
