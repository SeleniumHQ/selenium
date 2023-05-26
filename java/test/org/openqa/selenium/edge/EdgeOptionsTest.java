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

package org.openqa.selenium.edge;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.assertj.core.api.InstanceOfAssertFactories.STRING;
import static org.openqa.selenium.edge.EdgeOptions.WEBVIEW2_BROWSER_NAME;
import static org.openqa.selenium.remote.Browser.EDGE;
import static org.openqa.selenium.remote.CapabilityType.ACCEPT_INSECURE_CERTS;

import java.io.File;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.TestUtilities;

@Tag("UnitTests")
class EdgeOptionsTest {

  @Test
  void testDefaultOptions() {
    EdgeOptions options = new EdgeOptions();
    checkCommonStructure(options);
    assertThat(options.asMap())
        .extracting(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("args", Collections.emptyList())
        .containsEntry("extensions", Collections.emptyList());
  }

  @Test
  void canAddArguments() {
    EdgeOptions options = new EdgeOptions();
    options.addArguments("--arg1", "--arg2");
    checkCommonStructure(options);
    assertThat(options.asMap())
        .extracting(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("args", Arrays.asList("--arg1", "--arg2"))
        .containsEntry("extensions", Collections.emptyList());
  }

  @Test
  void canAddExtensions() throws IOException {
    EdgeOptions options = new EdgeOptions();
    Path tmpDir = Files.createTempDirectory("webdriver");
    File ext1 = createTempFile(tmpDir, "ext1 content");
    File ext2 = createTempFile(tmpDir, "ext2 content");
    options.addExtensions(ext1, ext2);
    checkCommonStructure(options);
    assertThat(options.asMap())
        .extracting(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("args", Collections.emptyList())
        .containsEntry(
            "extensions",
            Stream.of("ext1 content", "ext2 content")
                .map(s -> Base64.getEncoder().encodeToString(s.getBytes()))
                .collect(Collectors.toList()));
  }

  @Test
  void canMergeWithoutChangingOriginalObject() {
    EdgeOptions options = new EdgeOptions();
    EdgeOptions merged =
        options.merge(
            new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, PageLoadStrategy.NONE));
    assertThat(merged.getCapability(CapabilityType.PAGE_LOAD_STRATEGY))
        .isEqualTo(PageLoadStrategy.NONE);
  }

  @Test
  void mergingOptionsWithMutableCapabilities() {
    File ext1 = TestUtilities.createTmpFile("ext1");
    String ext1Encoded = Base64.getEncoder().encodeToString("ext1".getBytes());
    String ext2 = Base64.getEncoder().encodeToString("ext2".getBytes());

    MutableCapabilities one = new MutableCapabilities();

    EdgeOptions options = new EdgeOptions();
    options.addArguments("verbose");
    options.addArguments("silent");
    options.setExperimentalOption("opt1", "val1");
    options.setExperimentalOption("opt2", "val4");
    options.addExtensions(ext1);
    options.addEncodedExtensions(ext2);
    options.setAcceptInsecureCerts(true);
    File binary = TestUtilities.createTmpFile("binary");
    options.setBinary(binary);

    one.setCapability(EdgeOptions.CAPABILITY, options);

    EdgeOptions two = new EdgeOptions();
    two.addArguments("verbose");
    two.setExperimentalOption("opt2", "val2");
    two.setExperimentalOption("opt3", "val3");

    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
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
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
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
    one.setCapability(EdgeOptions.CAPABILITY, browserCaps);

    EdgeOptions two = new EdgeOptions();
    two.addArguments("verbose");
    two.setExperimentalOption("opt2", "val2");
    two.setExperimentalOption("opt3", "val3");
    two = two.merge(one);

    Map<String, Object> map = two.asMap();

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");

    assertThat(map).asInstanceOf(MAP).containsEntry("opt1", "val1");

    assertThat(map).asInstanceOf(MAP).containsEntry("opt2", "val4");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsEntry("opt2", "val2")
        .containsEntry("opt3", "val3");

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("extensions")
        .asInstanceOf(LIST)
        .containsExactly(ext1Encoded, ext2);

    assertThat(map)
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("binary")
        .asInstanceOf(STRING)
        .isEqualTo(binary.getPath());
  }

  private void checkCommonStructure(EdgeOptions options) {
    assertThat(options.asMap())
        .containsEntry(CapabilityType.BROWSER_NAME, EDGE.browserName())
        .extracting(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .containsOnlyKeys("args", "extensions");
  }

  private File createTempFile(Path tmpDir, String content) {
    try {
      Path file = Files.createTempFile(tmpDir, "tmp", "ext");
      Files.write(file, content.getBytes(Charset.defaultCharset()));
      return file.toFile();
    } catch (IOException e) {
      throw new UncheckedIOException(e);
    }
  }

  @Test
  void mergingOptionsMergesArguments() {
    EdgeOptions one = new EdgeOptions().addArguments("verbose");
    EdgeOptions two = new EdgeOptions().addArguments("silent");
    EdgeOptions merged = one.merge(two);

    assertThat(merged.asMap())
        .asInstanceOf(MAP)
        .extractingByKey(EdgeOptions.CAPABILITY)
        .asInstanceOf(MAP)
        .extractingByKey("args")
        .asInstanceOf(LIST)
        .containsExactly("verbose", "silent");
  }

  @Test
  void usingWebView2ChangesBrowserName() {
    EdgeOptions options = new EdgeOptions();
    assertThat(options.getBrowserName()).isEqualTo(EDGE.browserName());
    options.useWebView(true);
    assertThat(options.getBrowserName()).isEqualTo(WEBVIEW2_BROWSER_NAME);
    options.useWebView(false);
    assertThat(options.getBrowserName()).isEqualTo(EDGE.browserName());
  }
}
