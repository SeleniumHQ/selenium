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

package org.openqa.selenium.support.ui;

import java.util.List;
import org.openqa.selenium.WebElement;

/**
 * Created by evgeniyat on 13.05.16
 *
 * <p>ISelect interface makes a protocol for all kind of select elements (standard html and custom
 * model)
 */
public interface ISelect {

  /**
   * @return Whether this select element supports selecting multiple options at the same time? This
   *     is done by checking the value of the "multiple" attribute.
   */
  boolean isMultiple();

  /**
   * @return All options belonging to this select tag
   */
  List<WebElement> getOptions();

  /**
   * @return All selected options belonging to this select tag
   */
  List<WebElement> getAllSelectedOptions();

  /**
   * @return The first selected option in this select tag (or the currently selected option in a
   *     normal select)
   */
  WebElement getFirstSelectedOption();

  /**
   * Select all options that display text matching the argument. That is, when given "Bar" this
   * would select an option like:
   *
   * <p>&lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param text The visible text to match against
   */
  void selectByVisibleText(String text);

  /**
   * Select all options that display text matching or containing the argument. That is, when given "Bar"
   * this would select an option like:
   *
   * <p>&lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * Additionally, if no exact match is found, this will attempt to select options that contain the
   * argument as a substring. For example, when given "1년", this would select an option like:
   *
   * <p>&lt;option value="bar"&gt;1년납&lt;/option&gt;
   *
   * @param text The visible text to match or partially match against
   */
  void selectByContainsVisibleText(String text);

  /**
   * Select the option at the given index. This is done by examining the "index" attribute of an
   * element, and not merely by counting.
   *
   * @param index The option at this index will be selected
   */
  void selectByIndex(int index);

  /**
   * Select all options that have a value matching the argument. That is, when given "foo" this
   * would select an option like:
   *
   * <p>&lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param value The value to match against
   */
  void selectByValue(String value);

  /**
   * Clear all selected entries. This is only valid when the SELECT supports multiple selections.
   */
  void deselectAll();

  /**
   * Deselect all options that have a value matching the argument. That is, when given "foo" this
   * would deselect an option like:
   *
   * <p>&lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param value The value to match against
   */
  void deselectByValue(String value);

  /**
   * Deselect the option at the given index. This is done by examining the "index" attribute of an
   * element, and not merely by counting.
   *
   * @param index The option at this index will be deselected
   */
  void deselectByIndex(int index);

  /**
   * Deselect all options that display text matching the argument. That is, when given "Bar" this
   * would deselect an option like:
   *
   * <p>&lt;option value="foo"&gt;Bar&lt;/option&gt;
   *
   * @param text The visible text to match against
   */
  void deselectByVisibleText(String text);
}
