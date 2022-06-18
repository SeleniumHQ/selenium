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

import org.junit.jupiter.api.Test;

public class TestClickJavascriptHref extends InternalSelenseTestBase {
  @Test
  public void testClickJavascriptHref() {
    selenium.open("test_click_javascript_page.html");
    selenium.click("link");
    verifyEquals(selenium.getAlert(), "link clicked: foo");
    selenium.click("linkWithMultipleJavascriptStatements");
    verifyEquals(selenium.getAlert(), "alert1");
    verifyEquals(selenium.getAlert(), "alert2");
    verifyEquals(selenium.getAlert(), "alert3");
    selenium.click("linkWithJavascriptVoidHref");
    verifyEquals(selenium.getAlert(), "onclick");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.click("linkWithOnclickReturnsFalse");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    selenium.click("enclosedImage");
    verifyEquals(selenium.getAlert(), "enclosedImage clicked");
  }
}
