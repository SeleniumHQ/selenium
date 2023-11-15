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

package org.openqa.selenium.remote;

import static java.util.Collections.singletonMap;
import static org.openqa.selenium.remote.Dialect.W3C;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENTS_FROM_SHADOW_ROOT;
import static org.openqa.selenium.remote.DriverCommand.FIND_ELEMENT_FROM_SHADOW_ROOT;

import java.util.List;
import java.util.Map;
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WrapsDriver;
import org.openqa.selenium.internal.Require;

// Note: we want people to code against the SearchContext API, so we keep this class package private
class ShadowRoot implements SearchContext, WrapsDriver {
  private final RemoteWebDriver parent;
  private final String id;

  ShadowRoot(RemoteWebDriver parent, String id) {
    this.parent = Require.nonNull("Owning remote webdriver", parent);
    this.id = Require.nonNull("Shadow root ID", id);
  }

  @Override
  public List<WebElement> findElements(By by) {
    return parent.findElements(
        this,
        (using, value) -> FIND_ELEMENTS_FROM_SHADOW_ROOT(id, using, String.valueOf(value)),
        by);
  }

  @Override
  public WebElement findElement(By by) {
    return parent.findElement(
        this,
        (using, value) -> FIND_ELEMENT_FROM_SHADOW_ROOT(id, using, String.valueOf(value)),
        by);
  }

  @Override
  public WebDriver getWrappedDriver() {
    return parent;
  }

  public String getId() {
    return this.id;
  }

  private Map<String, Object> toJson() {
    return singletonMap(W3C.getShadowRootElementKey(), id);
  }
}
