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

package org.openqa.selenium.devtools.storage.model;

import static java.util.Objects.requireNonNull;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.json.JsonInput;

import java.util.Map;
import java.util.Objects;

/**
 * DOM Storage identifier.
 */
public class StorageId {

  /**
   * Security origin for the storage
   */
  private String securityOrigin;

  /**
   * Whether the storage is local storage (not session storage)
   */
  private boolean isLocalStorage;

  public StorageId(String securityOrigin, boolean isLocalStorage) {
    this.securityOrigin =
        requireNonNull(securityOrigin, "'securityOrigin' is mandatory for StorageId");
    this.isLocalStorage = isLocalStorage;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    StorageId storageId = (StorageId) o;
    return isLocalStorage == storageId.isLocalStorage &&
           Objects.equals(securityOrigin, storageId.securityOrigin);
  }

  @Override
  public int hashCode() {

    return Objects.hash(securityOrigin, isLocalStorage);
  }

  @Override
  public String toString() {
    return "StorageId{" +
           "securityOrigin='" + securityOrigin + '\'' +
           ", isLocalStorage=" + isLocalStorage +
           '}';
  }

  private Map<String, Object> toJson() {
    return ImmutableMap.of(
        "securityOrigin", securityOrigin,
        "isLocalStorage", isLocalStorage);
  }

  private static StorageId fromJson(JsonInput input) {
    String securityOrigin = null;
    boolean isLocalStorage = false;

    input.beginObject();

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "securityOrigin":
          securityOrigin = input.nextString();
          break;

        case "isLocalStorage":
          isLocalStorage = input.nextBoolean();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    input.endObject();

    return new StorageId(securityOrigin, isLocalStorage);
  }

}
