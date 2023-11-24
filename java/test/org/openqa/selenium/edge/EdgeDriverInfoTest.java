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
import static org.openqa.selenium.remote.Browser.EDGE;
import static org.openqa.selenium.remote.Browser.FIREFOX;

import java.util.Collections;
import org.assertj.core.api.Condition;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.remote.CapabilityType;

@Tag("UnitTests")
class EdgeDriverInfoTest {

  @Test
  void canonicalCapabilitiesContainProperBrowserName() {
    Capabilities caps = new EdgeDriverInfo().getCanonicalCapabilities();
    assertThat(caps.getBrowserName()).isEqualTo(EDGE.browserName());
  }

  @Test
  void isSupportingCapabilitiesWithProperBrowserNameOnly() {
    assertThat(new EdgeDriverInfo())
        .is(supporting(new ImmutableCapabilities(CapabilityType.BROWSER_NAME, EDGE.browserName())));
  }

  @Test
  void isNotSupportingFirefox() {
    assertThat(new EdgeDriverInfo())
        .isNot(
            supporting(
                new ImmutableCapabilities(CapabilityType.BROWSER_NAME, FIREFOX.browserName())));
  }

  @Test
  void canDetectBrowserByVendorSpecificCapability() {
    assertThat(new EdgeDriverInfo())
        .is(supporting(new ImmutableCapabilities(EdgeOptions.CAPABILITY, Collections.emptyMap())));
    assertThat(new EdgeDriverInfo())
        .is(supporting(new ImmutableCapabilities("edgeOptions", Collections.emptyMap())));
  }

  private Condition<EdgeDriverInfo> supporting(Capabilities capabilities) {
    return new Condition<>(info -> info.isSupporting(capabilities), "supporting " + capabilities);
  }
}
