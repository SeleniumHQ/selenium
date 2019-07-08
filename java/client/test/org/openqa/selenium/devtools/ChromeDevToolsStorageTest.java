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

package org.openqa.selenium.devtools;

import static org.openqa.selenium.devtools.storage.DOMStorage.clear;
import static org.openqa.selenium.devtools.storage.DOMStorage.disable;
import static org.openqa.selenium.devtools.storage.DOMStorage.domStorageItemAdded;
import static org.openqa.selenium.devtools.storage.DOMStorage.domStorageItemRemoved;
import static org.openqa.selenium.devtools.storage.DOMStorage.domStorageItemUpdated;
import static org.openqa.selenium.devtools.storage.DOMStorage.domStorageItemsCleared;
import static org.openqa.selenium.devtools.storage.DOMStorage.enable;
import static org.openqa.selenium.devtools.storage.DOMStorage.getDOMStorageItems;
import static org.openqa.selenium.devtools.storage.DOMStorage.removeDOMStorageItem;
import static org.openqa.selenium.devtools.storage.DOMStorage.setDOMStorageItem;

import org.junit.Assert;
import org.junit.Test;
import org.openqa.selenium.devtools.storage.model.Item;
import org.openqa.selenium.devtools.storage.model.StorageId;

import java.util.List;

public class ChromeDevToolsStorageTest extends ChromeDevToolsTestBase {

  @Test
  public void addAndGetStorageItem() {

    devTools.send(enable());

    devTools.addListener(domStorageItemAdded(), domStorageItemAdded -> {
      Assert.assertNotNull(domStorageItemAdded.getStorageId());
      Assert.assertEquals("testKey", domStorageItemAdded.getKey());
      Assert.assertEquals("testValue", domStorageItemAdded.getNewValue());
    });

    chromeDriver.get(appServer.whereIsSecure("devToolsDomStorage.html"));

    StorageId storageId = new StorageId(chromeDriver.getCurrentUrl().split("/common")[0], true);

    devTools.send(setDOMStorageItem(storageId, "testKey", "testValue"));

    List<Item> storageItems = devTools.send(getDOMStorageItems(storageId));
    Assert.assertEquals(1, storageItems.size());
    Assert.assertEquals("testKey", storageItems.get(0).getKey());
    Assert.assertEquals("testValue", storageItems.get(0).getValue());

  }

  @Test
  public void removeStorageItem() {

    devTools.send(enable());

    devTools.addListener(domStorageItemRemoved(), domStorageItemRemoved -> {
      Assert.assertNotNull(domStorageItemRemoved.getStorageId());
      Assert.assertEquals("testKey", domStorageItemRemoved.getKey());
    });

    chromeDriver.get(appServer.whereIsSecure("devToolsDomStorage.html"));

    StorageId storageId = new StorageId(chromeDriver.getCurrentUrl().split("/common")[0], true);

    devTools.send(setDOMStorageItem(storageId, "testKey", "testValue"));

    devTools.send(removeDOMStorageItem(storageId, "testKey"));

  }

  @Test
  public void updateStorageItem() {

    devTools.send(enable());

    devTools.addListener(domStorageItemUpdated(), domStorageItemUpdated -> {
      Assert.assertNotNull(domStorageItemUpdated.getStorageId());
      Assert.assertEquals("testKey", domStorageItemUpdated.getKey());
      Assert.assertEquals("testValue", domStorageItemUpdated.getOldValue());
      Assert.assertEquals("testValue2", domStorageItemUpdated.getNewValue());
    });

    chromeDriver.get(appServer.whereIsSecure("devToolsDomStorage.html"));

    StorageId storageId = new StorageId(chromeDriver.getCurrentUrl().split("/common")[0], true);

    devTools.send(setDOMStorageItem(storageId, "testKey", "testValue"));
    devTools.send(setDOMStorageItem(storageId, "testKey", "testValue2"));

  }

  @Test
  public void clearStorageItemsAndDisable() {

    devTools.send(enable());

    devTools.addListener(domStorageItemsCleared(), Assert::assertNotNull);

    chromeDriver.get(appServer.whereIsSecure("devToolsDomStorage.html"));

    StorageId storageId = new StorageId(chromeDriver.getCurrentUrl().split("/common")[0], true);

    devTools.send(setDOMStorageItem(storageId, "testKey", "testValue"));
    devTools.send(clear(storageId));

    devTools.send(disable());

  }

}
