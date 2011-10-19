/*
 * Copyright (C) 2011 The Android Open Source Project
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.openqa.selenium.android;

import org.openqa.selenium.WebDriver;

import org.openqa.selenium.android.AndroidWebDriver;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.WebStorage;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.android.app.MainActivity;

public class AndroidDriver implements BrowserConnection, HasTouchScreen, JavascriptExecutor,
    LocationContext, Rotatable, TakesScreenshot, WebDriver, WebStorage{

  private AndroidWebDriver driver;

  public AndroidDriver() {
    driver = MainActivity.createDriver();
  }

  public void get(String url) {
    driver.get(url);
  }

  public String getCurrentUrl() {
    return driver.getCurrentUrl();
  }

  public String getTitle() {
    return driver.getTitle();
  }

  public java.util.List<org.openqa.selenium.WebElement> findElements(org.openqa.selenium.By by) {
    return driver.findElements(by);
  }

  public org.openqa.selenium.WebElement findElement(org.openqa.selenium.By by) {
    return driver.findElement(by);
  }

  public String getPageSource() {
    return driver.getPageSource();
  }

  public void close() {
    driver.close();
  }

  public void quit() {
    driver.quit();
  }

  public java.util.Set<String> getWindowHandles() {
    return driver.getWindowHandles();
  }

  public String getWindowHandle() {
    return driver.getWindowHandle();
  }

  public org.openqa.selenium.WebDriver.TargetLocator switchTo() {
    return driver.switchTo();
  }

  public org.openqa.selenium.WebDriver.Navigation navigate() {
    return driver.navigate();
  }

  public org.openqa.selenium.WebDriver.Options manage() {
    return driver.manage();
  }

  public Object executeScript(String script, Object... args) {
    return driver.executeScript(script, args);
  }

  public Object executeAsyncScript(String script, Object... args) {
    return driver.executeAsyncScript(script, args);
  }

  public boolean isOnline() {
    return driver.isOnline();
  }

  public void setOnline(boolean online) throws org.openqa.selenium.WebDriverException {
    driver.setOnline(online);
  }

  public org.openqa.selenium.TouchScreen getTouch() {
    return driver.getTouch();
  }

  public org.openqa.selenium.html5.Location location() {
    return driver.location();
  }

  public void setLocation(org.openqa.selenium.html5.Location location) {
    driver.setLocation(location);
  }

  public void rotate(org.openqa.selenium.ScreenOrientation orientation) {
    driver.rotate(orientation);
  }

  public org.openqa.selenium.ScreenOrientation getOrientation() {
    return driver.getOrientation();
  }

  public <X> X getScreenshotAs(org.openqa.selenium.OutputType<X> target)
      throws org.openqa.selenium.WebDriverException {
    return driver.getScreenshotAs(target);
  }

  public org.openqa.selenium.html5.LocalStorage getLocalStorage() {
    return driver.getLocalStorage();
  }

  public org.openqa.selenium.html5.SessionStorage getSessionStorage() {
    return driver.getSessionStorage();
  }
}
