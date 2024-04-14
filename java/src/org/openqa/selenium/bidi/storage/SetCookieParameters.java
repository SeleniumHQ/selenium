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
package org.openqa.selenium.bidi.storage;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public class SetCookieParameters {
  private final PartialCookie cookie;
  private Optional<PartitionDescriptor> partitionDescriptor = Optional.empty();

  public SetCookieParameters(PartialCookie cookie) {
    this.cookie = cookie;
  }

  public SetCookieParameters(PartialCookie cookie, PartitionDescriptor partitionDescriptor) {
    this.cookie = cookie;
    this.partitionDescriptor = Optional.of(partitionDescriptor);
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("cookie", cookie.toMap());
    partitionDescriptor.ifPresent(descriptor -> map.put("partition", descriptor));

    return map;
  }
}
