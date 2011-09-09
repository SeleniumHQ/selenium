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

package org.openqa.selenium.android.html5;

import android.util.Log;

import org.openqa.selenium.android.Atoms;
import org.openqa.selenium.android.AndroidDriver;
import org.openqa.selenium.html5.SessionStorage;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class AndroidSessionStorage implements SessionStorage {
  private final AndroidDriver driver;
  private final Atoms atoms;

  public AndroidSessionStorage(AndroidDriver driver) {
    this.driver = driver;
    this.atoms = Atoms.getInstance();
  }

  public String getItem(String key) {
    return (String) driver.executeAtom(atoms.getSessionStorageItemJs, false, key);
  }

  public Set<String> keySet() {
    return new HashSet<String>
        ((Collection<String>) driver.executeAtom(atoms.getSessionStorageKeysJs, false));
  }

  public void setItem(String key, String value) {
    driver.executeAtom(atoms.setSessionStorageItemJs, false, key, value);
  }

  public String removeItem(String key) {
    return (String) driver.executeAtom(atoms.removeSessionStorageItemJs, false, key);
  }

  public void clear() {
    driver.executeAtom(atoms.clearSessionStorageJs, false);
  }

  public int size() {
    return ((Long) driver.executeAtom(atoms.getSessionStorageSizeJs, false)).intValue();
  }
}
