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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;

import java.io.IOException;
import java.util.UUID;

public class RemoteWebDriverInitializationTest {
  private boolean quitCalled = false;

  @Test
  public void testQuitsIfStartSessionFails() {
    assertThatExceptionOfType(RuntimeException.class)
        .isThrownBy(() -> new BadStartSessionRemoteWebDriver(mock(CommandExecutor.class), new ImmutableCapabilities()))
        .withMessageContaining("Stub session that should fail");

    assertThat(quitCalled).isTrue();
  }

  @Test
  public void canHandleNonStandardCapabilitiesReturnedByRemoteEnd() throws IOException {
    Response resp = new Response();
    resp.setSessionId(UUID.randomUUID().toString());
    resp.setValue(ImmutableMap.of("platformName", "xxx"));
    CommandExecutor executor = mock(CommandExecutor.class);
    when(executor.execute(any())).thenReturn(resp);
    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    assertThat(driver.getCapabilities().getCapability("platform")).isEqualTo(Platform.UNIX);
  }

  private class BadStartSessionRemoteWebDriver extends RemoteWebDriver {
    public BadStartSessionRemoteWebDriver(CommandExecutor executor,
                                          Capabilities desiredCapabilities) {
      super(executor, desiredCapabilities);
    }

    @Override
    protected void startSession(Capabilities desiredCapabilities) {
      throw new RuntimeException("Stub session that should fail");
    }

    @Override
    public void quit() {
      quitCalled = true;
    }
  }
}
