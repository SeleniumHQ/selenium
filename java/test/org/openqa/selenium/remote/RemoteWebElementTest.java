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
import static org.mockito.Mockito.mock;
import static org.openqa.selenium.remote.WebDriverFixture.echoCapabilities;
import static org.openqa.selenium.remote.WebDriverFixture.errorResponder;
import static org.openqa.selenium.remote.WebDriverFixture.exceptionResponder;
import static org.openqa.selenium.remote.WebDriverFixture.nullValueResponder;
import static org.openqa.selenium.remote.WebDriverFixture.valueResponder;
import static org.openqa.selenium.remote.WebDriverFixture.webDriverExceptionResponder;

import com.google.common.collect.ImmutableMap;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.openqa.selenium.By;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.Point;
import org.openqa.selenium.Rectangle;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.internal.Debug;

@Tag("UnitTests")
class RemoteWebElementTest {

  @Test
  void throwIfRemoteEndReturnsNullFromFindChild() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, nullValueResponder);

    assertThatExceptionOfType(NoSuchElementException.class)
        .isThrownBy(() -> fixture.element.findElement(By.id("id")));
  }

  @Test
  void canHandleClickCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, nullValueResponder);

    fixture.element.click();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleWebDriverExceptionThrownByCommandExecutor() {
    WebElementFixture fixture =
        new WebElementFixture(
            new ImmutableCapabilities("browserName", "cheese", "platformName", "WINDOWS"),
            echoCapabilities,
            webDriverExceptionResponder);

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(fixture.element::click)
        .withMessageStartingWith("BOOM!!!")
        .withMessageContaining("Build info: ")
        .withMessageContaining("Driver info: org.openqa.selenium.remote.RemoteWebDriver")
        .withMessageContaining(String.format("Session ID: %s", fixture.driver.getSessionId()))
        .withMessageContaining(String.format("%s", fixture.driver.getCapabilities()))
        .withMessageContaining(
            String.format(
                "Command: [%s, clickElement {id=%s}]",
                fixture.driver.getSessionId(), fixture.element.getId()))
        .withMessageContaining(
            String.format(
                "Element: [[RemoteWebDriver: cheese on windows (%s)] -> id: test]",
                fixture.driver.getSessionId()));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGeneralExceptionThrownByCommandExecutor() {
    try (MockedStatic<Debug> debugMock = Mockito.mockStatic(Debug.class)) {
      debugMock.when(Debug::isDebugging).thenReturn(true);
      WebElementFixture fixture =
          new WebElementFixture(
              new ImmutableCapabilities("browserName", "cheese", "platformName", "WINDOWS"),
              echoCapabilities,
              exceptionResponder);

      assertThatExceptionOfType(WebDriverException.class)
          .isThrownBy(fixture.element::click)
          .withMessageStartingWith("Error communicating with the remote browser. It may have died.")
          .withMessageContaining("Build info: ")
          .withMessageContaining("Driver info: org.openqa.selenium.remote.RemoteWebDriver")
          .withMessageContaining(String.format("Session ID: %s", fixture.driver.getSessionId()))
          .withMessageContaining(String.format("%s", fixture.driver.getCapabilities()))
          .withMessageContaining(
              String.format(
                  "Command: [%s, clickElement {id=%s}]",
                  fixture.driver.getSessionId(), fixture.element.getId()))
          .withMessageContaining(
              String.format(
                  "Element: [[RemoteWebDriver: cheese on windows (%s)] -> id: test]",
                  fixture.driver.getSessionId()))
          .havingCause()
          .withMessage("BOOM!!!");

      fixture.verifyCommands(
          new CommandPayload(
              DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
    }
  }

  @Test
  void canHandleWebDriverExceptionReturnedByCommandExecutor() {
    WebElementFixture fixture =
        new WebElementFixture(
            new ImmutableCapabilities("browserName", "cheese"),
            echoCapabilities,
            errorResponder("element click intercepted", new WebDriverException("BOOM!!!")));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(fixture.element::click)
        .withMessageStartingWith("BOOM!!!")
        .withMessageContaining("Build info: ")
        .withMessageContaining("Driver info: org.openqa.selenium.remote.RemoteWebDriver")
        .withMessageContaining(String.format("Session ID: %s", fixture.driver.getSessionId()))
        .withMessageContaining(String.format("%s", fixture.driver.getCapabilities()))
        .withMessageContaining(
            String.format(
                "Command: [%s, clickElement {id=%s}]",
                fixture.driver.getSessionId(), fixture.element.getId()))
        .withMessageContaining(
            String.format(
                "Element: [[RemoteWebDriver: cheese on any (%s)] -> id: test]",
                fixture.driver.getSessionId()));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleResponseWithErrorCodeButNoExceptionReturnedByCommandExecutor() {
    WebElementFixture fixture =
        new WebElementFixture(
            new ImmutableCapabilities("browserName", "cheese"),
            echoCapabilities,
            errorResponder("element click intercepted", "BOOM!!!"));

    assertThatExceptionOfType(WebDriverException.class)
        .isThrownBy(fixture.element::click)
        .withMessageStartingWith("BOOM!!!")
        .withMessageContaining("Build info: ")
        .withMessageContaining("Driver info: org.openqa.selenium.remote.RemoteWebDriver")
        .withMessageContaining(String.format("Session ID: %s", fixture.driver.getSessionId()))
        .withMessageContaining(String.format("%s", fixture.driver.getCapabilities()))
        .withMessageContaining(
            String.format(
                "Command: [%s, clickElement {id=%s}]",
                fixture.driver.getSessionId(), fixture.element.getId()))
        .withMessageContaining(
            String.format(
                "Element: [[RemoteWebDriver: cheese on any (%s)] -> id: test]",
                fixture.driver.getSessionId()));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.CLICK_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleClearCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, nullValueResponder);

    fixture.element.clear();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.CLEAR_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleSubmitCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, nullValueResponder);

    fixture.element.submit();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.SUBMIT_ELEMENT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleSendKeysCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, nullValueResponder);
    fixture.element.setFileDetector(mock(FileDetector.class));

    fixture.element.sendKeys("test");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.SEND_KEYS_TO_ELEMENT,
            ImmutableMap.of("id", fixture.element.getId(), "value", new CharSequence[] {"test"})));
  }

  @Test
  void canHandleGetAttributeCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("test"));

    assertThat(fixture.element.getAttribute("id")).isEqualTo("test");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_ATTRIBUTE,
            ImmutableMap.of("id", fixture.element.getId(), "name", "id")));
  }

  @Test
  void canHandleGetDomAttributeCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("test"));

    assertThat(fixture.element.getDomAttribute("id")).isEqualTo("test");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_DOM_ATTRIBUTE,
            ImmutableMap.of("id", fixture.element.getId(), "name", "id")));
  }

  @Test
  void canHandleGetDomPropertyCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("test"));

    assertThat(fixture.element.getDomProperty("id")).isEqualTo("test");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_DOM_PROPERTY,
            ImmutableMap.of("id", fixture.element.getId(), "name", "id")));
  }

  @Test
  void canHandleIsSelectedCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder(true));

    assertThat(fixture.element.isSelected()).isTrue();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.IS_ELEMENT_SELECTED, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleIsEnabledCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder(true));

    assertThat(fixture.element.isEnabled()).isTrue();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.IS_ELEMENT_ENABLED, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleIsDisplayedCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder(true));

    assertThat(fixture.element.isDisplayed()).isTrue();

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.IS_ELEMENT_DISPLAYED, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGeTextCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("test"));

    assertThat(fixture.element.getText()).isEqualTo("test");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_TEXT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetTagNameCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("div"));

    assertThat(fixture.element.getTagName()).isEqualTo("div");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_TAG_NAME, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetLocationCommand() {
    WebElementFixture fixture =
        new WebElementFixture(echoCapabilities, valueResponder(ImmutableMap.of("x", 10, "y", 20)));

    assertThat(fixture.element.getLocation()).isEqualTo(new Point(10, 20));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_RECT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetSizeCommand() {
    WebElementFixture fixture =
        new WebElementFixture(
            echoCapabilities, valueResponder(ImmutableMap.of("width", 100, "height", 200)));

    assertThat(fixture.element.getSize()).isEqualTo(new Dimension(100, 200));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_RECT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetRectCommand() {
    WebElementFixture fixture =
        new WebElementFixture(
            echoCapabilities,
            valueResponder(ImmutableMap.of("x", 10, "y", 20, "width", 100, "height", 200)));

    assertThat(fixture.element.getRect())
        .isEqualTo(new Rectangle(new Point(10, 20), new Dimension(100, 200)));

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_RECT, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetCssPropertyCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("red"));

    assertThat(fixture.element.getCssValue("color")).isEqualTo("red");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_VALUE_OF_CSS_PROPERTY,
            ImmutableMap.of("id", fixture.element.getId(), "propertyName", "color")));
  }

  @Test
  void canHandleGetAriaRoleCommand() {
    WebElementFixture fixture = new WebElementFixture(echoCapabilities, valueResponder("section"));

    assertThat(fixture.element.getAriaRole()).isEqualTo("section");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_ARIA_ROLE, ImmutableMap.of("id", fixture.element.getId())));
  }

  @Test
  void canHandleGetAccessibleNameCommand() {
    WebElementFixture fixture =
        new WebElementFixture(echoCapabilities, valueResponder("element name"));

    assertThat(fixture.element.getAccessibleName()).isEqualTo("element name");

    fixture.verifyCommands(
        new CommandPayload(
            DriverCommand.GET_ELEMENT_ACCESSIBLE_NAME,
            ImmutableMap.of("id", fixture.element.getId())));
  }
}
