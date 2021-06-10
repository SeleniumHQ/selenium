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
import static java.util.Collections.emptyMap;
import static java.util.Collections.singletonList;
import static java.util.Collections.singletonMap;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;
import static org.openqa.selenium.remote.WebDriverFixture.errorResponder;
import static org.openqa.selenium.remote.WebDriverFixture.webDriverExceptionResponder;
import static org.openqa.selenium.remote.WebDriverFixture.echoCapabilities;
import static org.openqa.selenium.remote.WebDriverFixture.exceptionResponder;
import static org.openqa.selenium.remote.WebDriverFixture.nullValueResponder;
import static org.openqa.selenium.remote.WebDriverFixture.valueResponder;

import com.google.common.collect.ImmutableMap;

import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.NoSuchFrameException;
import org.openqa.selenium.Point;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;
import org.openqa.selenium.testing.UnitTests;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticator;
import org.openqa.selenium.virtualauthenticator.VirtualAuthenticatorOptions;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.logging.Level;

@Category(UnitTests.class)
public class RemoteWebDriverUnitTest {

  private static final String ELEMENT_KEY = "element-6066-11e4-a52e-4f735466cecf";

  @Test
  public void canHandleGetCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.get("http://some.host.com");

    fixture.verifyCommands(
      new CommandPayload(
        DriverCommand.GET, ImmutableMap.of("url", "http://some.host.com")));
  }

  @Test
  public void canHandleGetCurrentUrlCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("http://some.host.com"));

    assertThat(fixture.driver.getCurrentUrl()).isEqualTo("http://some.host.com");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_URL, emptyMap()));
  }

  @Test
  public void canHandleGetTitleCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Hello, world!"));

    assertThat(fixture.driver.getTitle()).isEqualTo("Hello, world!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_TITLE, emptyMap()));
  }

  @Test
  public void canHandleGetPageSourceCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Hello, world!"));

    assertThat(fixture.driver.getPageSource()).isEqualTo("Hello, world!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_PAGE_SOURCE, emptyMap()));
  }

  @Test
  public void canHandleExecuteScriptCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Hello, world!"));

    fixture.driver.setLogLevel(Level.WARNING);
    Object result = fixture.driver.executeScript("return 1", 1, "2");

    assertThat(result).isEqualTo("Hello, world!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.EXECUTE_SCRIPT, ImmutableMap.of(
        "script", "return 1", "args", Arrays.asList(1, "2"))));
  }

  @Test
  public void canHandleExecuteAsyncScriptCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Hello, world!"));

    assertThat(fixture.driver.executeAsyncScript("return 1", 1, "2"))
      .isEqualTo("Hello, world!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.EXECUTE_ASYNC_SCRIPT, ImmutableMap.of(
        "script", "return 1", "args", Arrays.asList(1, "2"))));
  }

  @Test
  public void canHandleFindElementOSSCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(ImmutableMap.of("ELEMENT", UUID.randomUUID().toString())));

    assertThat(fixture.driver.findElement(By.id("cheese"))).isNotNull();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENT, ImmutableMap.of(
        "using", "id", "value", "cheese")));
  }

  @Test
  public void canHandleFindElementW3CCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString())));

    assertThat(fixture.driver.findElement(By.id("cheese"))).isNotNull();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENT, ImmutableMap.of(
        "using", "id", "value", "cheese")));
  }

  @Test
  public void canHandleFindElementCommandWithNonStandardLocator() {
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    By locator = new By() {
      @Override
      public List<WebElement> findElements(SearchContext context) {
        return Arrays.asList(element1, element2);
      }
    };
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities);

    assertThat(fixture.driver.findElement(locator)).isSameAs(element1);

    fixture.verifyNoCommands();
  }

  @Test
  public void canHandleFindElementsOSSCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(Arrays.asList(
        ImmutableMap.of("ELEMENT", UUID.randomUUID().toString()),
        ImmutableMap.of("ELEMENT", UUID.randomUUID().toString()))));

    assertThat(fixture.driver.findElements(By.id("cheese"))).hasSize(2);

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
        "using", "id", "value", "cheese")));
  }

  @Test
  public void canHandleFindElementsW3CCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(Arrays.asList(
        ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()),
        ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()))));

    assertThat(fixture.driver.findElements(By.id("cheese"))).hasSize(2);

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
        "using", "id", "value", "cheese")));
  }

  @Test
  public void canHandleFindElementsCommandWithNonStandardLocator() {
    WebElement element1 = mock(WebElement.class);
    WebElement element2 = mock(WebElement.class);
    By locator = new By() {
      @Override
      public List<WebElement> findElements(SearchContext context) {
        return Arrays.asList(element1, element2);
      }
    };
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities);

    assertThat(fixture.driver.findElements(locator)).containsExactly(element1, element2);

    fixture.verifyNoCommands();
  }

  @Test
  public void returnsEmptyListIfRemoteEndReturnsNullFromFindElements() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    List<WebElement> result = fixture.driver.findElements(By.id("id"));

    assertThat(result).isNotNull().isEmpty();
  }

  @Test
  public void throwsIfRemoteEndReturnsNullFromFindElement() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    assertThatExceptionOfType(NoSuchElementException.class)
      .isThrownBy(() -> fixture.driver.findElement(By.cssSelector("id")));
  }

  @Test
  public void canHandleGetWindowHandleCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Hello, world!"));

    assertThat(fixture.driver.getWindowHandle()).isEqualTo("Hello, world!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_HANDLE, emptyMap()));
  }

  @Test
  public void canHandleGetWindowHandlesCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder(Arrays.asList("window 1", "window 2")));

    assertThat(fixture.driver.getWindowHandles()).hasSize(2).contains("window 1", "window 2");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_WINDOW_HANDLES, emptyMap()));
  }

  @Test
  public void canHandleCloseCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.close();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.CLOSE, emptyMap()));
  }

  @Test
  public void canHandleQuitCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.quit();

    assertThat(fixture.driver.getSessionId()).isNull();
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.QUIT, emptyMap()));
  }

  @Test
  public void canHandleQuitCommandAfterQuit() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.quit();

    assertThat(fixture.driver.getSessionId()).isNull();
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.QUIT, emptyMap()));

    fixture.driver.quit();
    verifyNoMoreInteractions(fixture.executor);
  }

  @Test
  public void canHandleSwitchToWindowCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    WebDriver driver2 = fixture.driver.switchTo().window("window1");

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("handle", "window1")));
  }

  @Test
  public void canHandleSwitchToNewWindowCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder(ImmutableMap.of("handle", "new window")));

    WebDriver driver2 = fixture.driver.switchTo().newWindow(WindowType.TAB);

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_HANDLE, emptyMap()),
      new CommandPayload(DriverCommand.SWITCH_TO_NEW_WINDOW, ImmutableMap.of("type", "tab")),
      new CommandPayload(DriverCommand.SWITCH_TO_WINDOW, ImmutableMap.of("handle", "new window")));
  }

  @Test
  public void canHandleSwitchToFrameByIndexCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    WebDriver driver2 = fixture.driver.switchTo().frame(1);

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of("id", 1)));
  }

  @Test
  public void canHandleSwitchToFrameByNameCommand() {
    String elementId = UUID.randomUUID().toString();
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(Arrays.asList(
        ImmutableMap.of(ELEMENT_KEY, elementId),
        ImmutableMap.of(ELEMENT_KEY, UUID.randomUUID().toString()))));

    WebDriver driver2 = fixture.driver.switchTo().frame("frameName");

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
        "using", "css selector", "value", "frame[name='frameName'],iframe[name='frameName']")),
      new CommandPayload(DriverCommand.SWITCH_TO_FRAME, ImmutableMap.of(
        "id", ImmutableMap.of("ELEMENT", elementId, ELEMENT_KEY, elementId))));
  }

  @Test
  public void canHandleSwitchToNonExistingFrameCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder(EMPTY_LIST));

    assertThatExceptionOfType(NoSuchFrameException.class)
      .isThrownBy(() -> fixture.driver.switchTo().frame("frameName"));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
        "using", "css selector", "value", "frame[name='frameName'],iframe[name='frameName']")),
      new CommandPayload(DriverCommand.FIND_ELEMENTS, ImmutableMap.of(
        "using", "css selector", "value", "frame#frameName,iframe#frameName")));
  }

  @Test
  public void canHandleSwitchToParentFrameCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    WebDriver driver2 = fixture.driver.switchTo().parentFrame();

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SWITCH_TO_PARENT_FRAME, emptyMap()));
  }

  @Test
  public void canHandleSwitchToTopCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    WebDriver driver2 = fixture.driver.switchTo().defaultContent();

    assertThat(driver2).isSameAs(fixture.driver);
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SWITCH_TO_FRAME, Collections.singletonMap("id", null)));
  }

  @Test
  public void canHandleSwitchToAlertCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Alarm!"));

    Alert alert = fixture.driver.switchTo().alert();

    assertThat(alert.getText()).isEqualTo("Alarm!");
    fixture.verifyCommands(
      new MultiCommandPayload(2, DriverCommand.GET_ALERT_TEXT, emptyMap()));
  }

  @Test
  public void canHandleAlertAcceptCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Alarm!"), nullValueResponder);

    fixture.driver.switchTo().alert().accept();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_ALERT_TEXT, emptyMap()),
      new CommandPayload(DriverCommand.ACCEPT_ALERT, emptyMap()));
  }

  @Test
  public void canHandleAlertDismissCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Alarm!"), nullValueResponder);

    fixture.driver.switchTo().alert().dismiss();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_ALERT_TEXT, emptyMap()),
      new CommandPayload(DriverCommand.DISMISS_ALERT, emptyMap()));
  }

  @Test
  public void canHandleAlertSendKeysCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("Are you sure?"), nullValueResponder);

    fixture.driver.switchTo().alert().sendKeys("no");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_ALERT_TEXT, emptyMap()),
      new CommandPayload(DriverCommand.SET_ALERT_VALUE, ImmutableMap.of("text", "no")));
  }

  @Test
  public void canHandleRefreshCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.navigate().refresh();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.REFRESH, emptyMap()));
  }

  @Test
  public void canHandleBackCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.navigate().back();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GO_BACK, emptyMap()));
  }

  @Test
  public void canHandleForwardCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.navigate().forward();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GO_FORWARD, emptyMap()));
  }

  @Test
  public void canHandleNavigateToCommand() throws IOException {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.navigate().to(new URL("http://www.test.com/"));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET, ImmutableMap.of("url", "http://www.test.com/")));
  }

  @Test
  public void canHandleGetCookiesCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(Arrays.asList(
        ImmutableMap.of("name", "cookie1", "value", "value1", "sameSite", "Lax"),
        ImmutableMap.of("name", "cookie2", "value", "value2"))));

    Set<Cookie> cookies = fixture.driver.manage().getCookies();

    assertThat(cookies)
      .hasSize(2)
      .contains(
        new Cookie.Builder("cookie1", "value1").sameSite("Lax").build(),
        new Cookie("cookie2", "value2"));
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_ALL_COOKIES, ImmutableMap.of()));
  }

  @Test
  public void canHandleGetCookieNamedCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(Arrays.asList(
        ImmutableMap.of("name", "cookie1", "value", "value1"),
        ImmutableMap.of("name", "cookie2", "value", "value2"))));

    Cookie found = fixture.driver.manage().getCookieNamed("cookie2");

    assertThat(found).isEqualTo(new Cookie("cookie2", "value2"));
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_ALL_COOKIES, emptyMap()));
  }

  @Test
  public void canHandleAddCookieCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    Cookie cookie = new Cookie("x", "y");
    fixture.driver.manage().addCookie(cookie);

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.ADD_COOKIE, ImmutableMap.of("cookie", cookie)));
  }

  @Test
  public void canHandleDeleteCookieCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    Cookie cookie = new Cookie("x", "y");
    fixture.driver.manage().deleteCookie(cookie);

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.DELETE_COOKIE, ImmutableMap.of("name", "x")));
  }

  @Test
  public void canHandleDeleteAllCookiesCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().deleteAllCookies();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.DELETE_ALL_COOKIES, emptyMap()));
  }

  @Test
  public void canHandleGetWindowSizeCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(ImmutableMap.of("width", 400, "height", 600)));

    Dimension size = fixture.driver.manage().window().getSize();

    assertThat(size).isEqualTo(new Dimension(400, 600));
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_SIZE, emptyMap()));
  }

  @Test
  public void canHandleSetWindowSizeCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().window().setSize(new Dimension(400, 600));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SET_CURRENT_WINDOW_SIZE,
                         ImmutableMap.of("width", 400, "height", 600)));
  }

  @Test
  public void canHandleGetWindowPositionCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(ImmutableMap.of("x", 100, "y", 200)));

    Point position = fixture.driver.manage().window().getPosition();

    assertThat(position).isEqualTo(new Point(100, 200));
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_WINDOW_POSITION,
                         ImmutableMap.of("windowHandle", "current")));
  }

  @Test
  public void canHandleSetWindowPositionCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().window().setPosition(new Point(100, 200));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SET_CURRENT_WINDOW_POSITION,
                         ImmutableMap.of("x", 100, "y", 200)));
  }

  @Test
  public void canHandleMaximizeCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().window().maximize();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.MAXIMIZE_CURRENT_WINDOW, emptyMap()));
  }

  @Test
  public void canHandleFullscreenCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().window().fullscreen();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.FULLSCREEN_CURRENT_WINDOW, emptyMap()));
  }

  @Test
  public void canHandleSetImplicitWaitCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("implicit", 10000L)));
  }

  @Test
  public void canHandleGetTimeoutsCommand() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities,
      valueResponder(ImmutableMap.of("implicit", 100, "script", 200, "pageLoad", 300)));

    fixture.driver.manage().timeouts().getImplicitWaitTimeout();

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_TIMEOUTS, emptyMap()));
  }

  @Test
  public void canHandleSetScriptTimeoutCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().timeouts().setScriptTimeout(Duration.ofSeconds(10));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("script", 10000L)));
  }

  @Test
  public void canHandleSetPageLoadTimeoutCommand() {
    WebDriverFixture fixture = new WebDriverFixture(echoCapabilities, nullValueResponder);

    fixture.driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(10));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.SET_TIMEOUT, ImmutableMap.of("pageLoad", 10000L)));
  }

  @Test
  public void canHandleIME() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder(singletonList("cheese")));

    List<String> engines = fixture.driver.manage().ime().getAvailableEngines();

    assertThat(engines).hasSize(1).contains("cheese");
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.IME_GET_AVAILABLE_ENGINES, emptyMap()));
  }

  @Test
  public void canAddVirtualAuthenticator() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, valueResponder("authId"));

    VirtualAuthenticatorOptions options = new VirtualAuthenticatorOptions();
    VirtualAuthenticator auth = fixture.driver.addVirtualAuthenticator(options);

    assertThat(auth.getId()).isEqualTo("authId");
    fixture.verifyCommands(
      new CommandPayload(DriverCommand.ADD_VIRTUAL_AUTHENTICATOR, options.toMap()));
  }

  @Test
  public void canRemoveVirtualAuthenticator() {
    WebDriverFixture fixture = new WebDriverFixture(
      echoCapabilities, nullValueResponder);
    VirtualAuthenticator auth = mock(VirtualAuthenticator.class);
    when(auth.getId()).thenReturn("authId");

    fixture.driver.removeVirtualAuthenticator(auth);

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.REMOVE_VIRTUAL_AUTHENTICATOR,
                         singletonMap("authenticatorId", "authId")));
  }

  @Test
  public void canHandleWebDriverExceptionThrownByCommandExecutor() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities(
        "browserName", "cheese", "platformName", "WINDOWS"),
      echoCapabilities, webDriverExceptionResponder);

    assertThatExceptionOfType(WebDriverException.class)
      .isThrownBy(fixture.driver::getCurrentUrl)
      .withMessageStartingWith("BOOM!!!")
      .withMessageContaining("Build info: ")
      .withMessageContaining(
        "Driver info: org.openqa.selenium.remote.RemoteWebDriver")
      .withMessageContaining(String.format(
        "Session ID: %s", fixture.driver.getSessionId()))
      .withMessageContaining(String.format(
        "%s", fixture.driver.getCapabilities()))
      .withMessageContaining(String.format(
        "Command: [%s, getCurrentUrl {}]", fixture.driver.getSessionId()));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_URL, emptyMap()));
  }

  @Test
  public void canHandleGeneralExceptionThrownByCommandExecutor() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities(
        "browserName", "cheese", "platformName", "WINDOWS"),
      echoCapabilities, exceptionResponder);


    assertThatExceptionOfType(WebDriverException.class)
      .isThrownBy(fixture.driver::getCurrentUrl)
      .withMessageStartingWith("Error communicating with the remote browser. It may have died.")
      .withMessageContaining("Build info: ")
      .withMessageContaining(
        "Driver info: org.openqa.selenium.remote.RemoteWebDriver")
      .withMessageContaining(String.format(
        "Session ID: %s", fixture.driver.getSessionId()))
      .withMessageContaining(String.format(
        "%s", fixture.driver.getCapabilities()))
      .withMessageContaining(String.format(
        "Command: [%s, getCurrentUrl {}]", fixture.driver.getSessionId()))
      .havingCause()
      .withMessage("BOOM!!!");

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_URL, emptyMap()));
  }

  @Test
  public void canHandleWebDriverExceptionReturnedByCommandExecutor() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities("browserName", "cheese"),
      echoCapabilities, errorResponder("element click intercepted", new WebDriverException("BOOM!!!")));

    assertThatExceptionOfType(WebDriverException.class)
      .isThrownBy(fixture.driver::getCurrentUrl)
      .withMessageStartingWith("BOOM!!!")
      .withMessageContaining("Build info: ")
      .withMessageContaining(
        "Driver info: org.openqa.selenium.remote.RemoteWebDriver")
      .withMessageContaining(String.format(
        "Session ID: %s", fixture.driver.getSessionId()))
      .withMessageContaining(String.format(
        "%s", fixture.driver.getCapabilities()))
      .withMessageContaining(String.format(
        "Command: [%s, getCurrentUrl {}]", fixture.driver.getSessionId()));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_URL, emptyMap()));
  }

  @Test
  public void canHandleResponseWithErrorCodeButNoExceptionReturnedByCommandExecutor() {
    WebDriverFixture fixture = new WebDriverFixture(
      new ImmutableCapabilities("browserName", "cheese"),
      echoCapabilities, errorResponder("element click intercepted", "BOOM!!!"));

    assertThatExceptionOfType(WebDriverException.class)
      .isThrownBy(fixture.driver::getCurrentUrl)
      .withMessageStartingWith("BOOM!!!")
      .withMessageContaining("Build info: ")
      .withMessageContaining(
        "Driver info: org.openqa.selenium.remote.RemoteWebDriver")
      .withMessageContaining(String.format(
        "Session ID: %s", fixture.driver.getSessionId()))
      .withMessageContaining(String.format(
        "%s", fixture.driver.getCapabilities()))
      .withMessageContaining(String.format(
        "Command: [%s, getCurrentUrl {}]", fixture.driver.getSessionId()));

    fixture.verifyCommands(
      new CommandPayload(DriverCommand.GET_CURRENT_URL, emptyMap()));
  }

  @Test
  public void noArgConstuctorEmptyCapabilitiesTest() {
    RemoteWebDriver driver = new RemoteWebDriver() {}; // anonymous subclass
    assertThat(driver.getCapabilities()).isEqualTo(new ImmutableCapabilities());
  }
}
