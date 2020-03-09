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

import org.junit.Test;

public class TestWait extends InternalSelenseTestBase {
  @Test
  public void testWait() {
    // Link click
    selenium.open("test_reload_onchange_page.html");
    selenium.click("theLink");
    selenium.waitForPageToLoad("30000");
    // Page should reload
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    selenium.open("test_reload_onchange_page.html");
    selenium.select("theSelect", "Second Option");
    selenium.waitForPageToLoad("30000");
    // Page should reload
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    // Textbox with onblur
    selenium.open("test_reload_onchange_page.html");
    selenium.type("theTextbox", "new value");
    selenium.fireEvent("theTextbox", "blur");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    // Submit button
    selenium.open("test_reload_onchange_page.html");
    selenium.click("theSubmit");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    selenium.click("slowPage_reload");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
  }
}
