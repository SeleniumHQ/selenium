/*
Copyright 2012 Selenium committers
Copyright 2012 Software Freedom Conservancy

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


package org.openqa.selenium.v1;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

import com.thoughtworks.selenium.DefaultSelenium;
import com.thoughtworks.selenium.Selenium;

public class MockBrowserTest {
  Selenium sel;

  public void setUp() {
    sel = new DefaultSelenium("localhost", 4444, "*mock", "http://x");
    sel.start();
  }

  public void tearDown() {
    sel.stop();
  }

  public void testMock() {
    sel.open("/");
    sel.click("foo");
    assertEquals(sel.getTitle(), "x", "Incorrect title");
    assertTrue(sel.isAlertPresent(), "alert wasn't present");
    assertEquals(sel.getAllButtons(), (new String[] {""}),
        "getAllButtons should return one empty string");
    assertEquals(sel.getAllLinks(), (new String[] {"1"}), "getAllLinks was incorrect");
    assertEquals(sel.getAllFields(), (new String[] {"1", "2", "3"}), "getAllFields was incorrect");

  }

}
