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

import java.net.URL;

import org.openqa.selenium.WebDriver.Navigation;

public class AndroidNavigation implements Navigation {
  private ActivityController controller;
  
  public AndroidNavigation() {
    controller = ActivityController.getInstance();
  }
  
  public void back() {
    controller.navigateBackOrForward(-1);
  }

  public void forward() {
    controller.navigateBackOrForward(1);
  }

  public void refresh() {
    controller.refresh();
  }

  public void to(String url) {
    controller.get(url);
  }

  public void to(URL url) {
    controller.get(url.toString());
  }
}