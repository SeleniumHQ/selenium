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
package org.openqa.selenium.os;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RunWith(JUnit4.class)
public class WindowsUtilsUnitTest {

  private int majorVersion;
  private int minorVersion;
  private Pattern WIN_OS_VERSION = Pattern.compile("^(\\d)+\\.(\\d)+$");

  @Before
  public void setUp() {
    if (!WindowsUtils.thisIsWindows()) return;
    String osVersion = System.getProperty("os.version");
    Matcher m = WIN_OS_VERSION.matcher(osVersion);
    if (!m.find()) fail("osVersion doesn't look right: " + osVersion);
    majorVersion = Integer.parseInt(m.group(1));
    minorVersion = Integer.parseInt(m.group(2));
  }

  private boolean isXpOrHigher() {
    return majorVersion > 5
        || (majorVersion == 5 && minorVersion >= 1);
  }

  @Test
  public void testLoadEnvironment() {
    if (!WindowsUtils.thisIsWindows()) return;
    Properties p = WindowsUtils.loadEnvironment();
    assertFalse("Environment appears to be empty!", p.isEmpty());
    assertNotNull("SystemRoot env var apparently not set on Windows!",
        WindowsUtils.findSystemRoot());
  }

  @Test
  public void testTaskKill() {
    if (!WindowsUtils.thisIsWindows()) return;
    if (!isXpOrHigher()) return;
    assertFalse("taskkill should be found", "taskkill".equals(WindowsUtils.findTaskKill()));
  }
}
