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

package org.openqa.selenium.support.ui;

import static org.hamcrest.CoreMatchers.containsString;
import static org.hamcrest.CoreMatchers.instanceOf;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertThat;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.withSettings;
import static org.openqa.selenium.testing.TestUtilities.catchThrowable;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.MutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

import java.io.IOException;

@RunWith(JUnit4.class)
public class WebDriverWaitTest {

  @Mock private WebDriver mockDriver;
  @Mock private WebElement mockElement;

  @Before
  public void createMocks() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void shouldIncludeRemoteInfoForWrappedDriverTimeout() throws IOException {
    Capabilities caps = new MutableCapabilities();
    Response response = new Response(new SessionId("foo"));
    response.setValue(caps.asMap());
    CommandExecutor executor = mock(CommandExecutor.class);
    when(executor.execute(any(Command.class))).thenReturn(response);

    RemoteWebDriver driver = new RemoteWebDriver(executor, caps);
    WebDriver testDriver = mock(WebDriver.class, withSettings().extraInterfaces(WrapsDriver.class));
    when(((WrapsDriver) testDriver).getWrappedDriver()).thenReturn(driver);

    TickingClock clock = new TickingClock(200);
    WebDriverWait wait = new WebDriverWait(testDriver, clock, clock, 1, 200);

    Throwable ex = catchThrowable(() -> wait.until((d) -> false));
    assertNotNull(ex);
    assertThat(ex, instanceOf(TimeoutException.class));
    assertThat(ex.getMessage(), containsString("Capabilities [{javascriptEnabled=true, platformName=ANY, platform=ANY}]"));
    assertThat(ex.getMessage(), containsString("Session ID: foo"));
  }

  @Test
  public void shouldThrowAnExceptionIfTheTimerRunsOut() {
    TickingClock clock = new TickingClock(200);
    WebDriverWait wait = new WebDriverWait(mockDriver, clock, clock, 1, 200);

    Throwable ex = catchThrowable(() -> wait.until((d) -> false));
    assertNotNull(ex);
    assertThat(ex, instanceOf(TimeoutException.class));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchElementExceptions() {
    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchElementException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    assertSame(mockElement, wait.until(condition));
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchFrameExceptions() {
    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchFrameException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }

  @SuppressWarnings("unchecked")
  @Test
  public void shouldSilentlyCaptureNoSuchWindowExceptions() {

    final ExpectedCondition<WebElement> condition = mock(ExpectedCondition.class);
    when(condition.apply(mockDriver))
        .thenThrow(new NoSuchWindowException("foo"))
        .thenReturn(mockElement);

    TickingClock clock = new TickingClock(500);
    Wait<WebDriver> wait = new WebDriverWait(mockDriver, clock, clock, 5, 500);
    wait.until(condition);
  }
}
