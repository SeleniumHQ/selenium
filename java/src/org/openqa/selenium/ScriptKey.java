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

package org.openqa.selenium;

import java.util.Objects;
import org.openqa.selenium.internal.Require;

public class ScriptKey {

  private final String identifier;

  public ScriptKey(String identifier) {
    this.identifier = Require.nonNull("Script ID", identifier);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof ScriptKey)) {
      return false;
    }
    ScriptKey that = (ScriptKey) o;
    return Objects.equals(this.identifier, that.identifier);
  }

  @Override
  public int hashCode() {
    return Objects.hash(identifier);
  }

  private String toJson() {
    return identifier;
  }

  private static ScriptKey fromJson(String identifier) {
    return new ScriptKey(identifier);
  }
}
