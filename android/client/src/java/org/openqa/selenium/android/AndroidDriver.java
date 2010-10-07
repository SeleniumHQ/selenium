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

import org.openqa.selenium.OutputType;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.browserlaunchers.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.openqa.selenium.remote.DriverCommand;
import org.openqa.selenium.remote.RemoteWebDriver;

import com.google.common.collect.ImmutableMap;

import java.net.MalformedURLException;
import java.net.URL;

/**
 * A driver for running tests on an Android device or emulator.
 */
public class AndroidDriver extends RemoteWebDriver implements TakesScreenshot, Rotatable {

  protected static final String DEFAULT_ANDROID_DRIVER_URL = "http://localhost:8080/hub";
  
  public AndroidDriver() throws MalformedURLException {
    this(new URL(DEFAULT_ANDROID_DRIVER_URL));
  }
  
  
  public AndroidDriver(String remoteAddress) throws MalformedURLException {
    this(new URL(remoteAddress));
  }
  
  public AndroidDriver(URL remoteAddress) {
    super(remoteAddress, getAndroidCapabilities());
  }

  public <X> X getScreenshotAs(OutputType<X> target) throws WebDriverException {
    String base64Png = execute(DriverCommand.SCREENSHOT).getValue().toString();
    return target.convertFromBase64Png(base64Png);
  }

  private static DesiredCapabilities getAndroidCapabilities() {
    DesiredCapabilities caps = DesiredCapabilities.android();
    caps.setCapability(CapabilityType.TAKES_SCREENSHOT, true);
    caps.setCapability(CapabilityType.ROTATABLE, true);
    return caps;
  }

  public void rotate(ScreenOrientation orientation) {
    execute(DriverCommand.SET_SCREEN_ORIENTATION, ImmutableMap.of("orientation", orientation));
  }

  public ScreenOrientation getOrientation() {
    return ScreenOrientation.valueOf(
        (String) execute(DriverCommand.GET_SCREEN_ORIENTATION).getValue());
  }
}
