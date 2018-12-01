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

import static java.util.Collections.EMPTY_LIST;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.mockito.stubbing.OngoingStubbing;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.Platform;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.stream.Collectors;

public class RemoteWebDriverUnitTest {

  private static final String ELEMENT_KEY = "element-6066-11e4-a52e-4f735466cecf";

  @Test
  public void whatIfExecutorIsNull() {
    assertThatExceptionOfType(UnreachableBrowserException.class)
        .isThrownBy(() -> new RemoteWebDriver((CommandExecutor) null, new ImmutableCapabilities()));
  }

  @Test
  public void whatIfExecutorCannotStartASession() throws IOException {
    CommandExecutor executor = prepareExecutorMock(nullResponder, nullResponder);
    assertThatExceptionOfType(UnreachableBrowserException.class)
        .isThrownBy(() -> new RemoteWebDriver(executor, new ImmutableCapabilities()));

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void constructorStartsSessionAndPassesCapabilities() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);
    ImmutableCapabilities capabilities = new ImmutableCapabilities("browserName", "cheese browser");

    RemoteWebDriver driver = new RemoteWebDriver(executor, capabilities);

    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.NEW_SESSION))
            .filter(cmd -> cmd.getSessionId() == null)
            .filter(cmd -> cmd.getParameters().get("desiredCapabilities") == capabilities)
            .isPresent()
    ));
    verifyNoMoreInteractions(executor);
    assertThat(driver.getSessionId()).isNotNull();
  }

  @Test
  public void canHandlePlatformNameCapability() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
        "browserName", "cheese browser", "platformName", Platform.MOJAVE);

    RemoteWebDriver driver = new RemoteWebDriver(executor, capabilities);

    assertThat(driver.getCapabilities().getPlatform().is(Platform.MOJAVE)).isTrue();
  }

  @Test
  public void canHandlePlatformOSSCapability() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
        "browserName", "cheese browser", "platform", Platform.MOJAVE);

    RemoteWebDriver driver = new RemoteWebDriver(executor, capabilities);

    assertThat(driver.getCapabilities().getPlatform().is(Platform.MOJAVE)).isTrue();
  }

  @Test
  public void canHandleUnknownPlatformNameAndFallsBackToUnix() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);
    ImmutableCapabilities capabilities = new ImmutableCapabilities(
        "browserName", "cheese browser", "platformName", "cheese platform");

    RemoteWebDriver driver = new RemoteWebDriver(executor, capabilities);

    assertThat(driver.getCapabilities().getPlatform().is(Platform.UNIX)).isTrue(); // fallback
  }

  @Test
  public void canHandleGetCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.get("http://some.host.com");

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("url").equals("http://some.host.com"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetCurrentUrlCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("http://some.host.com"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String url = driver.getCurrentUrl();

    assertThat(url).isEqualTo("http://some.host.com");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_CURRENT_URL))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetTitleCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String title = driver.getTitle();

    assertThat(title).isEqualTo("Hello, world!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_TITLE))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetPageSourceCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String html = driver.getPageSource();

    assertThat(html).isEqualTo("Hello, world!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_PAGE_SOURCE))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleExecuteScriptCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.setLogLevel(Level.WARNING);
    Object result = driver.executeScript("return 1", 1, "2");

    assertThat(result).isEqualTo("Hello, world!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.EXECUTE_SCRIPT))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("script").equals("return 1"))
            .filter(cmd -> cmd.getParameters().get("args") instanceof List)
            .filter(cmd -> ((List) cmd.getParameters().get("args")).size() == 2)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleExecuteAsyncScriptCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Object result = driver.executeAsyncScript("return 1", 1, "2");

    assertThat(result).isEqualTo("Hello, world!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.EXECUTE_ASYNC_SCRIPT))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("script").equals("return 1"))
            .filter(cmd -> cmd.getParameters().get("args") instanceof List)
            .filter(cmd -> ((List) cmd.getParameters().get("args")).size() == 2)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleFindElementOSSCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("ELEMENT", UUID.randomUUID().toString())));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebElement found = driver.findElement(By.id("cheese"));

    assertThat(found).isNotNull();
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.FIND_ELEMENT))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("using").equals("id"))
            .filter(cmd -> cmd.getParameters().get("value").equals("cheese"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleFindElementW3CCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString())));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebElement found = driver.findElement(By.id("cheese"));

    assertThat(found).isNotNull();
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.FIND_ELEMENT))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("using").equals("id"))
            .filter(cmd -> cmd.getParameters().get("value").equals("cheese"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleFindElementsOSSCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of("ELEMENT", UUID.randomUUID().toString()),
            ImmutableMap.of("ELEMENT", UUID.randomUUID().toString()))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<WebElement> found = driver.findElements(By.id("cheese"));

    assertThat(found).hasSize(2);
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.FIND_ELEMENTS))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("using").equals("id"))
            .filter(cmd -> cmd.getParameters().get("value").equals("cheese"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleFindElementsW3CCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()),
            ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<WebElement> found = driver.findElements(By.id("cheese"));

    assertThat(found).hasSize(2);
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.FIND_ELEMENTS))
            .filter(cmd -> cmd.getParameters().size() == 2)
            .filter(cmd -> cmd.getParameters().get("using").equals("id"))
            .filter(cmd -> cmd.getParameters().get("value").equals("cheese"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void returnsEmptyListIfRemoteEndReturnsNullFromFindElements() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<WebElement> result = driver.findElements(By.id("id"));
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  public void returnsEmptyListIfRemoteEndReturnsNullFromFindChildren() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId("unique");

    List<WebElement> result = element.findElements(By.id("id"));
    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  public void throwsIfRemoteEndReturnsNullFromFindElement() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> driver.findElement(By.id("id")));
  }

  @Test
  public void throwIfRemoteEndReturnsNullFromFindChild() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId("unique");

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> element.findElement(By.id("id")));
  }

  @Test
  public void canHandleGetWindowHandleCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String handle = driver.getWindowHandle();

    assertThat(handle).isEqualTo("Hello, world!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_CURRENT_WINDOW_HANDLE))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetWindowHandlesCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableList.of("window 1", "window 2")));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Set<String> handles = driver.getWindowHandles();

    assertThat(handles).hasSize(2).contains("window 1", "window 2");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_WINDOW_HANDLES))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleCloseCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.close();

    assertThat(driver.getSessionId()).isNotNull();
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.CLOSE))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleQuitCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.quit();

    assertThat(driver.getSessionId()).isNull();
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.QUIT))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleQuitCommandAfterQuit() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.quit();

    assertThat(driver.getSessionId()).isNull();
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.QUIT))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);

    driver.quit();
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToWindowCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().window("window1");

    assertThat(driver2).isSameAs(driver);
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SWITCH_TO_WINDOW))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("handle").equals("window1"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToFrameByIndexCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().frame(1);

    assertThat(driver2).isSameAs(driver);
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SWITCH_TO_FRAME))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("id").equals(1))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToFrameByNameCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()),
            ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().frame("frameName");

    assertThat(driver2).isSameAs(driver);
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.FIND_ELEMENTS)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SWITCH_TO_FRAME))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> isWebElement(cmd.getParameters().get("id")))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToNonExistingFrameCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(EMPTY_LIST));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    assertThatExceptionOfType(NoSuchFrameException.class)
        .isThrownBy(() -> driver.switchTo().frame("frameName"));

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.FIND_ELEMENTS)
                   && command.getParameters().get("using").equals("css selector")
                   && command.getParameters().get("value").equals("frame[name='frameName'],iframe[name='frameName']")));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.FIND_ELEMENTS)
                   && command.getParameters().get("using").equals("css selector")
                   && command.getParameters().get("value").equals("frame#frameName,iframe#frameName")));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToAlertCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Alarm!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Alert alert = driver.switchTo().alert();

    assertThat(alert.getText()).isEqualTo("Alarm!");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor, times(2)).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_ALERT_TEXT))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleRefreshCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.navigate().refresh();

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.REFRESH))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetCookiesCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of("name", "cookie1", "value", "value1"),
            ImmutableMap.of("name", "cookie2", "value", "value2"))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Set<Cookie> cookies = driver.manage().getCookies();

    assertThat(cookies).hasSize(2).contains(new Cookie("cookie1", "value1"), new Cookie("cookie2", "value2"));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_ALL_COOKIES))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetWindowSizeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("width", 400, "height", 600)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Dimension size = driver.manage().window().getSize();

    assertThat(size).isEqualTo(new Dimension(400, 600));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_CURRENT_WINDOW_SIZE))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleGetWindowPositionCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("x", 100, "y", 200)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Point position = driver.manage().window().getPosition();

    assertThat(position).isEqualTo(new Point(100, 200));
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.GET_CURRENT_WINDOW_POSITION))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("windowHandle").equals("current"))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSetImplicitWaitCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SET_TIMEOUT))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("implicit").equals(10000L))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSetScriptTimeoutCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().setScriptTimeout(10, TimeUnit.SECONDS);

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SET_TIMEOUT))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("script").equals(10000L))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleIME() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableList.of("cheese")));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<String> engines = driver.manage().ime().getAvailableEngines();

    assertThat(engines).hasSize(1).contains("cheese");
    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.IME_GET_AVAILABLE_ENGINES))
            .filter(cmd -> cmd.getParameters().size() == 0)
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSetPageLoadTimeoutCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().pageLoadTimeout(10, TimeUnit.SECONDS);

    verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    verify(executor).execute(argThat(
        command -> Optional.of(command)
            .filter(cmd -> cmd.getName().equals(DriverCommand.SET_TIMEOUT))
            .filter(cmd -> cmd.getParameters().size() == 1)
            .filter(cmd -> cmd.getParameters().get("pageLoad").equals(10000L))
            .isPresent()));
    verifyNoMoreInteractions(executor);
  }

  private boolean isWebElement(Object value) {
    return Optional.of(value)
        .filter(v -> v instanceof Map)
        .map(v -> (Map<String, Object>) v)
        .filter(m -> m.size() == 2)
        .filter(m -> m.containsKey("ELEMENT") && m.containsKey(ELEMENT_KEY))
        .filter(m -> m.get("ELEMENT").equals(m.get(ELEMENT_KEY)))
        .isPresent();
  }

  private Function<Command, Response> echoCapabilities = cmd -> {
    Response nullResponse = new Response();
    nullResponse.setValue(
        ((Capabilities) cmd.getParameters().get("desiredCapabilities")).asMap()
            .entrySet().stream()
            .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue().toString())));
    nullResponse.setSessionId(UUID.randomUUID().toString());
    return nullResponse;
  };

  private Function<Command, Response> nullResponder = cmd -> {
    Response nullResponse = new Response();
    nullResponse.setValue(null);
    nullResponse.setSessionId(cmd.getSessionId().toString());
    return nullResponse;
  };

  private Function<Command, Response> valueResponder(Object value) {
    return cmd -> {
      Response nullResponse = new Response();
      nullResponse.setValue(value);
      nullResponse.setSessionId(cmd.getSessionId().toString());
      return nullResponse;
    };
  }

  @SafeVarargs
  private final CommandExecutor prepareExecutorMock(
      Function<Command, Response>... handlers) throws IOException {
    CommandExecutor executor = mock(CommandExecutor.class);
    OngoingStubbing<Response> callChain = when(executor.execute(any()));
    for (Function<Command, Response> handler : handlers) {
      callChain = callChain.thenAnswer(invocation -> handler.apply(invocation.getArgument(0)));
    }
    return executor;
  }

}
