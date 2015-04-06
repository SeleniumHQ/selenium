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

package org.openqa.grid.internal.utils;
/**
 * Represents a string value in a json key
 */
public class JsonKey {
  private final String key;
  private final String asParam;

  public JsonKey(String key) {
    this.key = key;
    this.asParam = "-" + key;
  }

  public static JsonKey key(String key){
    return new JsonKey(key);
  }

  public boolean matches(String arg) {
     return (asParam.equalsIgnoreCase(arg));
  }

  public String getAsParam() {
    return asParam;
  }

  public String getKey() {
    return key;
  }
}
