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

import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

@Ignore("Mock browser is not supported")
public class MockBrowserTest {
  Selenium sel;

  @Before
  public void setUp() {
    sel = new DefaultSelenium("localhost", 4444, "*mock", "http://x");
    sel.start();
  }

  @After
  public void tearDown() {
    sel.stop();
  }

  @Test
  public void testMock() {
    sel.open("/");
    sel.click("foo");
    assertEquals("Incorrect title", sel.getTitle(), "x");
    assertTrue("alert wasn't present", sel.isAlertPresent());
    assertArrayEquals("getAllButtons should return one empty string", sel.getAllButtons(), (new String[] {""}));
    assertArrayEquals("getAllLinks was incorrect", sel.getAllLinks(), (new String[] {"1"}));
    assertArrayEquals("getAllFields was incorrect", sel.getAllFields(), (new String[] {"1", "2", "3"}));

  }

}
