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

package org.openqa.selenium.internal.selenesedriver;

import java.util.Map;

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;
import org.openqa.selenium.NoSuchFrameException;

public class SwitchToFrame implements SeleneseFunction<Void> {
  public Void apply(Selenium selenium, Map<String, ?> args) {
    Object id = args.get("id");

    if (id == null) {
      selenium.selectFrame("relative=top");
      return null;
    }

    selenium.selectFrame("relative=top");
    String allFrames = String.valueOf(id);

    for (String subframe : allFrames.split("\\.")) {
      try {
        actuallySwitchFrame(selenium, subframe);
      } catch (SeleniumException e) {
        throw new NoSuchFrameException(e.getMessage(), e);
      }
    }

    return null;
  }

  private void actuallySwitchFrame(Selenium selenium, String subframe) {
    try {
      int frameNumber = Integer.parseInt(subframe);
      selenium.selectFrame("index=" + frameNumber);
    } catch (NumberFormatException e) {
      selenium.selectFrame(subframe);
    }
  }
}
