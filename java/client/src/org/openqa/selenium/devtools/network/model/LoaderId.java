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
 * Unique loader identifier
 */
public class LoaderId {

  private final String loaderId;

  LoaderId(String loaderId) {
    this.loaderId = Objects.requireNonNull(loaderId, "LoaderId must be set.");
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof LoaderId)) {
      return false;
    }

    LoaderId that = (LoaderId) o;
    return Objects.equals(loaderId, that.loaderId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(loaderId);
  }

  @Override
  public String toString() {
    return loaderId;
  }

}
