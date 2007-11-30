package com.thoughtworks.webdriver;

import java.text.MessageFormat;
import java.util.Iterator;
import java.util.List;

import com.thoughtworks.webdriver.internal.FindsById;
import com.thoughtworks.webdriver.internal.FindsByLinkText;
import com.thoughtworks.webdriver.internal.FindsByXPath;

/**
 * Mechanism used to locate elements within a document. In order to create
 * your own locating mechanisms, it is possible to subclass this class and
 * override the protected methods as required.
 */
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

  /**
   * When finding elements and using filtering, this methods determines whether
   * or not to include the given element the list returned to the user. This
   * means that a subclass can apply more sophisticated processing than is
   * possible using just an xpath (for example). Note that if filtering is required
   * this method will be called even if the user is finding only one element.
   *
   * @param element The element being considered for inclusion into the list
   * @return True if the elemens should be included
   * @see #isFilertingRequired()
   */
    protected boolean isElementIncluded(WebElement element) {
        return true;
    }

  /**
   * Indicates whether this By will apply a filter to determine whether or not
   * to return a given element to the user when they are searching for something.
   * This method ultimately gets called when the user calls either
   * {@link WebDriver#findElement(By)} or {@link WebDriver#findElements(By)} If
   * filtering is required, the By will always try and get as many elements as
   * possible, even if {@link WebDriver#findElement(By)} has been called.
   *
   * @return True if filtering is required, false if not.
   */
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
