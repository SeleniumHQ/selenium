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

package org.openqa.selenium.webextension;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class FirefoxWebExtensionOptionsTest {

  @Test
  void isEmptyByDefault() {
    FirefoxWebExtensionOptions options = new FirefoxWebExtensionOptions();
    assertThat(options.isEmpty()).isTrue();
    assertThat(options.isPermanent()).isEmpty();
    assertThat(options.allowsPrivateBrowsing()).isEmpty();
  }

  @Test
  void aPlainBaseOptionsIsAlwaysEmpty() {
    assertThat(new WebExtensionOptions().isEmpty()).isTrue();
  }

  @Test
  void carriesTheValuesThatWereSet() {
    FirefoxWebExtensionOptions options =
        new FirefoxWebExtensionOptions().permanent(true).allowPrivateBrowsing(false);

    assertThat(options.isPermanent()).contains(true);
    assertThat(options.allowsPrivateBrowsing()).contains(false);
    assertThat(options.isEmpty()).isFalse();
  }

  @Test
  void isImmutable() {
    FirefoxWebExtensionOptions base = new FirefoxWebExtensionOptions();
    FirefoxWebExtensionOptions withPermanent = base.permanent(true);

    assertThat(base.isPermanent()).isEmpty();
    assertThat(withPermanent).isNotSameAs(base);
  }
}
