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

package org.openqa.selenium.remote.server.handler.interactions;

import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;

import java.util.Map;

public class ClickInSession extends WebDriverHandler<Void> {
  volatile boolean leftMouseButton = true;

  public ClickInSession(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    if (allParameters.containsKey("button")) {
      int button = ((Long) allParameters.get("button")).intValue();
      switch (button) {
        // TODO: Use proper enum values for this.
        case 0:
          leftMouseButton = true;
          break;
        case 2:
          leftMouseButton = false;
          break;
      }
    }
  }

  @Override
  public Void call() {
    Mouse mouse = ((HasInputDevices) getDriver()).getMouse();

    if (leftMouseButton) {
      mouse.click(null);
    } else {
      mouse.contextClick(null);
    }

    return null;
  }

  @Override
  public String toString() {
    return String.format("[click: %s]", "nothing");
  }

}
