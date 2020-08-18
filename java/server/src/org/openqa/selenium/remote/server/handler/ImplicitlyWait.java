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

import java.time.Duration;
import java.util.Map;

public class ImplicitlyWait extends WebDriverHandler<Void> {

  private volatile long millis;

  public ImplicitlyWait(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    try {
      millis = ((Number) allParameters.get("ms")).longValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-numeric) timeout value passed: " + allParameters.get("ms"), ex);
    }
  }

  @Override
  public Void call() {
    getDriver().manage().timeouts().implicitlyWait(Duration.ofMillis(millis));

    return null;
  }

  @Override
  public String toString() {
    return String.format("[implicitly wait: %s]", millis);
  }
}
