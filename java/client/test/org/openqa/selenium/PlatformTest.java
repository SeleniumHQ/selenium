/*
Copyright 2007-2011 Selenium committers
Copyright 2011 Software Freedom Conservancy

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 */

package org.openqa.selenium;

import org.junit.Test;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class PlatformTest {

  @Test
  public void testShouldIdentifyWindowsVariants() {
    assertAllAre(Platform.WINDOWS, "Windows 2003");
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
  public void testWindows8Detection() {
    assertEquals("Windows NT with os version 6.2 should be detected as Windows 8",
                 Platform.WIN8, Platform.extractFromSysProperty("windows nt (unknown)", "6.2"));
  }

  @Test
  public void testShouldDistinctUnixFromLinux() {
    Platform linPlatform = Platform.extractFromSysProperty("Linux");
    assertTrue("Linux should be identified as Unix", linPlatform.is(Platform.UNIX));

    Platform anyUnixPlatform = Platform.extractFromSysProperty("solaris");
    assertFalse("Unix should NOT be identified as Linux", anyUnixPlatform.is(Platform.LINUX));
  }

  private void assertAllAre(Platform platform, String... osNames) {
    for (String osName : osNames) {
      Platform seen = Platform.extractFromSysProperty(osName);
      assertTrue(String.format("Expected %s, but got %s from %s", platform, seen, osName),
          seen.is(platform));
    }
  }

}
