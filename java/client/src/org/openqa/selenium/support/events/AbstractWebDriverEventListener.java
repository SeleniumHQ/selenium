// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.events;

import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

/**
 * Use this class as base class, if you want to implement a {@link WebDriverEventListener} and are
 * only interested in some events. All methods provided by this class have an empty method body.
 */
public abstract class AbstractWebDriverEventListener implements WebDriverEventListener {

  @Override
  public void beforeAlertAccept(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterAlertAccept(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterAlertDismiss(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeAlertDismiss(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeNavigateTo(String url, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterNavigateTo(String url, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeNavigateBack(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterNavigateBack(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeNavigateForward(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterNavigateForward(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeNavigateRefresh(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterNavigateRefresh(WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeFindBy(By by, WebElement element, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterFindBy(By by, WebElement element, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeClickOn(WebElement element, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void afterClickOn(WebElement element, WebDriver driver) {
    // Do nothing.
  }

  @Override
  public void beforeChangeValueOf(WebElement element, WebDriver driver, CharSequence[] keysToSend) {
    // Do nothing.
  }

  @Override
  public void afterChangeValueOf(WebElement element, WebDriver driver, CharSequence[] keysToSend) {
    // Do nothing.
  }

  @Override
  public void beforeScript(String script, WebDriver driver) {
    // Do nothing
  }

  @Override
  public void afterScript(String script, WebDriver driver) {
    // Do nothing
  }

  @Override
  public void afterSwitchToWindow(String windowName, WebDriver driver) {
      // Do nothing
  }

  @Override
  public void beforeSwitchToWindow(String windowName, WebDriver driver) {
      // Do nothing
  }

  @Override
  public void onException(Throwable throwable, WebDriver driver) {
    // Do nothing
  }

  @Override
  public <X> void beforeGetScreenshotAs(OutputType<X> target) {
    // Do nothing
  }

  @Override
  public <X> void afterGetScreenshotAs(OutputType<X> target, X screenshot) {
    // Do nothing
  }

  @Override
  public void beforeGetText(WebElement element, WebDriver driver) {
    // Do nothing
  }

  @Override
  public void afterGetText(WebElement element, WebDriver driver, String text) {
    // Do nothing
  }

}
