package com.googlecode.webdriver;

import com.googlecode.webdriver.internal.FindsById;
import com.googlecode.webdriver.internal.FindsByLinkText;
import com.googlecode.webdriver.internal.FindsByName;
import com.googlecode.webdriver.internal.FindsByXPath;

import java.util.List;

/**
 * Mechanism used to locate elements within a document. In order to create
 * your own locating mechanisms, it is possible to subclass this class and
 * override the protected methods as required, though it is expected that
 * that all subclasses rely on the basic finding mechanisms provided through
 * static methods of this class:
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
    private String using;

    protected By(String selector) {
        this.using = selector;
    }

    public static By id(String id) {
      if (id == null)
        throw new IllegalArgumentException("Cannot find elements with a null id attribute.");

      return new By(id) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsById) driver).findElementsById(getSelector());
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsById) driver).findElementById(getSelector());
        }
      };
    }

    public static By linkText(String linkText) {
      if (linkText == null)
        throw new IllegalArgumentException("Cannot find elements when link text is null.");

      return new By(linkText) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsByLinkText) driver).findElementsByLinkText(getSelector());
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsByLinkText) driver).findElementByLinkText(getSelector());
        }
      };
    }

    public static By name(String name) {
      if (name == null)
        throw new IllegalArgumentException("Cannot find elements when name text is null.");

      return new By(name) {
        public List<WebElement> findElements(WebDriver driver) {
            if (driver instanceof FindsByName)
              return ((FindsByName) driver).findElementsByName(getSelector());
            return ((FindsByXPath) driver).findElementsByXPath("//*[@name = '" + getSelector() + "']");
        }

        public WebElement findElement(WebDriver driver) {
          if (driver instanceof FindsByName)
            return ((FindsByName) driver).findElementByName(getSelector());
          return ((FindsByXPath) driver).findElementByXPath("//*[@name = '" + getSelector() + "']");
        }
      };
    }

    public static By xpath(String xpathExpression) {
       if (xpathExpression == null)
        throw new IllegalArgumentException("Cannot find elements when the XPath expression is null.");

      return new By(xpathExpression) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsByXPath) driver).findElementsByXPath(getSelector());
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsByXPath) driver).findElementByXPath(getSelector());
        }
      };
    }

    /**
     * Find a single element. Override this method if necessary.
     * @param driver A driver to use to find the element
     * @return The WebElement that matches the selector
     */
    public WebElement findElement(WebDriver driver) {
        List<WebElement> allElements = findElements(driver);
        if (allElements == null || allElements.size() == 0)
            throw new NoSuchElementException("Cannot locate an element matching: " + using);
        return allElements.get(0);
    }

    /**
     * Find many elements.
     *
     * @param driver A driver to use to find the element
     * @return A list of WebElements matching the selector
     */
    public abstract List<WebElement> findElements(WebDriver driver);

    /**
     * Get the argument passed to the By in the constructor. Typically, this is used
     * to select which element or elements should be returned.
     *
     * @return The selector provided in the constructor
     */
    protected String getSelector() {
        return using;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        By by = (By) o;

        return using.equals(by.using);
    }

    @Override
    public int hashCode() {
        return using.hashCode();
    }
}
