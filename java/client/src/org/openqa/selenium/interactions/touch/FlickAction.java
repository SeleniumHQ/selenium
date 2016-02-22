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

package org.openqa.selenium.interactions.touch;

import org.openqa.selenium.interactions.Action;
import org.openqa.selenium.interactions.TouchScreen;
import org.openqa.selenium.interactions.internal.TouchAction;
import org.openqa.selenium.internal.Locatable;

/**
 * Creates a flick gesture.
 */
public class FlickAction extends TouchAction implements Action {

  private int xOffset;
  private int yOffset;
  private int speed;
  private int xSpeed;
  private int ySpeed;

  public static final int SPEED_NORMAL = 0;
  public static final int SPEED_FAST = 1;

  public FlickAction(TouchScreen touchScreen, Locatable locationProvider, int x, int y, int speed) {
    super(touchScreen, locationProvider);
    xOffset = x;
    yOffset = y;
    this.speed = speed;
  }

  public FlickAction(TouchScreen touchScreen, int xSpeed, int ySpeed) {
    super(touchScreen, null);
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
  }

  public void perform() {
    if (where != null) {
      touchScreen.flick(getActionLocation(), xOffset, yOffset, speed);
    } else {
      touchScreen.flick(xSpeed, ySpeed);
    }
  }

}
