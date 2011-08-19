/*
Copyright 2011 WebDriver committers
Copyright 2011 Google Inc.

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

package org.openqa.selenium.remote;

import org.openqa.selenium.TouchScreen;
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
    Map<String, Object> downParams = new HashMap<String, Object>();
    downParams.put("x", x);
    downParams.put("y", y);
    executeMethod.execute(DriverCommand.TOUCH_DOWN, downParams);
  }

  public void up(int x, int y) {
    Map<String, Object> upParams = new HashMap<String, Object>();
    upParams.put("x", x);
    upParams.put("y", y);
    executeMethod.execute(DriverCommand.TOUCH_UP, upParams);
  }

}
