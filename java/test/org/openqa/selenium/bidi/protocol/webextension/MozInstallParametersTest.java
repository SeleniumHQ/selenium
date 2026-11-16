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

package org.openqa.selenium.bidi.protocol.webextension;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class MozInstallParametersTest {

  private static final ExtensionData EXTENSION = new ExtensionPath("path", "/tmp/ext");

  @Test
  void sendsVendorOptionsUnderTheirVendorWireKeys() {
    MozInstallParameters params =
        new MozInstallParameters(EXTENSION).setPermanent(true).setAllowPrivateBrowsing(false);

    assertThat(params.toMap())
        .containsEntry("moz:permanent", true)
        .containsEntry("moz:allowPrivateBrowsing", false)
        .containsKey("extensionData");
  }

  @Test
  void omitsVendorOptionsThatAreNeverSet() {
    assertThat(new MozInstallParameters(EXTENSION).toMap())
        .doesNotContainKey("moz:permanent")
        .doesNotContainKey("moz:allowPrivateBrowsing");
  }
}
