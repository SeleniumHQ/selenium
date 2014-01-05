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

package org.openqa.selenium;

import com.google.common.base.Supplier;


/**
 * @deprecated Use {@link com.thoughtworks.selenium.webdriven.WebDriverCommandProcessor} instead.
 */
@Deprecated
public class WebDriverCommandProcessor extends com.thoughtworks.selenium.webdriven.WebDriverCommandProcessor {

  public WebDriverCommandProcessor(String baseUrl, WebDriver driver) {
    super(baseUrl, driver);
  }

  public WebDriverCommandProcessor(String baseUrl,
                                   Supplier<WebDriver> maker) {
    super(baseUrl, maker);
  }
}
