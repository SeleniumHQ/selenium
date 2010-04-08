/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.

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

package org.openqa.selenium.remote;

import java.lang.reflect.Method;

import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;

// Deliberately package level visibility
class AddTakesScreenshot implements AugmenterProvider {

  public Class<?> getDescribedInterface() {
    return TakesScreenshot.class;
  }

  public InterfaceImplementation getImplementation(Object ignored) {
    // The only method on TakesScreenshot is the one to take a screenshot
    return new InterfaceImplementation() {
      public Object invoke(ExecuteMethod executeMethod, Method method, Object... args) {
        String base64 = (String) executeMethod.execute(DriverCommand.SCREENSHOT, null);
        return ((OutputType<?>) args[0]).convertFromBase64Png(base64);
      }
    };
  }
}
