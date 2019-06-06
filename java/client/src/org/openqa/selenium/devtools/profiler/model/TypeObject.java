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

package org.openqa.selenium.devtools.profiler.model;

import org.openqa.selenium.Beta;
import org.openqa.selenium.json.JsonInput;

import java.util.Objects;

/**
 * Describes a type collected during runtime.EXPERIMENTAL
 */
@Beta
public class TypeObject {

  /**
   * Name of a type collected with type profiling.
   */
  private final String name;

  public TypeObject(String name) {
    Objects.requireNonNull(name, "name is require");
    this.name = name;
  }

  private static TypeObject fromJson(JsonInput input) {
    return new TypeObject(input.nextString());
  }

  public String getName() {
    return name;
  }

}
