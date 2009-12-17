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

public class WaitForCondition extends SeleneseCommand<Void> {

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, final String script, final String timeout) {
    new Wait() {
      @Override
      public boolean until() {
        return (Boolean) ((JavascriptExecutor) driver).executeScript(script);
      }
    }.wait("Failed to resolve " + script, Long.valueOf(timeout));

    return null;
  }
}
