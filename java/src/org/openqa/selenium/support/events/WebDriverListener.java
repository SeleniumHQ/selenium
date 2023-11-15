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

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.time.Duration;
import java.util.Collection;
import java.util.List;
import java.util.Set;
import org.openqa.selenium.Alert;
import org.openqa.selenium.Beta;
import org.openqa.selenium.By;
import org.openqa.selenium.Cookie;
import org.openqa.selenium.Dimension;
import org.openqa.selenium.Point;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Sequence;

/**
 * Classes that implement this interface are intended to be used with {@link EventFiringDecorator},
 * read documentation for this class to find detailed usage description.
 *
 * <p>This interface provides empty default implementation for all methods that do nothing.
 */
@Beta
public interface WebDriverListener {

  // Global

  default void beforeAnyCall(Object target, Method method, Object[] args) {}

  default void afterAnyCall(Object target, Method method, Object[] args, Object result) {}

  default void onError(Object target, Method method, Object[] args, InvocationTargetException e) {}

  // WebDriver

  default void beforeAnyWebDriverCall(WebDriver driver, Method method, Object[] args) {}

  default void afterAnyWebDriverCall(
      WebDriver driver, Method method, Object[] args, Object result) {}

  default void beforeGet(WebDriver driver, String url) {}

  default void afterGet(WebDriver driver, String url) {}

  default void beforeGetCurrentUrl(WebDriver driver) {}

  default void afterGetCurrentUrl(String result, WebDriver driver) {}

  default void beforeGetTitle(WebDriver driver) {}

  default void afterGetTitle(WebDriver driver, String result) {}

  default void beforeFindElement(WebDriver driver, By locator) {}

  default void afterFindElement(WebDriver driver, By locator, WebElement result) {}

  default void beforeFindElements(WebDriver driver, By locator) {}

  default void afterFindElements(WebDriver driver, By locator, List<WebElement> result) {}

  default void beforeGetPageSource(WebDriver driver) {}

  default void afterGetPageSource(WebDriver driver, String result) {}

  default void beforeClose(WebDriver driver) {}

  default void afterClose(WebDriver driver) {}

  default void beforeQuit(WebDriver driver) {}

  default void afterQuit(WebDriver driver) {}

  default void beforeGetWindowHandles(WebDriver driver) {}

  default void afterGetWindowHandles(WebDriver driver, Set<String> result) {}

  default void beforeGetWindowHandle(WebDriver driver) {}

  default void afterGetWindowHandle(WebDriver driver, String result) {}

  default void beforeExecuteScript(WebDriver driver, String script, Object[] args) {}

  default void afterExecuteScript(WebDriver driver, String script, Object[] args, Object result) {}

  default void beforeExecuteAsyncScript(WebDriver driver, String script, Object[] args) {}

  default void afterExecuteAsyncScript(
      WebDriver driver, String script, Object[] args, Object result) {}

  default void beforePerform(WebDriver driver, Collection<Sequence> actions) {}

  default void afterPerform(WebDriver driver, Collection<Sequence> actions) {}

  default void beforeResetInputState(WebDriver driver) {}

  default void afterResetInputState(WebDriver driver) {}

  // WebElement

  default void beforeAnyWebElementCall(WebElement element, Method method, Object[] args) {}

  default void afterAnyWebElementCall(
      WebElement element, Method method, Object[] args, Object result) {}

  default void beforeClick(WebElement element) {}

  default void afterClick(WebElement element) {}

  default void beforeSubmit(WebElement element) {}

  default void afterSubmit(WebElement element) {}

  default void beforeSendKeys(WebElement element, CharSequence... keysToSend) {}

  default void afterSendKeys(WebElement element, CharSequence... keysToSend) {}

  default void beforeClear(WebElement element) {}

  default void afterClear(WebElement element) {}

  default void beforeGetTagName(WebElement element) {}

  default void afterGetTagName(WebElement element, String result) {}

  default void beforeGetAttribute(WebElement element, String name) {}

  default void afterGetAttribute(WebElement element, String name, String result) {}

  default void beforeIsSelected(WebElement element) {}

  default void afterIsSelected(WebElement element, boolean result) {}

  default void beforeIsEnabled(WebElement element) {}

  default void afterIsEnabled(WebElement element, boolean result) {}

  default void beforeGetText(WebElement element) {}

  default void afterGetText(WebElement element, String result) {}

  default void beforeFindElement(WebElement element, By locator) {}

  default void afterFindElement(WebElement element, By locator, WebElement result) {}

  default void beforeFindElements(WebElement element, By locator) {}

  default void afterFindElements(WebElement element, By locator, List<WebElement> result) {}

  default void beforeIsDisplayed(WebElement element) {}

  default void afterIsDisplayed(WebElement element, boolean result) {}

  default void beforeGetLocation(WebElement element) {}

  default void afterGetLocation(WebElement element, Point result) {}

  default void beforeGetSize(WebElement element) {}

  default void afterGetSize(WebElement element, Dimension result) {}

  default void beforeGetCssValue(WebElement element, String propertyName) {}

  default void afterGetCssValue(WebElement element, String propertyName, String result) {}

  // Navigation

  default void beforeAnyNavigationCall(
      WebDriver.Navigation navigation, Method method, Object[] args) {}

  default void afterAnyNavigationCall(
      WebDriver.Navigation navigation, Method method, Object[] args, Object result) {}

  default void beforeTo(WebDriver.Navigation navigation, String url) {}

  default void afterTo(WebDriver.Navigation navigation, String url) {}

  default void beforeTo(WebDriver.Navigation navigation, URL url) {}

  default void afterTo(WebDriver.Navigation navigation, URL url) {}

  default void beforeBack(WebDriver.Navigation navigation) {}

  default void afterBack(WebDriver.Navigation navigation) {}

  default void beforeForward(WebDriver.Navigation navigation) {}

  default void afterForward(WebDriver.Navigation navigation) {}

  default void beforeRefresh(WebDriver.Navigation navigation) {}

  default void afterRefresh(WebDriver.Navigation navigation) {}

  // Alert

  default void beforeAnyAlertCall(Alert alert, Method method, Object[] args) {}

  default void afterAnyAlertCall(Alert alert, Method method, Object[] args, Object result) {}

  default void beforeAccept(Alert alert) {}

  default void afterAccept(Alert alert) {}

  default void beforeDismiss(Alert alert) {}

  default void afterDismiss(Alert alert) {}

  default void beforeGetText(Alert alert) {}

  default void afterGetText(Alert alert, String result) {}

  default void beforeSendKeys(Alert alert, String text) {}

  default void afterSendKeys(Alert alert, String text) {}

  // Options

  default void beforeAnyOptionsCall(WebDriver.Options options, Method method, Object[] args) {}

  default void afterAnyOptionsCall(
      WebDriver.Options options, Method method, Object[] args, Object result) {}

  default void beforeAddCookie(WebDriver.Options options, Cookie cookie) {}

  default void afterAddCookie(WebDriver.Options options, Cookie cookie) {}

  default void beforeDeleteCookieNamed(WebDriver.Options options, String name) {}

  default void afterDeleteCookieNamed(WebDriver.Options options, String name) {}

  default void beforeDeleteCookie(WebDriver.Options options, Cookie cookie) {}

  default void afterDeleteCookie(WebDriver.Options options, Cookie cookie) {}

  default void beforeDeleteAllCookies(WebDriver.Options options) {}

  default void afterDeleteAllCookies(WebDriver.Options options) {}

  default void beforeGetCookies(WebDriver.Options options) {}

  default void afterGetCookies(WebDriver.Options options, Set<Cookie> result) {}

  default void beforeGetCookieNamed(WebDriver.Options options, String name) {}

  default void afterGetCookieNamed(WebDriver.Options options, String name, Cookie result) {}

  // Timeouts

  default void beforeAnyTimeoutsCall(WebDriver.Timeouts timeouts, Method method, Object[] args) {}

  default void afterAnyTimeoutsCall(
      WebDriver.Timeouts timeouts, Method method, Object[] args, Object result) {}

  default void beforeImplicitlyWait(WebDriver.Timeouts timeouts, Duration duration) {}

  default void afterImplicitlyWait(WebDriver.Timeouts timeouts, Duration duration) {}

  default void beforeSetScriptTimeout(WebDriver.Timeouts timeouts, Duration duration) {}

  default void afterSetScriptTimeout(WebDriver.Timeouts timeouts, Duration duration) {}

  default void beforePageLoadTimeout(WebDriver.Timeouts timeouts, Duration duration) {}

  default void afterPageLoadTimeout(WebDriver.Timeouts timeouts, Duration duration) {}

  // Window

  default void beforeAnyWindowCall(WebDriver.Window window, Method method, Object[] args) {}

  default void afterAnyWindowCall(
      WebDriver.Window window, Method method, Object[] args, Object result) {}

  default void beforeGetSize(WebDriver.Window window) {}

  default void afterGetSize(WebDriver.Window window, Dimension result) {}

  default void beforeSetSize(WebDriver.Window window, Dimension size) {}

  default void afterSetSize(WebDriver.Window window, Dimension size) {}

  default void beforeGetPosition(WebDriver.Window window) {}

  default void afterGetPosition(WebDriver.Window window, Point result) {}

  default void beforeSetPosition(WebDriver.Window window, Point position) {}

  default void afterSetPosition(WebDriver.Window window, Point position) {}

  default void beforeMaximize(WebDriver.Window window) {}

  default void afterMaximize(WebDriver.Window window) {}

  default void beforeFullscreen(WebDriver.Window window) {}

  default void afterFullscreen(WebDriver.Window window) {}
}
