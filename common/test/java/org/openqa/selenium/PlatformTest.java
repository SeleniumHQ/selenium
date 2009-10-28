/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import junit.framework.TestCase;

public class PlatformTest extends TestCase {

  public void testShouldIdentifyWindowsVariants() {
    assertAllAre(Platform.WINDOWS, "Windows 2003");
  }

  public void testShouldIdentifyMacVariants() {
    assertAllAre(Platform.MAC, "Darwin", "Mac OS X");
  }
  
  public void testShouldIdentifyUnixVariants() {
    assertAllAre(Platform.UNIX, "solaris", "bsd");
  }
  
  public void testShouldIdentifyLinux() {
    assertAllAre(Platform.LINUX, "Linux");
  }
  
  public void testShouldDistinctLinuxFromUnix() {
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
