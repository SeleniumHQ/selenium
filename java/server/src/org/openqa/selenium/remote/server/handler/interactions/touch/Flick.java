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

package org.openqa.selenium.remote.server.handler.interactions.touch;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.HasTouchScreen;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebElementHandler;

import java.util.Map;

public class Flick extends WebElementHandler<Void> {

  private static final String ELEMENT = "element";
  private static final String XOFFSET = "xoffset";
  private static final String YOFFSET = "yoffset";
  private static final String SPEED = "speed";
  private static final String XSPEED = "xspeed";
  private static final String YSPEED = "yspeed";
  private String elementId;
  private int xOffset;
  private int yOffset;
  private int speed;
  private int xSpeed;
  private int ySpeed;

  public Flick(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    if (allParameters.containsKey(ELEMENT) && allParameters.get(ELEMENT) != null) {
      elementId = (String) allParameters.get(ELEMENT);
      try {
        xOffset = ((Number) allParameters.get(XOFFSET)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) x offset value for flick passed: " + allParameters.get(XOFFSET), ex);
      }
      try {
        yOffset = ((Number) allParameters.get(YOFFSET)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) y offset value for flick passed: " + allParameters.get(YOFFSET), ex);
      }
      try {
        speed = ((Number) allParameters.get(SPEED)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) speed value for flick passed: " + allParameters.get(SPEED), ex);
      }
    } else if (allParameters.containsKey(XSPEED) && allParameters.containsKey(YSPEED)) {
      try {
        xSpeed = ((Number) allParameters.get(XSPEED)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) x speed value for flick passed: " + allParameters.get(XSPEED), ex);
      }
      try {
        ySpeed = ((Number) allParameters.get(YSPEED)).intValue();
      } catch (ClassCastException ex) {
        throw new WebDriverException("Illegal (non-numeric) y speed value for flick passed: " + allParameters.get(YSPEED), ex);
      }
    }
  }

  @Override
  public Void call() {
    TouchScreen touchScreen = ((HasTouchScreen) getDriver()).getTouch();

    if (elementId != null) {
      WebElement element = getKnownElements().get(elementId);
      Coordinates elementLocation = ((Locatable) element).getCoordinates();
      touchScreen.flick(elementLocation, xOffset, yOffset, speed);
    } else {
      touchScreen.flick(xSpeed, ySpeed);
    }

    return null;
  }

  @Override
  public String toString() {
    return "[Flick]";
  }

}
