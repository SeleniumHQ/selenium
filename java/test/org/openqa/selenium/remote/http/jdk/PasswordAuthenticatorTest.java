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

package org.openqa.selenium.remote.http.jdk;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.PasswordAuthentication;
import org.junit.jupiter.api.Test;

class PasswordAuthenticatorTest {
  @Test
  void usernameAndPassword() {
    PasswordAuthentication authentication =
        new PasswordAuthenticator("bob:smith").getPasswordAuthentication();
    assertThat(authentication.getUserName()).isEqualTo("bob");
    assertThat(new String(authentication.getPassword())).isEqualTo("smith");
  }

  @Test
  void usernameWithoutPassword() {
    PasswordAuthentication authentication =
        new PasswordAuthenticator("bob").getPasswordAuthentication();
    assertThat(authentication.getUserName()).isEqualTo("bob");
    assertThat(new String(authentication.getPassword())).isEmpty();
  }
}
