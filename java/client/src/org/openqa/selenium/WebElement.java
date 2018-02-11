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

import java.util.List;

/**
 * Represents an HTML element. Generally, all interesting operations to do with interacting with a
 * page will be performed through this interface.
 * <p>
 * All method calls will do a freshness check to ensure that the element reference is still valid.
 * This essentially determines whether or not the element is still attached to the DOM. If this test
 * fails, then an {@link org.openqa.selenium.StaleElementReferenceException} is thrown, and all
 * future calls to this instance will fail.
 */
public interface WebElement extends SearchContext, TakesScreenshot {
  /**
   * Click this element. If this causes a new page to load, you
   * should discard all references to this element and any further
   * operations performed on this element will throw a
   * StaleElementReferenceException.
   *
   * Note that if click() is done by sending a native event (which is
   * the default on most browsers/platforms) then the method will
   * _not_ wait for the next page to load and the caller should verify
   * that themselves.
   *
   * There are some preconditions for an element to be clicked. The
   * element must be visible and it must have a height and width
   * greater then 0.
   *
   * @throws StaleElementReferenceException If the element no
   *     longer exists as initially defined
   */
  void click();

  /**
   * If this current element is a form, or an element within a form, then this will be submitted to
   * the remote server. If this causes the current page to change, then this method will block until
   * the new page is loaded.
   *
   * @throws NoSuchElementException If the given element is not within a form
   */
  void submit();

  /**
   * Use this method to simulate typing into an element, which may set its value.
   *
   * @param keysToSend character sequence to send to the element
   *
   * @throws IllegalArgumentException if keysToSend is null
   */
  void sendKeys(CharSequence... keysToSend);

  /**
   * If this element is a text entry element, this will clear the value. Has no effect on other
   * elements. Text entry elements are INPUT and TEXTAREA elements.
   *
   * Note that the events fired by this event may not be as you'd expect.  In particular, we don't
   * fire any keyboard or mouse events.  If you want to ensure keyboard events are fired, consider
   * using something like {@link #sendKeys(CharSequence...)} with the backspace key.  To ensure
   * you get a change event, consider following with a call to {@link #sendKeys(CharSequence...)}
   * with the tab key.
   */
  void clear();

  /**
   * Get the tag name of this element. <b>Not</b> the value of the name attribute: will return
   * <code>"input"</code> for the element <code>&lt;input name="foo" /&gt;</code>.
   *
   * @return The tag name of this element.
   */
  String getTagName();

  /**
   * Get the value of the given attribute of the element. Will return the current value, even if
   * this has been modified after the page has been loaded.
   *
   * <p>More exactly, this method will return the value of the property with the given name, if it
   * exists. If it does not, then the value of the attribute with the given name is returned. If
   * neither exists, null is returned.
   *
   * <p>The "style" attribute is converted as best can be to a text representation with a trailing
   * semi-colon.
   *
   * <p>The following are deemed to be "boolean" attributes, and will return either "true" or null:
   *
   * <p>async, autofocus, autoplay, checked, compact, complete, controls, declare, defaultchecked,
   * defaultselected, defer, disabled, draggable, ended, formnovalidate, hidden, indeterminate,
   * iscontenteditable, ismap, itemscope, loop, multiple, muted, nohref, noresize, noshade,
   * novalidate, nowrap, open, paused, pubdate, readonly, required, reversed, scoped, seamless,
   * seeking, selected, truespeed, willvalidate
   *
   * <p>Finally, the following commonly mis-capitalized attribute/property names are evaluated as
   * expected:
   *
   * <ul>
   * <li>If the given name is "class", the "className" property is returned.
   * <li>If the given name is "readonly", the "readOnly" property is returned.
   * </ul>
   *
   * <i>Note:</i> The reason for this behavior is that users frequently confuse attributes and
   * properties. If you need to do something more precise, e.g., refer to an attribute even when a
   * property of the same name exists, then you should evaluate Javascript to obtain the result
   * you desire.
   *
   * @param name The name of the attribute.
   * @return The attribute/property's current value or null if the value is not set.
   */
  String getAttribute(String name);

  /**
   * Determine whether or not this element is selected or not. This operation only applies to input
   * elements such as checkboxes, options in a select and radio buttons.
   *
   * @return True if the element is currently selected or checked, false otherwise.
   */
  boolean isSelected();

  /**
   * Is the element currently enabled or not? This will generally return true for everything but
   * disabled input elements.
   *
   * @return True if the element is enabled, false otherwise.
   */
  boolean isEnabled();

  /**
   * Get the visible (i.e. not hidden by CSS) innerText of this element, including sub-elements,
   * without any leading or trailing whitespace.
   *
   * @return The innerText of this element.
   */
  String getText();

  /**
   * Find all elements within the current context using the given mechanism. When using xpath be
   * aware that webdriver follows standard conventions: a search prefixed with "//" will search the
   * entire document, not just the children of this current node. Use ".//" to limit your search to
   * the children of this WebElement.
   * This method is affected by the 'implicit wait' times in force at the time of execution. When
   * implicitly waiting, this method will return as soon as there are more than 0 items in the
   * found collection, or will return an empty list if the timeout is reached.
   *
   * @param by The locating mechanism to use
   * @return A list of all {@link WebElement}s, or an empty list if nothing matches.
   * @see org.openqa.selenium.By
   * @see org.openqa.selenium.WebDriver.Timeouts
   */
  List<WebElement> findElements(By by);

  /**
   * Find the first {@link WebElement} using the given method. See the note in
   * {@link #findElements(By)} about finding via XPath.
   * This method is affected by the 'implicit wait' times in force at the time of execution.
   * The findElement(..) invocation will return a matching row, or try again repeatedly until
   * the configured timeout is reached.
   *
   * findElement should not be used to look for non-present elements, use {@link #findElements(By)}
   * and assert zero length response instead.
   *
   * @param by The locating mechanism
   * @return The first matching element on the current context.
   * @throws NoSuchElementException If no matching elements are found
   * @see org.openqa.selenium.By
   * @see org.openqa.selenium.WebDriver.Timeouts
   */
  WebElement findElement(By by);

  /**
   * Is this element displayed or not? This method avoids the problem of having to parse an
   * element's "style" attribute.
   *
   * @return Whether or not the element is displayed
   */
  boolean isDisplayed();

  /**
   * Where on the page is the top left-hand corner of the rendered element?
   *
   * @return A point, containing the location of the top left-hand corner of the element
   */
  Point getLocation();

  /**
   * What is the width and height of the rendered element?
   *
   * @return The size of the element on the page.
   */
  Dimension getSize();

  /**
   * @return The location and size of the rendered element
   */
  Rectangle getRect();

  /**
   * Get the value of a given CSS property.
   * Color values should be returned as rgba strings, so,
   * for example if the "background-color" property is set as "green" in the
   * HTML source, the returned value will be "rgba(0, 255, 0, 1)".
   *
   * Note that shorthand CSS properties (e.g. background, font, border, border-top, margin,
   * margin-top, padding, padding-top, list-style, outline, pause, cue) are not returned,
   * in accordance with the
   * <a href="http://www.w3.org/TR/DOM-Level-2-Style/css.html#CSS-CSSStyleDeclaration">DOM CSS2 specification</a>
   * - you should directly access the longhand properties (e.g. background-color) to access the
   * desired values.
   *
   * @param propertyName the css property name of the element
   * @return The current, computed value of the property.
   */
  String getCssValue(String propertyName);
}
