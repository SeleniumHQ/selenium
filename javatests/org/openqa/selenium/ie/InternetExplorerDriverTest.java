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

package org.openqa.selenium.ie;

import junit.framework.TestCase;

import org.openqa.selenium.Ignore;
import org.openqa.selenium.WebDriver;

import static org.openqa.selenium.Ignore.Driver.IE;

public class InternetExplorerDriverTest extends TestCase {

  @Ignore(value = IE, reason = "Not sure why this is failing on my machine")
  public void testCanRestartTheIeDriverInATightLoop() {  
    for (int i = 0; i < 5; i++) {
      WebDriver driver = new InternetExplorerDriver();
      driver.quit();
    }
  }
}
