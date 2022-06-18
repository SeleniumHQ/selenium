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

package com.thoughtworks.selenium;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;

@Disabled("Mock browser is not supported")
public class MockBrowserTest {
  Selenium sel;

  @BeforeEach
  public void setUp() {
    sel = new DefaultSelenium("localhost", 4444, "*mock", "http://x");
    sel.start();
  }

  @AfterEach
  public void tearDown() {
    sel.stop();
  }

  @Test
  public void testMock() {
    sel.open("/");
    sel.click("foo");
    assertEquals(sel.getTitle(), "x", "Incorrect title");
    assertTrue(sel.isAlertPresent(), "alert wasn't present");
    assertArrayEquals(sel.getAllButtons(), (new String[] {""}), "getAllButtons should return one empty string");
    assertArrayEquals(sel.getAllLinks(), (new String[] {"1"}), "getAllLinks was incorrect");
    assertArrayEquals(sel.getAllFields(), (new String[] {"1", "2", "3"}), "getAllFields was incorrect");

  }

}
