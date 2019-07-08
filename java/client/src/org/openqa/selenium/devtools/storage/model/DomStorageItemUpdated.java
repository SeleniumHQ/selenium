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

import org.openqa.selenium.json.JsonInput;

public class DomStorageItemUpdated {

  private StorageId storageId;

  private String key;

  private String oldValue;

  private String newValue;

  private DomStorageItemUpdated(StorageId storageId, String key, String oldValue, String newValue) {
    this.storageId = requireNonNull(storageId, "'storageId' is required for DomStorageItemUpdated");
    this.key = requireNonNull(key, "'key' is required for DomStorageItemUpdated");
    this.oldValue = requireNonNull(oldValue, "'oldValue' is required for DomStorageItemUpdated");
    this.newValue = requireNonNull(newValue, "'newValue' is required for DomStorageItemUpdated");
  }

  private static DomStorageItemUpdated fromJson(JsonInput input) {
    StorageId storageId = input.read(StorageId.class);
    String key = null;
    String oldValue = null;
    String newValue = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "storageId":
          storageId = input.read(StorageId.class);
          break;

        case "key":
          key = input.nextString();
          break;

        case "oldValue":
          oldValue = input.nextString();
          break;

        case "newValue":
          newValue = input.nextString();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new DomStorageItemUpdated(storageId, key, oldValue, newValue);
  }

  public StorageId getStorageId() {
    return storageId;
  }

  public String getKey() {
    return key;
  }

  public String getOldValue() {
    return oldValue;
  }

  public String getNewValue() {
    return newValue;
  }

  @Override
  public String toString() {
    return "DomStorageItemUpdated{" +
           "storageId=" + storageId +
           ", key='" + key + '\'' +
           ", oldValue='" + oldValue + '\'' +
           ", newValue='" + newValue + '\'' +
           '}';
  }

}
