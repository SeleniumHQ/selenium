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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.internal.ArgumentConverter;

import java.util.Map;

public class SwitchToFrame extends WebDriverHandler<Void> {

  private volatile Object id;

  public SwitchToFrame(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    id = new ArgumentConverter(getKnownElements()).apply(allParameters.get("id"));
  }

  @Override
  public Void call() {
    if (id == null) {
      getDriver().switchTo().defaultContent();
    } else if (id instanceof Number) {
      getDriver().switchTo().frame(((Number) id).intValue());
    } else if (id instanceof WebElement) {
      getDriver().switchTo().frame((WebElement) id);
    } else if (id instanceof String) {
      getDriver().switchTo().frame((String) id);
    } else {
      throw new IllegalArgumentException("Unsupported frame locator: " + id.getClass().getName());
    }

    return null;
  }

  @Override
  public String toString() {
    return String.format("[switch to frame: %s]", (id == null ? "default" : id));
  }
}
