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

public class TestImplicitLocators extends InternalSelenseTestBase {
  @Test
  public void testImplicitLocators() {
    selenium.open("test_locators.html");
    verifyEquals(selenium.getText("id1"), "this is the first element");
    verifyEquals(selenium.getAttribute("id1@class"), "a1");
    verifyEquals(selenium.getText("name1"), "this is the second element");
    verifyEquals(selenium.getAttribute("name1@class"), "a2");
    verifyEquals(selenium.getText("document.links[1]"), "this is the second element");
    verifyEquals(selenium.getAttribute("document.links[1]@class"), "a2");
    verifyEquals(selenium.getAttribute("//img[contains(@src, 'banner.gif')]/@alt"), "banner");
    verifyEquals(selenium.getText("//body/a[2]"), "this is the second element");
  }
}
