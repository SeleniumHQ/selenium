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

package org.openqa.selenium.internal.seleniumemulation;

import com.thoughtworks.selenium.SeleniumException;
import com.thoughtworks.selenium.Wait;

import org.openqa.selenium.WebDriver;

public class WaitForPopup extends SeleneseCommand<Void> {
  private final Windows windows;

  public WaitForPopup(Windows windows) {
    this.windows = windows;
  }

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, final String windowID,
      final String timeout) {
    final long millis = Long.parseLong(timeout);
    final String current = driver.getWindowHandle();

    new Wait() {
      @Override
      public boolean until() {
        try {
          if ("_blank".equals(windowID)) {
            windows.selectBlankWindow(driver);
          } else {
            driver.switchTo()
                .window(windowID);
          }
          return !"about:blank".equals(driver.getCurrentUrl());
        } catch (SeleniumException e) {
          // Swallow
        }
        return false;
      }
    }.wait(String.format("Timed out waiting for %s. Waited %s", windowID, timeout), millis);

    driver.switchTo().window(current);

    return null;
  }
}
