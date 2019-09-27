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

package org.openqa.selenium.remote.server.handler;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriverException;

import java.util.Map;

public class BySelector {
  public By pickFromJsonParameters(Map<String, Object> allParameters) {
    String method = (String) allParameters.get("using");
    String selector = (String) allParameters.get("value");

    return pickFrom(method, selector);
  }

  public By pickFrom(String method, String selector) {
    if ("class name".equals(method)) {
      return By.className(selector);
    } else if ("css selector".equals(method)) {
      return By.cssSelector(selector);
    } else if ("id".equals(method)) {
      return By.id(selector);
    } else if ("link text".equals(method)) {
      return By.linkText(selector);
    } else if ("partial link text".equals(method)) {
      return By.partialLinkText(selector);
    } else if ("name".equals(method)) {
      return By.name(selector);
    } else if ("tag name".equals(method)) {
      return By.tagName(selector);
    } else if ("xpath".equals(method)) {
      return By.xpath(selector);
    } else {
      throw new WebDriverException("Cannot find matching element locator to: " + method);
    }
  }
}
