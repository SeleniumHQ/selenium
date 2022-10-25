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
import org.openqa.selenium.remote.server.Session;
import org.openqa.selenium.remote.server.handler.WebElementHandler;
import org.openqa.selenium.remote.server.handler.interactions.HasTouchScreen;
import org.openqa.selenium.remote.server.handler.interactions.TouchScreen;

import java.util.Map;

public class Up extends WebElementHandler<Void> {

  private static final String X = "x";
  private static final String Y = "y";
  private int x;
  private int y;

  public Up(Session session) {
    super(session);
  }

  @Override
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    super.setJsonParameters(allParameters);
    try {
      x = ((Number) allParameters.get(X)).intValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-numeric) x touch up position value passed: " + allParameters.get(X), ex);
    }
    try {
      y = ((Number) allParameters.get(Y)).intValue();
    } catch (ClassCastException ex) {
      throw new WebDriverException("Illegal (non-numeric) y touch up position value passed: " + allParameters.get(Y), ex);
    }
  }

  @Override
  public Void call() {
    TouchScreen touchScreen = ((HasTouchScreen) getDriver()).getTouch();

    touchScreen.up(x, y);

    return null;
  }

  @Override
  public String toString() {
    return "[Up]";
  }

}
