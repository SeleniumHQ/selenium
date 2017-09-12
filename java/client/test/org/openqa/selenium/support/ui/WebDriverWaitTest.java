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

import static org.junit.Assert.assertSame;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.google.common.collect.Lists;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.NoSuchWindowException;
import org.openqa.selenium.TimeoutException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.internal.WrapsDriver;
import org.openqa.selenium.remote.Command;
import org.openqa.selenium.remote.CommandExecutor;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.remote.Response;
import org.openqa.selenium.remote.SessionId;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RunWith(JUnit4.class)
public class WebDriverWaitTest {

  @Mock private WebDriver mockDriver;
  @Mock private WebElement mockElement;

  @Before
  public void createMocks() {
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void shouldIncludeRemoteInfoForWrappedDriverTimeout() {
    DesiredCapabilities caps = new DesiredCapabilities();
    WrappedDriver testDriver = new WrappedDriver(new RemoteWebDriver(new StubExecutor(caps), caps));

    TickingClock clock = new TickingClock(200);
    WebDriverWait wait = new WebDriverWait(testDriver, clock, clock, 1, 200);

    try {
      wait.until(new FalseExpectation());
    } catch (TimeoutException e) {
      String message = e.getMessage();
      assertTrue(message.contains("Capabilities [{javascriptEnabled=true, platformName=ANY, platform=ANY}]") &&  message.contains("Session ID: foo"));
    }
  }

  @Test
  public void shouldThrowAnExceptionIfTheTimerRunsOut() {
    TickingClock clock = new TickingClock(200);
    WebDriverWait wait = new WebDriverWait(mockDriver, clock, clock, 1, 200);

    try {
      wait.until(new FalseExpectation());
      fail();
    } catch (TimeoutException e) {
      // this is expected
    }
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

  private static class FalseExpectation implements ExpectedCondition<Boolean> {
    public Boolean apply(WebDriver driver) {
      return false;
    }
  }

  public class WrappedDriver implements WebDriver, WrapsDriver {

    private final WebDriver driver;

    public WrappedDriver(WebDriver driver) {
      this.driver = driver;
    }

    @Override
    public WebDriver getWrappedDriver() {
      return driver;
    }

    @Override
    public void get(String url) {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getCurrentUrl() {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getTitle() {
      throw new UnsupportedOperationException();
    }

    @Override
    public List<WebElement> findElements(By by) {
      throw new UnsupportedOperationException();
    }

    @Override
    public WebElement findElement(By by) {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getPageSource() {
      throw new UnsupportedOperationException();
    }

    @Override
    public void close() {
      throw new UnsupportedOperationException();
    }

    @Override
    public void quit() {
      throw new UnsupportedOperationException();
    }

    @Override
    public Set<String> getWindowHandles() {
      throw new UnsupportedOperationException();
    }

    @Override
    public String getWindowHandle() {
      throw new UnsupportedOperationException();
    }

    @Override
    public TargetLocator switchTo() {
      throw new UnsupportedOperationException();
    }

    @Override
    public Navigation navigate() {
      throw new UnsupportedOperationException();
    }

    @Override
    public Options manage() {
      throw new UnsupportedOperationException();
    }
  }

  protected static class StubExecutor implements CommandExecutor {
    private final Capabilities capabilities;
    private final List<Data> expected = Lists.newArrayList();

    protected StubExecutor(Capabilities capabilities) {
      this.capabilities = capabilities;
    }

    public Response execute(Command command) {
      if (DriverCommand.NEW_SESSION.equals(command.getName())) {
        Response response = new Response(new SessionId("foo"));
        response.setValue(capabilities.asMap());
        return response;
      }

      for (Data possibleMatch : expected) {
        if (possibleMatch.commandName.equals(command.getName()) &&
            possibleMatch.args.equals(command.getParameters())) {
          Response response = new Response(new SessionId("foo"));
          response.setValue(possibleMatch.returnValue);
          return response;
        }
      }

      fail("Unexpected method invocation: " + command);
      return null; // never reached
    }

    public void expect(String commandName, Map<String, ?> args, Object returnValue) {
      expected.add(new Data(commandName, args, returnValue));
    }

    private class Data {
      public String commandName;
      public Map<String, ?> args;
      public Object returnValue;

      public Data(String commandName, Map<String, ?> args, Object returnValue) {
        this.commandName = commandName;
        this.args = args;
        this.returnValue = returnValue;
      }
    }
  }

}