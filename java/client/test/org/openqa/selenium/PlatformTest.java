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

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.Platform.ANDROID;
import static org.openqa.selenium.Platform.ANY;
import static org.openqa.selenium.Platform.IOS;
import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.VISTA;
import static org.openqa.selenium.Platform.WIN8;
import static org.openqa.selenium.Platform.WIN8_1;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.Platform.XP;

import org.junit.Test;

public class PlatformTest {

  @Test
  public void testXpIsWindows() {
    assertThat(XP.is(WINDOWS)).isTrue();
  }

  @Test
  public void testVistaIsWindows() {
    assertThat(VISTA.is(WINDOWS)).isTrue();
  }

  @Test
  public void testWin8IsWindows() {
    assertThat(WIN8.is(WINDOWS)).isTrue();
  }

  @Test
  public void testWin81IsWindows() {
    assertThat(WIN8_1.is(WINDOWS)).isTrue();
  }

  @Test
  public void testLinuxIsUnix() {
    assertThat(LINUX.is(UNIX)).isTrue();
  }

  @Test
  public void testUnixIsNotLinux() {
    assertThat(UNIX.is(LINUX)).isFalse();
  }

  @Test
  public void testXpIsAny() {
    assertThat(XP.is(ANY)).isTrue();
  }

  @Test
  public void testWindowsIsAny() {
    assertThat(WINDOWS.is(ANY)).isTrue();
  }

  @Test
  public void testLinuxIsAny() {
    assertThat(LINUX.is(ANY)).isTrue();
  }

  @Test
  public void windowsIsNotMacOS() {
    // Both of these are platform definitions, so return "null" for the family.
    assertThat(WINDOWS.is(MAC)).isFalse();
  }

  @Test
  public void testUnixIsAny() {
    assertThat(UNIX.is(ANY)).isTrue();
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
    assertThat(WINDOWS.is(WINDOWS)).isTrue();
  }

  @Test
  public void macIsMac() {
    assertThat(MAC.is(MAC)).isTrue();
  }

  @Test
  public void linuxIsLinux() {
    assertThat(LINUX.is(LINUX)).isTrue();
  }

  @Test
  public void unixIsUnix() {
    assertThat(UNIX.is(UNIX)).isTrue();
  }

  @Test
  public void androidIAndroid() {
    assertThat(ANDROID.is(ANDROID)).isTrue();
  }

  @Test
  public void iosIsIos() {
    assertThat(IOS.is(IOS)).isTrue();
  }

  @Test
  public void testWindows8Detection() {
    assertThat(Platform.extractFromSysProperty("windows nt (unknown)", "6.2")).isEqualTo(Platform.WIN8);
  }

  @Test
  public void testWindows81Detection() {
    assertThat(Platform.extractFromSysProperty("windows nt (unknown)", "6.3")).isEqualTo(Platform.WIN8_1);
  }

  @Test
  public void testWindowsIsWindows() {
    assertThat(WINDOWS).isEqualTo(Platform.fromString("windows"));
  }

  @Test
  public void canParseMacOsXCorrectly() {
    assertThat(Platform.fromString("Mac OS X")).isEqualTo(MAC);
  }

  private void assertAllAre(Platform platform, String... osNames) {
    for (String osName : osNames) {
      Platform seen = Platform.extractFromSysProperty(osName);
      assertThat(seen.is(platform)).isTrue();
    }
  }

}
