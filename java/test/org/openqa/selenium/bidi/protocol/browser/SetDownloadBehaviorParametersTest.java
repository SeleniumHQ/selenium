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

package org.openqa.selenium.bidi.protocol.browser;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

@Tag("UnitTests")
class SetDownloadBehaviorParametersTest {

  // downloadBehavior is a required field the schema also marks nullable — null clears any
  // override, a legal, meaningful wire value (see the BiDi spec), not an omitted field. The
  // constructor already allows it; toMap() must not NPE by calling .toMap() on that null.
  @Test
  void toMapDoesNotThrowWhenTheRequiredNullableFieldIsNull() {
    SetDownloadBehaviorParameters params = new SetDownloadBehaviorParameters(null);

    Map<String, Object> map = params.toMap();

    assertThat(map).containsEntry("downloadBehavior", null);
  }

  @Test
  void toMapSerializesTheFieldNormallyWhenNonNull() {
    SetDownloadBehaviorParameters params =
        new SetDownloadBehaviorParameters(new DownloadBehavior.Denied("denied"));

    Map<String, Object> map = params.toMap();

    assertThat(map).containsEntry("downloadBehavior", Map.of("type", "denied"));
  }
}
