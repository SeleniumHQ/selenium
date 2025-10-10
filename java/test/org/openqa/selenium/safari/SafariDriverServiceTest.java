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

package org.openqa.selenium.safari;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import java.io.File;
import java.time.Duration;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class SafariDriverServiceTest {

  @Test
  void builderPassesTimeoutToDriverService() {
    File exe = new File("someFile");
    Duration defaultTimeout = Duration.ofSeconds(20);
    Duration customTimeout = Duration.ofSeconds(60);

    SafariDriverService.Builder builderMock = spy(MockSafariDriverServiceBuilder.class);
    builderMock.build();

    verify(builderMock).createDriverService(any(), anyInt(), eq(defaultTimeout), any(), any());

    builderMock.withTimeout(customTimeout);
    builderMock.build();
    verify(builderMock).createDriverService(any(), anyInt(), eq(customTimeout), any(), any());
  }

  @Test
  void shouldStopServiceWhenSessionCreationFails() {
    // Create Safari options that will cause session creation to fail
    SafariOptions options = new SafariOptions();
    options.setCapability("invalidCapability", "invalidValue");

    // Create a service
    SafariDriverService service = SafariDriverService.createDefaultService();
    SafariDriverService serviceSpy = spy(service);

    // Attempt to create driver - should fail and cleanup the service
    assertThatExceptionOfType(Exception.class)
        .isThrownBy(() -> new SafariDriver(serviceSpy, options));

    // Verify that the service was stopped
    assertThat(serviceSpy.isRunning()).isFalse();
  }

  public static class MockSafariDriverServiceBuilder extends SafariDriverService.Builder {

    @Override
    public SafariDriverService.Builder usingDriverExecutable(File file) {
      return this;
    }
  }
}
