/*
Copyright 2010 Selenium committers

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

import com.thoughtworks.selenium.Selenium;
import com.thoughtworks.selenium.SeleniumException;

import java.util.Map;

public class Close implements SeleneseFunction<Void> {
  public Void apply(Selenium selenium, Map<String, ?> args) {
    selenium.close();

    // WebDriver quits the browser once all windows are closed.
    String[] allWindowIds = selenium.getAllWindowIds();
    if (allWindowIds.length == 1) {
      boolean open = true;
      try {
        // Hilariously, this script will detonate if the window has been closed
        selenium.getEval("selenium.browserbot.getCurrentWindow().closed");
      } catch (SeleniumException e) {
        open = false;
      }

      if (!open) {
        selenium.stop();
      }
    }

    return null;
  }
}
