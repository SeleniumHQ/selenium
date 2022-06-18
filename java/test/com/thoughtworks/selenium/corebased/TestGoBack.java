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

public class TestGoBack extends InternalSelenseTestBase {
  @Test
  public void testGoBack() {
    selenium.open("test_click_page1.html");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    // Click a regular link
    selenium.click("link");
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page Target");
    selenium.goBack();
    selenium.waitForPageToLoad("30000");
    verifyEquals(selenium.getTitle(), "Click Page 1");
    // history.forward() generates 'Permission Denied' in IE
    // <tr>
    // <td>goForward</td>
    // <td>&nbsp;</td>
    // <td>&nbsp;</td>
    // </tr>
    // <tr>
    // <td>verifyTitle</td>
    // <td>Click Page Target</td>
    // <td>&nbsp;</td>
    // </tr>
    //
  }
}
