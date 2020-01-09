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

public class TestFailingVerifications extends InternalSelenseTestBase {
  @Test
  public void testFailingVerifications() {
    selenium.open("/test_verifications.html");
    try {
      assertTrue(selenium.getLocation().matches(
          "^[\\s\\S]*/common/legacy/not_test_verifications\\.html$"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getValue("theText"), "not the text value");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertNotEquals("the text value", selenium.getValue("theText"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getValue("theHidden"), "not the hidden value");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getText("theSpan"), "this is not the span");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isTextPresent("this is not the span"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertFalse(selenium.isTextPresent("this is the span"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isElementPresent("notTheSpan"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertFalse(selenium.isElementPresent("theSpan"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getTable("theTable.2.0"), "a");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getSelectedIndex("theSelect"), "2");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.getSelectedValue("theSelect").matches("^opt[\\s\\S]*3$"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getSelectedLabel("theSelect"), "third option");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(join(selenium.getSelectOptions("theSelect"), ','),
          "first\\,option,second option");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertEquals(selenium.getAttribute("theText@class"), "bar");
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertNotEquals("foo", selenium.getAttribute("theText@class"));
      fail("expected failure");
    } catch (Throwable e) {
    }
  }
}
