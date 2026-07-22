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

package org.openqa.selenium.bidi.protocol.session;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.json.Json;

@Tag("UnitTests")
class UserPromptHandlerTest {

  @Test
  void wireKeyDefaultDeserializesIntoTheEscapedDefault_Field() {
    // "default" is a Java reserved word, so the generator escapes the Java identifier to
    // "default_" while keeping the wire key "default" — this must still round-trip correctly.
    Json json = new Json();
    UserPromptHandler handler =
        json.toType("{\"default\":\"accept\",\"alert\":\"dismiss\"}", UserPromptHandler.class);

    assertThat(handler.getDefault_()).isPresent();
    assertThat(handler.getDefault_().get()).isEqualTo(UserPromptHandlerType.ACCEPT);
    assertThat(handler.getAlert()).isPresent();
    assertThat(handler.getAlert().get()).isEqualTo(UserPromptHandlerType.DISMISS);
  }
}
