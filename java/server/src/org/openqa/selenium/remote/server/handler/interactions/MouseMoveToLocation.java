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

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.HasInputDevices;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.Mouse;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;

import java.util.Map;

public class MouseMoveToLocation extends WebDriverHandler<Void> {
  private static final String XOFFSET = "xoffset";
  private static final String YOFFSET = "yoffset";
  private static final String ELEMENT = "element";
  String elementId;
  boolean elementProvided = false;
  int xOffset = 0;
  int yOffset = 0;
  boolean offsetsProvided = false;

  public MouseMoveToLocation(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    if (allParameters.containsKey(ELEMENT) && allParameters.get(ELEMENT) != null) {
      elementId = (String) allParameters.get(ELEMENT);
      elementProvided = true;
    } else {
      elementProvided = false;
    }

    if (allParameters.containsKey(XOFFSET) && allParameters.containsKey(YOFFSET)) {
      try {
        xOffset = ((Number) allParameters.get(XOFFSET)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) x offset value for mouse move passed: " + allParameters.get(XOFFSET), ex);
      }
      try {
        yOffset = ((Number) allParameters.get(YOFFSET)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) y offset value for mouse move passed: " + allParameters.get(YOFFSET), ex);
      }
      offsetsProvided = true;
    } else {
      offsetsProvided = false;
    }
  }

  @Override
  public Void call() {
    Mouse mouse = ((HasInputDevices) getDriver()).getMouse();

    Coordinates elementLocation = null;
    if (elementProvided) {
      WebElement element = getKnownElements().get(elementId);
      elementLocation = ((Locatable) element).getCoordinates();
    }

    if (offsetsProvided) {
      mouse.mouseMove(elementLocation, xOffset, yOffset);
    } else {
      mouse.mouseMove(elementLocation);
    }
    return null;
  }

  @Override
  public String toString() {
    return String.format("[mousemove: %s %b]", elementId, offsetsProvided);
  }

}
