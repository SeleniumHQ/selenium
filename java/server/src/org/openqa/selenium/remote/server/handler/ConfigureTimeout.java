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

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.remote.server.Session;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

public class ConfigureTimeout extends WebDriverHandler<Void> {

  private static final String IMPLICIT = "implicit";
  private static final String PAGE_LOAD = "page load";
  private static final String SCRIPT = "script";
  private static final List<String> knownTypes = Arrays.asList(IMPLICIT, PAGE_LOAD, SCRIPT);

  private Map<String, Object> timeouts = new HashMap<>();

  public ConfigureTimeout(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    String type = (String) allParameters.get("type");

    if (type != null) {
      // OSS
      if (! knownTypes.contains(type)) {
        throw new WebDriverException("Unknown wait type: " + type);
      }
      timeouts.put(type, allParameters.get("ms"));

    } else {
      // W3C
      for (String key : allParameters.keySet()) {
        if (! knownTypes.contains(key)) {
          throw new WebDriverException("Unknown wait type: " + key);
        }
      }
      timeouts.putAll(allParameters);
    }
  }

  @Override
  public Void call() {
    if (timeouts.containsKey(IMPLICIT)) {
      try {
        getDriver().manage().timeouts().implicitlyWait(
            ((Number) timeouts.get(IMPLICIT)).longValue(), TimeUnit.MILLISECONDS);
      } catch (ClassCastException ex) {
        throw new WebDriverException(
            "Illegal (non-numeric) timeout value passed: " + timeouts.get(IMPLICIT), ex);
      }
    }
    if (timeouts.containsKey(PAGE_LOAD)) {
      try {
        getDriver().manage().timeouts().pageLoadTimeout(
            ((Number) timeouts.get(PAGE_LOAD)).longValue(), TimeUnit.MILLISECONDS);
      } catch (ClassCastException ex) {
        throw new WebDriverException(
            "Illegal (non-numeric) timeout value passed: " + timeouts.get(PAGE_LOAD), ex);
      }
    }
    if (timeouts.containsKey(SCRIPT)) {
      try {
        getDriver().manage().timeouts().setScriptTimeout(
            ((Number) timeouts.get(SCRIPT)).longValue(), TimeUnit.MILLISECONDS);
      } catch (ClassCastException ex) {
        throw new WebDriverException(
            "Illegal (non-numeric) timeout value passed: " + timeouts.get(SCRIPT), ex);
      }
    }
    return null;
  }

  @Override
  public String toString() {
    return "[" + timeouts.entrySet().stream()
        .map(entry -> String.format("%s: %s", entry.getKey(), entry.getValue()))
        .collect(Collectors.joining(",")) + "]";
  }
}
