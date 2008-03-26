package com.googlecode.webdriver;

import com.googlecode.webdriver.internal.FindsById;
import com.googlecode.webdriver.internal.FindsByLinkText;
import com.googlecode.webdriver.internal.FindsByName;
import com.googlecode.webdriver.internal.FindsByXPath;

import java.util.List;

/**
 * Mechanism used to locate elements within a document. In order to create
 * your own locating mechanisms, it is possible to subclass this class and
 * override the protected methods as required.
 */
public abstract class By {
    protected final How how;
    protected String using;

    protected By(How how, String using) {
        this.how = how;
        this.using = using;
    }

    public static By id(String id) {
      if (id == null)
        throw new IllegalArgumentException("Cannot find elements with a null id attribute.");

      return new By(How.ID, id) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsById) driver).findElementsById(using);
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsById) driver).findElementById(using);
        }
      };
    }

    public static By linkText(String linkText) {
      if (linkText == null)
        throw new IllegalArgumentException("Cannot find elements when link text is null.");

      return new By(How.LINK_TEXT, linkText) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsByLinkText) driver).findElementsByLinkText(using);
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsByLinkText) driver).findElementByLinkText(using);
        }
      };
    }

    public static By name(String name) {
      if (name == null)
        throw new IllegalArgumentException("Cannot find elements when name text is null.");

      return new By(How.NAME, name) {
        public List<WebElement> findElements(WebDriver driver) {
            if (driver instanceof FindsByName)
              return ((FindsByName) driver).findElementsByName(using);
            return ((FindsByXPath) driver).findElementsByXPath("//*[@name = '" + using + "']");
        }

        public WebElement findElement(WebDriver driver) {
          if (driver instanceof FindsByName)
            return ((FindsByName) driver).findElementByName(using);
          return ((FindsByXPath) driver).findElementByXPath("//*[@name = '" + using + "']");
        }
      };
    }

    public static By xpath(String xpathExpression) {
       if (xpathExpression == null)
        throw new IllegalArgumentException("Cannot find elements when the XPath expression is null.");

      return new By(How.XPATH, xpathExpression) {
        public List<WebElement> findElements(WebDriver driver) {
          return ((FindsByXPath) driver).findElementsByXPath(using);
        }

        public WebElement findElement(WebDriver driver) {
          return ((FindsByXPath) driver).findElementByXPath(using);
        }
      };
    }

    public abstract WebElement findElement(WebDriver driver);
    public abstract List<WebElement> findElements(WebDriver driver);

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        By by = (By) o;

        return how == by.how && using.equals(by.using);
    }

    @Override
    public int hashCode() {
        int result;
        result = how.hashCode();
        result = 31 * result + using.hashCode();
        return result;
    }
}
