/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

import java.util.Map;
import java.util.Set;

/**
 * Represents web storage object associated with a list of key/value pairs.
 */
public class Storage {
  private final Map<String, Object> store;
  
  public Storage(Map<String, Object> store) {
    this.store = store;
  }
  
  public int size() {
    return store.size();
  }
  
  /**
   * Note: Webkit only supports strings items.
   * 
   * @param key
   * @return the value associated to the current key. If the key does not
   *     exist, this will return null.
   */
  public Object getItem(String key) {
    return store.get(key);
  }
  
  public Set<String> keySet() {
    return store.keySet();
  }
}
