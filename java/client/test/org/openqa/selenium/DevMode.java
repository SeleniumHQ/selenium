/*
Copyright 2007-2010 WebDriver committers
Copyright 2007-2010 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

public class DevMode {
  public static boolean isInDevMode() {
    return isInDevMode("/org/openqa/selenium/firefox/webdriver.xpi");
  }

  public static boolean isInDevMode(String nameOfRequiredResource) {
    return isInDevMode(DevMode.class, nameOfRequiredResource);
  }

  public static boolean isInDevMode(Class<?> resourceLoaderClazz, String nameOfRequiredResource) {
    return resourceLoaderClazz.getResource(nameOfRequiredResource) == null &&
        resourceLoaderClazz.getResource("/" + nameOfRequiredResource) == null;
  }
}
