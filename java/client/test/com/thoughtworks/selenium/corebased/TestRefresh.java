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

package com.thoughtworks.selenium.corebased;

import com.thoughtworks.selenium.InternalSelenseTestBase;

import org.junit.Ignore;
import org.junit.Test;

public class TestRefresh extends InternalSelenseTestBase {
  @Ignore("The click on slowRefresh doesn't make the rc implementation wait")
  @Test
  public void testRefresh() {
    selenium.open("test_page.slow.html");
    System.out.println(selenium.getLocation());
    verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/common/rc/tests/html/test_page\\.slow\\.html$"));
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    selenium.click("changeSpan");
    assertTrue(selenium.isTextPresent("Changed the text"));
    selenium.refresh();
    selenium.waitForPageToLoad("30000");
    assertFalse(selenium.isTextPresent("Changed the text"));
    selenium.click("changeSpan");
    assertTrue(selenium.isTextPresent("Changed the text"));
    selenium.click("slowRefresh");
    selenium.waitForPageToLoad("30000");
    assertFalse(selenium.isTextPresent("Changed the text"));
    selenium.click("changeSpan");
    assertTrue(selenium.isTextPresent("Changed the text"));
    selenium.click("id=slowRefreshJavascriptHref");
    selenium.waitForPageToLoad("30000");
    assertFalse(selenium.isTextPresent("Changed the text"));
    selenium.click("anchor");
    selenium.click("changeSpan");
    assertTrue(selenium.isTextPresent("Changed the text"));
    selenium.refresh();
    selenium.waitForPageToLoad("30000");
    assertFalse(selenium.isTextPresent("Changed the text"));
  }
}
