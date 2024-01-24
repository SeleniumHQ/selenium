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

public class AddInterceptParameters {

  private final List<String> phases = new ArrayList<>();

  private final List<Map<String, String>> urlPatterns = new ArrayList<>();

  public AddInterceptParameters(InterceptPhase phase) {
    this.phases.add(phase.toString());
  }

  public AddInterceptParameters(List<InterceptPhase> phases) {
    phases.forEach(phase -> this.phases.add(phase.toString()));
  }

  public AddInterceptParameters urlPattern(UrlPattern pattern) {
    this.urlPatterns.add(pattern.toMap());
    return this;
  }

  public AddInterceptParameters urlPatterns(List<UrlPattern> patterns) {
    patterns.forEach(pattern -> this.urlPatterns.add(pattern.toMap()));
    return this;
  }

  public AddInterceptParameters urlStringPattern(String pattern) {
    this.urlPatterns.add(Map.of("type", "string", "pattern", pattern));
    return this;
  }

  public AddInterceptParameters urlStringPatterns(List<String> patterns) {
    patterns.forEach(pattern -> this.urlPatterns.add(Map.of("type", "string", "pattern", pattern)));
    return this;
  }

  public Map<String, Object> toMap() {
    Map<String, Object> map = new HashMap<>();
    map.put("phases", phases);
    if (!urlPatterns.isEmpty()) {
      map.put("urlPatterns", urlPatterns);
    }
    return map;
  }
}
