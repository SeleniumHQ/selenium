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

package org.openqa.selenium.support.ui;

import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;
import java.util.StringTokenizer;

/**
 * Models a SELECT tag, providing helper methods to select and deselect options.
 */
public class Select {

  private final WebElement element;
  private boolean isMulti;

  /**
   * Constructor. A check is made that the given element is, indeed, a SELECT tag. If it is not,
   * then an UnexpectedTagNameException is thrown.
   * 
   * @param element SELECT element to wrap
   * @throws UnexpectedTagNameException when element is not a SELECT
   */
  public Select(WebElement element) {
    String tagName = element.getTagName();

    if (null == tagName || !"select".equals(tagName.toLowerCase())) {
      throw new UnexpectedTagNameException("select", tagName);
    }

    this.element = element;

    String value = element.getAttribute("multiple");

    // The atoms normalize the returned value, but check for "false"
    isMulti = (value != null && !"false".equals(value));
  }

  /**
   * @return Whether this select element support selecting multiple options at the same time? This
   *         is done by checking the value of the "multiple" attribute.
   */
  public boolean isMultiple() {
    return isMulti;
  }

  /**
   * @return All options belonging to this select tag
   */
  public List<WebElement> getOptions() {
    return element.findElements(By.tagName("option"));
  }

  /**
   * @return All selected options belonging to this select tag
   */
  public List<WebElement> getAllSelectedOptions() {
    List<WebElement> toReturn = new ArrayList<WebElement>();

    for (WebElement option : getOptions()) {
      if (option.isSelected()) {
        toReturn.add(option);
      }
    }

    return toReturn;
  }

  /**
   * @return The first selected option in this select tag (or the currently selected option in a
   *         normal select)
   */
  public WebElement getFirstSelectedOption() {
    for (WebElement option : getOptions()) {
      if (option.isSelected()) {
        return option;
      }
    }

    throw new NoSuchElementException("No options are selected");
  }

  /**
   * Select all options that display text matching the argument. That is, when given "Bar" this
   * would select an option like:
   * 
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   * 
   * @param text The visible text to match against
   */
  public void selectByVisibleText(String text) {
    // try to find the option via XPATH ...
    List<WebElement> options =
        element.findElements(By.xpath(".//option[normalize-space(.) = " + escapeQuotes(text) + "]"));

    boolean matched = false;
    for (WebElement option : options) {
      setSelected(option);
      if (!isMultiple()) {
        return;
      }
      matched = true;
    }

    if (options.isEmpty() && text.contains(" ")) {
      String subStringWithoutSpace = getLongestSubstringWithoutSpace(text);
      List<WebElement> candidates;
      if ("".equals(subStringWithoutSpace)) {
        // hmm, text is either empty or contains only spaces - get all options ...
        candidates = element.findElements(By.tagName("option"));
      } else {
        // get candidates via XPATH ...
        candidates =
            element.findElements(By.xpath(".//option[contains(., " +
                escapeQuotes(subStringWithoutSpace) + ")]"));
      }
      for (WebElement option : candidates) {
        if (text.equals(option.getText())) {
          setSelected(option);
          if (!isMultiple()) {
            return;
          }
          matched = true;
        }
      }
    }

    if (!matched) {
      throw new NoSuchElementException("Cannot locate element with text: " + text);
    }
  }

  private String getLongestSubstringWithoutSpace(String s) {
    String result = "";
    StringTokenizer st = new StringTokenizer(s, " ");
    while (st.hasMoreTokens()) {
      String t = st.nextToken();
      if (t.length() > result.length()) {
        result = t;
      }
    }
    return result;
  }

  /**
   * Select the option at the given index. This is done by examing the "index" attribute of an
   * element, and not merely by counting.
   * 
   * @param index The option at this index will be selected
   */
  public void selectByIndex(int index) {
    String match = String.valueOf(index);

    boolean matched = false;
    for (WebElement option : getOptions()) {
      if (match.equals(option.getAttribute("index"))) {
        setSelected(option);
        if (!isMultiple()) {
          return;
        }
        matched = true;
      }
    }
    if (!matched) {
      throw new NoSuchElementException("Cannot locate option with index: " + index);
    }
  }

  /**
   * Select all options that have a value matching the argument. That is, when given "foo" this
   * would select an option like:
   * 
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   * 
   * @param value The value to match against
   */
  public void selectByValue(String value) {
    StringBuilder builder = new StringBuilder(".//option[@value = ");
    builder.append(escapeQuotes(value));
    builder.append("]");
    List<WebElement> options = element.findElements(By.xpath(builder.toString()));

    boolean matched = false;
    for (WebElement option : options) {
      setSelected(option);
      if (!isMultiple()) {
        return;
      }
      matched = true;
    }

    if (!matched) {
      throw new NoSuchElementException("Cannot locate option with value: " + value);
    }
  }

  /**
   * Clear all selected entries. This is only valid when the SELECT supports multiple selections.
   * 
   * @throws UnsupportedOperationException If the SELECT does not support multiple selections
   */
  public void deselectAll() {
    if (!isMultiple()) {
      throw new UnsupportedOperationException(
          "You may only deselect all options of a multi-select");
    }

    for (WebElement option : getOptions()) {
      if (option.isSelected()) {
        option.click();
      }
    }
  }

  /**
   * Deselect all options that have a value matching the argument. That is, when given "foo" this
   * would deselect an option like:
   * 
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   * 
   * @param value The value to match against
   */
  public void deselectByValue(String value) {
    StringBuilder builder = new StringBuilder(".//option[@value = ");
    builder.append(escapeQuotes(value));
    builder.append("]");
    List<WebElement> options = element.findElements(By.xpath(builder.toString()));
    for (WebElement option : options) {
      if (option.isSelected()) {
        option.click();
      }
    }
  }

  /**
   * Deselect the option at the given index. This is done by examing the "index" attribute of an
   * element, and not merely by counting.
   * 
   * @param index The option at this index will be deselected
   */
  public void deselectByIndex(int index) {
    String match = String.valueOf(index);

    for (WebElement option : getOptions()) {
      if (match.equals(option.getAttribute("index")) && option.isSelected()) {
        option.click();
      }
    }
  }

  /**
   * Deselect all options that display text matching the argument. That is, when given "Bar" this
   * would deselect an option like:
   * 
   * &lt;option value="foo"&gt;Bar&lt;/option&gt;
   * 
   * @param text The visible text to match against
   */
  public void deselectByVisibleText(String text) {
    StringBuilder builder = new StringBuilder(".//option[normalize-space(.) = ");
    builder.append(escapeQuotes(text));
    builder.append("]");
    List<WebElement> options = element.findElements(By.xpath(builder.toString()));
    for (WebElement option : options) {
      if (option.isSelected()) {
        option.click();
      }
    }
  }

  protected String escapeQuotes(String toEscape) {
    // Convert strings with both quotes and ticks into: foo'"bar -> concat("foo'", '"', "bar")
    if (toEscape.indexOf("\"") > -1 && toEscape.indexOf("'") > -1) {
      boolean quoteIsLast = false;
      if (toEscape.indexOf("\"") == toEscape.length() - 1) {
        quoteIsLast = true;
      }
      String[] substrings = toEscape.split("\"");

      StringBuilder quoted = new StringBuilder("concat(");
      for (int i = 0; i < substrings.length; i++) {
        quoted.append("\"").append(substrings[i]).append("\"");
        quoted
            .append(((i == substrings.length - 1) ? (quoteIsLast ? ", '\"')" : ")") : ", '\"', "));
      }
      return quoted.toString();
    }

    // Escape string with just a quote into being single quoted: f"oo -> 'f"oo'
    if (toEscape.indexOf("\"") > -1) {
      return String.format("'%s'", toEscape);
    }

    // Otherwise return the quoted string
    return String.format("\"%s\"", toEscape);
  }

  private void setSelected(WebElement option) {
    if (!option.isSelected()) {
      option.click();
    }
  }
}
