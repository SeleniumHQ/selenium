/*
 * Copyright 2007 ThoughtWorks, Inc
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

package com.thoughtworks.webdriver;

import java.util.List;


/**
 * The main interface to use for testing, which represents an idealised web
 * browser. The methods in this class fall into three categories:
 * 
 * <ul>
 * <li>Control of the browser itself</li>
 * <li>Selection of {@link WebElement}s</li>
 * <li>Debugging aids</li>
 * </ul>
 * 
 * Key methods are {@link WebDriver#get(String)}, which is used to load a new
 * web page, and the various methods similar to
 * {@link WebDriver#selectElement(String)}, which is used to find
 * {@link WebElement}s.
 * 
 * Currently, you will need to instantiate implementations of this class
 * directly. It is hoped that you write your tests against this interface so
 * that you may "swap in" a more fully featured browser when there is a
 * requirement for one. Given this approach to testing, it is best to start
 * writing your tests using the {@link com.thoughtworks.webdriver.htmlunit.HtmlUnitDriver} implementation.
 * 
 * Note that all methods that use XPath to locate elements will throw a
 * {@link RuntimeException} should there be an error thrown by the underlying
 * XPath engine.
 * 
 * @see com.thoughtworks.webdriver.ie.InternetExplorerDriver
 * @see com.thoughtworks.webdriver.htmlunit.HtmlUnitDriver
 */
public interface WebDriver {
	// Navigation
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
	 * @param url
	 *            The URL to load. It is best to use a fully qualified URL
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
	 * @return The title of the current page, or null if one is not already set
	 */
	String getTitle();

	/**
	 * Is the browser visible or not?
	 * 
	 * @return True if the browser can be seen, or false otherwise
	 */
	boolean getVisible();

	/**
	 * Make the browser visible or not. Note that for some implementations, this
	 * is a no-op.
	 * 
	 * @param visible
	 *            Set whether or not the browser is visible
	 */
	void setVisible(boolean visible);

	// XPath goodness
	/**
	 * Convience method to locate a single element and return the text contained
	 * within it. Note that the returned string will not have
	 * {@link String#trim()} run against it, so if leading or trailing
	 * whitespace doesn't matter to you, this may need to be removed. Also, if
	 * the underlying XML engine may trim whitespace, but this is an unexpected
	 * behaviour
	 * 
	 * @param xpath
	 *            XPath required to select an element on the current page
	 * @return The InnerText of the first matching element
	 * @throws NoSuchElementException
	 *             If no element matches the XPath
	 */
	String selectText(String xpath);

	/**
	 * Find all elements within the current page which match the given XPath
	 * query.
	 * 
	 * @param xpath
	 *            An XPath expression, selecting elements, to use.
	 * @return A list of all {@link WebElement}s matching the XPath, or an
	 *         empty list if nothing matches
	 */
	List selectElements(String xpath);

	/**
	 * Select the first {@link WebElement} which matches the given selector. The
	 * selector is assumed to be an XPath expression, unless it begins with
	 * <ul>
     *   <li>"link=" (no spaces!) followed by the link text to look for.</li>
     *   <li>"id=" followed by the ID of the element to locate</li>
     * </ul>
	 * 
	 * @param selector
	 *            An XPath expression to use, or the link text of if the
	 *            selector begins with "link="
	 * @return The first matching element on the current page
	 * @throws NoSuchElementException
	 *             If no matching elements are found
	 */
	WebElement selectElement(String selector);

	// Misc
	/**
	 * Dump the body of the last loaded page to standard out (normally the
	 * console). If the page has been modified after loading (for example, by
	 * Javascript) there is no guarentee that the returned text is that of the
	 * modified page. Please consult the documentation of the particular driver
	 * being used to determine whether the returned text reflects the current
	 * state of the page or the text last sent by the web server.
	 */
	void dumpBody();

	/**
	 * Close the current window, quitting the browser if it's the last window
	 * currently open.
	 */
	void close();

    /**
     * Send future commands to a different frame or window.
     *
     * @return A TargetLocator which can be used to select a frame or window
     * @see com.thoughtworks.webdriver.WebDriver.TargetLocator
     */
    TargetLocator switchTo();

    /**
     * Used to locate a given frame or window.
     */
    public interface TargetLocator {
        /**
         * Select a frame by its (zero-based) index. That is, if a page has three frames, the first frame would be at index "0",
         * the second at index "1" and the third at index "2". Once the frame has been selected, all subsequent calls on the WebDriver interface are made to that frame.
         *
         * @param frameIndex
         * @return
         */
        WebDriver frame(int frameIndex);

        WebDriver window(int windowIndex);
    }
}
