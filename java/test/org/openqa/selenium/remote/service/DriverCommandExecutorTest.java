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

package org.openqa.selenium.remote.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.ConnectException;
import java.net.URL;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

@Tag("UnitTests")
class DriverCommandExecutorTest {

  private static final String DRIVER_SERVER_URL = "http://a.base.url:3000";

  @Test
  void shouldStartDriverServerOnTheNewSession() throws IOException {
    Command command = new Command(null, DriverCommand.NEW_SESSION(new ImmutableCapabilities()));
    Response response = new Response(new SessionId("foo"));
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL(DRIVER_SERVER_URL));
    when(service.isRunning()).thenReturn(false, true);

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doReturn(response).when(executor).invokeExecute(any(Command.class));
    assertThat(executor.execute(command)).isEqualTo(response);

    verify(service).start();
    verify(service, never()).stop();
  }

  @Test
  void shouldNotStartDriverServerOnGetCommand() throws IOException {
    Command command =
        new Command(new SessionId("some id"), DriverCommand.GET("https://example.com"));
    Response response = new Response();
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL("http://a.base.url:3000"));

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doReturn(response).when(executor).invokeExecute(any(Command.class));
    assertThat(executor.execute(command)).isEqualTo(response);

    verify(service, never()).isRunning();
    verify(service, never()).start();
    verify(service, never()).stop();
  }

  @Test
  void shouldStopDriverServerOnExceptionForTheNewSessionCommand() throws IOException {
    Command command = new Command(null, DriverCommand.NEW_SESSION(new ImmutableCapabilities()));
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL("http://a.base.url:3000"));
    when(service.isRunning()).thenReturn(false, true);

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doThrow(WebDriverException.class).when(executor).invokeExecute(any(Command.class));
    assertThatExceptionOfType(WebDriverException.class).isThrownBy(() -> executor.execute(command));

    verify(service).start();
    verify(service).stop();
  }

  @Test
  void shouldNotStopDriverServerOnExceptionForGetCommand() throws IOException {
    Command command =
        new Command(new SessionId("some id"), DriverCommand.GET("https://example.com"));
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL("http://a.base.url:3000"));

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doThrow(WebDriverException.class).when(executor).invokeExecute(any(Command.class));
    assertThatExceptionOfType(WebDriverException.class).isThrownBy(() -> executor.execute(command));

    verify(service, never()).isRunning();
    verify(service, never()).start();
    verify(service, never()).stop();
  }

  @Test
  void shouldNotStopDriverServerOnExceptionForTheNewSessionCommandIfItWasAlreadyRunning()
      throws IOException {
    Command command = new Command(null, DriverCommand.NEW_SESSION(new ImmutableCapabilities()));
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL("http://a.base.url:3000"));
    when(service.isRunning()).thenReturn(true);

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doThrow(WebDriverException.class).when(executor).invokeExecute(any(Command.class));
    assertThatExceptionOfType(WebDriverException.class).isThrownBy(() -> executor.execute(command));

    verify(service).start();
    verify(service, never()).stop();
  }

  @Test
  void shouldNotStopDriverServerOnExceptionForTheNewSessionCommandIfItDied() throws IOException {
    Command command = new Command(null, DriverCommand.NEW_SESSION(new ImmutableCapabilities()));
    DriverService service = mock(DriverService.class);
    when(service.getUrl()).thenReturn(new URL("http://a.base.url:3000"));
    when(service.isRunning()).thenReturn(false);

    DriverCommandExecutor executor = spy(new DriverCommandExecutor(service));
    doThrow(new ConnectException("Connection refused"))
        .when(executor)
        .invokeExecute(any(Command.class));
    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(() -> executor.execute(command))
        .withMessageContaining("The driver server has unexpectedly died!");

    verify(service).start();
    verify(service, never()).stop();
  }
}
