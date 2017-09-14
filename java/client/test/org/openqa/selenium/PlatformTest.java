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

package org.openqa.selenium;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.JUnit4;

@RunWith(JUnit4.class)
public class PlatformTest {

  @Test
  public void testXpIsWindows() {
    assertTrue(Platform.XP.is(Platform.WINDOWS));
  }

  @Test
  public void testVistaIsWindows() {
    assertTrue(Platform.VISTA.is(Platform.WINDOWS));
  }

  @Test
  public void testWin8IsWindows() {
    assertTrue(Platform.WIN8.is(Platform.WINDOWS));
  }

  @Test
  public void testWin81IsWindows() {
    assertTrue(Platform.WIN8_1.is(Platform.WINDOWS));
  }

  @Test
  public void testLinuxIsUnix() {
    assertTrue(Platform.LINUX.is(Platform.UNIX));
  }

  @Test
  public void testUnixIsNotLinux() {
    assertFalse(Platform.UNIX.is(Platform.LINUX));
  }

  @Test
  public void androidIsAUnixVariant() {
    assertTrue(Platform.ANDROID.is(Platform.UNIX));
  }

  @Test
  public void testXpIsAny() {
    assertTrue(Platform.XP.is(Platform.ANY));
  }

  @Test
  public void testWindowsIsAny() {
    assertTrue(Platform.WINDOWS.is(Platform.ANY));
  }

  @Test
  public void testLinuxIsAny() {
    assertTrue(Platform.LINUX.is(Platform.ANY));
  }

  @Test
  public void windowsIsNotMacOS() {
    // Both of these are platform definitions, so return "null" for the family.
    assertFalse(Platform.WINDOWS.is(Platform.MAC));
  }

  @Test
  public void testUnixIsAny() {
    assertTrue(Platform.UNIX.is(Platform.ANY));
  }

  @Test
  public void testShouldIdentifyXPVariants() {
    assertAllAre(Platform.WINDOWS, "Windows 2003", "xp", "windows", "winnt");
  }

  @Test
  public void testShouldIdentifyVistaVariants() {
    assertAllAre(Platform.VISTA, "Windows Vista", "windows server 2008", "Windows 7", "win7");
  }

  @Test
  public void testShouldIdentifyMacVariants() {
    assertAllAre(Platform.MAC, "Darwin", "Mac OS X");
  }

  @Test
  public void testShouldIdentifyUnixVariants() {
    assertAllAre(Platform.UNIX, "solaris", "bsd");
  }

  @Test
  public void testShouldIdentifyLinux() {
    assertAllAre(Platform.LINUX, "Linux");
  }

  @Test
  public void windowsIsWindows() {
    assertTrue(Platform.WINDOWS.is(Platform.WINDOWS));
  }

  @Test
  public void macIsMac() {
    assertTrue(Platform.MAC.is(Platform.MAC));
  }

  @Test
  public void linuxIsLinux() {
    assertTrue(Platform.LINUX.is(Platform.LINUX));
  }

  @Test
  public void unixIsUnix() {
    assertTrue(Platform.UNIX.is(Platform.UNIX));
  }

  @Test
  public void testWindows8Detection() {
    assertEquals("Windows NT with os version 6.2 should be detected as Windows 8",
                 Platform.WIN8, Platform.extractFromSysProperty("windows nt (unknown)", "6.2"));
  }

  @Test
  public void testWindows81Detection() {
    assertEquals("Windows NT with os version 6.3 should be detected as Windows 8.1",
                 Platform.WIN8_1, Platform.extractFromSysProperty("windows nt (unknown)", "6.3"));
  }

  @Test
  public void testWindowsIsWindows() {
    assertEquals(Platform.fromString("windows"), Platform.WINDOWS);
  }

  @Test
  public void canParseMacOsXCorrectly() {
    assertEquals(Platform.MAC, Platform.fromString("Mac OS X"));
  }

  private void assertAllAre(Platform platform, String... osNames) {
    for (String osName : osNames) {
      Platform seen = Platform.extractFromSysProperty(osName);
      assertTrue(String.format("Expected %s, but got %s from %s", platform, seen, osName),
          seen.is(platform));
    }
  }

}
