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

import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.remote.ExecuteMethod;

/**
 * Provides remote access to the {@link WebStorage} API.
 */
public class RemoteWebStorage implements WebStorage {

  private final ExecuteMethod executeMethod;

  public RemoteWebStorage(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  @Override
  public LocalStorage getLocalStorage() {
    return new RemoteLocalStorage(executeMethod);
  }

  @Override
  public SessionStorage getSessionStorage() {
    return new RemoteSessionStorage(executeMethod);
  }
}
