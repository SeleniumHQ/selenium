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

package org.openqa.selenium.edge;

import static org.assertj.core.api.Assertions.assertThat;

import org.assertj.core.api.Condition;
import org.junit.Test;
import org.junit.experimental.categories.Category;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.testing.UnitTests;

import java.util.Collections;

@Category(UnitTests.class)
public class EdgeDriverInfoTest {

  @Test
  public void canonicalCapabilitiesContainProperBrowserName() {
    Capabilities caps = new EdgeDriverInfo().getCanonicalCapabilities();
    assertThat(caps.getBrowserName()).isEqualTo(BrowserType.EDGE);
  }

  @Test
  public void isSupportingCapabilitiesWithProperBrowserNameOnly() {
    assertThat(new EdgeDriverInfo()).is(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE)));
  }

  @Test
  public void isNotSupportingEdgeHtml() {
    assertThat(new EdgeDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE,
                                  EdgeOptions.USE_CHROMIUM, false)));
  }

  @Test
  public void isSupportingEdgeWithExplicitlySetChromiumFlag() {
    assertThat(new EdgeDriverInfo()).is(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE,
                                  EdgeOptions.USE_CHROMIUM, true)));
  }

  @Test
  public void isNotSupportingFirefox() {
    assertThat(new EdgeDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX)));
  }

  @Test
  public void canDetectBrowserByVendorSpecificCapability() {
    assertThat(new EdgeDriverInfo()).is(supporting(
        new ImmutableCapabilities(EdgeOptions.CAPABILITY, Collections.emptyMap())));
    assertThat(new EdgeDriverInfo()).is(supporting(
        new ImmutableCapabilities("edgeOptions", Collections.emptyMap())));
  }

  @Test
  public void canRejectEdgeHtmlByVendorSpecificCapability() {
    assertThat(new EdgeDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(EdgeOptions.CAPABILITY, Collections.emptyMap(),
                                  EdgeOptions.USE_CHROMIUM, false)));
    assertThat(new EdgeDriverInfo()).isNot(supporting(
        new ImmutableCapabilities("edgeOptions", Collections.emptyMap(),
                                  EdgeOptions.USE_CHROMIUM, false)));
  }

  private Condition<EdgeDriverInfo> supporting(Capabilities capabilities) {
    return new Condition<>(info -> info.isSupporting(capabilities), "supporting " + capabilities);
  }
}