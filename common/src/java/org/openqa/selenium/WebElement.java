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

import java.util.List;

/**
 * Represents an HTML element. Generally, all interesting operations to do with interacting with a
 * page will be performed through this interface.
 * <p/>
 * All method calls will do a freshness check to ensure that the element reference is still valid.
 * This essentially determines whether or not the element is still attached to the DOM. If this test
 * fails, then an {@link org.openqa.selenium.StaleElementReferenceException} is thrown, and all
 * future calls to this instance will fail.
 */
public interface WebElement extends SearchContext {
  /**
   * Click this element. If this causes a new page to load, this method will block until the page
   * has loaded. At this point, you should discard all references to this element and any further
   * operations performed on this element will have undefined behaviour unless you know that the
   * element and the page will still be present. If click() causes a new page to be loaded via an
   * event or is done by sending a native event (which is a common case on Firefox, IE on Windows)
   * then the method will *not* wait for it to be loaded and the caller should verify that a new
   * page has been loaded.
   * <p/>
   * If this element is not clickable, then this operation is a no-op since it's pretty common for
   * someone to accidentally miss the target when clicking in Real Life
   */
  void click();

  /**
   * If this current element is a form, or an element within a form, then this will be submitted
   * to the remote server. If this causes the current page to change, then this method will block
   * until the new page is loaded.
   *
   * @throws NoSuchElementException If the given element is not within a form
   */
  void submit();

  /**
   * Get the value of the element's "value" attribute. If this value has been modified after the
   * page has loaded (for example, through javascript) then this will reflect the current value of
   * the "value" attribute.
   *
   * @return The value of the element's "value" attribute.
   * @see WebElement#getAttribute(String)
   */
  String getValue();

  /**
   * Use this method to simulate typing into an element, which may set its value.
   */
  void sendKeys(CharSequence... keysToSend);

  /**
   * If this element is a text entry element, this will clear the value. Has no effect on other
   * elements. Text entry elements are INPUT and TEXTAREA elements.
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
   * Get the value of a the given attribute of the element. Will return the current value, even if
   * this has been modified after the page has been loaded. Note that the value of the attribute
   * "checked" will return "checked" if the element is a input of type checkbox and there is no
   * explicit "checked" attribute, and will also return "selected" for an option that is selected
   * even if there is no explicit "selected" attribute. The expected value of "disabled" is also
   * returned.
   *
   * @param name The name of the attribute.
   * @return The attribute's current value or null if the value is not set.
   */
  String getAttribute(String name);

  /**
   * If the element is a checkbox this will toggle the elements state from selected to not
   * selected, or from not selected to selected.
   *
   * @return Whether the toggled element is selected (true) or not (false) after this toggle is
   *         complete
   */
  boolean toggle();

  /**
   * Determine whether or not this element is selected or not. This operation only applies to
   * input elements such as checkboxes, options in a select and radio buttons.
   *
   * @return True if the element is currently selected or checked, false otherwise.
   */
  boolean isSelected();

  /**
   * Select an element. This method will work against radio buttons, "option" elements within a
   * "select" and checkboxes
   */
  void setSelected();

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
   * Find all elements within the current context using the given mechanism.
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
   * @return The first matching element on the current context
   * @throws NoSuchElementException If no matching elements are found
   */
  WebElement findElement(By by);

}
