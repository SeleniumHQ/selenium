/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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

package org.openqa.selenium.android;

import android.util.Log;

import org.openqa.selenium.WebDriver.Navigation;
import org.openqa.selenium.android.intents.Action;

import java.net.URL;

public class AndroidNavigation implements Navigation {
  private static final String LOG_TAG = AndroidNavigation.class.getName();
  private AndroidDriver driver;
  
  public AndroidNavigation(AndroidDriver driver) {
    this.driver = driver;
  }
  
  public void back() {
    Log.d(LOG_TAG, "Navigating back.");
    driver.doNavigation(Action.NAVIGATE_BACK);
  }

  public void forward() {
    Log.d(LOG_TAG, "Navigating forward.");
    driver.doNavigation(Action.NAVIGATE_FORWARD);
  }

  public void refresh() {
    Log.d(LOG_TAG, "Navigating refresh.");
    driver.doNavigation(Action.REFRESH);
  }

  public void to(String url) {
    driver.get(url);
  }

  public void to(URL url) {
    driver.get(url.toString());
  }
}