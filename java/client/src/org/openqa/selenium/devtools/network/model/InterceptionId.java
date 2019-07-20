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

package org.openqa.selenium.devtools.network.model;

import java.util.Objects;

/**
 * Unique intercepted request identifier
 */
public class InterceptionId {

  private final String interceptionId;

  public InterceptionId(String interceptionId) {
    this.interceptionId = Objects.requireNonNull(interceptionId, "InterceptionId must be set.");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof InterceptionId)) {
      return false;
    }

    InterceptionId that = (InterceptionId) o;
    return Objects.equals(interceptionId, that.interceptionId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(interceptionId);
  }

  @Override
  public String toString() {
    return interceptionId;
  }

}
