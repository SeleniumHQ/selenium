/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.openqa.selenium.Ignore.Driver.ANDROID;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.HTMLUNIT;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.IPHONE;
import static org.openqa.selenium.Ignore.Driver.OPERA;
import static org.openqa.selenium.Ignore.Driver.SELENESE;
import static org.openqa.selenium.TestWaiter.waitFor;
import static org.openqa.selenium.WaitingConditions.elementToExist;

@Ignore(value = {IPHONE},
        reason = "iPhone: Frame switching not supported;\n" +
                 "Others: Implementation not updated to new frame-switching behavior")
public class FrameSwitchingTest extends AbstractDriverTestCase {
  private static final int TIMEOUT = 4000;

  @Override
  protected void tearDown() throws Exception {
    try {
      driver.switchTo().defaultContent();
    } catch (Exception e) {
      //May happen if the driver went away.
    } finally {
      super.tearDown();
    }
  }

  // ----------------------------------------------------------------------------------------------
  //
  // Tests that WebDriver doesn't do anything fishy when it navigates to a page with frames.
  //
  // ----------------------------------------------------------------------------------------------

  public void testShouldAlwaysFocusOnTheTopMostFrameAfterANavigationEvent() {
    driver.get(pages.framesetPage);
    driver.findElement(By.tagName("frameset"));  // Test passes if this does not throw.
  }

  public void testShouldNotAutomaticallySwitchFocusToAnIFrameWhenAPageContainingThemIsLoaded() {
    driver.get(pages.iframePage);
    driver.findElement(By.id("iframe_page_heading"));
  }

  // ----------------------------------------------------------------------------------------------
  //
  // Tests that WebDriver can switch to frames as expected.
  //
  // ----------------------------------------------------------------------------------------------

  public void testShouldBeAbleToSwitchToAFrameByItsIndex() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame(1);

    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("2"));
  }

  public void testShouldBeAbleToSwitchToAnIframeByItsIndex() {
    driver.get(pages.iframePage);
    driver.switchTo().frame(0);

    assertThat(driver.findElement(By.name("id-name1")).getAttribute("value"), equalTo("name"));
  }

  public void testShouldBeAbleToSwitchToAFrameByItsName() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("fourth");

    assertThat(driver.findElement(By.tagName("frame")).getAttribute("name"), equalTo("child1"));
  }

  public void testShouldBeAbleToSwitchToAnIframeByItsName() {
    driver.get(pages.iframePage);
    driver.switchTo().frame("iframe1-name");

    assertThat(driver.findElement(By.name("id-name1")).getAttribute("value"), equalTo("name"));
  }

  public void testShouldBeAbleToSwitchToAFrameByItsID() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("fifth");

    assertThat(driver.findElement(By.name("windowOne")).getText(), equalTo("Open new window"));
  }

  public void testShouldBeAbleToSwitchToAnIframeByItsID() {
    driver.get(pages.iframePage);
    driver.switchTo().frame("iframe1");

    assertThat(driver.findElement(By.name("id-name1")).getAttribute("value"), equalTo("name"));
  }

  @Ignore(value = {SELENESE, OPERA}, reason = "switchTo().frame(WebElement) not supported with Selenium"
      + "Opera: Unsupported")
  public void testShouldBeAbleToSwitchToAFrameUsingAPreviouslyLocatedWebElement() {
    driver.get(pages.framesetPage);
    WebElement frame = driver.findElement(By.tagName("frame"));
    driver.switchTo().frame(frame);

    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("1"));
  }

//  @Ignore(value = SELENESE, reason = "switchTo().frame(WebElement) not supported with Selenium")
  @Ignore(value = OPERA, reason = "Opera: Unsupported")
  public void testShouldBeAbleToSwitchToAnIFrameUsingAPreviouslyLocatedWebElement() {
    driver.get(pages.iframePage);
    WebElement frame = driver.findElement(By.tagName("iframe"));
    driver.switchTo().frame(frame);

  WebElement element = driver.findElement(By.name("id-name1"));
  assertThat(element.getAttribute("value"), equalTo("name"));
  }

  @Ignore(value = {SELENESE, OPERA}, reason = "switchTo().frame(WebElement) not supported with Selenium "
      + "Opera: Unsupported")
  public void testShouldEnsureElementIsAFrameBeforeSwitching() {
    driver.get(pages.framesetPage);
    WebElement frame = driver.findElement(By.tagName("frameset"));

    try {
      driver.switchTo().frame(frame);
      fail();
    } catch (NoSuchFrameException expected) {
      // Do nothing.
    }
  }

  public void testFrameSearchesShouldBeRelativeToTheCurrentlySelectedFrame() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame("second");
    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("2"));

    try {
      driver.switchTo().frame("third");
      fail();
    } catch (NoSuchFrameException expected) {
      // Do nothing
    }

    driver.switchTo().defaultContent();
    driver.switchTo().frame("third");

    try {
      driver.switchTo().frame("second");
      fail();
    } catch (NoSuchFrameException expected) {
      // Do nothing
    }

    driver.switchTo().defaultContent();
    driver.switchTo().frame("second");
    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("2"));
  }

  @Ignore({OPERA})
  public void testShouldSelectChildFramesByChainedCalls() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame("fourth").switchTo().frame("child2");
    assertThat(driver.findElement(By.id("pageNumber")).getText(), equalTo("11"));
  }

  public void testShouldThrowFrameNotFoundExceptionLookingUpSubFramesWithSuperFrameNames() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("fourth");

    try {
      driver.switchTo().frame("second");
      fail("Expected NoSuchFrameException");
    } catch (NoSuchFrameException e) {
      //Expected
    }

  }

  public void testShouldThrowAnExceptionWhenAFrameCannotBeFound() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.switchTo().frame("Nothing here");
      fail("Should not have been able to switch");
    } catch (NoSuchFrameException e) {
      // This is expected
    }
  }

  public void testShouldThrowAnExceptionWhenAFrameCannotBeFoundByIndex() {
    driver.get(pages.xhtmlTestPage);

    try {
      driver.switchTo().frame(27);
      fail("Should not have been able to switch");
    } catch (NoSuchFrameException e) {
      // This is expected
    }
  }

  // ----------------------------------------------------------------------------------------------
  //
  // General frame handling behavior tests
  //
  // ----------------------------------------------------------------------------------------------

  public void testShouldContinueToReferToTheSameFrameOnceItHasBeenSelected() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame(2);
    WebElement checkbox = driver.findElement(By.xpath("//input[@name='checky']"));
    checkbox.click();
    checkbox.submit();

    // TODO(simon): this should not be needed, and is only here because IE's submit returns too soon.

    waitFor(WaitingConditions.elementTextToEqual(driver, By.xpath("//p"), "Success!"));
    assertThat(driver.findElement(By.xpath("//p")).getText(), equalTo("Success!"));
  }

  @Ignore(value = {ANDROID, OPERA}, reason = "Android does not detect that the select frame has disappeared")
  public void testShouldFocusOnTheReplacementWhenAFrameFollowsALinkToA_TopTargettedPage() throws Exception {
    driver.get(pages.framesetPage);

    driver.switchTo().frame(0);
    driver.findElement(By.linkText("top")).click();

    // TODO(simon): Avoid going too fast when native events are there.
    Thread.sleep(1000);

    assertThat(driver.getTitle(), equalTo("XHTML Test Page"));
    assertThat(driver.findElement(By.xpath("/html/head/title")).getText(),
               equalTo("XHTML Test Page"));
  }

  public void testShouldAllowAUserToSwitchFromAnIframeBackToTheMainContentOfThePage() {
    driver.get(pages.iframePage);
    driver.switchTo().frame(0);

    try {
      driver.switchTo().defaultContent();
      driver.findElement(By.id("iframe_page_heading"));
    } catch (Exception e) {
      fail("Should have switched back to main content");
    }
  }

  public void testShouldAllowTheUserToSwitchToAnIFrameAndRemainFocusedOnIt() {
    driver.get(pages.iframePage);
    driver.switchTo().frame(0);

    driver.findElement(By.id("submitButton")).click();

    assertThat(getTextOfGreetingElement(), equalTo("Success!"));
  }

  public String getTextOfGreetingElement() {
    return waitFor(elementToExist(driver, "greeting")).getText();
  }

  @Ignore({OPERA})
  public void testShouldBeAbleToClickInAFrame() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("third");

    // This should replace frame "third" ...
    driver.findElement(By.id("submitButton")).click();
    // driver should still be focused on frame "third" ...
    assertThat(getTextOfGreetingElement(), equalTo("Success!"));
    // Make sure it was really frame "third" which was replaced ...
    driver.switchTo().defaultContent().switchTo().frame("third");
    assertThat(getTextOfGreetingElement(), equalTo("Success!"));
  }

  @Ignore({OPERA})
  public void testShouldBeAbleToClickInASubFrame() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("sixth")
          .switchTo().frame("iframe1");

    // This should replaxe frame "iframe1" inside frame "sixth" ...
    driver.findElement(By.id("submitButton")).click();
    // driver should still be focused on frame "iframe1" inside frame "sixth" ...
    assertThat(getTextOfGreetingElement(), equalTo("Success!"));
    // Make sure it was really frame "iframe1" inside frame "sixth" which was replaced ...
    driver.switchTo().defaultContent()
        .switchTo().frame("sixth")
        .switchTo().frame("iframe1");
    assertThat(driver.findElement(By.id("greeting")).getText(), equalTo("Success!"));
  }

  @NoDriverAfterTest
  @Ignore({IPHONE})
  public void testClosingTheFinalBrowserWindowShouldNotCauseAnExceptionToBeThrown() {
    driver.get(pages.simpleTestPage);
    try {
      driver.close();
    } catch (Exception e) {
      StringWriter sw = new StringWriter();
      PrintWriter pw = new PrintWriter(sw);
      e.printStackTrace(pw);
      pw.flush();
      pw.close();
      fail("This is not expected. " + sw);
    }
  }

  public void testShouldBeAbleToFlipToAFrameIdentifiedByItsId() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame("fifth");

    try {
      driver.findElement(By.id("username"));
    } catch (NoSuchElementException e) {
      fail("Driver did not switch by frame id");
    }
  }

  public void testShouldBeAbleToFindElementsInIframesByXPath() {
    driver.get(pages.iframePage);

    driver.switchTo().frame("iframe1");

    WebElement element = driver.findElement(By.xpath("//*[@id = 'changeme']"));

    assertNotNull(element);
  }

  public void testGetCurrentUrl() {
    driver.get(pages.framesetPage);

    driver.switchTo().frame("second");

    String url = appServer.whereIs("page/2");
    assertThat(driver.getCurrentUrl(), equalTo(url + "?title=Fish"));

    url = appServer.whereIs("iframes.html");
    driver.get(pages.iframePage);
    assertThat(driver.getCurrentUrl(), equalTo(url));


    url = appServer.whereIs("formPage.html");
    driver.switchTo().frame("iframe1");
    assertThat(driver.getCurrentUrl(), equalTo(url));
  }

  @Ignore(value = {IE, HTMLUNIT, OPERA}, reason = "Appears to uncover an HtmlUnit bug" +
      "Opera: Original runtime still exists inside Opera")
  @JavascriptEnabled
  public void testShouldBeAbleToCarryOnWorkingIfTheFrameIsDeletedFromUnderUs() {
    driver.get(pages.deletingFrame);

    driver.switchTo().frame("iframe1");

    WebElement killIframe = driver.findElement(By.id("killIframe"));
    killIframe.click();

    assertFrameNotPresent(driver, "iframe1");

    driver.switchTo().defaultContent();
    WebElement addIFrame = driver.findElement(By.id("addBackFrame"));
    addIFrame.click();

    driver.switchTo().frame("iframe1");

    try {
      driver.findElement(By.id("checkbox"));
    } catch (WebDriverException web) {
      fail("Could not find element after switching frame");
    }
  }

  @Ignore(value = {CHROME, SELENESE}, reason = "These drivers still return frame title.")
  public void testShouldReturnWindowTitleInAFrameset() {
    driver.get(pages.framesetPage);
    driver.switchTo().frame("third");
    assertEquals("Unique title", driver.getTitle());
  }

  @JavascriptEnabled
  public void testJavaScriptShouldExecuteInTheContextOfTheCurrentFrame() {
    JavascriptExecutor executor = (JavascriptExecutor) driver;

    driver.get(pages.framesetPage);
    assertTrue((Boolean) executor.executeScript("return window == window.top"));
    driver.switchTo().frame("third");
    assertTrue((Boolean) executor.executeScript("return window != window.top"));
  }

  private void assertFrameNotPresent(WebDriver driver, String locator) {
    long end = System.currentTimeMillis() + TIMEOUT;

    while (System.currentTimeMillis() < end) {
      try {
        driver.switchTo().frame(locator);
      } catch (NoSuchFrameException e) {
        return;
      }
    }

    fail("Frame did not disappear");
  }
}
