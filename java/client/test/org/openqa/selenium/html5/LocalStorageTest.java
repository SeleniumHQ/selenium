/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.html5;

import org.openqa.selenium.AbstractDriverTestCase;

import java.util.Set;

public class LocalStorageTest extends AbstractDriverTestCase {
  public void testLocalStorageSetAndGetItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    assertEquals("Local Storage isn't empty.", 0, local.size());

    local.setItem("FOO", "BAR");
    assertEquals("BAR", local.getItem("FOO"));

    local.setItem("FOO1", "BAR1");
    assertEquals("BAR1", local.getItem("FOO1"));
    assertEquals(2, local.size());

    local.clear();
    assertEquals(0, local.size());
  }

  public void testLocalStorageKeySet() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");

    Set<String> keySet = local.keySet();
    assertTrue(keySet.size() == 3);
    assertTrue(keySet.contains("FOO1"));
    assertTrue(keySet.contains("FOO2"));
    assertTrue(keySet.contains("FOO3"));

    local.clear();
    assertTrue(local.keySet().isEmpty());
  }

  public void testClearLocalStorage() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.setItem("FOO1", "BAR1");
    local.setItem("FOO2", "BAR2");
    local.setItem("FOO3", "BAR3");
    assertEquals(3, local.size());

    local.clear();
    assertEquals(0, local.size());
  }

  public void testLocalStorageRemoveItem() {
    if (!(driver instanceof WebStorage)) {
      return;
    }
    driver.get(pages.html5Page);

    LocalStorage local = ((WebStorage) driver).getLocalStorage();
    local.clear();
    local.setItem("FOO", "BAR");
    assertEquals(1, local.size());
    String removedItemValue = local.removeItem("FOO");
    assertEquals("BAR", removedItemValue);
    assertEquals(0, local.size());
    local.clear();
  }
}
