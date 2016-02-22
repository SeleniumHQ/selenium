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

package org.openqa.selenium.remote;

import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.interactions.internal.Coordinates;

import java.util.HashMap;
import java.util.Map;

public class RemoteTouchScreen implements TouchScreen {

  private final ExecuteMethod executeMethod;

  public RemoteTouchScreen(ExecuteMethod executeMethod) {
    this.executeMethod = executeMethod;
  }

  public void singleTap(Coordinates where) {
    Map<String, Object> singleTapParams = CoordinatesUtils.paramsFromCoordinates(where);
    executeMethod.execute(DriverCommand.TOUCH_SINGLE_TAP, singleTapParams);
  }

  public void down(int x, int y) {
    Map<String, Object> downParams = new HashMap<>();
    downParams.put("x", x);
    downParams.put("y", y);
    executeMethod.execute(DriverCommand.TOUCH_DOWN, downParams);
  }

  public void up(int x, int y) {
    Map<String, Object> upParams = new HashMap<>();
    upParams.put("x", x);
    upParams.put("y", y);
    executeMethod.execute(DriverCommand.TOUCH_UP, upParams);
  }

  public void move(int x, int y) {
    Map<String, Object> moveParams = new HashMap<>();
    moveParams.put("x", x);
    moveParams.put("y", y);
    executeMethod.execute(DriverCommand.TOUCH_MOVE, moveParams);
  }

  public void scroll(Coordinates where, int xOffset, int yOffset) {
    Map<String, Object> scrollParams = CoordinatesUtils.paramsFromCoordinates(where);
    scrollParams.put("xoffset", xOffset);
    scrollParams.put("yoffset", yOffset);
    executeMethod.execute(DriverCommand.TOUCH_SCROLL, scrollParams);
  }

  public void doubleTap(Coordinates where) {
    Map<String, Object> doubleTapParams = CoordinatesUtils.paramsFromCoordinates(where);
    executeMethod.execute(DriverCommand.TOUCH_DOUBLE_TAP, doubleTapParams);
  }

  public void longPress(Coordinates where) {
    Map<String, Object> longPressParams = CoordinatesUtils.paramsFromCoordinates(where);
    executeMethod.execute(DriverCommand.TOUCH_LONG_PRESS, longPressParams);
  }

  public void scroll(int xOffset, int yOffset) {
    Map<String, Object> scrollParams = new HashMap<>();
    scrollParams.put("xoffset", xOffset);
    scrollParams.put("yoffset", yOffset);
    executeMethod.execute(DriverCommand.TOUCH_SCROLL, scrollParams);
  }

  public void flick(int xSpeed, int ySpeed) {
    Map<String, Object> flickParams = new HashMap<>();
    flickParams.put("xspeed", xSpeed);
    flickParams.put("yspeed", ySpeed);
    executeMethod.execute(DriverCommand.TOUCH_FLICK, flickParams);
  }

  public void flick(Coordinates where, int xOffset, int yOffset, int speed) {
    Map<String, Object> flickParams = CoordinatesUtils.paramsFromCoordinates(where);
    flickParams.put("xoffset", xOffset);
    flickParams.put("yoffset", yOffset);
    flickParams.put("speed", speed);
    executeMethod.execute(DriverCommand.TOUCH_FLICK, flickParams);
  }
}
