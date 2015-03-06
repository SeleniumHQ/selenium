/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium.support.events;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public interface WebDriverEventListener {

  /**
   * Called before {@link org.openqa.selenium.WebDriver#get get(String url)} respectively
   * {@link org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}.
   */
  void beforeNavigateTo(String url, WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver#get get(String url)} respectively
   * {@link org.openqa.selenium.WebDriver.Navigation#to navigate().to(String url)}. Not called, if an
   * exception is thrown.
   */
  void afterNavigateTo(String url, WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver.Navigation#back navigate().back()}.
   */
  void beforeNavigateBack(WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver.Navigation navigate().back()}. Not called, if an
   * exception is thrown.
   */
  void afterNavigateBack(WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}.
   */
  void beforeNavigateForward(WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.WebDriver.Navigation#forward navigate().forward()}. Not called,
   * if an exception is thrown.
   */
  void afterNavigateForward(WebDriver driver);

  /**
   * Called before {@link WebDriver#findElement WebDriver.findElement(...)}, or
   * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
   * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
   *
   * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
   */
  void beforeFindBy(By by, WebElement element, WebDriver driver);

  /**
   * Called after {@link WebDriver#findElement WebDriver.findElement(...)}, or
   * {@link WebDriver#findElements WebDriver.findElements(...)}, or {@link WebElement#findElement
   * WebElement.findElement(...)}, or {@link WebElement#findElement WebElement.findElements(...)}.
   *
   * @param element will be <code>null</code>, if a find method of <code>WebDriver</code> is called.
   */
  void afterFindBy(By by, WebElement element, WebDriver driver);

  /**
   * Called before {@link WebElement#click WebElement.click()}.
   */
  void beforeClickOn(WebElement element, WebDriver driver);

  /**
   * Called after {@link WebElement#click WebElement.click()}. Not called, if an exception is
   * thrown.
   */
  void afterClickOn(WebElement element, WebDriver driver);

  /**
   * Called before {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
   * WebElement.sendKeys(...)}.
   */
  void beforeChangeValueOf(WebElement element, WebDriver driver);

  /**
   * Called after {@link WebElement#clear WebElement.clear()}, {@link WebElement#sendKeys
   * WebElement.sendKeys(...)}}. Not called, if an exception is thrown.
   */
  void afterChangeValueOf(WebElement element, WebDriver driver);

  /**
   * Called before {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }
   */
  // Previously: Called before {@link WebDriver#executeScript(String)}
  // See the same issue below.
  void beforeScript(String script, WebDriver driver);

  /**
   * Called after {@link org.openqa.selenium.remote.RemoteWebDriver#executeScript(java.lang.String, java.lang.Object[]) }. Not called if an exception is thrown
   */
  // Previously: Called after {@link WebDriver#executeScript(String)}. Not called if an exception is thrown
  // So someone should check if this is right.  There is no executeScript method
  // in WebDriver, but there is in several other places, like this one
  void afterScript(String script, WebDriver driver);

  /**
   * Called whenever an exception would be thrown.
   */
  void onException(Throwable throwable, WebDriver driver);
}
