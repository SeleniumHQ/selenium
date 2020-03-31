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
import org.mockito.InOrder;
import org.mockito.Mockito;
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
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;

import java.io.IOException;
import java.lang.reflect.Array;
import java.net.URL;
import java.util.Collections;
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

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET, ImmutableMap.of("url", "http://some.host.com")));
  }

  @Test
  public void canHandleGetCurrentUrlCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("http://some.host.com"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String url = driver.getCurrentUrl();

    assertThat(url).isEqualTo("http://some.host.com");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_CURRENT_URL, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetTitleCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String title = driver.getTitle();

    assertThat(title).isEqualTo("Hello, world!");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_TITLE, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetPageSourceCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    String html = driver.getPageSource();

    assertThat(html).isEqualTo("Hello, world!");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_PAGE_SOURCE, ImmutableMap.of()));
  }

  @Test
  public void canHandleExecuteScriptCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.setLogLevel(Level.WARNING);
    Object result = driver.executeScript("return 1", 1, "2");

    assertThat(result).isEqualTo("Hello, world!");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.EXECUTE_SCRIPT, ImmutableMap.of(
            "script", "return 1", "args", ImmutableList.of(1, "2"))));
  }

  @Test
  public void canHandleExecuteAsyncScriptCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Hello, world!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Object result = driver.executeAsyncScript("return 1", 1, "2");

    assertThat(result).isEqualTo("Hello, world!");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.EXECUTE_ASYNC_SCRIPT, ImmutableMap.of(
            "script", "return 1", "args", ImmutableList.of(1, "2"))));
  }

  @Test
  public void canHandleFindElementOSSCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("ELEMENT", UUID.randomUUID().toString())));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebElement found = driver.findElement(By.id("cheese"));

    assertThat(found).isNotNull();
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FIND_ELEMENT, ImmutableMap.of(
            "using", "id", "value", "cheese")));
  }

  @Test
  public void canHandleFindElementW3CCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString())));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebElement found = driver.findElement(By.id("cheese"));

    assertThat(found).isNotNull();
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FIND_ELEMENT, ImmutableMap.of(
            "using", "id", "value", "cheese")));
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
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
            "using", "id", "value", "cheese")));
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
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
            "using", "id", "value", "cheese")));
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
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_HANDLE, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetWindowHandlesCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableList.of("window 1", "window 2")));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Set<String> handles = driver.getWindowHandles();

    assertThat(handles).hasSize(2).contains("window 1", "window 2");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_WINDOW_HANDLES, ImmutableMap.of()));
  }

  @Test
  public void canHandleCloseCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.close();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.CLOSE, ImmutableMap.of()));
  }

  @Test
  public void canHandleQuitCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    SessionId sid = driver.getSessionId();
    driver.quit();

    assertThat(driver.getSessionId()).isNull();
    verifyCommands(
        executor, sid,
        new CommandPayload(DriverCommand.QUIT, ImmutableMap.of()));
  }

  @Test
  public void canHandleQuitCommandAfterQuit() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    SessionId sid = driver.getSessionId();
    driver.quit();

    assertThat(driver.getSessionId()).isNull();
    verifyCommands(
        executor, sid,
        new CommandPayload(DriverCommand.QUIT, ImmutableMap.of()));

    driver.quit();
    verifyNoMoreInteractions(executor);
  }

  @Test
  public void canHandleSwitchToWindowCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().window("window1");

    assertThat(driver2).isSameAs(driver);
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("handle", "window1")));
  }

  @Test
  public void canHandleSwitchToNewWindowCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableMap.of("handle", "new window")));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().newWindow(WindowType.TAB);

    assertThat(driver2).isSameAs(driver);
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_HANDLE, ImmutableMap.of()),
        new CommandPayload(DriverCommand.SWITCH_TO_NEW_WINDOW, ImmutableMap.of("type", "tab")),
        new CommandPayload(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("handle", "new window")));
  }

  @Test
  public void canHandleSwitchToFrameByIndexCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().frame(1);

    assertThat(driver2).isSameAs(driver);
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", 1)));
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

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
            "using", "css selector", "value", "frame[name='frameName'],iframe[name='frameName']")),
        new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
            "using", "css selector", "value", "frame#frameName,iframe#frameName")));
  }

  @Test
  public void canHandleSwitchToParentFrameCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().parentFrame();

    assertThat(driver2).isSameAs(driver);
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SWITCH_TO_PARENT_FRAME, ImmutableMap.of()));
  }

  @Test
  public void canHandleSwitchToTopCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    WebDriver driver2 = driver.switchTo().defaultContent();

    assertThat(driver2).isSameAs(driver);
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SWITCH_TO_FRAME, Collections.singletonMap("id", null)));
  }

  @Test
  public void canHandleSwitchToAlertCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Alarm!"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Alert alert = driver.switchTo().alert();

    assertThat(alert.getText()).isEqualTo("Alarm!");
    verifyCommands(
        executor, driver.getSessionId(),
        new MultiCommandPayload(2, DriverCommand.GET_ALERT_TEXT, ImmutableMap.of()));
  }

  @Test
  public void canHandleAlertAcceptCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Alarm!"), nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.switchTo().alert().accept();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ALERT_TEXT, ImmutableMap.of()),
        new CommandPayload(DriverCommand.ACCEPT_ALERT, ImmutableMap.of()));
  }

  @Test
  public void canHandleAlertDismissCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Alarm!"), nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.switchTo().alert().dismiss();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ALERT_TEXT, ImmutableMap.of()),
        new CommandPayload(DriverCommand.DISMISS_ALERT, ImmutableMap.of()));
  }

  @Test
  public void canHandleAlertSendKeysCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder("Are you sure?"), nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.switchTo().alert().sendKeys("no");

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ALERT_TEXT, ImmutableMap.of()),
        new CommandPayload(DriverCommand.SET_ALERT_VALUE, ImmutableMap.of("text", "no")));
  }

  @Test
  public void canHandleRefreshCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.navigate().refresh();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.REFRESH, ImmutableMap.of()));
  }

  @Test
  public void canHandleBackCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.navigate().back();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GO_BACK, ImmutableMap.of()));
  }

  @Test
  public void canHandleForwardCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.navigate().forward();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GO_FORWARD, ImmutableMap.of()));
  }

  @Test
  public void canHandleNavigateToCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.navigate().to(new URL("http://www.test.com/"));

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET, ImmutableMap.of("url", "http://www.test.com/")));
  }

  @Test
  public void canHandleGetCookiesCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of("name", "cookie1", "value", "value1", "samesite", "Lax"),
            ImmutableMap.of("name", "cookie2", "value", "value2"))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Set<Cookie> cookies = driver.manage().getCookies();

    assertThat(cookies)
        .hasSize(2)
        .contains(
            new Cookie.Builder("cookie1", "value1").sameSite("Lax").build(),
            new Cookie("cookie2", "value2"));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ALL_COOKIES, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetCookieNamedCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableList.of(
            ImmutableMap.of("name", "cookie1", "value", "value1"),
            ImmutableMap.of("name", "cookie2", "value", "value2"))));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Cookie found = driver.manage().getCookieNamed("cookie2");

    assertThat(found).isEqualTo(new Cookie("cookie2", "value2"));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ALL_COOKIES, ImmutableMap.of()));
  }

  @Test
  public void canHandleAddCookieCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    Cookie cookie = new Cookie("x", "y");
    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().addCookie(cookie);

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.ADD_COOKIE, ImmutableMap.of("cookie", cookie)));
  }

  @Test
  public void canHandleDeleteCookieCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    Cookie cookie = new Cookie("x", "y");
    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().deleteCookie(cookie);

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.DELETE_COOKIE, ImmutableMap.of("name", "x")));
  }

  @Test
  public void canHandleDeleteAllCookiesCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().deleteAllCookies();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.DELETE_ALL_COOKIES, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetWindowSizeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("width", 400, "height", 600)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Dimension size = driver.manage().window().getSize();

    assertThat(size).isEqualTo(new Dimension(400, 600));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_SIZE, ImmutableMap.of()));
  }

  @Test
  public void canHandleSetWindowSizeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().window().setSize(new Dimension(400, 600));

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SET_CURRENT_WINDOW_SIZE,
                           ImmutableMap.of("width", 400, "height", 600)));
  }

  @Test
  public void canHandleGetWindowPositionCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("x", 100, "y", 200)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    Point position = driver.manage().window().getPosition();

    assertThat(position).isEqualTo(new Point(100, 200));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_POSITION,
                           ImmutableMap.of("windowHandle", "current")));
  }

  @Test
  public void canHandleSetWindowPositionCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().window().setPosition(new Point(100, 200));

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SET_CURRENT_WINDOW_POSITION,
                           ImmutableMap.of("x", 100, "y", 200)));
  }

  @Test
  public void canHandleMaximizeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().window().maximize();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.MAXIMIZE_CURRENT_WINDOW, ImmutableMap.of()));
  }

  @Test
  public void canHandleFullscreenCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().window().fullscreen();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.FULLSCREEN_CURRENT_WINDOW, ImmutableMap.of()));
  }

  @Test
  public void canHandleSetImplicitWaitCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("implicit", 10000L)));
  }

  @Test
  public void canHandleSetScriptTimeoutCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().setScriptTimeout(10, TimeUnit.SECONDS);

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("script", 10000L)));
  }

  @Test
  public void canHandleSetPageLoadTimeoutCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    driver.manage().timeouts().pageLoadTimeout(10, TimeUnit.SECONDS);

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("pageLoad", 10000L)));
  }

  @Test
  public void canHandleIME() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableList.of("cheese")));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    List<String> engines = driver.manage().ime().getAvailableEngines();

    assertThat(engines).hasSize(1).contains("cheese");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.IME_GET_AVAILABLE_ENGINES, ImmutableMap.of()));
  }

  @Test
  public void canHandleElementClickCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    element.click();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementClearCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    element.clear();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.CLEAR_ELEMENT, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementSubmitCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    element.submit();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SUBMIT_ELEMENT, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementSendKeysCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, nullResponder);

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());
    element.setFileDetector(mock(FileDetector.class));

    element.sendKeys("test");

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.SEND_KEYS_TO_ELEMENT, ImmutableMap.of(
            "id", element.getId(), "value", new CharSequence[]{"test"})));
  }

  @Test
  public void canHandleElementGetAttributeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder("test"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    String attr = element.getAttribute("id");

    assertThat(attr).isEqualTo("test");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_ATTRIBUTE, ImmutableMap.of(
            "id", element.getId(), "name", "id")));
  }

  @Test
  public void canHandleElementIsSelectedCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder(true));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    assertThat(element.isSelected()).isTrue();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.IS_ELEMENT_SELECTED, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementIsEnabledCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder(true));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    assertThat(element.isEnabled()).isTrue();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.IS_ELEMENT_ENABLED, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementIsDisplayedCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder(true));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    assertThat(element.isDisplayed()).isTrue();

    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.IS_ELEMENT_DISPLAYED, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementGeTextCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder("test"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    String text = element.getText();

    assertThat(text).isEqualTo("test");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_TEXT, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementGeTagNameCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder("div"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    String tag = element.getTagName();

    assertThat(tag).isEqualTo("div");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_TAG_NAME,
                           ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementGeLocationCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableMap.of("x", 10, "y", 20)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    Point location = element.getLocation();

    assertThat(location).isEqualTo(new Point(10, 20));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_LOCATION,
                           ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementGeSizeCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities, valueResponder(ImmutableMap.of("width", 100, "height", 200)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    Dimension size = element.getSize();

    assertThat(size).isEqualTo(new Dimension(100, 200));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_SIZE, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementGeRectCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(
        echoCapabilities,
        valueResponder(ImmutableMap.of("x", 10, "y", 20, "width", 100, "height", 200)));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    Rectangle rect = element.getRect();

    assertThat(rect).isEqualTo(new Rectangle(new Point(10, 20), new Dimension(100, 200)));
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_RECT, ImmutableMap.of("id", element.getId())));
  }

  @Test
  public void canHandleElementCssPropertyCommand() throws IOException {
    CommandExecutor executor = prepareExecutorMock(echoCapabilities, valueResponder("red"));

    RemoteWebDriver driver = new RemoteWebDriver(executor, new ImmutableCapabilities());
    RemoteWebElement element = new RemoteWebElement();
    element.setParent(driver);
    element.setId(UUID.randomUUID().toString());

    String color = element.getCssValue("color");

    assertThat(color).isEqualTo("red");
    verifyCommands(
        executor, driver.getSessionId(),
        new CommandPayload(DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
                           ImmutableMap.of("id", element.getId(), "propertyName", "color")));
  }

  private class MultiCommandPayload extends CommandPayload {
    private int times;

    MultiCommandPayload(int times, String name, Map<String, ?> parameters) {
      super(name, parameters);
      this.times = times;
    }

    public int getTimes() {
      return times;
    }
  }

  private void verifyCommands(CommandExecutor executor, SessionId sid, CommandPayload... commands)
      throws IOException {
    InOrder inOrder = Mockito.inOrder(executor);
    inOrder.verify(executor).execute(argThat(
        command -> command.getName().equals(DriverCommand.NEW_SESSION)));
    for (CommandPayload target : commands) {
      int x = target instanceof MultiCommandPayload ? ((MultiCommandPayload) target).getTimes() : 1;
      inOrder.verify(executor, times(x)).execute(argThat(
          cmd -> cmd.getSessionId().equals(sid)
                 && cmd.getName().equals(target.getName())
                 && areEqual(cmd.getParameters(), target.getParameters())));
    }
    verifyNoMoreInteractions(executor);
  }

  private boolean areEqual(Map<String, ?> left, Map<String, ?> right) {
    if (left.size() != right.size()) {
      return false;
    }
    if (! left.keySet().equals(right.keySet())) {
      return false;
    }
    for (String key : left.keySet()) {
      if (! areEqual(left.get(key), right.get(key))) {
        return false;
      }
    }
    return true;
  }

  private boolean areEqual(Object left, Object right) {
    if (left == null) {
      return right == null;
    }
    if (! left.getClass().isArray()) {
      return left.equals(right);
    }
    if (! right.getClass().isArray()) {
      return false;
    }
    for(int i = 0; i < Array.getLength(left); i++) {
      if (! Array.get(left, i).equals(Array.get(right, i))) {
        return false;
      }
    }
    return true;
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
