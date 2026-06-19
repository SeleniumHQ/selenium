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

package org.openqa.selenium.bidi.network;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.openqa.selenium.internal.Require;

public class AddDataCollectorParameters {

  private final List<String> dataTypes = new ArrayList<>();
  private final long maxEncodedDataSize;
  private String collectorType = "blob";
  private List<String> contexts;
  private List<String> userContexts;

  public AddDataCollectorParameters(List<DataType> dataTypes, long maxEncodedDataSize) {
    Require.nonNull("Data types", dataTypes);
    if (maxEncodedDataSize <= 0) {
      throw new IllegalArgumentException("Max encoded data size must be positive");
    }

    dataTypes.forEach(dataType -> this.dataTypes.add(dataType.toString()));
    this.maxEncodedDataSize = maxEncodedDataSize;
  }

  public AddDataCollectorParameters collectorType(String collectorType) {
    this.collectorType = Require.nonNull("Collector type", collectorType);
    return this;
  }

  public AddDataCollectorParameters contexts(List<String> contexts) {
    this.contexts = Require.nonNull("Contexts", contexts);
    return this;
  }

  public AddDataCollectorParameters userContexts(List<String> userContexts) {
    this.userContexts = Require.nonNull("User contexts", userContexts);
    return this;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("dataTypes", dataTypes);
    map.put("maxEncodedDataSize", maxEncodedDataSize);

    if (collectorType != null) {
      map.put("collectorType", collectorType);
    }

    if (contexts != null && !contexts.isEmpty()) {
      map.put("contexts", contexts);
    }

    if (userContexts != null && !userContexts.isEmpty()) {
      map.put("userContexts", userContexts);
    }

    return Map.copyOf(map);
  }
}
