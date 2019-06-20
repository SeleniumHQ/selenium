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
package org.openqa.selenium.devtools.target.model;

import org.openqa.selenium.Beta;

import java.util.Objects;

@Beta
public class BrowserContextID {

  private final String id;

  public BrowserContextID(String id) {
    this.id = Objects.requireNonNull(id, "Browser Context ID must be set.");
  }

  private static BrowserContextID fromJson(String id) {
    return new BrowserContextID(id);
  }

  @Override
  public boolean equals(Object o) {
    if (null != o && !(o instanceof BrowserContextID)) {
      return false;
    }
    BrowserContextID that = (BrowserContextID) o;
    return Objects.equals(id, that.id);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id);
  }

  @Override
  public String toString() {
    return id;
  }

  private String toJson() {
    return id;
  }

}
