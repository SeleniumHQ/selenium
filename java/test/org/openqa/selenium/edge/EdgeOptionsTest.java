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

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Tag;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.PageLoadStrategy;
import org.openqa.selenium.remote.CapabilityType;

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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.InstanceOfAssertFactories.LIST;
import static org.assertj.core.api.InstanceOfAssertFactories.MAP;
import static org.openqa.selenium.remote.Browser.EDGE;

@Tag("UnitTests")
public class EdgeOptionsTest {

  @Test
  public void testDefaultOptions() {
    EdgeOptions options = new EdgeOptions();
    checkCommonStructure(options);
    assertThat(options.asMap()).extracting(EdgeOptions.CAPABILITY).asInstanceOf(MAP)
        .containsEntry("args", Collections.emptyList())
        .containsEntry("extensions", Collections.emptyList());
  }

  @Test
  public void canAddArguments() {
    EdgeOptions options = new EdgeOptions();
    options.addArguments("--arg1", "--arg2");
    checkCommonStructure(options);
    assertThat(options.asMap()).extracting(EdgeOptions.CAPABILITY).asInstanceOf(MAP)
        .containsEntry("args", Arrays.asList("--arg1", "--arg2"))
        .containsEntry("extensions", Collections.emptyList());
  }

  @Test
  public void canAddExtensions() throws IOException {
    EdgeOptions options = new EdgeOptions();
    Path tmpDir = Files.createTempDirectory("webdriver");
    File ext1 = createTempFile(tmpDir, "ext1 content");
    File ext2 = createTempFile(tmpDir, "ext2 content");
    options.addExtensions(ext1, ext2);
    checkCommonStructure(options);
    assertThat(options.asMap()).extracting(EdgeOptions.CAPABILITY).asInstanceOf(MAP)
        .containsEntry("args", Collections.emptyList())
        .containsEntry("extensions", Stream.of("ext1 content", "ext2 content")
            .map(s -> Base64.getEncoder().encodeToString(s.getBytes())).collect(Collectors.toList()));
  }

  @Test
  public void canMergeWithoutChangingOriginalObject() {
    EdgeOptions options = new EdgeOptions();
    Map<String, Object> before = options.asMap();
    EdgeOptions merged = options.merge(
        new ImmutableCapabilities(CapabilityType.PAGE_LOAD_STRATEGY, PageLoadStrategy.NONE));
    // TODO: assertThat(merged).isNotSameAs(options);
    // TODO: assertThat(options.asMap()).isEqualTo(before);
    assertThat(merged.getCapability(CapabilityType.PAGE_LOAD_STRATEGY)).isEqualTo(PageLoadStrategy.NONE);
  }

  private void checkCommonStructure(EdgeOptions options) {
    assertThat(options.asMap())
        .containsEntry(CapabilityType.BROWSER_NAME, EDGE.browserName())
        .extracting(EdgeOptions.CAPABILITY).asInstanceOf(MAP)
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
  public void mergingOptionsMergesArguments() {
    EdgeOptions one = new EdgeOptions().addArguments("verbose");
    EdgeOptions two = new EdgeOptions().addArguments("silent");
    EdgeOptions merged = one.merge(two);

    assertThat(merged.asMap()).asInstanceOf(MAP)
      .extractingByKey(EdgeOptions.CAPABILITY).asInstanceOf(MAP)
      .extractingByKey("args").asInstanceOf(LIST)
      .containsExactly("verbose", "silent");
  }
}
