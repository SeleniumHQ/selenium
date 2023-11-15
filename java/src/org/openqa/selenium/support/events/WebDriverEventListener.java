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

import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.WindowType;

/**
 * @deprecated Use {@link EventFiringDecorator} and {@link WebDriverListener} instead
 */
@Deprecated
public interface WebDriverEventListener {

  /**
   * This action will be performed each time before {@link Alert#accept()}
   *
   * @param driver WebDriver
   */
  void beforeAlertAccept(WebDriver driver);

  /**
   * This action will be performed each time after {@link Alert#accept()}
   *
   * @param driver WebDriver
   */
  void afterAlertAccept(WebDriver driver);

  /**
   * This action will be performed each time before {@link Alert#dismiss()}
   *
   * @param driver WebDriver
   */
  void afterAlertDismiss(WebDriver driver);

  /**
   * This action will be performed each time after {@link Alert#dismiss()}
   *
   * @param driver WebDriver
   */
  void beforeAlertDismiss(WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver#get get(String url)} respectively {@link
   * org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}.
   *
   * @param url URL
   * @param driver WebDriver
   */
  void beforeNavigateTo(String url, WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver#get get(String url)} respectively {@link
   * org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}. Not called, if an
   * exception is thrown.
   *
   * @param url URL
   * @param driver WebDriver
   */
  void afterNavigateTo(String url, WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver.Navigation#back navigate().back()}.
   *
   * @param driver WebDriver
   */
  void beforeNavigateBack(WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver.Navigation navigate().back()}. Not called, if
   * an exception is thrown.
   *
   * @param driver WebDriver
   */
  void afterNavigateBack(WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}.
   *
   * @param driver WebDriver
   */
  void beforeNavigateForward(WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}. Not
   * called, if an exception is thrown.
   *
   * @param driver WebDriver
   */
  void afterNavigateForward(WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver.Navigation#refresh navigate().refresh()}.
   *
   * @param driver WebDriver
   */
  void beforeNavigateRefresh(WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver.Navigation#refresh navigate().refresh()}. Not
   * called, if an exception is thrown.
   *
   * @param driver WebDriver
   */
  void afterNavigateRefresh(WebDriver driver);

  /**
   * Called before {@link WebDriver#findElement WebDriver.findElement(...)}, or {@link
   * WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
   * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
   *
   * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
   * @param by locator being used
   * @param driver WebDriver
   */
  void beforeFindBy(By by, WebElement element, WebDriver driver);

  /**
   * Called after {@link WebDriver#findElement WebDriver.findElement(...)}, or {@link
   * WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
   * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
   *
   * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
   * @param by locator being used
   * @param driver WebDriver
   */
  void afterFindBy(By by, WebElement element, WebDriver driver);

  /**
   * Called before {@link WebElement#click WebElement.click()}.
   *
   * @param driver WebDriver
   * @param element the WebElement being used for the action
   */
  void beforeClickOn(WebElement element, WebDriver driver);

  /**
   * Called after {@link WebElement#click WebElement.click()}. Not called, if an exception is
   * thrown.
   *
   * @param driver WebDriver
   * @param element the WebElement being used for the action
   */
  void afterClickOn(WebElement element, WebDriver driver);

  /**
   * Called before {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
   * WebElement.sendKeys(...)}.
   *
   * @param driver WebDriver
   * @param element the WebElement being used for the action
   */
  void beforeChangeValueOf(WebElement element, WebDriver driver, CharSequence[] keysToSend);

  /**
   * Called after {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
   * WebElement.sendKeys(...)}}. Not called, if an exception is thrown.
   *
   * @param driver WebDriver
   * @param element the WebElement being used for the action
   */
  void afterChangeValueOf(WebElement element, WebDriver driver, CharSequence[] keysToSend);

  /**
   * Called before {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(String,
   * Object...)}
   *
   * @param driver WebDriver
   * @param script the script to be executed
   */
  // Previously: Called before {@link WebDriver#executeScript(String)}
  // See the same issue below.
  void beforeScript(String script, WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(String,
   * Object...)}. Not called if an exception is thrown
   *
   * @param driver WebDriver
   * @param script the script that was executed
   */
  // Previously: Called after {@link WebDriver#executeScript(String)}. Not called if an exception is
  // thrown
  // So someone should check if this is right.  There is no executeScript method
  // in WebDriver, but there is in several other places, like this one
  void afterScript(String script, WebDriver driver);

  /**
   * This action will be performed each time before {@link
   * org.openqa.selenium.WebDriver.TargetLocator#window(String)}
   *
   * @param windowName The name of the window or the handle as returned by {@link
   *     org.openqa.selenium.WebDriver#getWindowHandle()} or <code>null</code> if switching to a new
   *     window created by {@link org.openqa.selenium.WebDriver.TargetLocator#newWindow(WindowType)}
   * @param driver WebDriver
   */
  void beforeSwitchToWindow(String windowName, WebDriver driver);

  /**
   * This action will be performed each time after {@link
   * org.openqa.selenium.WebDriver.TargetLocator#window(String)}
   *
   * @param windowName The name of the window or the handle as returned by {@link
   *     org.openqa.selenium.WebDriver#getWindowHandle()} or <code>null</code> if switching to a new
   *     window created by {@link org.openqa.selenium.WebDriver.TargetLocator#newWindow(WindowType)}
   * @param driver WebDriver
   */
  void afterSwitchToWindow(String windowName, WebDriver driver);

  /**
   * Called whenever an exception would be thrown.
   *
   * @param driver WebDriver
   * @param throwable the exception that will be thrown
   */
  void onException(Throwable throwable, WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.TakesScreenshot#getScreenshotAs(OutputType)} allows
   * the implementation to determine which type of output will be generated
   *
   * @param <X> Return type for getScreenshotAs.
   * @param target target type, @see OutputType
   */
  <X> void beforeGetScreenshotAs(OutputType<X> target);

  /**
   * Called after {@link org.openqa.selenium.TakesScreenshot#getScreenshotAs(OutputType)} allows the
   * implementation to determine which type of output was generated and to access the output itself
   *
   * @param <X> Return type for getScreenshotAs.
   * @param target target type, @see OutputType
   * @param screenshot screenshot output of the specified type
   */
  <X> void afterGetScreenshotAs(OutputType<X> target, X screenshot);

  /**
   * Called before {@link WebElement#getText()} method is being called
   *
   * @param element - {@link WebElement} against which call is being made
   * @param driver - instance of {@link WebDriver}
   */
  void beforeGetText(WebElement element, WebDriver driver);

  /**
   * Called right after {@link WebElement#getText()} method is being called
   *
   * @param element - {@link WebElement} against which call is being made
   * @param driver - instance of {@link WebDriver}
   * @param text - {@link String} object extracted from respective {@link WebElement}
   */
  void afterGetText(WebElement element, WebDriver driver, String text);
}
