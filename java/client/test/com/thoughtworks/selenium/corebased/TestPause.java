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

public class TestPause extends InternalSelenseTestBase {
  @Test
  public void testPause() throws Exception {
    selenium.open("../tests/html/test_reload_onchange_page.html");
    // Make sure we can pause even when the page doesn't change
    Thread.sleep(100);
    verifyEquals(selenium.getTitle(), "Reload Page");
    verifyTrue(selenium.isElementPresent("theSelect"));
    selenium.select("theSelect", "Second Option");
    // Make sure we can pause to wait for a page reload
    // Must pause longer than the slow-loading page takes (500ms)
    Thread.sleep(5000);
    verifyEquals(selenium.getTitle(), "Slow Loading Page");
    verifyFalse(selenium.isElementPresent("theSelect"));
    verifyTrue(selenium.isElementPresent("theSpan"));
  }
}
