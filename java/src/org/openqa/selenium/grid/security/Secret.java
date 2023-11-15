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

package org.openqa.selenium.grid.security;

import java.util.Objects;
import org.openqa.selenium.internal.Require;

public class Secret {

  private final String secret;

  public Secret(String secret) {
    this.secret = Require.nonNull("Secret", secret);
  }

  public static boolean matches(Secret first, Secret second) {
    if (first == null) {
      return second == null;
    }

    return first.matches(second);
  }

  public boolean matches(Secret other) {
    if (other == null) {
      return false;
    }

    return secret.equals(other.secret);
  }

  public String encode() {
    return secret;
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Secret)) {
      return false;
    }

    Secret that = (Secret) o;
    return Objects.equals(this.secret, that.secret);
  }

  @Override
  public int hashCode() {
    return Objects.hash(secret);
  }

  private String toJson() {
    return secret;
  }

  private static Secret fromJson(String secret) {
    return new Secret(secret);
  }
}
