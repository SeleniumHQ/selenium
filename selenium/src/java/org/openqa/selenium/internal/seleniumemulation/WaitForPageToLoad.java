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

package org.openqa.selenium.internal.seleniumemulation;

import com.thoughtworks.selenium.Wait;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

public class WaitForPageToLoad extends SeleneseCommand<Void> {
  private int timeToWait = 100;

  /**
   * Overrides the default time to wait (in milliseconds) after a page has finished loading.
   * 
   * @param timeToWait the time to wait, in milliseconds, after the page has finished loading
   */
  public void setTimeToWait(int timeToWait) {
    this.timeToWait = timeToWait;
  }

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, String timeout, String ignored) {
    // Wait until things look like they've been stable for "timeToWait"
    if (!(driver instanceof JavascriptExecutor)) {
      // Assume that we Do The Right Thing
      return null;
    }

    new Wait() {
      private long started = System.currentTimeMillis();

      public boolean until() {
        try {
          Object result = ((JavascriptExecutor) driver).executeScript(
              "return document['readyState'] ? 'complete' == document.readyState : true");
          if (result != null && result instanceof Boolean && (Boolean) result) {
            long now = System.currentTimeMillis();
            if (now - started > timeToWait) {
              return true;
            }
          } else {
            started = System.currentTimeMillis();
          }
        } catch (Exception e) {
          // Possible page reload. Fine
        }
        return false;
      }
    }.wait(timeout);

    return null;
  }
}