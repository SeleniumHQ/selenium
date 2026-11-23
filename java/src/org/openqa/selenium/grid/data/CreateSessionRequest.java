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

package org.openqa.selenium.grid.data;

import static java.util.Collections.unmodifiableSet;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.openqa.selenium.Capabilities;
import org.openqa.selenium.ImmutableCapabilities;
import org.openqa.selenium.internal.Require;
import org.openqa.selenium.remote.Dialect;

public class CreateSessionRequest {

  private final Set<Dialect> downstreamDialects;
  private final Capabilities capabilities;
  private final Map<String, Object> metadata;

  // Constructor parameter names are used as JSON field names.
  public CreateSessionRequest(
      Set<Dialect> downstreamDialects,
      Capabilities desiredCapabilities,
      Map<String, Object> metadata) {
    this.downstreamDialects =
        unmodifiableSet(new HashSet<>(Require.nonNull("Downstream dialects", downstreamDialects)));
    this.capabilities =
        ImmutableCapabilities.copyOf(Require.nonNull("Capabilities", desiredCapabilities));
    this.metadata = Map.copyOf(Require.nonNull("Metadata", metadata));
  }

  public Set<Dialect> getDownstreamDialects() {
    return downstreamDialects;
  }

  public Capabilities getDesiredCapabilities() {
    return capabilities;
  }

  public Map<String, Object> getMetadata() {
    return metadata;
  }

  public String toString() {
    return String.format("<CreateSessionRequest with %s>", capabilities);
  }
}
