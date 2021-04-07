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

public class TestVisibility extends InternalSelenseTestBase {
  @Test
  public void testVisibility() {
    selenium.open("test_visibility.html");
    verifyTrue(selenium.isVisible("visibleParagraph"));
    verifyFalse(selenium.isVisible("hiddenParagraph"));
    verifyFalse(selenium.isVisible("suppressedParagraph"));
    verifyFalse(selenium.isVisible("classSuppressedParagraph"));
    verifyFalse(selenium.isVisible("jsClassSuppressedParagraph"));
    verifyFalse(selenium.isVisible("hiddenSubElement"));
    verifyTrue(selenium.isVisible("visibleSubElement"));
    verifyFalse(selenium.isVisible("suppressedSubElement"));
    verifyFalse(selenium.isVisible("jsHiddenParagraph"));
    try {
      assertFalse(selenium.isVisible("visibleParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("hiddenParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("suppressedParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("classSuppressedParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("jsClassSuppressedParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("hiddenSubElement"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("suppressedSubElement"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    try {
      assertTrue(selenium.isVisible("jsHiddenParagraph"));
      fail("expected failure");
    } catch (Throwable e) {
    }
    verifyFalse(selenium.isVisible("hiddenInput"));
    try {
      assertTrue(selenium.isVisible("nonExistentElement"));
      fail("expected failure");
    } catch (Throwable e) {
    }
  }
}
