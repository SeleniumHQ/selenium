/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.
Portions copyright 2007 ThoughtWorks, Inc

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

package org.openqa.selenium;

import java.net.URL;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;


/**
 * The main interface to use for testing, which represents an idealised web
 * browser. The methods in this class fall into three categories:
 * <p/>
 * <ul>
 * <li>Control of the browser itself</li>
 * <li>Selection of {@link WebElement}s</li>
 * <li>Debugging aids</li>
 * </ul>
 * <p/>
 * Key methods are {@link WebDriver#get(String)}, which is used to load a new
 * web page, and the various methods similar to
 * {@link WebDriver#findElement(By)}, which is used to find
 * {@link WebElement}s.
 * <p/>
 * Currently, you will need to instantiate implementations of this class
 * directly. It is hoped that you write your tests against this interface so
 * that you may "swap in" a more fully featured browser when there is a
 * requirement for one. Given this approach to testing, it is best to start
 * writing your tests using the {@link org.openqa.selenium.htmlunit.HtmlUnitDriver} implementation.
 * <p/>
 * Note that all methods that use XPath to locate elements will throw a
 * {@link RuntimeException} should there be an error thrown by the underlying
 * XPath engine.
 *
 * @see org.openqa.selenium.ie.InternetExplorerDriver
 * @see org.openqa.selenium.htmlunit.HtmlUnitDriver
 */
public interface WebDriver extends SearchContext {
  // Navigation

  /**
   * Load a new web page in the current browser window. This is done using an
   * HTTP GET operation, and the method will block until the load is complete.
   * This will follow redirects issued either by the server or as a
   * meta-redirect from within the returned HTML. Should a meta-redirect
   * "rest" for any duration of time, it is best to wait until this timeout is
   * over, since should the underlying page change whilst your test is
   * executing the results of future calls against this interface will be
   * against the freshly loaded page. Synonym for
   * {@link org.openqa.selenium.WebDriver.Navigation#to(String)}.
   *
   * @param url The URL to load. It is best to use a fully qualified URL
   */
  void get(String url);

  /**
   * Get a string representing the current URL that the browser is looking at.
   *
   * @return The URL of the page currently loaded in the browser
   */
  String getCurrentUrl();

  // General properties

  /**
   * The title of the current page.
   *
   * @return The title of the current page,
   *         with leading and trailing whitespace stripped,
   *         or null if one is not already set
   */
  String getTitle();

  /**
   * Find all elements within the current page using the given mechanism.
   *
   * @param by The locating mechanism to use
   * @return A list of all {@link WebElement}s, or an empty list if nothing matches
   * @see org.openqa.selenium.By
   */
  List<WebElement> findElements(By by);


  /**
   * Find the first {@link WebElement} using the given method.
   *
   * @param by The locating mechanism
   * @return The first matching element on the current page
   * @throws NoSuchElementException If no matching elements are found
   */
  WebElement findElement(By by);

  // Misc

  /**
   * Get the source of the last loaded page. If the page has been modified
   * after loading (for example, by Javascript) there is no guarentee that the
   * returned text is that of the modified page. Please consult the
   * documentation of the particular driver being used to determine whether
   * the returned text reflects the current state of the page or the text last
   * sent by the web server. The page source returned is a representation of
   * the underlying DOM: do not expect it to be formatted or escaped in the same
   * way as the response sent from the web server.
   *
   * @return The source of the current page
   */
  String getPageSource();

  /**
   * Close the current window, quitting the browser if it's the last window
   * currently open.
   */
  void close();

  /**
   * Quits this driver, closing every associated window.
   */
  void quit();

  /**
   * Return a set of window handles which can be used to iterate over all open windows of
   * this webdriver instance by passing them to {@link #switchTo().window(String)}
   *
   * @return A set of window handles which can be used to iterate over all open windows.
   */
  Set<String> getWindowHandles();

  /**
   * Return an opaque handle to this window that uniquely identifies it within this driver
   * instance. This can be used to switch to this window at a later date
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
   * An abstraction allowing the driver to access the browser's history and to
   * navigate to a given URL.
   *
   * @return A {@link org.openqa.selenium.WebDriver.Navigation} that allows
   *         the selection of what to do next
   */
  Navigation navigate();

  /**
   * Gets the Option interface
   *
   * @return An option interface
   * @see org.openqa.selenium.WebDriver.Options
   */
  Options manage();

  /**
   * An interface for managing stuff you would do in a browser menu
   */
  interface Options {

    /**
     * Add a specific cookie. If the cookie's domain name is left blank, it
     * is assumed that the cookie is meant for the domain of the current
     * document.
     *
     * @param cookie The cookie to add.
     */
    void addCookie(Cookie cookie);

    /**
     * Delete the named cookie from the current domain. This is equivalent
     * to setting the named cookie's expiry date to some time in the past.
     *
     * @param name The name of the cookie to delete
     */
    void deleteCookieNamed(String name);

    /**
     * Delete a cookie from the browser's "cookie jar". The domain of the
     * cookie will be ignored.
     *
     * @param cookie
     */
    void deleteCookie(Cookie cookie);

    /**
     * Delete all the cookies for the current domain.
     */
    void deleteAllCookies();

    /**
     * Get all the cookies for the current domain. This is the equivalent of
     * calling "document.cookie" and parsing the result
     *
     * @return A Set of cookies for the current domain.
     */
    Set<Cookie> getCookies();

    /**
     * Get a cookie with a given name.
     *
     * @param name the name of the cookie
     * @return the cookie, or null if no cookie with the given name is present
     */
    Cookie getCookieNamed(String name);

    /**
     * Gets the mouse speed for drag and drop
     */
    Speed getSpeed();

    /**
     * Sets the speed for user input
     *
     * @param speed
     */
    void setSpeed(Speed speed);

    /**
     * Returns the interface for managing driver timeouts.
     */
    Timeouts timeouts();
  }

  /**
   * An interface for managing timeout behavior for WebDriver instances.
   */
  interface Timeouts {

    /**
     * Specifies the amount of time the driver should wait when searching for an
     * element if it is not immediately present.
     * <p/>
     * When searching for a single element, the driver should poll the page
     * until the element has been found, or this timeout expires before throwing
     * a {@link NoSuchElementException}. When searching for multiple elements,
     * the driver should poll the page until at least one element has been found
     * or this timeout has expired.
     * <p/>
     * Increasing the implicit wait timeout should be used judiciously as it
     * will have an adverse effect on test run time, especially when used with
     * slower location strategies like XPath.
     *
     * @param time The amount of time to wait.
     * @param unit The unit of measure for {@code time}.
     * @return A self reference.
     */
    Timeouts implicitlyWait(long time, TimeUnit unit);
  }

  /**
   * Used to locate a given frame or window.
   */
  interface TargetLocator {
    /**
     * Select a frame by its (zero-based) index. That is, if a page has
     * three frames, the first frame would be at index "0", the second at
     * index "1" and the third at index "2". Once the frame has been
     * selected, all subsequent calls on the WebDriver interface are made to
     * that frame.
     *
     * @param frameIndex
     * @return A driver focused on the given frame
     * @throws NoSuchFrameException If the frame cannot be found
     */
    WebDriver frame(int frameIndex);

    /**
     * Select a frame by its name or ID. To select sub-frames, simply separate the frame names/IDs
     * by dots. As an example "main.child" will select the frame with the name "main" and then it's
     * child "child". If a frame name is a number, then it will be treated as selecting a frame as
     * if using.
     *
     * @param frameName
     * @return A driver focused on the given frame
     * @throws NoSuchFrameException If the frame cannot be found
     */
    WebDriver frame(String frameName);

    /**
     * Switch the focus of future commands for this driver to the window with the given name
     *
     * @param windowName
     * @return A driver focused on the given window
     * @throws NoSuchWindowException If the window cannot be found
     */
    WebDriver window(String windowName);

    /**
     * Selects either the first frame on the page, or the main document when a page contains
     * iframes.
     */
    WebDriver defaultContent();

    /**
     * Switches to the element that currently has focus, or the body element if this cannot be
     * detected.
     *
     * @return The WebElement with focus, or the body element if no element with focus can be
     *     detected.
     */
    WebElement activeElement();

//        Alert alert();
  }

  interface Navigation {
    /**
     * Move back a single "item" in the browser's history.
     */
    void back();

    /**
     * Move a single "item" forward in the browser's history. Does nothing if
     * we are on the latest page viewed.
     */
    void forward();


    /**
     * Load a new web page in the current browser window. This is done using an
     * HTTP GET operation, and the method will block until the load is complete.
     * This will follow redirects issued either by the server or as a
     * meta-redirect from within the returned HTML. Should a meta-redirect
     * "rest" for any duration of time, it is best to wait until this timeout is
     * over, since should the underlying page change whilst your test is
     * executing the results of future calls against this interface will be
     * against the freshly loaded page.
     *
     * @param url The URL to load. It is best to use a fully qualified URL
     */
    void to(String url);

    /**
     * Overloaded version of {@link #to(String)} that makes it easy to pass in a URL.
     *
     * @param url
     */
    void to(URL url);

    /**
     * Refresh the current page
     */
    void refresh();
  }
}
