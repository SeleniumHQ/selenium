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

import static java.util.Collections.emptyMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.CapabilityType.PLATFORM_NAME;

import java.util.Map;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.openqa.selenium.Platform;

class RemoteWebDriverTest {

  @Nested
  class ResolvePlatform {

    @Test
    void detectsPlatformByCapabilityValue() {
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, "windows")))
          .isEqualTo(Platform.WINDOWS);
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, "mac")))
          .isEqualTo(Platform.MAC);
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, "Linux")))
          .isEqualTo(Platform.LINUX);
    }

    @ParameterizedTest
    @EnumSource(Platform.class)
    void allKnownPlatforms(Platform platform) {
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, platform.toString())))
          .isEqualTo(platform);
    }

    @Test
    void any_byDefault() {
      assertThat(RemoteWebDriver.resolvePlatform(emptyMap())).isEqualTo(Platform.ANY);
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, "")))
          .isEqualTo(Platform.ANY);
    }

    @Test
    void unix_byDefault() {
      assertThat(RemoteWebDriver.resolvePlatform(Map.of(PLATFORM_NAME, "xxx")))
          .isEqualTo(Platform.UNIX);
    }
  }
}
