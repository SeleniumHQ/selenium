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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class ReleaseJarBuildInfoTest {

  private static final String BUILD_PROPERTIES = "META-INF/selenium-build.properties";

  private final Path jar = Path.of(System.getProperty("selenium.release.jar"));

  @Test
  void containsExactlyOneBuildPropertiesFile() throws IOException {
    List<String> names = new ArrayList<>();
    try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(jar))) {
      for (ZipEntry entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
        names.add(entry.getName());
      }
    }

    assertThat(names).filteredOn(BUILD_PROPERTIES::equals).hasSize(1);
  }

  @Test
  void stampedJarRecordsVersionAndRevision() throws IOException {
    String expectedVersion = System.getProperty("selenium.stamped.version");
    assumeTrue(expectedVersion != null, "Only stamped builds record the version and revision");

    Properties properties = buildProperties();

    assertThat(properties.getProperty("Selenium-Version")).isEqualTo(expectedVersion);
    assertThat(properties.getProperty("Build-Revision"))
        .isNotBlank()
        .isNotEqualToIgnoringCase("unknown");
  }

  private Properties buildProperties() throws IOException {
    try (ZipInputStream zip = new ZipInputStream(Files.newInputStream(jar))) {
      for (ZipEntry entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
        if (BUILD_PROPERTIES.equals(entry.getName())) {
          Properties properties = new Properties();
          properties.load(zip);
          return properties;
        }
      }
    }
    throw new AssertionError(BUILD_PROPERTIES + " not found in " + jar);
  }
}
