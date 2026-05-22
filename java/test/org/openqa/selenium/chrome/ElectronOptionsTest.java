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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

@Tag("UnitTests")
class ElectronOptionsTest {

  @TempDir static Path tempDir;

  static Path electronAppFile;
  static Path electronAppBundle;

  @BeforeAll
  static void createElectronApp() throws IOException {
    electronAppFile = Files.createFile(tempDir.resolve("Electron"));
    electronAppBundle = Files.createDirectory(tempDir.resolve("Electron.app"));
  }

  @Test
  void browserNameIsChromeOnTheWire() {
    ElectronOptions options = new ElectronOptions(electronAppFile.toString());
    assertThat(options.getBrowserName()).isEqualTo("chrome");
    assertThat(options.asMap()).containsEntry("browserName", "chrome");
  }

  @Test
  void constructorStoresBinary() {
    ElectronOptions options = new ElectronOptions(electronAppFile.toString());
    assertThat(options.asMap())
        .extractingByKey(ElectronOptions.CAPABILITY)
        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
        .containsEntry("binary", electronAppFile.toString());
  }

  @Test
  void constructorAcceptsAppBundleDirectory() {
    ElectronOptions options = new ElectronOptions(electronAppBundle.toString());
    assertThat(options.asMap())
        .extractingByKey(ElectronOptions.CAPABILITY)
        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
        .containsEntry("binary", electronAppBundle.toString());
  }

  @Test
  void constructorRejectsNullBinary() {
    assertThatThrownBy(() -> new ElectronOptions(null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void constructorRejectsNonexistentPath() {
    assertThatThrownBy(() -> new ElectronOptions("/does/not/exist/electron"))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("must exist");
  }

  @Test
  void mergeReturnsElectronOptions() {
    ElectronOptions options = new ElectronOptions(electronAppFile.toString());
    ElectronOptions merged = options.merge(new ElectronOptions(electronAppFile.toString()));

    assertThat(merged.getBrowserName()).isEqualTo("chrome");
    assertThat(merged).isInstanceOf(ElectronOptions.class);
  }
}
