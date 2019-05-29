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

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.openqa.selenium.Beta;
import org.openqa.selenium.devtools.DevToolsException;
import org.openqa.selenium.json.JsonInput;
import org.openqa.selenium.json.JsonInputConverter;

/**
 * Source offset and types for a parameter or return value.EXPERIMENTAL
 */
@Beta
public class TypeProfileEntry {

  /**
   * Source offset of the parameter or end of function for return values.
   */
  private int offset;
  /**
   * The types for this parameter or return value.
   */
  private List<TypeObject> types;


  public TypeProfileEntry(int offset,
    List<TypeObject> types) {
    this.setOffset(offset);
    this.setTypes(types);
  }

  public static TypeProfileEntry fromJson(JsonInput input) {
    int offset = JsonInputConverter.extractInt(input);
    List<TypeObject> types = null;
    while (input.hasNext()) {
      switch (input.nextName()) {
        case "types":
          types = new ArrayList<>();
          input.beginArray();
          while (input.hasNext()) {
            types.add(TypeObject.fromJson(input));
          }
          input.endArray();
          break;
        default:
          input.skipValue();
          break;
      }
    }
    return new TypeProfileEntry(offset, types);
  }

  public int getOffset() {
    return offset;
  }

  public void setOffset(int offset) {
    this.offset = offset;
  }

  public List<TypeObject> getTypes() {
    return types;
  }

  public void setTypes(List<TypeObject> types) {
    Objects.requireNonNull(types, "types is require");
    if (types.isEmpty()) {
      throw new DevToolsException("types is require");
    }
    this.types = types;
  }
}
