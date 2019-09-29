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

import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsByCssSelector;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByTagName;
import org.openqa.selenium.internal.FindsByXPath;

import java.io.Serializable;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import static java.util.stream.Collectors.joining;

/**
 * Mechanism used to locate elements within a document. In order to create your own locating
 * mechanisms, it is possible to subclass this class and override the protected methods as required,
 * though it is expected that all subclasses rely on the basic finding mechanisms provided
 * through static methods of this class:
 *
 * <code>
 * public WebElement findElement(WebDriver driver) {
 *     WebElement element = driver.findElement(By.id(getSelector()));
 *     if (element == null)
 *       element = driver.findElement(By.name(getSelector());
 *     return element;
 * }
 * </code>
 */
public abstract class By {
  /**
   * @param id The value of the "id" attribute to search for.
   * @return A By which locates elements by the value of the "id" attribute.
   */
  public static By id(String id) {
    return new ById(id);
  }

  /**
   * @param linkText The exact text to match against.
   * @return A By which locates A elements by the exact text it displays.
   */
  public static By linkText(String linkText) {
    return new ByLinkText(linkText);
  }

  /**
   * @param partialLinkText The partial text to match against
   * @return a By which locates elements that contain the given link text.
   */
  public static By partialLinkText(String partialLinkText) {
    return new ByPartialLinkText(partialLinkText);
  }

  /**
   * @param name The value of the "name" attribute to search for.
   * @return A By which locates elements by the value of the "name" attribute.
   */
  public static By name(String name) {
    return new ByName(name);
  }

  /**
   * @param tagName The element's tag name.
   * @return A By which locates elements by their tag name.
   */
  public static By tagName(String tagName) {
    return new ByTagName(tagName);
  }

  /**
   * @param xpathExpression The XPath to use.
   * @return A By which locates elements via XPath.
   */
  public static By xpath(String xpathExpression) {
    return new ByXPath(xpathExpression);
  }

  /**
   * Find elements based on the value of the "class" attribute. If an element has multiple classes, then
   * this will match against each of them. For example, if the value is "one two onone", then the
   * class names "one" and "two" will match.
   *
   * @param className The value of the "class" attribute to search for.
   * @return A By which locates elements by the value of the "class" attribute.
   */
  public static By className(String className) {
    return new ByClassName(className);
  }

  /**
   * Find elements via the driver's underlying W3C Selector engine. If the browser does not
   * implement the Selector API, a best effort is made to emulate the API. In this case, we strive
   * for at least CSS2 support, but offer no guarantees.
   *
   * @param cssSelector CSS expression.
   * @return A By which locates elements by CSS.
   */
  public static By cssSelector(String cssSelector) {
    return new ByCssSelector(cssSelector);
  }

  /**
   * Find a single element. Override this method if necessary.
   *
   * @param context A context to use to find the element.
   * @return The WebElement that matches the selector.
   */
  public WebElement findElement(SearchContext context) {
    List<WebElement> allElements = findElements(context);
    if (allElements == null || allElements.isEmpty()) {
      throw new NoSuchElementException("Cannot locate an element using " + toString());
    }
    return allElements.get(0);
  }

  /**
   * Find many elements.
   *
   * @param context A context to use to find the elements.
   * @return A list of WebElements matching the selector.
   */
  public abstract List<WebElement> findElements(SearchContext context);

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof By)) {
      return false;
    }

    By that = (By) o;

    return this.toString().equals(that.toString());
  }

  @Override
  public int hashCode() {
    return toString().hashCode();
  }

  @Override
  public String toString() {
    // A stub to prevent endless recursion in hashCode()
    return "[unknown locator]";
  }

  public static class ById extends By implements Serializable {

    private static final long serialVersionUID = 5341968046120372169L;

    private final String id;

    public ById(String id) {
      if (id == null) {
        throw new IllegalArgumentException("Cannot find elements when the id is null.");
      }

      this.id = id;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      if (context instanceof FindsById) {
        return ((FindsById) context).findElementsById(id);
      }
      return ((FindsByXPath) context).findElementsByXPath(".//*[@id = '" + id + "']");
    }

    @Override
    public WebElement findElement(SearchContext context) {
      if (context instanceof FindsById) {
        return ((FindsById) context).findElementById(id);
      }
      return ((FindsByXPath) context).findElementByXPath(".//*[@id = '" + id + "']");
    }

    @Override
    public String toString() {
      return "By.id: " + id;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "css selector");
      asJson.put("value", Stream.of(id.split("\\s+")).map(str -> "#" + str).collect(joining(" ")));
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByLinkText extends By implements Serializable {

    private static final long serialVersionUID = 1967414585359739708L;

    private final String linkText;

    public ByLinkText(String linkText) {
      if (linkText == null) {
        throw new IllegalArgumentException("Cannot find elements when the link text is null.");
      }

      this.linkText = linkText;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return ((FindsByLinkText) context).findElementsByLinkText(linkText);
    }

    @Override
    public WebElement findElement(SearchContext context) {
      return ((FindsByLinkText) context).findElementByLinkText(linkText);
    }

    @Override
    public String toString() {
      return "By.linkText: " + linkText;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "link text");
      asJson.put("value", linkText);
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByPartialLinkText extends By implements Serializable {

    private static final long serialVersionUID = 1163955344140679054L;

    private final String partialLinkText;

    public ByPartialLinkText(String partialLinkText) {
      if (partialLinkText == null) {
        throw new IllegalArgumentException("Cannot find elements when the link text is null.");
      }

      this.partialLinkText = partialLinkText;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return ((FindsByLinkText) context).findElementsByPartialLinkText(partialLinkText);
    }

    @Override
    public WebElement findElement(SearchContext context) {
      return ((FindsByLinkText) context).findElementByPartialLinkText(partialLinkText);
    }

    @Override
    public String toString() {
      return "By.partialLinkText: " + partialLinkText;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "partial link text");
      asJson.put("value", partialLinkText);
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByName extends By implements Serializable {

    private static final long serialVersionUID = 376317282960469555L;

    private final String name;

    public ByName(String name) {
      if (name == null) {
        throw new IllegalArgumentException("Cannot find elements when name text is null.");
      }

      this.name = name;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      if (context instanceof FindsByName) {
        return ((FindsByName) context).findElementsByName(name);
      }
      return ((FindsByXPath) context).findElementsByXPath(".//*[@name = '" + name + "']");
    }

    @Override
    public WebElement findElement(SearchContext context) {
      if (context instanceof FindsByName) {
        return ((FindsByName) context).findElementByName(name);
      }
      return ((FindsByXPath) context).findElementByXPath(".//*[@name = '" + name + "']");
    }

    @Override
    public String toString() {
      return "By.name: " + name;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "css selector");
      asJson.put("value", String.format("*[name='%s']", name.replace("'", "\\'")));
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByTagName extends By implements Serializable {

    private static final long serialVersionUID = 4699295846984948351L;

    private final String tagName;

    public ByTagName(String tagName) {
      if (tagName == null) {
        throw new IllegalArgumentException("Cannot find elements when the tag name is null.");
      }

      this.tagName = tagName;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      if (context instanceof FindsByTagName) {
        return ((FindsByTagName) context).findElementsByTagName(tagName);
      }
      return ((FindsByXPath) context).findElementsByXPath(".//" + tagName);
    }

    @Override
    public WebElement findElement(SearchContext context) {
      if (context instanceof FindsByTagName) {
        return ((FindsByTagName) context).findElementByTagName(tagName);
      }
      return ((FindsByXPath) context).findElementByXPath(".//" + tagName);
    }

    @Override
    public String toString() {
      return "By.tagName: " + tagName;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "tag name");
      asJson.put("value", tagName);
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByXPath extends By implements Serializable {

    private static final long serialVersionUID = -6727228887685051584L;

    private final String xpathExpression;

    public ByXPath(String xpathExpression) {
      if (xpathExpression == null) {
        throw new IllegalArgumentException(
            "Cannot find elements when the XPath is null.");
      }

      this.xpathExpression = xpathExpression;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return ((FindsByXPath) context).findElementsByXPath(xpathExpression);
    }

    @Override
    public WebElement findElement(SearchContext context) {
      return ((FindsByXPath) context).findElementByXPath(xpathExpression);
    }

    @Override
    public String toString() {
      return "By.xpath: " + xpathExpression;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "xpath");
      asJson.put("value", xpathExpression);
      return Collections.unmodifiableMap(asJson);
    }
  }

  public static class ByClassName extends By implements Serializable {

    private static final long serialVersionUID = -8737882849130394673L;

    private final String className;

    public ByClassName(String className) {
      if (className == null) {
        throw new IllegalArgumentException(
            "Cannot find elements when the class name expression is null.");
      }

      this.className = className;
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      if (context instanceof FindsByClassName) {
        return ((FindsByClassName) context).findElementsByClassName(className);
      }
      return ((FindsByXPath) context).findElementsByXPath(
          ".//*[" + containingWord("class", className) + "]");
    }

    @Override
    public WebElement findElement(SearchContext context) {
      if (context instanceof FindsByClassName) {
        return ((FindsByClassName) context).findElementByClassName(className);
      }
      return ((FindsByXPath) context).findElementByXPath(
          ".//*[" + containingWord("class", className) + "]");
    }

    /**
     * Generate a partial XPath expression that matches an element whose specified attribute
     * contains the given CSS word. So to match &lt;div class='foo bar'&gt; you would say "//div[" +
     * containingWord("class", "foo") + "]".
     *    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "link text");
      asJson.put("value", linkText);
      return Collections.unmodifiableMap(asJson);
    }

     * @param attribute name
     * @param word name
     * @return XPath fragment
     */
    private String containingWord(String attribute, String word) {
      return "contains(concat(' ',normalize-space(@" + attribute + "),' '),' " + word + " ')";
    }

    @Override
    public String toString() {
      return "By.className: " + className;
    }

    private Map<String, Object> toJson() {

      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "css selector");
      asJson.put("value", Stream.of(className.split("\\s+")).map(str -> "." + str).collect(joining(" ")));
      return Collections.unmodifiableMap(asJson);
    }

  }

  public static class ByCssSelector extends By implements Serializable {

    private static final long serialVersionUID = -3910258723099459239L;

    private final String cssSelector;

    public ByCssSelector(String cssSelector) {
      if (cssSelector == null) {
        throw new IllegalArgumentException("Cannot find elements when the selector is null");
      }
      
      this.cssSelector = cssSelector;
    }

    @Override
    public WebElement findElement(SearchContext context) {
      if (context instanceof FindsByCssSelector) {
        return ((FindsByCssSelector) context).findElementByCssSelector(cssSelector);
      }

      throw new WebDriverException(
          "Driver does not support finding an element by selector: " + cssSelector);
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      if (context instanceof FindsByCssSelector) {
        return ((FindsByCssSelector) context).findElementsByCssSelector(cssSelector);
      }

      throw new WebDriverException(
          "Driver does not support finding elements by selector: " + cssSelector);
    }

    @Override
    public String toString() {
      return "By.cssSelector: " + cssSelector;
    }

    private Map<String, Object> toJson() {
      Map<String, Object> asJson = new HashMap<>();
      asJson.put("using", "css selector");
      asJson.put("value", cssSelector);
      return Collections.unmodifiableMap(asJson);
    }
  }
}
