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

public class DomStorageItemAdded {

  private StorageId storageId;

  private String key;

  private String newValue;

  private DomStorageItemAdded(StorageId storageId, String key, String newValue) {
    this.storageId = requireNonNull(storageId, "'storageId' is required for DomStorageItemAdded");
    this.key = requireNonNull(key, "'key' is required for DomStorageItemAdded");
    this.newValue = requireNonNull(newValue, "'newValue' is required for DomStorageItemAdded");
  }

  private static DomStorageItemAdded fromJson(JsonInput input) {
    StorageId storageId = input.read(StorageId.class);
    String key = null;
    String newValue = null;

    while (input.hasNext()) {

      switch (input.nextName()) {
        case "storageId":
          storageId = input.read(StorageId.class);
          break;

        case "key":
          key = input.nextString();
          break;

        case "newValue":
          newValue = input.nextString();
          break;

        default:
          input.skipValue();
          break;
      }
    }

    return new DomStorageItemAdded(storageId, key, newValue);
  }

  public StorageId getStorageId() {
    return storageId;
  }

  public String getKey() {
    return key;
  }

  public String getNewValue() {
    return newValue;
  }

  @Override
  public String toString() {
    return "DomStorageItemAdded{" +
           "storageId=" + storageId +
           ", key='" + key + '\'' +
           ", value='" + newValue + '\'' +
           '}';
  }

}
