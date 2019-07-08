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

package org.openqa.selenium.devtools.storage;

import static org.openqa.selenium.devtools.ConverterFunctions.map;

import com.google.common.collect.ImmutableMap;
import com.google.common.reflect.TypeToken;

import org.openqa.selenium.devtools.Command;
import org.openqa.selenium.devtools.Event;
import org.openqa.selenium.devtools.storage.model.DomStorageItemAdded;
import org.openqa.selenium.devtools.storage.model.DomStorageItemRemoved;
import org.openqa.selenium.devtools.storage.model.DomStorageItemUpdated;
import org.openqa.selenium.devtools.storage.model.Item;
import org.openqa.selenium.devtools.storage.model.StorageId;

import java.util.List;
import java.util.Objects;

/**
 * Query and modify DOM storage.
 */
public class DOMStorage {

  private final static String DOMAIN_NAME = "DOMStorage";

  /**
   * Disables storage tracking, prevents storage events from being sent to the client.
   */
  public static Command<Void> disable() {
    return new Command<>(DOMAIN_NAME + ".disable", ImmutableMap.of());
  }

  /**
   * Enables storage tracking, storage events will now be delivered to the client.
   */
  public static Command<Void> enable() {
    return new Command<>(DOMAIN_NAME + ".enable", ImmutableMap.of());
  }

  public static Command<Void> clear(StorageId storageId) {
    Objects.requireNonNull(storageId, "storageId must be set.");
    return new Command<>(DOMAIN_NAME + ".clear", ImmutableMap.of("storageId", storageId));
  }

  public static Command<List<Item>> getDOMStorageItems(StorageId storageId) {
    Objects.requireNonNull(storageId, "storageId must be set.");
    return new Command<>(DOMAIN_NAME + ".getDOMStorageItems",
                         ImmutableMap.of("storageId", storageId),
                         map("entries", new TypeToken<List<Item>>() {
                         }.getType()));
  }

  public static Command<Void> removeDOMStorageItem(StorageId storageId, String key) {
    Objects.requireNonNull(storageId, "storageId must be set.");
    Objects.requireNonNull(key, "key must be set.");
    return new Command<>(DOMAIN_NAME + ".removeDOMStorageItem",
                         ImmutableMap.of("storageId", storageId, "key", key));
  }

  public static Command<Void> setDOMStorageItem(StorageId storageId, String key, String value) {
    Objects.requireNonNull(storageId, "storageId must be set.");
    Objects.requireNonNull(key, "key must be set.");
    Objects.requireNonNull(value, "value must be set.");
    return new Command<>(DOMAIN_NAME + ".setDOMStorageItem",
                         ImmutableMap.of("storageId", storageId, "key", key, "value", value));
  }

  public static Event<DomStorageItemAdded> domStorageItemAdded() {
    return new Event<>(DOMAIN_NAME + ".domStorageItemAdded",
                       map("storageId", DomStorageItemAdded.class));
  }

  public static Event<DomStorageItemRemoved> domStorageItemRemoved() {
    return new Event<>(DOMAIN_NAME + ".domStorageItemRemoved",
                       map("storageId", DomStorageItemRemoved.class));
  }

  public static Event<DomStorageItemUpdated> domStorageItemUpdated() {
    return new Event<>(DOMAIN_NAME + ".domStorageItemUpdated",
                       map("storageId", DomStorageItemUpdated.class));
  }

  public static Event<StorageId> domStorageItemsCleared() {
    return new Event<>(DOMAIN_NAME + ".domStorageItemsCleared",
                       map("storageId", StorageId.class));
  }

}
