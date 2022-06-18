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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

public class BrowserConfigurationOptionsTest {

  @Test
  public void testCanUseWithValidArg() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions();
    assertTrue(bco.canUse("foobar"));
  }

  @Test
  public void testCanUseWithNullArg() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions();
    assertFalse(bco.canUse(null));
  }

  @Test
  public void testCanUseWithEmptyArg() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions();
    assertFalse(bco.canUse(""));
  }

  @Test
  public void testSetProfileWithNullDoesNotSet() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setProfile(null);
    assertFalse(bco.isSet(BrowserConfigurationOptions.PROFILE_NAME));
  }

  @Test
  public void testSetProfileWithNonNullDoesSet() {
    String profile = "foo";
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setProfile(profile);
    assertTrue(bco.isSet(BrowserConfigurationOptions.PROFILE_NAME));
    assertEquals(profile, bco.getProfile());
  }

  @Test
  public void testSetSingleWindow() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setSingleWindow();
    assertTrue(bco.isSingleWindow());
    assertTrue(bco.isSet(BrowserConfigurationOptions.SINGLE_WINDOW));
  }

  @Test
  public void testSetSingleWindowWhenMultiWindowWasAlreadySet() {
    BrowserConfigurationOptions bco =
        new BrowserConfigurationOptions().setMultiWindow().setSingleWindow();
    assertTrue(bco.isSingleWindow());
    assertFalse(bco.isMultiWindow());
    assertTrue(bco.isSet(BrowserConfigurationOptions.SINGLE_WINDOW));
  }

  @Test
  public void testSetMultiWindow() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setMultiWindow();
    assertTrue(bco.isMultiWindow());
    assertTrue(bco.isSet(BrowserConfigurationOptions.MULTI_WINDOW));
  }

  @Test
  public void testSetMultiWindowWhenSingleWindowWasAlreadySet() {
    BrowserConfigurationOptions bco =
        new BrowserConfigurationOptions().setSingleWindow().setMultiWindow();
    assertTrue(bco.isMultiWindow());
    assertFalse(bco.isSingleWindow());
    assertTrue(bco.isSet(BrowserConfigurationOptions.MULTI_WINDOW));
  }

  @Test
  public void testSetBrowserExecutablePathWithNullPath() {
    BrowserConfigurationOptions bco =
        new BrowserConfigurationOptions().setBrowserExecutablePath(null);
    assertFalse(bco.isSet(BrowserConfigurationOptions.BROWSER_EXECUTABLE_PATH));
  }

  @Test
  public void testSetBrowserExecutablePathWithValidPath() {
    String path = "c:\\chrome\\is\\cool.exe with_arg";
    BrowserConfigurationOptions bco =
        new BrowserConfigurationOptions().setBrowserExecutablePath(path);
    assertTrue(bco.isSet(BrowserConfigurationOptions.BROWSER_EXECUTABLE_PATH));
    assertEquals(path, bco.getBrowserExecutablePath());
  }

  @Test
  public void testSetTimeoutInSeconds() {
    int timeout = 17;
    BrowserConfigurationOptions bco =
        new BrowserConfigurationOptions().setTimeoutInSeconds(timeout);
    assertTrue(bco.isSet(BrowserConfigurationOptions.TIMEOUT_IN_SECONDS));
    assertEquals(timeout, bco.getTimeoutInSeconds());
  }

  @Test
  public void testGetTimeoutWhenNoneSet() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions();
    assertEquals(BrowserConfigurationOptions.DEFAULT_TIMEOUT_IN_SECONDS, bco.getTimeoutInSeconds());
  }

  @Test
  public void testBrowserModeWithNullMode() {
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setBrowserMode(null);
    assertFalse(bco.isSet(BrowserConfigurationOptions.BROWSER_MODE));
  }

  @Test
  public void testBrowserModeWithNonNullMode() {
    String mode = "hta";
    BrowserConfigurationOptions bco = new BrowserConfigurationOptions().setBrowserMode(mode);
    assertTrue(bco.isSet(BrowserConfigurationOptions.BROWSER_MODE));
    assertEquals(mode, bco.getBrowserMode());
  }

}
