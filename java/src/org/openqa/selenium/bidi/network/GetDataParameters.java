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

import java.util.HashMap;
import java.util.Map;
import org.openqa.selenium.internal.Require;

public class GetDataParameters {

  private final DataType dataType;
  private final String request;
  private String collector;
  private boolean disown = false;

  public GetDataParameters(DataType dataType, String request) {
    this.dataType = Require.nonNull("Data type", dataType);
    this.request = Require.nonNull("Request", request);
  }

  public GetDataParameters collector(String collector) {
    this.collector = Require.nonNull("Collector", collector);
    return this;
  }

  public GetDataParameters disown(boolean disown) {
    this.disown = disown;
    return this;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("dataType", dataType.toString());
    map.put("request", request);

    if (collector != null) {
      map.put("collector", collector);
    }

    map.put("disown", disown);

    return Map.copyOf(map);
  }
}
