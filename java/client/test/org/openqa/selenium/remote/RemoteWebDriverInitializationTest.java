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
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.WebDriverFixture.echoCapabilities;
import static org.openqa.selenium.remote.WebDriverFixture.exceptionResponder;
import static org.openqa.selenium.remote.WebDriverFixture.nullResponder;
import static org.openqa.selenium.remote.WebDriverFixture.nullValueResponder;
import static org.openqa.selenium.remote.WebDriverFixture.valueResponder;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.mockito.ArgumentCaptor;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.SessionNotCreatedException;
import org.openqa.selenium.remote.http.ClientConfig;
import org.openqa.selenium.remote.http.Contents;
import org.openqa.selenium.remote.http.HttpClient;
import org.openqa.selenium.remote.http.HttpResponse;
import org.openqa.selenium.testing.UnitTests;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.net.MalformedURLException;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

@Category(UnitTests.class)
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
  public void constructorShouldThrowIfExecutorIsNull() {
    assertThatExceptionOfType(IllegalArgumentException.class)
      .isThrownBy(() -> new RemoteWebDriver((CommandExecutor) null, new ImmutableCapabilities()))
      .withMessage("Command executor must be set");
  }

  @Test
  public void constructorShouldThrowIfExecutorThrowsOnAnAttemptToStartASession() {
    CommandExecutor executor = WebDriverFixture.prepareExecutorMock(exceptionResponder);

    assertThatExceptionOfType(SessionNotCreatedException.class)
      .isThrownBy(() -> new RemoteWebDriver(executor, new ImmutableCapabilities()))
      .withMessageContaining("Build info: ")
      .withMessageContaining("Driver info: org.openqa.selenium.remote.RemoteWebDriver")
      .withMessageContaining("Command: [null, newSession {capabilities=[Capabilities {}], desiredCapabilities=Capabilities {}}]");

    verifyNoCommands(executor);
  }

  @Test
  public void constructorShouldThrowIfExecutorReturnsNullOnAnAttemptToStartASession() {
    CommandExecutor executor = WebDriverFixture.prepareExecutorMock(nullResponder);
    assertThatExceptionOfType(SessionNotCreatedException.class)
      .isThrownBy(() -> new RemoteWebDriver(executor, new ImmutableCapabilities()));

    verifyNoCommands(executor);
  }

  @Test
  public void constructorShouldThrowIfExecutorReturnsAResponseWithNullValueOnAnAttemptToStartASession() {
    CommandExecutor executor = WebDriverFixture.prepareExecutorMock(nullValueResponder);
    assertThatExceptionOfType(SessionNotCreatedException.class)
      .isThrownBy(() -> new RemoteWebDriver(executor, new ImmutableCapabilities()));

    verifyNoCommands(executor);
  }

  @Test
  public void constructorShouldThrowIfExecutorReturnsSomethingButNotCapabilitiesOnAnAttemptToStartASession() {
    CommandExecutor executor = WebDriverFixture.prepareExecutorMock(valueResponder("OK"));
    assertThatExceptionOfType(SessionNotCreatedException.class)
      .isThrownBy(() -> new RemoteWebDriver(executor, new ImmutableCapabilities()));

    verifyNoCommands(executor);
  }

  @Test
  public void constructorStartsSessionAndPassesCapabilities() throws IOException {
    CommandExecutor executor = WebDriverFixture.prepareExecutorMock(echoCapabilities, nullValueResponder);
    ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "cheese browser");

    RemoteWebDriver driver = new RemoteWebDriver(executor, capabilities);

    verify(executor).execute(argThat(
      command -> command.getName().equals(DriverCommand.NEW_SESSION)
                 && command.getSessionId() == null
                 && command.getParameters().get("desiredCapabilities") == capabilities
    ));
    verifyNoMoreInteractions(executor);
    assertThat(driver.getSessionId()).isNotNull();
  }

  @Test
  public void canHandlePlatformNameCapability() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities(
        "browserName", "cheese browser", "platformName", Platform.MOJAVE),
      echoCapabilities, nullValueResponder);

    assertThat(fixture.driver.getCapabilities().getPlatformName())
      .satisfies(p -> p.is(Platform.MOJAVE));
  }

  @Test
  public void canHandlePlatformOSSCapability() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities(
        "browserName", "cheese browser", "platform", Platform.MOJAVE),
      echoCapabilities, nullValueResponder);

    assertThat(fixture.driver.getCapabilities().getPlatformName())
      .satisfies(p -> p.is(Platform.MOJAVE));
  }

  @Test
  public void canHandleUnknownPlatformNameAndFallsBackToUnix() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities(
        "browserName", "cheese browser", "platformName", "cheese platform"),
      echoCapabilities, nullValueResponder);

    assertThat(fixture.driver.getCapabilities().getPlatformName())
      .satisfies(p -> p.is(Platform.UNIX)); // fallback
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

  @Test
  public void canPassClientConfig() throws MalformedURLException {
    HttpClient client = mock(HttpClient.class);
    when(client.execute(any())).thenReturn(new HttpResponse().setStatus(200).setContent(
      Contents.asJson(singletonMap("value", ImmutableMap.of(
        "sessionId", UUID.randomUUID().toString(),
        "capabilities", new ImmutableCapabilities().asMap())))));

    HttpClient.Factory factory = mock(HttpClient.Factory.class);
    ArgumentCaptor<ClientConfig > config = ArgumentCaptor.forClass(ClientConfig.class);
    when(factory.createClient(config.capture())).thenReturn(client);

    CommandExecutor executor = new HttpCommandExecutor(
      emptyMap(),
      ClientConfig.defaultConfig()
        .baseUrl(new URL("http://localhost:4444/")).readTimeout(Duration.ofSeconds(1)),
      factory);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());

    ClientConfig usedConfig = config.getValue();
    assertThat(usedConfig.baseUrl()).isEqualTo(new URL("http://localhost:4444/"));
    assertThat(usedConfig.readTimeout()).isEqualTo(Duration.ofSeconds(1));
  }

  public void verifyNoCommands(CommandExecutor executor) {
    try {
      verify(executor).execute(argThat(cmd -> cmd.getName().equals(DriverCommand.NEW_SESSION)));
    } catch (IOException ex) {
      throw new UncheckedIOException(ex);
    }
    verifyNoMoreInteractions(executor);
  }
}
