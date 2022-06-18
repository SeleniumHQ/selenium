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

public class TestVerifications extends InternalSelenseTestBase {
  @Test
  public void testVerifications() {
    selenium.open("test_verifications.html?foo=bar");
    verifyTrue(selenium.getLocation().matches(
        "^.*/test_verifications\\.html[\\s\\S]*$"));
    verifyTrue(selenium.getLocation().matches(
        "^.*/test_verifications\\.html[\\s\\S]foo=bar$"));
    verifyEquals(selenium.getValue("theText"), "the text value");
    verifyNotEquals("not the text value", selenium.getValue("theText"));
    verifyEquals(selenium.getValue("theHidden"), "the hidden value");
    verifyEquals(selenium.getText("theSpan"), "this is the span");
    verifyNotEquals("blah blah", selenium.getText("theSpan"));
    verifyTrue(selenium.isTextPresent("this is the span"));
    verifyFalse(selenium.isTextPresent("this is not the span"));
    verifyTrue(selenium.isElementPresent("theSpan"));
    verifyTrue(selenium.isElementPresent("theText"));
    verifyFalse(selenium.isElementPresent("unknown"));
    verifyEquals(selenium.getTable("theTable.0.0"), "th1");
    verifyEquals(selenium.getTable("theTable.1.0"), "a");
    verifyEquals(selenium.getTable("theTable.2.1"), "d");
    verifyEquals(selenium.getTable("theTable.3.1"), "f2");
    verifyEquals(selenium.getSelectedIndex("theSelect"), "1");
    verifyEquals(selenium.getSelectedValue("theSelect"), "option2");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");
    verifyEquals(selenium.getSelectedLabel("theSelect"), "second option");
    verifyEquals(selenium.getSelectedId("theSelect"), "o2");
    verifyEquals(join(selenium.getSelectOptions("theSelect"), ','),
        "first option,second option,third,,option");
    verifyEquals(selenium.getAttribute("theText@class"), "foo");
    verifyNotEquals("fox", selenium.getAttribute("theText@class"));
    verifyEquals(selenium.getTitle(), "theTitle");
    verifyNotEquals("Blah Blah", selenium.getTitle());
  }
}
