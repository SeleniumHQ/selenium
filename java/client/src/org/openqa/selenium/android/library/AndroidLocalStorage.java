/*
Copyright 2011 Selenium committers

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

package org.openqa.selenium.android.library;

import org.openqa.selenium.html5.LocalStorage;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

class AndroidLocalStorage implements LocalStorage {
  private final AndroidWebDriver driver;

  /* package */ AndroidLocalStorage(AndroidWebDriver driver) {
    this.driver = driver;
  }

  public String getItem(String key) {
    return (String) driver.executeAtom(AndroidAtoms.GET_LOCAL_STORAGE_ITEM.getValue(), key);
  }

  public Set<String> keySet() {
    return new HashSet<String>
        ((Collection<String>) driver.executeAtom(AndroidAtoms.GET_LOCAL_STORAGE_KEYS.getValue()));
  }

  public void setItem(String key, String value) {
    driver.executeAtom(AndroidAtoms.SET_LOCAL_STORAGE_ITEM.getValue(), key, value);
  }

  public String removeItem(String key) {
    return (String) driver.executeAtom(AndroidAtoms.REMOVE_LOCAL_STORAGE_ITEM.getValue(), key);
  }

  public void clear() {
    driver.executeAtom(AndroidAtoms.CLEAR_LOCAL_STORAGE.getValue());
  }

  public int size() {
    return ((Long) driver.executeAtom(AndroidAtoms.GET_LOCAL_STORAGE_SIZE.getValue())).intValue();
  }
}
