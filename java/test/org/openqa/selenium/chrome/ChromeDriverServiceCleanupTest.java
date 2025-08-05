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
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.spy;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.SessionNotCreatedException;

@Tag("UnitTests")
class ChromeDriverServiceCleanupTest {

  @Test
  void shouldStopServiceWhenSessionCreationFails() {
    // Create a Chrome options that will cause session creation to fail
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--user-data-dir=/no/such/location");

    // Create a service
    ChromeDriverService service = ChromeDriverService.createDefaultService();
    ChromeDriverService serviceSpy = spy(service);

    // Attempt to create driver - should fail and cleanup the service
    assertThatExceptionOfType(SessionNotCreatedException.class)
        .isThrownBy(() -> new ChromeDriver(serviceSpy, options));

    // Verify that the service was stopped
    assertThat(serviceSpy.isRunning()).isFalse();
  }
}
