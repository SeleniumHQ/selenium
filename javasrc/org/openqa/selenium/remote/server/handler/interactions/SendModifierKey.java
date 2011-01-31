/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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
import org.openqa.selenium.Keyboard;
import org.openqa.selenium.Keys;
import org.openqa.selenium.remote.server.DriverSessions;
import org.openqa.selenium.remote.server.JsonParametersAware;
import org.openqa.selenium.remote.server.handler.WebDriverHandler;
import org.openqa.selenium.remote.server.rest.ResultType;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;

public class SendModifierKey extends WebDriverHandler implements JsonParametersAware {

  private String key;
  private boolean isDown;

  public SendModifierKey(DriverSessions sessions) {
    super(sessions);
  }

  @SuppressWarnings({"unchecked"})
  public void setJsonParameters(Map<String, Object> allParameters) throws Exception {
    key = (String) allParameters.get("value");
    isDown = (Boolean) allParameters.get("isdown");
  }

  public ResultType call() throws Exception {
    Keyboard keyboard = ((HasInputDevices) getDriver()).getKeyboard();

    Keys[] modifiers = {Keys.SHIFT, Keys.CONTROL, Keys.ALT};
    Keys keyToSend = null;

    for (Keys modifier : modifiers) {
      if (key.equals(modifier.toString())) {
        keyToSend = modifier;
      }
    }
    
    if (isDown) {
      keyboard.pressKey(keyToSend);
    } else {
      keyboard.releaseKey(keyToSend);
    }

    return ResultType.SUCCESS;
  }
  
  @Override
  public String toString() {
    return String.format("[send modifier key: %s, %s]", key, isDown);
  }
}
