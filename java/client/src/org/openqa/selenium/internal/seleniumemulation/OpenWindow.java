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

public class OpenWindow extends SeleneseCommand<Void> {
  private final GetEval opener;

  public OpenWindow(GetEval opener) {
    this.opener = opener;
  }

  @Override
  protected Void handleSeleneseCommand(final WebDriver driver, final String url,
      final String windowID) {
    String[] args = {String.format("window.open('%s', '%s');", url, windowID)};

    opener.apply(driver, args);

    return null;
  }
}
