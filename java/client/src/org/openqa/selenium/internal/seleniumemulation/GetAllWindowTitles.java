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

import org.openqa.selenium.WebDriver;

import java.util.ArrayList;
import java.util.List;

public class GetAllWindowTitles extends SeleneseCommand<String[]> {
  @Override
  protected String[] handleSeleneseCommand(WebDriver driver, String ignored, String alsoIgnored) {
    String current = driver.getWindowHandle();

    List<String> attributes = new ArrayList<String>();
    for (String handle : driver.getWindowHandles()) {
      driver.switchTo().window(handle);
      attributes.add(driver.getTitle());
    }

    driver.switchTo().window(current);

    return attributes.toArray(new String[attributes.size()]);

  }
}
