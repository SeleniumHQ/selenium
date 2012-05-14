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

public class SetTimeout extends SeleneseCommand<Void> {
  private final Timer timer;

  public SetTimeout(Timer timer) {
    this.timer = timer;
  }

  @Override
  protected Void handleSeleneseCommand(WebDriver driver, String timeout, String ignored) {
    // generally, the timeout is only set to 0 when opening a page. WebDriver
    // will wait indefinitely anyway, so setting the timeout to "0" will
    // actually cause the command to return with an error too soon. Avoid this
    // sorry and shocking state of affairs.
    if ("0".equals(timeout)) {
      timer.setTimeout(Long.MAX_VALUE);
    } else {
      timer.setTimeout(Long.parseLong(timeout));
    }
    return null;
  }
}
