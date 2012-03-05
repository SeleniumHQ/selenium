/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.remote.server;

import static com.google.common.collect.Lists.newArrayList;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.number.OrderingComparisons.greaterThan;
import static org.hamcrest.number.OrderingComparisons.lessThan;
import static org.openqa.selenium.remote.server.CapabilitiesComparator.getBestMatch;

import com.google.common.collect.Lists;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.BlockJUnit4ClassRunner;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.Platform;
import org.openqa.selenium.remote.DesiredCapabilities;

import java.util.Comparator;
import java.util.List;

@RunWith(BlockJUnit4ClassRunner.class)
public class CapabilitiesComparatorTest {

  private Comparator<Capabilities> comparator;

  @Test
  public void shouldMatchByBrowserName_assumingAllOtherPropertiesAreNull() {
    comparator = compareBy(capabilities("firefox", "", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", null, null, false);
    Capabilities c2 = capabilities("chrome", null, null, false);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldMatchByBrowserName_assumingAllOtherPropertiesAreTheSame() {
    comparator = compareBy(capabilities("firefox", "", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", "", Platform.ANY, true);
    Capabilities c2 = capabilities("chrome", "", Platform.ANY, true);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldIgnoreVersionIfNullOnAnInput() {
    comparator = compareBy(capabilities("firefox", "6", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", null, Platform.ANY, true);
    Capabilities c2 = capabilities("firefox", "7", Platform.ANY, true);
    assertGreaterThan(c1, c2);

    Capabilities c3 = capabilities("firefox", "7", Platform.ANY, true);
    Capabilities c4 = capabilities("firefox", null, Platform.ANY, true);
    assertGreaterThan(c4, c3);
  }

  @Test
  public void shouldMatchByVersion_assumingAllOtherPropertiesAreTheSame_versionSpecified() {
    comparator = compareBy(capabilities("firefox", "6", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", "6", Platform.ANY, true);
    Capabilities c2 = capabilities("firefox", "7", Platform.ANY, true);
    Capabilities c3 = capabilities("firefox", null, Platform.ANY, true);

    assertGreaterThan(c1, c2);
    assertGreaterThan(c1, c3);
  }

  @Test
  public void shouldMatchByVersion_assumingAllOtherPropertiesAreTheSame_emptyVersion() {
    comparator = compareBy(capabilities("firefox", "", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", "", Platform.ANY, true);
    Capabilities c2 = capabilities("firefox", "6", Platform.ANY, true);
    Capabilities c3 = capabilities("firefox", null, Platform.ANY, true);

    assertGreaterThan(c1, c2);
    assertGreaterThan(c1, c3);
  }

  @Test
  public void shouldMatchByVersion_assumingAllOtherPropertiesAreTheSame_nullVersion() {
    comparator = compareBy(capabilities("firefox", null, Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", null, Platform.ANY, true);
    Capabilities c2 = capabilities("firefox", "", Platform.ANY, true);
    Capabilities c3 = capabilities("firefox", "6", Platform.ANY, true);

    assertGreaterThan(c1, c2);
    assertGreaterThan(c1, c3);
  }

  @Test
  public void shouldMatchByPlatform_assumingAllOtherPropertiesAreTheSame() {
    comparator = compareBy(capabilities("firefox", "6", Platform.ANY, true));

    Capabilities c1 = capabilities("firefox", "6", Platform.ANY, true);
    Capabilities c2 = capabilities("firefox", "6", Platform.LINUX, true);

    assertGreaterThan(c1, c2);
  }

  @Test
  public void shouldPickCorrectBrowser() {
    Capabilities chrome = DesiredCapabilities.chrome();
    Capabilities firefox = DesiredCapabilities.firefox();
    Capabilities opera = DesiredCapabilities.opera();
    List<Capabilities> list = Lists.newArrayList(chrome, firefox, opera);

    DesiredCapabilities desired = new DesiredCapabilities();

    desired.setBrowserName("chrome");
    assertThat(getBestMatch(desired, list), equalTo(chrome));

    desired.setBrowserName("firefox");
    assertThat(getBestMatch(desired, list), equalTo(firefox));

    desired.setBrowserName("opera");
    assertThat(getBestMatch(desired, list), equalTo(opera));
  }

  @Test
  public void shouldPickAnyIfPlatformChoicesAreAnyOrWindowsAndDesireLinux() {
    Capabilities any = capabilities("firefox", "", Platform.ANY, true);
    Capabilities windows = capabilities("firefox", "", Platform.WINDOWS, true);
    Capabilities linux = capabilities("firefox", "", Platform.LINUX, true);

    assertThat(getBestMatch(linux, Lists.newArrayList(any, windows)), equalTo(any));
    // Registration order should not matter.
    assertThat(getBestMatch(linux, Lists.newArrayList(windows, any)), equalTo(any));
  }

  @Test
  public void shouldPickWindowsIfPlatformChoiceIsAny() {
    Capabilities any = capabilities("internet explorer", "", Platform.ANY, true);
    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    assertThat(getBestMatch(any, Lists.newArrayList(windows)), equalTo(windows));
  }

  @Test
  public void shouldPickMostSpecificOperatingSystem() {
    Capabilities any = capabilities("internet explorer", "", Platform.ANY, true);
    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    Capabilities xp = capabilities("internet explorer", "", Platform.XP, true);
    Capabilities vista = capabilities("internet explorer", "", Platform.VISTA, true);

    List<Capabilities> list = newArrayList(any, windows, xp, vista);
    assertThat(getBestMatch(any, list), equalTo(any));
    assertThat(getBestMatch(windows, list), equalTo(windows));
    assertThat(getBestMatch(xp, list), equalTo(xp));
    assertThat(getBestMatch(vista, list), equalTo(vista));
  }

  @Test
  public void pickingWindowsFromVariousLists() {
    Capabilities any = capabilities("internet explorer", "", Platform.ANY, true);
    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    Capabilities xp = capabilities("internet explorer", "", Platform.XP, true);
    Capabilities vista = capabilities("internet explorer", "", Platform.VISTA, true);

    assertThat(getBestMatch(windows, newArrayList(any)), equalTo(any));
    assertThat(getBestMatch(windows, newArrayList(any, windows)), equalTo(windows));
    assertThat(getBestMatch(windows, newArrayList(windows, xp, vista)), equalTo(windows));
    assertThat(getBestMatch(windows, newArrayList(xp, vista)),
        anyOf(equalTo(xp), equalTo(vista)));
    assertThat(getBestMatch(windows, newArrayList(xp)), equalTo(xp));
    assertThat(getBestMatch(windows, newArrayList(vista)), equalTo(vista));
  }

  @Test
  public void pickingXpFromVariousLists() {
    Capabilities any = capabilities("internet explorer", "", Platform.ANY, true);
    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    Capabilities xp = capabilities("internet explorer", "", Platform.XP, true);
    Capabilities vista = capabilities("internet explorer", "", Platform.VISTA, true);

    assertThat(getBestMatch(xp, newArrayList(any)), equalTo(any));
    assertThat(getBestMatch(xp, newArrayList(any, windows)), equalTo(windows));
    assertThat(getBestMatch(xp, newArrayList(windows, xp, vista)), equalTo(xp));
    assertThat(getBestMatch(xp, newArrayList(windows, xp)), equalTo(xp));
    assertThat(getBestMatch(xp, newArrayList(xp, vista)), equalTo(xp));
    assertThat(getBestMatch(xp, newArrayList(xp)), equalTo(xp));
    assertThat(getBestMatch(xp, newArrayList(vista)), equalTo(vista));
  }

  @Test
  public void pickingVistaFromVariousLists() {
    Capabilities any = capabilities("internet explorer", "", Platform.ANY, true);
    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    Capabilities xp = capabilities("internet explorer", "", Platform.XP, true);
    Capabilities vista = capabilities("internet explorer", "", Platform.VISTA, true);

    assertThat(getBestMatch(vista, newArrayList(any)), equalTo(any));
    assertThat(getBestMatch(vista, newArrayList(any, windows)), equalTo(windows));
    assertThat(getBestMatch(vista, newArrayList(windows, xp, vista)), equalTo(vista));
    assertThat(getBestMatch(vista, newArrayList(windows, xp)), equalTo(windows));
    assertThat(getBestMatch(vista, newArrayList(xp, vista)), equalTo(vista));
    assertThat(getBestMatch(vista, newArrayList(xp)), equalTo(xp));
    assertThat(getBestMatch(vista, newArrayList(vista)), equalTo(vista));
  }

  @Test
  public void pickingUnixFromVariousLists() {
    Capabilities any = capabilities("firefox", "", Platform.ANY, true);
    Capabilities mac = capabilities("firefox", "", Platform.MAC, true);
    Capabilities unix = capabilities("firefox", "", Platform.UNIX, true);
    Capabilities linux = capabilities("firefox", "", Platform.LINUX, true);

    assertThat(getBestMatch(unix, newArrayList(any)), equalTo(any));
    assertThat(getBestMatch(unix, newArrayList(any, mac)), equalTo(any));
    assertThat(getBestMatch(unix, newArrayList(any, unix)), equalTo(unix));
    assertThat(getBestMatch(unix, newArrayList(any, unix, linux)), equalTo(unix));
    assertThat(getBestMatch(unix, newArrayList(unix, linux)), equalTo(unix));
    assertThat(getBestMatch(unix, newArrayList(linux)), equalTo(linux));
  }

  @Test
  public void pickingLinuxFromVariousLists() {
    Capabilities any = capabilities("firefox", "", Platform.ANY, true);
    Capabilities mac = capabilities("firefox", "", Platform.MAC, true);
    Capabilities unix = capabilities("firefox", "", Platform.UNIX, true);
    Capabilities linux = capabilities("firefox", "", Platform.LINUX, true);

    assertThat(getBestMatch(linux, newArrayList(any)), equalTo(any));
    assertThat(getBestMatch(linux, newArrayList(any, mac)), equalTo(any));
    assertThat(getBestMatch(linux, newArrayList(any, unix)), equalTo(unix));
    assertThat(getBestMatch(linux, newArrayList(any, unix, linux)), equalTo(linux));
    assertThat(getBestMatch(linux, newArrayList(unix, linux)), equalTo(linux));
    assertThat(getBestMatch(linux, newArrayList(linux)), equalTo(linux));
    assertThat(getBestMatch(linux, newArrayList(unix)), equalTo(unix));
  }

  @Test
  public void matchesByCapabilitiesProvided() {
    DesiredCapabilities sparse = new DesiredCapabilities();
    sparse.setBrowserName("firefox");

    Capabilities windows = capabilities("internet explorer", "", Platform.WINDOWS, true);
    Capabilities firefox = capabilities("firefox", "", Platform.WINDOWS, true);

    assertThat(getBestMatch(sparse, Lists.newArrayList(windows, firefox)),
        equalTo(firefox));

    sparse.setBrowserName("internet explorer");
    assertThat(getBestMatch(sparse, Lists.newArrayList(windows, firefox)),
        equalTo(windows));
  }

  private void assertGreaterThan(Capabilities a, Capabilities b) {
    assertThat(comparator.compare(a, b), greaterThan(0));
    assertThat(comparator.compare(b, a), lessThan(0));
  }

  private static Comparator<Capabilities> compareBy(Capabilities capabilities) {
    return new CapabilitiesComparator(capabilities);
  }

  private static Capabilities capabilities(String browserName, String version,
      Platform platform, boolean isJavaScriptEnabled) {
    DesiredCapabilities dc = new DesiredCapabilities(browserName, version, platform);
    dc.setJavascriptEnabled(isJavaScriptEnabled);
    return dc;
  }

}
