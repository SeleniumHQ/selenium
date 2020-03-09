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

package org.openqa.selenium.remote.server;

import static java.util.Arrays.asList;
import static java.util.Collections.singletonList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.remote.server.CapabilitiesComparator.getBestMatch;

import com.google.common.collect.Lists;

import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Comparator;
import java.util.List;

public class CapabilitiesComparatorTest {

  private Comparator<Capabilities> comparator;

  @Test
  public void shouldMatchByBrowserName_assumingAllOtherPropertiesAreNull() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "", Platform.ANY, true));

    Capabilities c1 = capabilities(BrowserType.FIREFOX, null, null, false);
    Capabilities c2 = capabilities(BrowserType.CHROME, null, null, false);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldMatchByBrowserName_assumingAllOtherPropertiesAreTheSame() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "", Platform.ANY, true));

    Capabilities c1 = capabilities(BrowserType.FIREFOX, "", Platform.ANY, true);
    Capabilities c2 = capabilities(BrowserType.CHROME, "", Platform.ANY, true);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldIgnoreVersionIfNullOnAnInput() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true));

    Capabilities c1 = capabilities(BrowserType.FIREFOX, null, Platform.ANY, true);
    Capabilities c2 = capabilities(BrowserType.FIREFOX, "7", Platform.ANY, true);
    assertGreaterThan(c1, c2);

    Capabilities c3 = capabilities(BrowserType.FIREFOX, "7", Platform.ANY, true);
    Capabilities c4 = capabilities(BrowserType.FIREFOX, null, Platform.ANY, true);
    assertGreaterThan(c4, c3);
  }

  @Test
  public void shouldMatchByVersion_assumingAllOtherPropertiesAreTheSame_versionSpecified() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true));

    Capabilities c1 = capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true);
    Capabilities c2 = capabilities(BrowserType.FIREFOX, "7", Platform.ANY, true);
    Capabilities c3 = capabilities(BrowserType.FIREFOX, null, Platform.ANY, true);

    assertGreaterThan(c1, c2);
    assertGreaterThan(c1, c3);
  }

  @Test
  public void shouldMatchByPlatform_assumingAllOtherPropertiesAreTheSame() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true));

    Capabilities c1 = capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true);
    Capabilities c2 = capabilities(BrowserType.FIREFOX, "6", Platform.LINUX, true);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldPreferCurrentPlatformOverOthers() {
    comparator = compareBy(capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true), Platform.LINUX);

    Capabilities c1 = capabilities(BrowserType.FIREFOX, "6", Platform.ANY, true);
    Capabilities c2 = capabilities(BrowserType.FIREFOX, "6", Platform.LINUX, true);
    Capabilities c3 = capabilities(BrowserType.FIREFOX, "6", Platform.WINDOWS, true);

    assertGreaterThan(c2, c1);
    assertGreaterThan(c2, c3);
  }

  @Test
  public void shouldPickCorrectBrowser() {
    Capabilities chrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);
    Capabilities firefox = new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY);
    Capabilities opera = new DesiredCapabilities(BrowserType.OPERA_BLINK, "10", Platform.ANY);
    List<Capabilities> list = asList(chrome, firefox, opera);

    DesiredCapabilities desired = new DesiredCapabilities();

    desired.setBrowserName(BrowserType.CHROME);
    assertThat(getBestMatch(desired, list)).isEqualTo(chrome);

    desired.setBrowserName(BrowserType.FIREFOX);
    assertThat(getBestMatch(desired, list)).isEqualTo(firefox);

    desired.setBrowserName(BrowserType.OPERA_BLINK);
    assertThat(getBestMatch(desired, list)).isEqualTo(opera);
  }

  @Test
  public void shouldPickAnyIfPlatformChoicesAreAnyOrWindowsAndDesireLinux() {
    Capabilities any = capabilities(BrowserType.FIREFOX, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.FIREFOX, "", Platform.WINDOWS, true);
    Capabilities linux = capabilities(BrowserType.FIREFOX, "", Platform.LINUX, true);

    assertThat(getBestMatch(linux, asList(any, windows))).isEqualTo(any);
    // Registration order should not matter.
    assertThat(getBestMatch(linux, asList(windows, any))).isEqualTo(any);
  }

  @Test
  public void shouldPickWindowsIfPlatformChoiceIsAny() {
    Capabilities any = capabilities(BrowserType.IE, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    assertThat(getBestMatch(any, singletonList(windows))).isEqualTo(windows);
  }

  @Test
  public void shouldPickMostSpecificOperatingSystem() {
    Capabilities any = capabilities(BrowserType.IE, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    Capabilities xp = capabilities(BrowserType.IE, "", Platform.XP, true);
    Capabilities vista = capabilities(BrowserType.IE, "", Platform.VISTA, true);

    List<Capabilities> list = asList(any, windows, xp, vista);
    assertThat(getBestMatch(any, list, Platform.LINUX)).isEqualTo(any);
    assertThat(getBestMatch(windows, list)).isEqualTo(windows);
    assertThat(getBestMatch(xp, list)).isEqualTo(xp);
    assertThat(getBestMatch(vista, list)).isEqualTo(vista);
  }

  @Test
  public void pickingWindowsFromVariousLists() {
    Capabilities any = capabilities(BrowserType.IE, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    Capabilities xp = capabilities(BrowserType.IE, "", Platform.XP, true);
    Capabilities vista = capabilities(BrowserType.IE, "", Platform.VISTA, true);

    assertThat(getBestMatch(windows, singletonList(any))).isEqualTo(any);
    assertThat(getBestMatch(windows, asList(any, windows))).isEqualTo(windows);
    assertThat(getBestMatch(windows, asList(windows, xp, vista))).isEqualTo(windows);
    assertThat(getBestMatch(windows, asList(xp, vista))).isIn(xp, vista);
    assertThat(getBestMatch(windows, singletonList(xp))).isEqualTo(xp);
    assertThat(getBestMatch(windows, singletonList(vista))).isEqualTo(vista);
  }

  @Test
  public void pickingXpFromVariousLists() {
    Capabilities any = capabilities(BrowserType.IE, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    Capabilities xp = capabilities(BrowserType.IE, "", Platform.XP, true);
    Capabilities vista = capabilities(BrowserType.IE, "", Platform.VISTA, true);

    assertThat(getBestMatch(xp, singletonList(any))).isEqualTo(any);
    assertThat(getBestMatch(xp, asList(any, windows))).isEqualTo(windows);
    assertThat(getBestMatch(xp, asList(windows, xp, vista))).isEqualTo(xp);
    assertThat(getBestMatch(xp, asList(windows, xp))).isEqualTo(xp);
    assertThat(getBestMatch(xp, asList(xp, vista))).isEqualTo(xp);
    assertThat(getBestMatch(xp, singletonList(xp))).isEqualTo(xp);
    assertThat(getBestMatch(xp, singletonList(vista))).isEqualTo(vista);
  }

  @Test
  public void pickingVistaFromVariousLists() {
    Capabilities any = capabilities(BrowserType.IE, "", Platform.ANY, true);
    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    Capabilities xp = capabilities(BrowserType.IE, "", Platform.XP, true);
    Capabilities vista = capabilities(BrowserType.IE, "", Platform.VISTA, true);

    Platform current = Platform.WINDOWS;
    assertThat(getBestMatch(vista, singletonList(any), current)).isEqualTo(any);
    assertThat(getBestMatch(vista, asList(any, windows), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(windows, xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, asList(windows, xp), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, singletonList(xp), current)).isEqualTo(xp);
    assertThat(getBestMatch(vista, singletonList(vista), current)).isEqualTo(vista);

    current = Platform.VISTA;
    assertThat(getBestMatch(vista, singletonList(any), current)).isEqualTo(any);
    assertThat(getBestMatch(vista, asList(any, windows), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(any, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, asList(windows, xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, asList(windows, xp), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, singletonList(xp), current)).isEqualTo(xp);
    assertThat(getBestMatch(vista, singletonList(vista), current)).isEqualTo(vista);

    current = Platform.XP;
    assertThat(getBestMatch(vista, singletonList(any), current)).isEqualTo(any);
    assertThat(getBestMatch(vista, asList(any, windows), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(any, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, asList(windows, xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, asList(windows, xp), current)).isEqualTo(windows);
    assertThat(getBestMatch(vista, asList(xp, vista), current)).isEqualTo(vista);
    assertThat(getBestMatch(vista, singletonList(xp), current)).isEqualTo(xp);
    assertThat(getBestMatch(vista, singletonList(vista), current)).isEqualTo(vista);
  }

  @Test
  public void pickingUnixFromVariousLists() {
    Capabilities any = capabilities(BrowserType.FIREFOX, "", Platform.ANY, true);
    Capabilities mac = capabilities(BrowserType.FIREFOX, "", Platform.MAC, true);
    Capabilities unix = capabilities(BrowserType.FIREFOX, "", Platform.UNIX, true);
    Capabilities linux = capabilities(BrowserType.FIREFOX, "", Platform.LINUX, true);

    assertThat(getBestMatch(unix, singletonList(any))).isEqualTo(any);
    assertThat(getBestMatch(unix, asList(any, mac))).isEqualTo(any);
    assertThat(getBestMatch(unix, asList(any, unix))).isEqualTo(unix);
    assertThat(getBestMatch(unix, asList(any, unix, linux))).isEqualTo(unix);
    assertThat(getBestMatch(unix, asList(unix, linux))).isEqualTo(unix);
    assertThat(getBestMatch(unix, singletonList(linux))).isEqualTo(linux);
  }

  @Test
  public void pickingLinuxFromVariousLists() {
    Capabilities any = capabilities(BrowserType.FIREFOX, "", Platform.ANY, true);
    Capabilities mac = capabilities(BrowserType.FIREFOX, "", Platform.MAC, true);
    Capabilities unix = capabilities(BrowserType.FIREFOX, "", Platform.UNIX, true);
    Capabilities linux = capabilities(BrowserType.FIREFOX, "", Platform.LINUX, true);

    assertThat(getBestMatch(linux, singletonList(any))).isEqualTo(any);
    assertThat(getBestMatch(linux, asList(any, mac))).isEqualTo(any);
    assertThat(getBestMatch(linux, asList(any, unix))).isEqualTo(unix);
    assertThat(getBestMatch(linux, asList(any, unix, linux))).isEqualTo(linux);
    assertThat(getBestMatch(linux, asList(unix, linux))).isEqualTo(linux);
    assertThat(getBestMatch(linux, singletonList(linux))).isEqualTo(linux);
    assertThat(getBestMatch(linux, singletonList(unix))).isEqualTo(unix);
  }

  @Test
  public void matchesByCapabilitiesProvided() {
    DesiredCapabilities sparse = new DesiredCapabilities();
    sparse.setBrowserName(BrowserType.FIREFOX);

    Capabilities windows = capabilities(BrowserType.IE, "", Platform.WINDOWS, true);
    Capabilities firefox = capabilities(BrowserType.FIREFOX, "", Platform.WINDOWS, true);

    assertThat(getBestMatch(sparse, asList(windows, firefox))).isEqualTo(firefox);

    sparse.setBrowserName(BrowserType.IE);
    assertThat(getBestMatch(sparse, asList(windows, firefox))).isEqualTo(windows);
  }

  @Test
  public void matchesWithPreferenceToCurrentPlatform() {
    Capabilities chromeUnix = capabilities(BrowserType.CHROME, "", Platform.UNIX, true);
    Capabilities chromeVista = capabilities(BrowserType.CHROME, "", Platform.VISTA, true);
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "", Platform.ANY);

    List<Capabilities> allCaps = asList(anyChrome, chromeVista, chromeUnix,
        // This last option should never match.
        new DesiredCapabilities(BrowserType.FIREFOX, "10", Platform.ANY));

    // Should match to corresponding platform.
    assertThat(getBestMatch(anyChrome, allCaps, Platform.UNIX)).isEqualTo(chromeUnix);
    assertThat(getBestMatch(chromeUnix, allCaps, Platform.UNIX)).isEqualTo(chromeUnix);

    assertThat(getBestMatch(anyChrome, allCaps, Platform.LINUX)).isEqualTo(chromeUnix);
    assertThat(getBestMatch(chromeUnix, allCaps, Platform.LINUX)).isEqualTo(chromeUnix);

    assertThat(getBestMatch(anyChrome, allCaps, Platform.VISTA)).isEqualTo(chromeVista);
    assertThat(getBestMatch(chromeVista, allCaps, Platform.VISTA)).isEqualTo(chromeVista);

    assertThat(getBestMatch(anyChrome, allCaps, Platform.WINDOWS)).isEqualTo(chromeVista);
    assertThat(getBestMatch(chromeVista, allCaps, Platform.WINDOWS)).isEqualTo(chromeVista);

    // No configs registered to current platform, should fallback to normal matching rules.
    assertThat(getBestMatch(anyChrome, allCaps, Platform.MAC)).isEqualTo(anyChrome);
    assertThat(getBestMatch(anyChrome, allCaps, Platform.XP)).isEqualTo(anyChrome);
  }

  @Test
  public void currentPlatformCheckDoesNotTrumpExactPlatformMatch() {
    Capabilities chromeUnix = capabilities(BrowserType.CHROME, "", Platform.UNIX, true);
    Capabilities chromeVista = capabilities(BrowserType.CHROME, "", Platform.VISTA, true);
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);

    List<Capabilities> allCaps = asList(anyChrome, chromeVista, chromeUnix);

    assertThat(getBestMatch(chromeVista, allCaps, Platform.UNIX)).isEqualTo(chromeVista);
    assertThat(getBestMatch(chromeVista, allCaps, Platform.LINUX)).isEqualTo(chromeVista);
    assertThat(getBestMatch(chromeVista, allCaps, Platform.MAC)).isEqualTo(chromeVista);

    assertThat(getBestMatch(chromeUnix, allCaps, Platform.MAC)).isEqualTo(chromeUnix);
    assertThat(getBestMatch(chromeUnix, allCaps, Platform.VISTA)).isEqualTo(chromeUnix);
    assertThat(getBestMatch(chromeUnix, allCaps, Platform.WINDOWS)).isEqualTo(chromeUnix);
  }

  @Test
  public void currentPlatformCheckDoesNotTrumpExactVersionMatch() {
    Capabilities chromeUnix = capabilities(BrowserType.CHROME, "", Platform.UNIX, true);
    Capabilities chromeBetaUnix = capabilities(BrowserType.CHROME, "beta", Platform.UNIX, true);
    Capabilities chromeVista = capabilities(BrowserType.CHROME, "", Platform.VISTA, true);
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);

    List<Capabilities> allCaps = asList(anyChrome, chromeVista, chromeUnix, chromeBetaUnix);

    assertThat(getBestMatch(chromeUnix, allCaps, Platform.UNIX)).isEqualTo(chromeUnix);
    assertThat(getBestMatch(chromeBetaUnix, allCaps, Platform.UNIX)).isEqualTo(chromeBetaUnix);
  }

  @Test
  public void absentExactMatchPrefersItemsInInputOrder() {
    Capabilities chromeWindows = capabilities(BrowserType.CHROME, "", Platform.WINDOWS, true);
    Capabilities chromeVista = capabilities(BrowserType.CHROME, "", Platform.VISTA, true);
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);

    List<Capabilities> allCaps = asList(chromeWindows, chromeVista);
    List<Capabilities> reversedCaps = Lists.reverse(allCaps);

    assertThat(getBestMatch(anyChrome, allCaps, Platform.UNIX)).isEqualTo(chromeWindows);
    assertThat(getBestMatch(anyChrome, reversedCaps, Platform.UNIX)).isEqualTo(chromeVista);
  }

  @Test
  public void filtersByVersionStringIfNonEmpty() {
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);
    Capabilities chromeBeta = new DesiredCapabilities(anyChrome) {{ setVersion("beta"); }};
    Capabilities chromeDev = new DesiredCapabilities(anyChrome) {{ setVersion("dev"); }};

    List<Capabilities> allCaps = asList(anyChrome, chromeBeta, chromeDev);

    assertThat(getBestMatch(anyChrome, allCaps)).isEqualTo(anyChrome);
    assertThat(getBestMatch(chromeBeta, allCaps)).isEqualTo(chromeBeta);
    assertThat(getBestMatch(chromeDev, allCaps)).isEqualTo(chromeDev);
  }

  @Test
  public void ignoresVersionStringIfEmpty() {
    Capabilities anyChrome = new DesiredCapabilities(BrowserType.CHROME, "10", Platform.ANY);
    Capabilities chromeNoVersion = new DesiredCapabilities() {{
      setBrowserName(BrowserType.CHROME);
      setPlatform(Platform.UNIX);
    }};
    Capabilities chromeEmptyVersion = new DesiredCapabilities(chromeNoVersion) {{
      setVersion("");
    }};

    List<Capabilities> allCaps = asList(anyChrome, chromeNoVersion);

    assertThat(getBestMatch(chromeEmptyVersion, allCaps, Platform.UNIX)).isEqualTo(chromeNoVersion);
    assertThat(getBestMatch(chromeNoVersion, allCaps, Platform.UNIX)).isEqualTo(chromeNoVersion);
    // Unix does not match windows.
    assertThat(getBestMatch(anyChrome, allCaps, Platform.WINDOWS)).isEqualTo(anyChrome);
  }

  private void assertGreaterThan(Capabilities a, Capabilities b) {
    assertThat(comparator.compare(a, b)).isGreaterThan(0);
    assertThat(comparator.compare(b, a)).isLessThan(0);
  }

  private static Comparator<Capabilities> compareBy(Capabilities capabilities) {
    return compareBy(capabilities, Platform.ANY);
  }

  private static Comparator<Capabilities> compareBy(Capabilities capabilities,
      Platform currentPlatform) {
    return new CapabilitiesComparator(capabilities, currentPlatform);
  }

  private static Capabilities capabilities(String browserName, String version,
      Platform platform, boolean isJavaScriptEnabled) {
    DesiredCapabilities dc = new DesiredCapabilities(browserName, version, platform);
    dc.setJavascriptEnabled(isJavaScriptEnabled);
    return dc;
  }

}
