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
package org.openqa.selenium;


/**
 * Indicates a driver that can capture a screenshot and store it in different
 * ways.
 * <p>
 * Example usage:
 * <pre>
 * import static openqa.selenium.OutputType.*;
 * 
 * File screenshotFile = ((Screenshot)driver).getScreenshotAs(file);
 * String screenshotBase64 = ((Screenshot)driver).getScreenshotAs(base64);
 * </pre>
 * 
 * @see OutputType
 */
public interface TakesScreenshot {
  /**
   * Capture the screenshot and store it in the specified location.
   *
   * @param <X> Return type for getScreenshotAs.
   * @param target target type, @see OutputType
   * @return Object in which is stored information about the screenshot.
   * @throws WebDriverException on failure.
   */
  <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException;
}
