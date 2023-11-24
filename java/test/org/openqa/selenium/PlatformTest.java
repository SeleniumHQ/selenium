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
import static org.openqa.selenium.Platform.CATALINA;
import static org.openqa.selenium.Platform.IOS;
import static org.openqa.selenium.Platform.LINUX;
import static org.openqa.selenium.Platform.MAC;
import static org.openqa.selenium.Platform.UNIX;
import static org.openqa.selenium.Platform.VISTA;
import static org.openqa.selenium.Platform.WIN8;
import static org.openqa.selenium.Platform.WIN8_1;
import static org.openqa.selenium.Platform.WINDOWS;
import static org.openqa.selenium.Platform.XP;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class PlatformTest {

  @Test
  void testXpIsWindows() {
    assertThat(XP.is(WINDOWS)).isTrue();
  }

  @Test
  void testVistaIsWindows() {
    assertThat(VISTA.is(WINDOWS)).isTrue();
  }

  @Test
  void testWin8IsWindows() {
    assertThat(WIN8.is(WINDOWS)).isTrue();
  }

  @Test
  void testWin81IsWindows() {
    assertThat(WIN8_1.is(WINDOWS)).isTrue();
  }

  @Test
  void testLinuxIsUnix() {
    assertThat(LINUX.is(UNIX)).isTrue();
  }

  @Test
  void testUnixIsNotLinux() {
    assertThat(UNIX.is(LINUX)).isFalse();
  }

  @Test
  void testXpIsAny() {
    assertThat(XP.is(ANY)).isTrue();
  }

  @Test
  void testWindowsIsAny() {
    assertThat(WINDOWS.is(ANY)).isTrue();
  }

  @Test
  void testLinuxIsAny() {
    assertThat(LINUX.is(ANY)).isTrue();
  }

  @Test
  void windowsIsNotMacOS() {
    // Both of these are platform definitions, so return "null" for the family.
    assertThat(WINDOWS.is(MAC)).isFalse();
  }

  @Test
  void testUnixIsAny() {
    assertThat(UNIX.is(ANY)).isTrue();
  }

  @Test
  void testShouldIdentifyXPVariants() {
    assertAllAre(Platform.WINDOWS, "Windows 2003", "xp", "windows", "winnt");
  }

  @Test
  void testShouldIdentifyVistaVariants() {
    assertAllAre(Platform.VISTA, "Windows Vista", "windows server 2008");
  }

  @Test
  void testShouldIdentifyMacVariants() {
    assertAllAre(Platform.MAC, "Darwin", "Mac OS X");
  }

  @Test
  void testShouldIdentifyUnixVariants() {
    assertAllAre(Platform.UNIX, "solaris", "bsd");
  }

  @Test
  void testShouldIdentifyLinux() {
    assertAllAre(Platform.LINUX, "Linux");
  }

  @Test
  void windowsIsWindows() {
    assertThat(WINDOWS.is(WINDOWS)).isTrue();
  }

  @Test
  void macIsMac() {
    assertThat(MAC.is(MAC)).isTrue();
  }

  @Test
  void linuxIsLinux() {
    assertThat(LINUX.is(LINUX)).isTrue();
  }

  @Test
  void unixIsUnix() {
    assertThat(UNIX.is(UNIX)).isTrue();
  }

  @Test
  void androidIAndroid() {
    assertThat(ANDROID.is(ANDROID)).isTrue();
  }

  @Test
  void iosIsIos() {
    assertThat(IOS.is(IOS)).isTrue();
  }

  @Test
  void testWindows8Detection() {
    assertThat(Platform.extractFromSysProperty("windows nt (unknown)", "6.2"))
        .isEqualTo(Platform.WIN8);
  }

  @Test
  void testWindows81Detection() {
    assertThat(Platform.extractFromSysProperty("windows nt (unknown)", "6.3"))
        .isEqualTo(Platform.WIN8_1);
  }

  @Test
  void testWindowsIsWindows() {
    assertThat(WINDOWS).isEqualTo(Platform.fromString("windows"));
  }

  @Test
  void canParseMacOsXCorrectly() {
    assertThat(Platform.fromString("Mac OS X")).isEqualTo(MAC);
  }

  @Test
  void catalinaIsMac() {
    assertThat(CATALINA.is(MAC)).isTrue();
  }

  @Test
  void canParseCatalinaFromOSName() {
    assertThat(Platform.fromString("macOS 10.15")).isEqualTo(CATALINA);
  }

  private void assertAllAre(Platform platform, String... osNames) {
    for (String osName : osNames) {
      Platform seen = Platform.extractFromSysProperty(osName);
      assertThat(seen.is(platform)).isTrue();
    }
  }
}
