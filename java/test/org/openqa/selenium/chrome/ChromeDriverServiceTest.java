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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

import java.io.File;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.chromium.ChromiumDriverLogLevel;

@Tag("UnitTests")
class ChromeDriverServiceTest {

  @Test
  void builderPassesTimeoutToDriverService() {
    File exe = new File("someFile");
    Duration defaultTimeout = Duration.ofSeconds(20);
    Duration customTimeout = Duration.ofSeconds(60);

    ChromeDriverService.Builder builderMock = spy(ChromeDriverService.Builder.class);
    builderMock.build();

    verify(builderMock).createDriverService(any(), anyInt(), eq(defaultTimeout), any(), any());

    builderMock.withTimeout(customTimeout);
    builderMock.build();
    verify(builderMock).createDriverService(any(), anyInt(), eq(customTimeout), any(), any());
  }

  @Test
  void testScoring() {
    ChromeDriverService.Builder builder = new ChromeDriverService.Builder();
    assertThat(builder.score(new ChromeOptions())).isPositive();
  }

  @Test
  void logLevelLastWins() {
    ChromeDriverService.Builder builderMock = spy(ChromeDriverService.Builder.class);

    List<String> silentLast = Arrays.asList("--port=1", "--log-level=OFF");
    builderMock.withLogLevel(ChromiumDriverLogLevel.ALL).usingPort(1).withSilent(true).build();
    verify(builderMock).createDriverService(any(), anyInt(), any(), eq(silentLast), any());

    List<String> silentFirst = Arrays.asList("--port=1", "--log-level=DEBUG");
    builderMock.withSilent(true).withLogLevel(ChromiumDriverLogLevel.DEBUG).usingPort(1).build();
    verify(builderMock).createDriverService(any(), anyInt(), any(), eq(silentFirst), any());

    List<String> verboseLast = Arrays.asList("--port=1", "--log-level=ALL");
    builderMock.withLogLevel(ChromiumDriverLogLevel.OFF).usingPort(1).withVerbose(true).build();
    verify(builderMock).createDriverService(any(), anyInt(), any(), eq(verboseLast), any());

    List<String> verboseFirst = Arrays.asList("--port=1", "--log-level=INFO");
    builderMock.withVerbose(true).withLogLevel(ChromiumDriverLogLevel.INFO).usingPort(1).build();
    verify(builderMock).createDriverService(any(), anyInt(), any(), eq(verboseFirst), any());
  }

  // Setting these to false makes no sense; we're just going to ignore it.
  @Test
  void ignoreFalseLogging() {
    ChromeDriverService.Builder builderMock = spy(ChromeDriverService.Builder.class);

    List<String> falseSilent = Arrays.asList("--port=1", "--log-level=DEBUG");
    builderMock.withLogLevel(ChromiumDriverLogLevel.DEBUG).usingPort(1).withSilent(false).build();
    verify(builderMock).createDriverService(any(), anyInt(), any(), eq(falseSilent), any());
  }
}
