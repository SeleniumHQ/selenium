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

package org.openqa.selenium.edgehtml;

import static org.assertj.core.api.Assertions.assertThat;

import org.assertj.core.api.Condition;
import org.junit.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.BrowserType;
import org.openqa.selenium.remote.CapabilityType;

import java.util.Collections;

public class EdgeHtmlDriverInfoTest {

  @Test
  public void canonicalCapabilitiesContainProperBrowserName() {
    Capabilities caps = new EdgeHtmlDriverInfo().getCanonicalCapabilities();
    assertThat(caps.getBrowserName()).isEqualTo(BrowserType.EDGE);
  }

  @Test
  public void isNotSupportingCapabilitiesWithBrowserNameOnly() {
    assertThat(new EdgeHtmlDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE)));
  }

  @Test
  public void isSupportingEdgeHtml() {
    assertThat(new EdgeHtmlDriverInfo()).is(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE,
                                  EdgeHtmlOptions.USE_CHROMIUM, false)));
  }

  @Test
  public void isNotSupportingEdgeWithExplicitlySetChromiumFlag() {
    assertThat(new EdgeHtmlDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.EDGE,
                                  EdgeHtmlOptions.USE_CHROMIUM, true)));
  }

  @Test
  public void isNotSupportingFirefox() {
    assertThat(new EdgeHtmlDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(CapabilityType.BROWSER_NAME, BrowserType.FIREFOX)));
  }

  @Test
  public void canDetectEdgeHtmlByVendorSpecificCapability() {
    assertThat(new EdgeHtmlDriverInfo()).is(supporting(
        new ImmutableCapabilities(EdgeHtmlOptions.CAPABILITY, Collections.emptyMap(),
                                  EdgeHtmlOptions.USE_CHROMIUM, false)));
    assertThat(new EdgeHtmlDriverInfo()).is(supporting(
        new ImmutableCapabilities("edgeOptions", Collections.emptyMap(),
                                  EdgeHtmlOptions.USE_CHROMIUM, false)));
  }

  @Test
  public void rejectsCapabilitiesWithVendorSpecificCapabilityButWithoutChromiumFlag() {
    assertThat(new EdgeHtmlDriverInfo()).isNot(supporting(
        new ImmutableCapabilities(EdgeHtmlOptions.CAPABILITY, Collections.emptyMap())));
    assertThat(new EdgeHtmlDriverInfo()).isNot(supporting(
        new ImmutableCapabilities("edgeOptions", Collections.emptyMap())));
  }

  private Condition<EdgeHtmlDriverInfo> supporting(Capabilities capabilities) {
    return new Condition<>(info -> info.isSupporting(capabilities), "supporting " + capabilities);
  }
}