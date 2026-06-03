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

import java.io.File;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class ElectronOptionsTest {

  private static final File ELECTRON_BINARY = new File("/path/to/electron/app");

  @Test
  void browserNameIsChromeOnTheWire() {
    ElectronOptions options = new ElectronOptions(ELECTRON_BINARY);
    assertThat(options.getBrowserName()).isEqualTo("chrome");
    assertThat(options.asMap()).containsEntry("browserName", "chrome");
  }

  @Test
  void constructorStoresBinary() {
    ElectronOptions options = new ElectronOptions(ELECTRON_BINARY);
    assertThat(options.asMap())
        .extractingByKey(ElectronOptions.CAPABILITY)
        .asInstanceOf(org.assertj.core.api.InstanceOfAssertFactories.MAP)
        .containsEntry("binary", ELECTRON_BINARY.getPath());
  }

  @Test
  void constructorRejectsNullBinary() {
    assertThatThrownBy(() -> new ElectronOptions(null))
        .isInstanceOf(IllegalArgumentException.class);
  }

  @Test
  void mergeReturnsElectronOptions() {
    ElectronOptions options = new ElectronOptions(ELECTRON_BINARY);
    ElectronOptions merged = options.merge(new ElectronOptions(ELECTRON_BINARY));

    assertThat(merged.getBrowserName()).isEqualTo("chrome");
    assertThat(merged).isInstanceOf(ElectronOptions.class);
  }
}
