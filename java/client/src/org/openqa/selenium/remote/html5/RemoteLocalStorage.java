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

package org.openqa.selenium.remote.html5;

import com.google.common.collect.ImmutableMap;

import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.ExecuteMethod;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Executes the commands to access HTML5 localStorage on the remote webdriver server.
 */
public class RemoteLocalStorage implements LocalStorage {
  private final ExecuteMethod executeMethod;

  public RemoteLocalStorage(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public String getItem(String key) {
    Map<String, String> args = ImmutableMap.of("key", key);
    return (String) executeMethod.execute(DriverCommand.GET_LOCAL_STORAGE_ITEM, args);
  }

  @Override
  public Set<String> keySet() {
    @SuppressWarnings("unchecked")
    Collection<String> result = (Collection<String>)
        executeMethod.execute(DriverCommand.GET_LOCAL_STORAGE_KEYS, null);
    return new HashSet<>(result);
  }

  @Override
  public void setItem(String key, String value) {
    Map<String, String> args = ImmutableMap.of("key", key, "value", value);
    executeMethod.execute(DriverCommand.SET_LOCAL_STORAGE_ITEM, args);
  }

  @Override
  public String removeItem(String key) {
    Map<String, String> args = ImmutableMap.of("key", key);
    return (String) executeMethod.execute(DriverCommand.REMOVE_LOCAL_STORAGE_ITEM, args);
  }

  @Override
  public void clear() {
    executeMethod.execute(DriverCommand.CLEAR_LOCAL_STORAGE, null);
  }

  @Override
  public int size() {
    Object response = executeMethod.execute(DriverCommand.GET_LOCAL_STORAGE_SIZE, null);
    return Integer.parseInt(response.toString());
  }
}
