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

package org.openqa.selenium.bidi.protocol.browsingcontext;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class MozGetTreeParametersTest {

  @Test
  void sendsTheScopeUnderItsVendorWireKey() {
    MozGetTreeParameters params = new MozGetTreeParameters().setRoot("ctx1");
    params.setScope(MozScope.CHROME);

    assertThat(params.toMap()).isEqualTo(Map.of("root", "ctx1", "moz:scope", "chrome"));
  }

  @Test
  void omitsTheScopeWhenItIsNeverSet() {
    assertThat(new MozGetTreeParameters().toMap()).doesNotContainKey("moz:scope");
  }
}
