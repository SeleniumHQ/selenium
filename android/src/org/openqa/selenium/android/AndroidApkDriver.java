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

import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.ScreenOrientation;
import org.openqa.selenium.WebDriver;

import org.openqa.selenium.WebDriverException;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.android.library.AndroidWebDriver;
import org.openqa.selenium.HasTouchScreen;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.Rotatable;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.android.app.MainActivity;
import org.openqa.selenium.html5.AppCacheStatus;
import org.openqa.selenium.html5.ApplicationCache;
import org.openqa.selenium.html5.BrowserConnection;
import org.openqa.selenium.html5.LocalStorage;
import org.openqa.selenium.html5.Location;
import org.openqa.selenium.html5.LocationContext;
import org.openqa.selenium.html5.SessionStorage;
import org.openqa.selenium.html5.WebStorage;

import java.util.List;
import java.util.Set;

public class AndroidApkDriver implements BrowserConnection, HasTouchScreen, JavascriptExecutor,
    LocationContext, Rotatable, TakesScreenshot, WebDriver, WebStorage, ApplicationCache {

  private AndroidWebDriver driver;

  public AndroidApkDriver() {
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

  public List<WebElement> findElements(By by) {
    return driver.findElements(by);
  }

  public WebElement findElement(By by) {
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

  public Set<String> getWindowHandles() {
    return driver.getWindowHandles();
  }

  public String getWindowHandle() {
    return driver.getWindowHandle();
  }

  public TargetLocator switchTo() {
    return driver.switchTo();
  }

  public Navigation navigate() {
    return driver.navigate();
  }

  public Options manage() {
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

  public void setOnline(boolean online) throws WebDriverException {
    driver.setOnline(online);
  }

  public org.openqa.selenium.TouchScreen getTouch() {
    return driver.getTouch();
  }

  public org.openqa.selenium.html5.Location location() {
    return driver.location();
  }

  public void setLocation(Location location) {
    driver.setLocation(location);
  }

  public void rotate(ScreenOrientation orientation) {
    driver.rotate(orientation);
  }

  public ScreenOrientation getOrientation() {
    return driver.getOrientation();
  }

  public <X> X getScreenshotAs(OutputType<X> target)
      throws org.openqa.selenium.WebDriverException {
    return driver.getScreenshotAs(target);
  }

  public LocalStorage getLocalStorage() {
    return driver.getLocalStorage();
  }

  public SessionStorage getSessionStorage() {
    return driver.getSessionStorage();
  }

  public AppCacheStatus getStatus() {
    return driver.getStatus();
  }
}
