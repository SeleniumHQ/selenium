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

import org.openqa.selenium.internal.Require;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

/**
 * Mechanism used to locate elements within a document. In order to create your own locating
 * mechanisms, it is possible to subclass this class and override the protected methods as required,
 * though it is expected that all subclasses rely on the basic finding mechanisms provided
 * through static methods of this class:
 *
 * <pre><code>
 * public WebElement findElement(WebDriver driver) {
 *     WebElement element = driver.findElement(By.id(getSelector()));
 *     if (element == null)
 *       element = driver.findElement(By.name(getSelector());
 *     return element;
 * }
 * </code></pre>
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
   * Find elements based on the value of the "class" attribute. Only one class name should be
   * used. If an element has multiple classes, please use {@link By#cssSelector(String)}.
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

  protected WebDriver getWebDriver(SearchContext context) {
    if (context instanceof WebDriver) {
      return (WebDriver) context;
    }

    if (!(context instanceof WrapsDriver)) {
      throw new IllegalArgumentException("Context does not wrap a webdriver: " + context);
    }

    return ((WrapsDriver) context).getWrappedDriver();
  }

  protected JavascriptExecutor getJavascriptExecutor(SearchContext context) {
    WebDriver driver = getWebDriver(context);

    if (!(context instanceof JavascriptExecutor)) {
      throw new IllegalArgumentException("Context does not provide a mechanism to execute JS: " + context);
    }

    return (JavascriptExecutor) driver;
  }

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

  public static class ById extends PreW3CLocator {

    private final String id;

    public ById(String id) {
      super(
        "id",
        Require.argument("Id", id).nonNull("Cannot find elements when id is null."),
        "#%s");

      this.id = id;
    }

    @Override
    public String toString() {
      return "By.id: " + id;
    }
  }

  public static class ByLinkText extends BaseW3CLocator {

    private final String linkText;

    public ByLinkText(String linkText) {
      super(
        "link text",
        Require.argument("Link text", linkText)
          .nonNull("Cannot find elements when the link text is null."));

      this.linkText = linkText;
    }

    @Override
    public String toString() {
      return "By.linkText: " + linkText;
    }
  }

  public static class ByPartialLinkText extends BaseW3CLocator {

    private final String partialLinkText;

    public ByPartialLinkText(String partialLinkText) {
      super(
        "partial link text",
        Require.argument("Partial link text", partialLinkText)
          .nonNull("Cannot find elements when the link text is null."));

      this.partialLinkText = partialLinkText;
    }

    @Override
    public String toString() {
      return "By.partialLinkText: " + partialLinkText;
    }
  }

  public static class ByName extends PreW3CLocator {
    private final String name;

    public ByName(String name) {
      super(
        "name",
        Require.argument("Name", name).nonNull("Cannot find elements when name text is null."),
        String.format("*[name='%s']", name.replace("'", "\\'")));

      this.name = name;
    }

    @Override
    public String toString() {
      return "By.name: " + name;
    }
  }

  public static class ByTagName extends BaseW3CLocator {

    private final String tagName;

    public ByTagName(String tagName) {
      super(
        "tag name",
        Require.argument("Tag name", tagName)
          .nonNull("Cannot find elements when the tag name is null."));

      if (tagName.isEmpty()) {
        throw new InvalidSelectorException("Tag name must not be blank");
      }

      this.tagName = tagName;
    }

    @Override
    public String toString() {
      return "By.tagName: " + tagName;
    }
  }

  public static class ByXPath extends BaseW3CLocator {

    private final String xpathExpression;

    public ByXPath(String xpathExpression) {
      super(
        "xpath",
        Require.argument("XPath", xpathExpression)
          .nonNull("Cannot find elements when the XPath is null."));

      this.xpathExpression = xpathExpression;
    }

    @Override
    public String toString() {
      return "By.xpath: " + xpathExpression;
    }
  }

  public static class ByClassName extends PreW3CLocator {

    private final String className;

    public ByClassName(String className) {
      super(
        "class name",
        Require.argument("Class name", className)
          .nonNull("Cannot find elements when the class name expression is null."),
      ".%s");

      if (className.matches(".*\\s.*")) {
        throw new InvalidSelectorException("Compound class names not permitted");
      }

      this.className = className;
    }

    @Override
    public String toString() {
      return "By.className: " + className;
    }
  }

  public static class ByCssSelector extends BaseW3CLocator {
    private final String cssSelector;

    public ByCssSelector(String cssSelector) {
      super(
        "css selector",
        Require.argument("CSS selector", cssSelector)
          .nonNull("Cannot find elements when the selector is null"));

      this.cssSelector = cssSelector;
    }

    @Override
    public String toString() {
      return "By.cssSelector: " + cssSelector;
    }
  }

  public interface Remotable {
    Parameters getRemoteParameters();

    class Parameters {
      private final String using;
      private final Object value;

      public Parameters(String using, Object value) {
        this.using = Require.nonNull("Search mechanism", using);
        // There may be subclasses where the value is optional. Allow for this.
        this.value = value;
      }

      public String using() {
        return using;
      }

      public Object value() {
        return value;
      }

      @Override
      public String toString() {
        return "[" + using + ": " + value + "]";
      }

      @Override
      public boolean equals(Object o) {
        if (!(o instanceof Parameters)) {
          return false;
        }
        Parameters that = (Parameters) o;
        return using.equals(that.using) && Objects.equals(value, that.value);
      }

      @Override
      public int hashCode() {
        return Objects.hash(using, value);
      }

      private Map<String, Object> toJson() {
        Map<String, Object> params = new HashMap<>();
        params.put("using", using);
        params.put("value", value);
        return Collections.unmodifiableMap(params);
      }
    }
  }

  private abstract static class BaseW3CLocator extends By implements Remotable {
    private final Parameters params;

    protected BaseW3CLocator(String using, String value) {
      this.params = new Parameters(using, value);
    }

    @Override
    public WebElement findElement(SearchContext context) {
      Require.nonNull("Search Context", context);
      return context.findElement(this);
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      Require.nonNull("Search Context", context);
      return context.findElements(this);
    }

    @Override
    public final Parameters getRemoteParameters() {
      return params;
    }

    protected final Map<String, Object> toJson() {
      return getRemoteParameters().toJson();
    }
  }

  private abstract static class PreW3CLocator extends By implements Remotable {
    private final Parameters remoteParams;
    private final ByCssSelector fallback;

    private PreW3CLocator(String using, String value, String formatString) {
      this.remoteParams = new Remotable.Parameters(using, value);
      this.fallback = new ByCssSelector(String.format(formatString, cssEscape(value)));
    }

    @Override
    public WebElement findElement(SearchContext context) {
      return context.findElement(fallback);
    }

    @Override
    public List<WebElement> findElements(SearchContext context) {
      return context.findElements(fallback);
    }

    @Override
    public final Parameters getRemoteParameters() {
      return remoteParams;
    }

    protected final Map<String, Object> toJson() {
      return fallback.toJson();
    }

    private String cssEscape(String using) {
      using = using.replaceAll("([\\s'\"\\\\#.:;,!?+<>=~*^$|%&@`{}\\-\\/\\[\\]\\(\\)])", "\\\\$1");
      if (using.length() > 0 && Character.isDigit(using.charAt(0))) {
        using = "\\" + (30 + Integer.parseInt(using.substring(0,1))) + " " + using.substring(1);
      }
      return using;
    }
  }
}
