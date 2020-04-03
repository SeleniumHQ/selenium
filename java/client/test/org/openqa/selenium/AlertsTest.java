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

package org.openqa.selenium;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.junit.Assume.assumeFalse;
import static org.openqa.selenium.WaitingConditions.newWindowIsOpened;
import static org.openqa.selenium.support.ui.ExpectedConditions.alertIsPresent;
import static org.openqa.selenium.support.ui.ExpectedConditions.presenceOfElementLocated;
import static org.openqa.selenium.support.ui.ExpectedConditions.titleIs;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.CHROMIUMEDGE;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;
import static org.openqa.selenium.testing.TestUtilities.getFirefoxVersion;
import static org.openqa.selenium.testing.TestUtilities.isFirefox;

import org.junit.After;
import org.junit.Test;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;
import org.openqa.selenium.testing.NotYetImplemented;
import org.openqa.selenium.testing.SwitchToTopAfterTest;

import java.util.Set;

public class AlertsTest extends JUnit4TestBase {

  @After
  public void closeAlertIfPresent() {
    try {
      driver.switchTo().alert().dismiss();
    } catch (WebDriverException ignore) {
    }
  }

  private String alertPage(String alertText) {
    return appServer.create(new Page()
        .withTitle("Testing Alerts")
        .withBody("<a href='#' id='alert' onclick='alert(\""+alertText+"\");'>click me</a>"));
  }

  private String promptPage(String defaultText) {
    return appServer.create(new Page()
        .withTitle("Testing Prompt")
        .withScripts(
            "function setInnerText(id, value) {",
            "  document.getElementById(id).innerHTML = '<p>' + value + '</p>';",
            "}",
            defaultText == null
              ? "function displayPrompt() { setInnerText('text', prompt('Enter something')); }"
              : "function displayPrompt() { setInnerText('text', prompt('Enter something', '"+defaultText+"')); }")

        .withBody(
            "<a href='#' id='prompt' onclick='displayPrompt();'>click me</a>",
            "<div id='text'>acceptor</div>"));
  }

  @Test
  public void testShouldBeAbleToOverrideTheWindowAlertMethod() {
    driver.get(alertPage("cheese"));

    ((JavascriptExecutor) driver).executeScript(
        "window.alert = function(msg) { document.getElementById('text').innerHTML = msg; }");
    driver.findElement(By.id("alert")).click();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  public void testShouldAllowUsersToAcceptAnAlertManually() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  public void testShouldThrowIllegalArgumentExceptionWhenKeysNull() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    Alert alert = wait.until(alertIsPresent());

    assertThatExceptionOfType(IllegalArgumentException.class)
        .isThrownBy(() -> alert.sendKeys(null));
  }

  @Test
  public void testShouldAllowUsersToAcceptAnAlertWithNoTextManually() {
    driver.get(alertPage(""));

    driver.findElement(By.id("alert")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  public void testShouldGetTextOfAlertOpenedInSetTimeout() {
    driver.get(appServer.create(new Page()
        .withTitle("Testing Alerts")
        .withScripts(
            "function slowAlert() { window.setTimeout(function(){ alert('Slow'); }, 200); }")
        .withBody(
            "<a href='#' id='slow-alert' onclick='slowAlert();'>click me</a>")));

    driver.findElement(By.id("slow-alert")).click();
    Alert alert = wait.until(alertIsPresent());

    assertThat(alert.getText()).isEqualTo("Slow");
  }

  @Test
  public void testShouldAllowUsersToDismissAnAlertManually() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    Alert alert =  wait.until(alertIsPresent());
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  public void testShouldAllowAUserToAcceptAPrompt() {
    driver.get(promptPage(null));

    driver.findElement(By.id("prompt")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Prompt");
  }

  @Test
  public void testShouldAllowAUserToDismissAPrompt() {
    driver.get(promptPage(null));

    driver.findElement(By.id("prompt")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Prompt");
  }

  @Test
  public void testShouldAllowAUserToSetTheValueOfAPrompt() {
    driver.get(promptPage(null));

    driver.findElement(By.id("prompt")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.sendKeys("cheese");
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "cheese"));
  }

  @Test
  public void testSettingTheValueOfAnAlertThrows() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();

    Alert alert = wait.until(alertIsPresent());
    assertThatExceptionOfType(ElementNotInteractableException.class)
        .isThrownBy(() -> alert.sendKeys("cheese"));
  }

  @Test
  public void testShouldAllowTheUserToGetTheTextOfAnAlert() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("cheese");
  }

  @Test
  public void testShouldAllowTheUserToGetTheTextOfAPrompt() {
    driver.get(promptPage(null));

    driver.findElement(By.id("prompt")).click();
    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("Enter something");
  }

  @Test
  public void testAlertShouldNotAllowAdditionalCommandsIfDismissed() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    assertThatExceptionOfType(NoAlertPresentException.class)
        .isThrownBy(alert::getText);
  }

  @SwitchToTopAfterTest
  @Test
  public void testShouldAllowUsersToAcceptAnAlertInAFrame() {
    String iframe = appServer.create(new Page()
        .withBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
    driver.get(appServer.create(new Page()
        .withTitle("Testing Alerts")
        .withBody(String.format("<iframe src='%s' name='iframeWithAlert'></iframe>", iframe))));

    driver.switchTo().frame("iframeWithAlert");
    driver.findElement(By.id("alertInFrame")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @SwitchToTopAfterTest
  @Test
  public void testShouldAllowUsersToAcceptAnAlertInANestedFrame() {
    String iframe = appServer.create(new Page()
        .withBody("<a href='#' id='alertInFrame' onclick='alert(\"framed cheese\");'>click me</a>"));
    String iframe2 = appServer.create(new Page()
        .withBody(String.format("<iframe src='%s' name='iframeWithAlert'></iframe>", iframe)));
    driver.get(appServer.create(new Page()
        .withTitle("Testing Alerts")
        .withBody(String.format("<iframe src='%s' name='iframeWithIframe'></iframe>", iframe2))));

    driver.switchTo().frame("iframeWithIframe").switchTo().frame("iframeWithAlert");

    driver.findElement(By.id("alertInFrame")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    // If we can perform any action, we're good to go
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  @Test
  public void testSwitchingToMissingAlertThrows() {
    driver.get(alertPage("cheese"));

    assertThatExceptionOfType(NoAlertPresentException.class)
        .isThrownBy(() -> driver.switchTo().alert());
  }

  @Test
  public void testSwitchingToMissingAlertInAClosedWindowThrows() {
    String blank = appServer.create(new Page());
    driver.get(appServer.create(new Page()
        .withBody(String.format(
            "<a id='open-new-window' href='%s' target='newwindow'>open new window</a>", blank))));

    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      wait.until(ableToSwitchToWindow("newwindow"));
      driver.close();

      assertThatExceptionOfType(NoSuchWindowException.class)
          .isThrownBy(() -> driver.switchTo().alert());

    } finally {
      driver.switchTo().window(mainWindow);
    }
  }

  @Test
  public void testPromptShouldUseDefaultValueIfNoKeysSent() {
    driver.get(promptPage("This is a default value"));

    wait.until(presenceOfElementLocated(By.id("prompt"))).click();
    Alert alert = wait.until(alertIsPresent());
    alert.accept();

    wait.until(textInElementLocated(By.id("text"), "This is a default value"));
  }

  @Test
  public void testPromptShouldHaveNullValueIfDismissed() {
    driver.get(promptPage("This is a default value"));

    driver.findElement(By.id("prompt")).click();
    Alert alert = wait.until(alertIsPresent());
    alert.dismiss();

    wait.until(textInElementLocated(By.id("text"), "null"));
  }

  @Test
  public void testHandlesTwoAlertsFromOneInteraction() {
    driver.get(appServer.create(new Page()
        .withScripts(
            "function setInnerText(id, value) {",
            "  document.getElementById(id).innerHTML = '<p>' + value + '</p>';",
            "}",
            "function displayTwoPrompts() {",
            "  setInnerText('text1', prompt('First'));",
            "  setInnerText('text2', prompt('Second'));",
            "}")
        .withBody(
            "<a href='#' id='double-prompt' onclick='displayTwoPrompts();'>click me</a>",
            "<div id='text1'></div>",
            "<div id='text2'></div>")));

    wait.until(presenceOfElementLocated(By.id("double-prompt"))).click();
    Alert alert1 = wait.until(alertIsPresent());
    alert1.sendKeys("brie");
    alert1.accept();

    Alert alert2 = wait.until(alertIsPresent());
    alert2.sendKeys("cheddar");
    alert2.accept();

    wait.until(textInElementLocated(By.id("text1"), "brie"));
    wait.until(textInElementLocated(By.id("text2"), "cheddar"));
  }

  @Test
  public void testShouldHandleAlertOnPageLoad() {
    String pageWithOnLoad = appServer.create(new Page()
        .withOnLoad("javascript:alert(\"onload\")")
        .withBody("<p>Page with onload event handler</p>"));
    driver.get(appServer.create(new Page()
        .withBody(String.format("<a id='link' href='%s'>open new page</a>", pageWithOnLoad))));

    driver.findElement(By.id("link")).click();
    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("onload");
    wait.until(textInElementLocated(By.tagName("p"), "Page with onload event handler"));
  }

  @Test
  public void testShouldHandleAlertOnPageLoadUsingGet() {
    driver.get(appServer.create(new Page()
        .withOnLoad("javascript:alert(\"onload\")")
        .withBody("<p>Page with onload event handler</p>")));

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("onload");
    wait.until(textInElementLocated(By.tagName("p"), "Page with onload event handler"));
  }

  @Test
  @Ignore(value = CHROME, reason = "Hangs")
  @Ignore(value = CHROMIUMEDGE, reason = "Hangs")
  @Ignore(FIREFOX)
  @Ignore(value = IE, reason = "Fails in versions 6 and 7")
  @Ignore(SAFARI)
  @Ignore(EDGE)
  @NoDriverAfterTest
  public void testShouldNotHandleAlertInAnotherWindow() {
    String pageWithOnLoad = appServer.create(new Page()
        .withOnLoad("javascript:alert(\"onload\")")
        .withBody("<p>Page with onload event handler</p>"));
    driver.get(appServer.create(new Page()
        .withBody(String.format(
            "<a id='open-new-window' href='%s' target='newwindow'>open new window</a>", pageWithOnLoad))));

    String mainWindow = driver.getWindowHandle();
    Set<String> currentWindowHandles = driver.getWindowHandles();
    driver.findElement(By.id("open-new-window")).click();
    wait.until(newWindowIsOpened(currentWindowHandles));

    assertThatExceptionOfType(TimeoutException.class)
        .isThrownBy(() -> wait.until(alertIsPresent()));
  }

  @Test
  @Ignore(value = CHROME, reason = "Chrome does not trigger alerts on unload")
  @Ignore(value = CHROMIUMEDGE, reason = "Edge does not trigger alerts on unload")
  @NotYetImplemented(HTMLUNIT)
  @Ignore(SAFARI)
  @NotYetImplemented(EDGE)
  public void testShouldHandleAlertOnPageUnload() {
    assumeFalse("Firefox 27+ does not trigger alerts on before unload",
                isFirefox(driver) && getFirefoxVersion(driver) >= 27);

    String pageWithOnBeforeUnload = appServer.create(new Page()
        .withOnBeforeUnload("return \"onbeforeunload\"")
        .withBody("<p>Page with onbeforeunload event handler</p>"));
    driver.get(appServer.create(new Page()
        .withBody(String.format("<a id='link' href='%s'>open new page</a>", pageWithOnBeforeUnload))));

    driver.findElement(By.id("link")).click();
    driver.navigate().back();

    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("onbeforeunload");
    wait.until(textInElementLocated(By.id("link"), "open new page"));
  }

  @Test
  @Ignore(value = FIREFOX, reason = "Non W3C conformant")
  @Ignore(value = HTMLUNIT, reason = "Non W3C conformant")
  @Ignore(value = CHROME, reason = "Non W3C conformant")
  @Ignore(value = CHROMIUMEDGE, reason = "Non W3C conformant")
  @Ignore(EDGE)
  public void testShouldImplicitlyHandleAlertOnPageBeforeUnload() {
    String blank = appServer.create(new Page().withTitle("Success"));
    driver.get(appServer.create(new Page()
        .withTitle("Page with onbeforeunload handler")
        .withBody(String.format(
            "<a id='link' href='%s'>Click here to navigate to another page.</a>", blank))));

    setSimpleOnBeforeUnload("onbeforeunload message");

    driver.findElement(By.id("link")).click();
    wait.until(titleIs("Success"));
  }

  @Test
  @Ignore(value = CHROME, reason = "Chrome does not trigger alerts on unload")
  @Ignore(value = CHROMIUMEDGE, reason = "Chrome does not trigger alerts on unload")
  @NotYetImplemented(HTMLUNIT)
  @Ignore(SAFARI)
  @Ignore(value = IE, reason = "IE driver automatically dismisses alerts on window close")
  @NotYetImplemented(EDGE)
  public void testShouldHandleAlertOnWindowClose() {
    assumeFalse("Firefox 27+ does not trigger alerts on unload",
        isFirefox(driver) && getFirefoxVersion(driver) >= 27);

    String pageWithOnBeforeUnload = appServer.create(new Page()
        .withOnBeforeUnload("return \"onbeforeunload\"")
        .withBody("<p>Page with onbeforeunload event handler</p>"));
    driver.get(appServer.create(new Page()
        .withBody(String.format(
            "<a id='open-new-window' href='%s' target='newwindow'>open new window</a>", pageWithOnBeforeUnload))));

    String mainWindow = driver.getWindowHandle();
    try {
      driver.findElement(By.id("open-new-window")).click();
      wait.until(ableToSwitchToWindow("newwindow"));
      driver.close();

      Alert alert = wait.until(alertIsPresent());
      String value = alert.getText();
      alert.accept();

      assertThat(value).isEqualTo("onbeforeunload");

    } finally {
      driver.switchTo().window(mainWindow);
      wait.until(textInElementLocated(By.id("open-new-window"), "open new window"));
    }
  }

  @Test
  @Ignore(value = HTMLUNIT, reason = "https://github.com/SeleniumHQ/htmlunit-driver/issues/57")
  @NotYetImplemented(value = MARIONETTE,
      reason = "https://bugzilla.mozilla.org/show_bug.cgi?id=1279211")
  @NotYetImplemented(EDGE)
  public void testIncludesAlertTextInUnhandledAlertException() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    assertThatExceptionOfType(UnhandledAlertException.class)
        .isThrownBy(driver::getTitle)
        .withMessageContaining("cheese")
        .satisfies(ex -> assertThat(ex.getAlertText()).isEqualTo("cheese"));
  }

  @NoDriverAfterTest
  @Test
  public void testCanQuitWhenAnAlertIsPresent() {
    driver.get(alertPage("cheese"));

    driver.findElement(By.id("alert")).click();
    wait.until(alertIsPresent());

    driver.quit();
  }

  @Test
  public void shouldHandleAlertOnFormSubmit() {
    driver.get(appServer.create(new Page().withTitle("Testing Alerts").withBody(
        "<form id='theForm' action='javascript:alert(\"Tasty cheese\");'>",
        "<input id='unused' type='submit' value='Submit'>",
        "</form>")));

    driver.findElement(By.id("theForm")).submit();
    Alert alert = wait.until(alertIsPresent());
    String value = alert.getText();
    alert.accept();

    assertThat(value).isEqualTo("Tasty cheese");
    assertThat(driver.getTitle()).isEqualTo("Testing Alerts");
  }

  private static ExpectedCondition<Boolean> textInElementLocated(
      final By locator, final String text) {
    return driver -> text.equals(driver.findElement(locator).getText());
  }

  private static ExpectedCondition<WebDriver> ableToSwitchToWindow(final String name) {
    return driver -> driver.switchTo().window(name);
  }

  private void setSimpleOnBeforeUnload(Object returnText) {
    ((JavascriptExecutor) driver).executeScript(
        "var returnText = arguments[0]; window.onbeforeunload = function() { return returnText; }",
        returnText);
  }

}
