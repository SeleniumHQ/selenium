/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.remote.server.handler.interactions;

import org.openqa.selenium.HasInputDevices;
import org.openqa.selenium.Mouse;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.internal.Coordinates;
import org.openqa.selenium.internal.Locatable;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.Map;

public class MouseMoveToLocation extends WebDriverHandler implements JsonParametersAware {
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

  public ResultType call() throws Exception {
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
    return ResultType.SUCCESS;
  }

  @Override
  public String toString() {
    return String.format("[mousemove: %s %b]", elementId, offsetsProvided);
  }

  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    if (allParameters.containsKey(ELEMENT) && allParameters.get(ELEMENT) != null) {
      elementId = (String) allParameters.get(ELEMENT);
      elementProvided = true;
    } else {
      elementProvided = false;
    }

    if (allParameters.containsKey(XOFFSET) && allParameters.containsKey(YOFFSET)) {
      xOffset = ((Long) allParameters.get(XOFFSET)).intValue();
      yOffset = ((Long) allParameters.get(YOFFSET)).intValue();
      offsetsProvided = true;
    } else {
      offsetsProvided = false;
    }
  }
}
