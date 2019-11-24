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

public class TestGetTextContent extends InternalSelenseTestBase {
  @Test
  public void testGetTextContent() {
    selenium.open("test_gettextcontent.html");
    verifyTrue(selenium.isTextPresent("Text1"));

    // TODO(simon): Fix this lameness.
    if (Boolean.getBoolean("selenium.browser.selenium") &&
        System.getProperty("selenium.browser").startsWith("*ie")) {
      verifyFalse(selenium.isTextPresent("Text2"));
      verifyFalse(selenium.isTextPresent("Text3"));
      verifyFalse(selenium.isTextPresent("Text4"));
      verifyFalse(selenium.isTextPresent("Text5"));
      verifyFalse(selenium.isTextPresent("Text6"));
      verifyFalse(selenium.isTextPresent("Text7"));
      verifyFalse(selenium.isTextPresent("Text8"));
    }
  }
}
