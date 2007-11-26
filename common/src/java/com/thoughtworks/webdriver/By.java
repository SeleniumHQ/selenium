package com.thoughtworks.webdriver;

import java.text.MessageFormat;
import java.util.Iterator;
import java.util.List;

import com.thoughtworks.webdriver.internal.FindsById;
import com.thoughtworks.webdriver.internal.FindsByLinkText;
import com.thoughtworks.webdriver.internal.FindsByXPath;

public class By {
    private final How how;
    private final String using;

    protected By(How how, String using) {
        this.how = how;
        this.using = using;
    }

    public static By id(String id) {
        return new By(How.ID, id);
    }

    public static By linkText(String linkText) {
        return new By(How.LINK_TEXT, linkText);
    }

    public static By xpath(String xpathExpression) {
        return new By(How.XPATH, xpathExpression);
    }

    @Deprecated
    public static By deprecatedOldStyleSelector(String selector) {
      if (selector.startsWith("id=")) {
          return By.id(selector.substring("id=".length()));
      } else if (selector.startsWith("link=")) {
          return By.linkText(selector.substring("link=".length()));
      } else {
          return By.xpath(selector);
      }
    }

  public WebElement findElement(WebDriver driver) {
        if (!isFilertingRequired())
            return findASingleElement(driver);

        List<WebElement> elements = findElements(driver);
        if (elements.size() == 0) {
            throw new NoSuchElementException(MessageFormat.format("Cannot find element by '{0}' using the locator '{1}", how, using));
        }

        return elements.get(0);
    }

    public List<WebElement> findElements(WebDriver driver) {
        List<WebElement> elements = null;

        switch (how) {
          case ID:
            elements = ((FindsById) driver).findElementsById(using);

          case LINK_TEXT:
            elements = ((FindsByLinkText) driver).findElementsByLinkText(using);

          case XPATH:
            elements = ((FindsByXPath) driver).findElementsByXPath(using);
        }

        filterElements(elements);

        return elements;
    }

    private void filterElements(List<WebElement> elements) {
        if (!isFilertingRequired())
            return;

        Iterator<WebElement> allElements = elements.iterator();
        while (allElements.hasNext()) {
            WebElement element = allElements.next();
            if (!isElementIncluded(element)) {
                allElements.remove();
            }
        }
    }

    protected boolean isElementIncluded(WebElement element) {
        return true;
    }

    protected boolean isFilertingRequired() {
        return false;
    }

    private WebElement findASingleElement(WebDriver driver) {
      switch (how) {
        case ID:
          return ((FindsById) driver).findElementById(using);

        case LINK_TEXT:
          return ((FindsByLinkText) driver).findElementByLinkText(using);

        case XPATH:
          return ((FindsByXPath) driver).findElementByXPath(using);
      }

      return null;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        By by = (By) o;

        if (how != by.how) return false;
        if (!using.equals(by.using)) return false;

        return true;
    }

    @Override
    public int hashCode() {
        int result;
        result = how.hashCode();
        result = 31 * result + using.hashCode();
        return result;
    }
}
