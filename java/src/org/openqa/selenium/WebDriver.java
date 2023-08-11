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

package org.openqa.selenium;

import java.net.URL;
import java.time.Duration;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import org.openqa.selenium.logging.LoggingPreferences;
import org.openqa.selenium.logging.Logs;

/**
 * WebDriver is a remote control interface that enables introspection and control of user agents
 * (browsers). The methods in this interface fall into three categories:
 *
 * <ul>
 *   <li>Control of the browser itself
 *   <li>Selection of {@link WebElement}s
 *   <li>Debugging aids
 * </ul>
 *
 * <p>Key methods are {@link WebDriver#get(String)}, which is used to load a new web page, and the
 * various methods similar to {@link WebDriver#findElement(By)}, which is used to find {@link
 * WebElement}s.
 *
 * <p>Currently, you will need to instantiate implementations of this interface directly. It is
 * hoped that you write your tests against this interface so that you may "swap in" a more fully
 * featured browser when there is a requirement for one.
 *
 * <p>Most implementations of this interface follow <a href="https://w3c.github.io/webdriver/">W3C
 * WebDriver specification</a>
 */
public interface WebDriver extends SearchContext {
  // Navigation

  /**
   * Load a new web page in the current browser window. This is done using an HTTP POST operation,
   * and the method will block until the load is complete (with the default 'page load strategy'.
   * This will follow redirects issued either by the server or as a meta-redirect from within the
   * returned HTML. Should a meta-redirect "rest" for any duration of time, it is best to wait until
   * this timeout is over, since should the underlying page change whilst your test is executing the
   * results of future calls against this interface will be against the freshly loaded page. Synonym
   * for {@link org.openqa.selenium.WebDriver.Navigation#to(String)}.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#navigate-to">W3C WebDriver specification</a>
   * for more details.
   *
   * @param url The URL to load. Must be a fully qualified URL
   * @see org.openqa.selenium.PageLoadStrategy
   */
  void get(String url);

  /**
   * Get a string representing the current URL that the browser is looking at.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#get-current-url">W3C WebDriver
   * specification</a> for more details.
   *
   * @return The URL of the page currently loaded in the browser
   */
  String getCurrentUrl();

  // General properties

  /**
   * Get the title of the current page.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#get-title">W3C WebDriver specification</a> for
   * more details.
   *
   * @return The title of the current page, with leading and trailing whitespace stripped, or null
   *     if one is not already set
   */
  String getTitle();

  /**
   * Find all elements within the current page using the given mechanism. This method is affected by
   * the 'implicit wait' times in force at the time of execution. When implicitly waiting, this
   * method will return as soon as there are more than 0 items in the found collection, or will
   * return an empty list if the timeout is reached.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#find-elements">W3C WebDriver specification</a>
   * for more details.
   *
   * @param by The locating mechanism to use
   * @return A list of all matching {@link WebElement}s, or an empty list if nothing matches
   * @see org.openqa.selenium.By
   * @see org.openqa.selenium.WebDriver.Timeouts
   */
  @Override
  List<WebElement> findElements(By by);

  /**
   * Find the first {@link WebElement} using the given method. This method is affected by the
   * 'implicit wait' times in force at the time of execution. The findElement(..) invocation will
   * return a matching row, or try again repeatedly until the configured timeout is reached.
   *
   * <p>findElement should not be used to look for non-present elements, use {@link
   * #findElements(By)} and assert zero length response instead.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#find-element">W3C WebDriver specification</a>
   * for more details.
   *
   * @param by The locating mechanism to use
   * @return The first matching element on the current page
   * @throws NoSuchElementException If no matching elements are found
   * @see org.openqa.selenium.By
   * @see org.openqa.selenium.WebDriver.Timeouts
   */
  @Override
  WebElement findElement(By by);

  // Misc

  /**
   * Get the source of the last loaded page. If the page has been modified after loading (for
   * example, by Javascript) there is no guarantee that the returned text is that of the modified
   * page. Please consult the documentation of the particular driver being used to determine whether
   * the returned text reflects the current state of the page or the text last sent by the web
   * server. The page source returned is a representation of the underlying DOM: do not expect it to
   * be formatted or escaped in the same way as the response sent from the web server. Think of it
   * as an artist's impression.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#get-page-source">W3C WebDriver
   * specification</a> for more details.
   *
   * @return The source of the current page
   */
  String getPageSource();

  /**
   * Close the current window, quitting the browser if it's the last window currently open.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#close-window">W3C WebDriver specification</a>
   * for more details.
   */
  void close();

  /** Quits this driver, closing every associated window. */
  void quit();

  /**
   * Return a set of window handles which can be used to iterate over all open windows of this
   * WebDriver instance by passing them to {@link #switchTo()}.{@link Options#window()}
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#get-window-handles">W3C WebDriver
   * specification</a> for more details.
   *
   * @return A set of window handles which can be used to iterate over all open windows.
   */
  Set<String> getWindowHandles();

  /**
   * Return an opaque handle to this window that uniquely identifies it within this driver instance.
   * This can be used to switch to this window at a later date
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#get-window-handle">W3C WebDriver
   * specification</a> for more details.
   *
   * @return the current window handle
   */
  String getWindowHandle();

  /**
   * Send future commands to a different frame or window.
   *
   * @return A TargetLocator which can be used to select a frame or window
   * @see org.openqa.selenium.WebDriver.TargetLocator
   */
  TargetLocator switchTo();

  /**
   * An abstraction allowing the driver to access the browser's history and to navigate to a given
   * URL.
   *
   * @return A {@link org.openqa.selenium.WebDriver.Navigation} that allows the selection of what to
   *     do next
   */
  Navigation navigate();

  /**
   * Gets the Option interface
   *
   * @return An option interface
   * @see org.openqa.selenium.WebDriver.Options
   */
  Options manage();

  /** An interface for managing stuff you would do in a browser menu */
  interface Options {

    /**
     * Add a specific cookie. If the cookie's domain name is left blank, it is assumed that the
     * cookie is meant for the domain of the current document.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#add-cookie">W3C WebDriver specification</a>
     * for more details.
     *
     * @param cookie The cookie to add.
     */
    void addCookie(Cookie cookie);

    /**
     * Delete the named cookie from the current domain. This is equivalent to setting the named
     * cookie's expiry date to some time in the past.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#delete-cookie">W3C WebDriver
     * specification</a> for more details.
     *
     * @param name The name of the cookie to delete
     */
    void deleteCookieNamed(String name);

    /**
     * Delete a cookie from the browser's "cookie jar". The domain of the cookie will be ignored.
     *
     * @param cookie nom nom nom
     */
    void deleteCookie(Cookie cookie);

    /**
     * Delete all the cookies for the current domain.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#delete-all-cookies">W3C WebDriver
     * specification</a> for more details.
     */
    void deleteAllCookies();

    /**
     * Get all the cookies for the current domain.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#get-all-cookies">W3C WebDriver
     * specification</a> for more details.
     *
     * @return A Set of cookies for the current domain.
     */
    Set<Cookie> getCookies();

    /**
     * Get a cookie with a given name.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#get-named-cookie">W3C WebDriver
     * specification</a> for more details.
     *
     * @param name the name of the cookie
     * @return the cookie, or null if no cookie with the given name is present
     */
    Cookie getCookieNamed(String name);

    /**
     * @return the interface for managing driver timeouts.
     */
    Timeouts timeouts();

    /**
     * @return the interface for managing the current window.
     */
    Window window();

    /**
     * Gets the {@link Logs} interface used to fetch different types of logs.
     *
     * <p>To set the logging preferences {@link LoggingPreferences}.
     *
     * @return A Logs interface.
     */
    @Beta
    Logs logs();
  }

  /**
   * An interface for managing timeout behavior for WebDriver instances.
   *
   * <p>See <a href="https://w3c.github.io/webdriver/#set-timeouts">W3C WebDriver specification</a>
   * for more details.
   */
  interface Timeouts {

    /**
     * @deprecated Use {@link #implicitlyWait(Duration)}
     *     <p>Specifies the amount of time the driver should wait when searching for an element if
     *     it is not immediately present.
     *     <p>When searching for a single element, the driver should poll the page until the element
     *     has been found, or this timeout expires before throwing a {@link NoSuchElementException}.
     *     When searching for multiple elements, the driver should poll the page until at least one
     *     element has been found or this timeout has expired.
     *     <p>Increasing the implicit wait timeout should be used judiciously as it will have an
     *     adverse effect on test run time, especially when used with slower location strategies
     *     like XPath.
     *     <p>If the timeout is negative, not null, or greater than 2e16 - 1, an error code with
     *     invalid argument will be returned.
     * @param time The amount of time to wait.
     * @param unit The unit of measure for {@code time}.
     * @return A self reference.
     */
    @Deprecated
    Timeouts implicitlyWait(long time, TimeUnit unit);

    /**
     * Specifies the amount of time the driver should wait when searching for an element if it is
     * not immediately present.
     *
     * <p>When searching for a single element, the driver should poll the page until the element has
     * been found, or this timeout expires before throwing a {@link NoSuchElementException}. When
     * searching for multiple elements, the driver should poll the page until at least one element
     * has been found or this timeout has expired.
     *
     * <p>Increasing the implicit wait timeout should be used judiciously as it will have an adverse
     * effect on test run time, especially when used with slower location strategies like XPath.
     *
     * <p>If the timeout is negative, not null, or greater than 2e16 - 1, an error code with invalid
     * argument will be returned.
     *
     * @param duration The duration to wait.
     * @return A self reference.
     */
    default Timeouts implicitlyWait(Duration duration) {
      return implicitlyWait(duration.toMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * Gets the amount of time the driver should wait when searching for an element if it is not
     * immediately present.
     *
     * @return The amount of time the driver should wait when searching for an element.
     * @see <a href="https://www.w3.org/TR/webdriver/#get-timeouts">W3C WebDriver</a>
     */
    default Duration getImplicitWaitTimeout() {
      throw new UnsupportedCommandException();
    }

    /**
     * @deprecated Use {@link #setScriptTimeout(Duration)}
     *     <p>Sets the amount of time to wait for an asynchronous script to finish execution before
     *     throwing an error. If the timeout is negative, not null, or greater than 2e16 - 1, an
     *     error code with invalid argument will be returned.
     * @param time The timeout value.
     * @param unit The unit of time.
     * @return A self reference.
     * @see JavascriptExecutor#executeAsyncScript(String, Object...)
     * @see <a href="https://www.w3.org/TR/webdriver/#set-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    @Deprecated
    Timeouts setScriptTimeout(long time, TimeUnit unit);

    /**
     * Sets the amount of time to wait for an asynchronous script to finish execution before
     * throwing an error. If the timeout is negative, not null, or greater than 2e16 - 1, an error
     * code with invalid argument will be returned.
     *
     * @param duration The timeout value.
     * @deprecated Use {@link #scriptTimeout(Duration)}
     * @return A self reference.
     * @see JavascriptExecutor#executeAsyncScript(String, Object...)
     * @see <a href="https://www.w3.org/TR/webdriver/#set-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    @Deprecated
    default Timeouts setScriptTimeout(Duration duration) {
      return setScriptTimeout(duration.toMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * Sets the amount of time to wait for an asynchronous script to finish execution before
     * throwing an error. If the timeout is negative, not null, or greater than 2e16 - 1, an error
     * code with invalid argument will be returned.
     *
     * @param duration The timeout value.
     * @return A self reference.
     * @see JavascriptExecutor#executeAsyncScript(String, Object...)
     * @see <a href="https://www.w3.org/TR/webdriver/#set-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    default Timeouts scriptTimeout(Duration duration) {
      return setScriptTimeout(duration);
    }

    /**
     * Gets the amount of time to wait for an asynchronous script to finish execution before
     * throwing an error. If the timeout is negative, not null, or greater than 2e16 - 1, an error
     * code with invalid argument will be returned.
     *
     * @return The amount of time to wait for an asynchronous script to finish execution.
     * @see <a href="https://www.w3.org/TR/webdriver/#get-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    default Duration getScriptTimeout() {
      throw new UnsupportedCommandException();
    }

    /**
     * @param time The timeout value.
     * @param unit The unit of time.
     * @return A Timeouts interface.
     * @see <a href="https://www.w3.org/TR/webdriver/#set-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     * @deprecated Use {@link #pageLoadTimeout(Duration)}
     *     <p>Sets the amount of time to wait for a page load to complete before throwing an error.
     *     If the timeout is negative, not null, or greater than 2e16 - 1, an error code with
     *     invalid argument will be returned.
     */
    @Deprecated
    Timeouts pageLoadTimeout(long time, TimeUnit unit);

    /**
     * Sets the amount of time to wait for a page load to complete before throwing an error. If the
     * timeout is negative, not null, or greater than 2e16 - 1, an error code with invalid argument
     * will be returned.
     *
     * @param duration The timeout value.
     * @return A Timeouts interface.
     * @see <a href="https://www.w3.org/TR/webdriver/#set-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    default Timeouts pageLoadTimeout(Duration duration) {
      return pageLoadTimeout(duration.toMillis(), TimeUnit.MILLISECONDS);
    }

    /**
     * Gets the amount of time to wait for a page load to complete before throwing an error. If the
     * timeout is negative, not null, or greater than 2e16 - 1, an error code with invalid argument
     * will be returned.
     *
     * @return The amount of time to wait for a page load to complete.
     * @see <a href="https://www.w3.org/TR/webdriver/#get-timeouts">W3C WebDriver</a>
     * @see <a href="https://www.w3.org/TR/webdriver/#dfn-timeouts-configuration">W3C WebDriver</a>
     */
    default Duration getPageLoadTimeout() {
      throw new UnsupportedCommandException();
    }
  }

  /** Used to locate a given frame or window. */
  interface TargetLocator {
    /**
     * Select a frame by its (zero-based) index. Selecting a frame by index is equivalent to the JS
     * expression window.frames[index] where "window" is the DOM window represented by the current
     * context. Once the frame has been selected, all subsequent calls on the WebDriver interface
     * are made to that frame.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#switch-to-frame">W3C WebDriver
     * specification</a> for more details.
     *
     * @param index (zero-based) index
     * @return This driver focused on the given frame
     * @throws NoSuchFrameException If the frame cannot be found
     */
    WebDriver frame(int index);

    /**
     * Select a frame by its name or ID. Frames located by matching name attributes are always given
     * precedence over those matched by ID.
     *
     * @param nameOrId the name of the frame window, the id of the &lt;frame&gt; or &lt;iframe&gt;
     *     element, or the (zero-based) index
     * @return This driver focused on the given frame
     * @throws NoSuchFrameException If the frame cannot be found
     */
    WebDriver frame(String nameOrId);

    /**
     * Select a frame using its previously located {@link WebElement}.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#switch-to-frame">W3C WebDriver
     * specification</a> for more details.
     *
     * @param frameElement The frame element to switch to.
     * @return This driver focused on the given frame.
     * @throws NoSuchFrameException If the given element is neither an IFRAME nor a FRAME element.
     * @throws StaleElementReferenceException If the WebElement has gone stale.
     * @see WebDriver#findElement(By)
     */
    WebDriver frame(WebElement frameElement);

    /**
     * Change focus to the parent context. If the current context is the top level browsing context,
     * the context remains unchanged.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#switch-to-parent-frame">W3C WebDriver
     * specification</a> for more details.
     *
     * @return This driver focused on the parent frame
     */
    WebDriver parentFrame();

    /**
     * Switch the focus of future commands for this driver to the window with the given name/handle.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#switch-to-window">W3C WebDriver
     * specification</a> for more details.
     *
     * @param nameOrHandle The name of the window or the handle as returned by {@link
     *     WebDriver#getWindowHandle()}
     * @return This driver focused on the given window
     * @throws NoSuchWindowException If the window cannot be found
     */
    WebDriver window(String nameOrHandle);

    /**
     * Creates a new browser window and switches the focus for future commands of this driver to the
     * new window.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#new-window">W3C WebDriver specification</a>
     * for more details.
     *
     * @param typeHint The type of new browser window to be created. The created window is not
     *     guaranteed to be of the requested type; if the driver does not support the requested
     *     type, a new browser window will be created of whatever type the driver does support.
     * @return This driver focused on the given window
     */
    WebDriver newWindow(WindowType typeHint);

    /**
     * Selects either the first frame on the page, or the main document when a page contains
     * iframes.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#switch-to-frame">W3C WebDriver
     * specification</a> for more details.
     *
     * @return This driver focused on the top window/first frame.
     */
    WebDriver defaultContent();

    /**
     * Switches to the element that currently has focus within the document currently "switched to",
     * or the body element if this cannot be detected. This matches the semantics of calling
     * "document.activeElement" in Javascript.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#get-active-element">W3C WebDriver
     * specification</a> for more details.
     *
     * @return The WebElement with focus, or the body element if no element with focus can be
     *     detected.
     */
    WebElement activeElement();

    /**
     * Switches to the currently active modal dialog for this particular driver instance.
     *
     * @return A handle to the dialog.
     * @throws NoAlertPresentException If the dialog cannot be found
     */
    Alert alert();
  }

  interface Navigation {
    /**
     * Move back a single "item" in the browser's history.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#back">W3C WebDriver specification</a> for
     * more details.
     */
    void back();

    /**
     * Move a single "item" forward in the browser's history. Does nothing if we are on the latest
     * page viewed.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#forward">W3C WebDriver specification</a> for
     * more details.
     */
    void forward();

    /**
     * Load a new web page in the current browser window. This is done using an HTTP POST operation,
     * and the method will block until the load is complete. This will follow redirects issued
     * either by the server or as a meta-redirect from within the returned HTML. Should a
     * meta-redirect "rest" for any duration of time, it is best to wait until this timeout is over,
     * since should the underlying page change whilst your test is executing the results of future
     * calls against this interface will be against the freshly loaded page.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#navigate-to">W3C WebDriver specification</a>
     * for more details.
     *
     * @param url The URL to load. Must be a fully qualified URL
     */
    void to(String url);

    /**
     * Overloaded version of {@link #to(String)} that makes it easy to pass in a URL.
     *
     * @param url URL
     */
    void to(URL url);

    /**
     * Refresh the current page
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#refresh">W3C WebDriver specification</a> for
     * more details.
     */
    void refresh();
  }

  @Beta
  interface Window {

    /**
     * Get the size of the current window. This will return the outer window dimension, not just the
     * view port.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#get-window-rect">W3C WebDriver
     * specification</a> for more details.
     *
     * @return The current window size.
     */
    Dimension getSize();

    /**
     * Set the size of the current window. This will change the outer window dimension, not just the
     * view port, synonymous to window.resizeTo() in JS.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#set-window-rect">W3C WebDriver
     * specification</a> for more details.
     *
     * @param targetSize The target size.
     */
    void setSize(Dimension targetSize);

    /**
     * Get the position of the current window, relative to the upper left corner of the screen.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#get-window-rect">W3C WebDriver
     * specification</a> for more details.
     *
     * @return The current window position.
     */
    Point getPosition();

    /**
     * Set the position of the current window. This is relative to the upper left corner of the
     * screen, synonymous to window.moveTo() in JS.
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#set-window-rect">W3C WebDriver
     * specification</a> for more details.
     *
     * @param targetPosition The target position of the window.
     */
    void setPosition(Point targetPosition);

    /**
     * Maximizes the current window if it is not already maximized
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#maximize-window">W3C WebDriver
     * specification</a> for more details.
     */
    void maximize();

    /**
     * Minimizes the current window if it is not already minimized
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#minimize-window">W3C WebDriver
     * specification</a> for more details.
     */
    void minimize();

    /**
     * Fullscreen the current window if it is not already fullscreen
     *
     * <p>See <a href="https://w3c.github.io/webdriver/#fullscreen-window">W3C WebDriver
     * specification</a> for more details.
     */
    void fullscreen();
  }
}
