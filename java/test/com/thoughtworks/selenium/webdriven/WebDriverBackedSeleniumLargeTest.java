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

package com.thoughtworks.selenium.webdriven;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.Wait;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.GlobalTestEnvironment;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NoDriverAfterTest;

public class WebDriverBackedSeleniumLargeTest extends JupiterTestBase {

  private Selenium selenium;

  @BeforeEach
  public void setUpEnvironment() {
    String base = GlobalTestEnvironment.get().getAppServer().whereIs("");
    selenium = new WebDriverBackedSelenium(driver, base);
  }

  @Test
  public void canUseTheOriginalWaitClassWithAWebDriverBackedInstance() {
    selenium.open(pages.dynamicPage);

    Wait waiter = new Wait() {

      @Override
      public boolean until() {
        return selenium.isElementPresent("id=box0");
      }
    };

    try {
      waiter.wait("Can't find the box", 2000, 200);
      fail("Should not have found the box");
    } catch (Wait.WaitTimedOutException e) {
      // this is expected
    }

    selenium.click("adder");

    waiter.wait("Can't find the box", 2000, 200);
  }

  @NoDriverAfterTest
  @Test
  public void testCallingStopThenSleepDoesNotCauseAnExceptionToBeThrown() {
    // Stop selenium
    selenium.stop();

    try {
      // Now schedule a command that causes "interrupt" to be thrown internally.
      selenium.isElementPresent("name=q");
      fail("This test should have failed");
    } catch (NullPointerException | IllegalStateException expected) {
      // This is the exception thrown by selenium 1. We should throw the same
      // one
      // IllegalStateException is what the timer throws when it has been stopped
    }

    try {
      Thread.sleep(10);
    } catch (InterruptedException e) {
      fail("This was not expected");
    }
  }

  @Test
  public void testShouldBeAbleToInvokeSeleniumCoreElementLocatorsWithGetEval() {
    selenium.open(pages.simpleTestPage);
    String tagName = selenium.getEval(
        "var el = selenium.browserbot.findElement('id=oneline');" +
        "el.tagName.toUpperCase();");
    assertEquals("P", tagName);
  }
}
