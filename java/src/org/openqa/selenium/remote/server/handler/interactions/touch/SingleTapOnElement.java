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

import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Coordinates;
import org.openqa.selenium.interactions.Locatable;
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebElementHandler;
import org.openqa.selenium.remote.server.handler.interactions.HasTouchScreen;
import org.openqa.selenium.remote.server.handler.interactions.TouchScreen;

import java.util.Map;

public class SingleTapOnElement extends WebElementHandler<Void> {

  private static final String ELEMENT = "element";
  private String elementId;

  public SingleTapOnElement(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    if (allParameters.containsKey(ELEMENT) && allParameters.get(ELEMENT) != null) {
      elementId = (String) allParameters.get(ELEMENT);
    }
  }

  @Override
  public Void call() {
    TouchScreen touchScreen = ((HasTouchScreen) getDriver()).getTouch();
    WebElement element = getKnownElements().get(elementId);
    Coordinates elementLocation = ((Locatable) element).getCoordinates();

    touchScreen.singleTap(elementLocation);

    return null;
  }

  @Override
  public String toString() {
    return String.format("[singleTap: %s]", elementId);
  }

}
