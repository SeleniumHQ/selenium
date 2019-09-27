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

public class TestModalDialog extends InternalSelenseTestBase {
  @Test
  public void testModalDialog() {
    selenium.open("../tests/html/test_modal_dialog.html");
    verifyTrue(selenium.getLocation().matches("^[\\s\\S]*/tests/html/test_modal_dialog\\.html$"));
    verifyEquals(selenium.getTitle(), "Modal Dialog Host Window");

    verifyEquals(selenium.getText("changeText"), "before modal dialog");

    // TODO(simon): re-enable this test

    // selenium.click("modal");
    // // selenium.waitForPopup("Modal Dialog Popup", "5000");
    // selenium.selectWindow("Modal Dialog Popup");
    // verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
    // selenium.click("change");
    // selenium.click("close");
    // selenium.selectWindow("Modal Dialog Host Window");
    // verifyEquals(selenium.getText("changeText"), "after modal dialog");
    // verifyEquals(selenium.getTitle(), "Modal Dialog Popup");
  }
}
