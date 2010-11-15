/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.Wait;

import org.openqa.selenium.environment.GlobalTestEnvironment;

public class WebDriverBackedSeleniumLargeTest extends AbstractDriverTestCase {

  private Selenium selenium;

  @Override
  protected void setUp() throws Exception {
    super.setUp();

    String base = GlobalTestEnvironment.get().getAppServer().whereIs("");
    selenium = new WebDriverBackedSelenium(driver, base);
  }

  public void xtestCanUseTheOriginalWaitClassWithAWebDriverBackedInstance() {
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
  public void testCallingStopThenSleepDoesNotCauseAnExceptionToBeThrown() {
    // Stop selenium
    selenium.stop();

    try {
      // Now schedule a command that caues "interrupt" to be thrown internally.
      selenium.isElementPresent("name=q");
      fail("This test should have failed");
    } catch (NullPointerException expected) {
      // This is the exception thrown by selenium 1. We should throw the same
      // one
    }

    try {
      Thread.sleep(10);
    } catch (InterruptedException e) {
      fail("This was not expected");
    }
  }
}
