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

/**
 * A description of mixed content (HTTP resources on HTTPS pages), as defined by
 * https://www.w3.org/TR/mixed-content/#categories
 */
public enum MixedContentType {

  blockable("blockable"),
  optionallyBlockable("optionally-blockable"),
  none("none");

  private String type;

  MixedContentType(String type) {
    this.type = type;
  }

  public String getType() {
    return type;
  }

  public static MixedContentType fromString(String s) {
    for (MixedContentType m : MixedContentType.values()) {
      if (m.getType().equalsIgnoreCase(s)) {
        return m;
      }
    }
    return null;
  }

}
