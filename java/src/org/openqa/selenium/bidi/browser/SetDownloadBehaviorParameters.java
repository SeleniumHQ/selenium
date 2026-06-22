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

package org.openqa.selenium.bidi.browser;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.jspecify.annotations.Nullable;
import org.openqa.selenium.Beta;

@Beta
public class SetDownloadBehaviorParameters {
  private final Map<String, @Nullable Object> map = new HashMap<>();

  /**
   * Recommended to use BiDi-compliant constructor {@link
   * #SetDownloadBehaviorParameters(DownloadBehavior)} instead
   */
  public SetDownloadBehaviorParameters(
      @Nullable Boolean allowed, @Nullable String destinationFolder) {
    this(allowed, destinationFolder != null ? Paths.get(destinationFolder) : null);
  }

  /**
   * Recommended to use BiDi-compliant constructor {@link
   * #SetDownloadBehaviorParameters(DownloadBehavior)} instead
   */
  public SetDownloadBehaviorParameters(
      @Nullable Boolean allowed, @Nullable Path destinationFolder) {
    this(allowed == null ? null : new DownloadBehavior(allowed, destinationFolder));
  }

  public SetDownloadBehaviorParameters(@Nullable DownloadBehavior downloadBehavior) {
    if (downloadBehavior == null) {
      map.put("downloadBehavior", null);
    } else {
      map.put("downloadBehavior", downloadBehavior.toMap());
    }
  }

  public SetDownloadBehaviorParameters userContexts(List<String> userContexts) {
    map.put("userContexts", userContexts);
    return this;
  }

  public Map<String, @Nullable Object> toMap() {
    return map;
  }

  @Override
  public String toString() {
    return String.format("SetDownloadBehaviorParameters{%s}", map);
  }
}
