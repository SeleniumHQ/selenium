package org.openqa.selenium;

import java.util.List;

import org.openqa.selenium.internal.FindsByClassName;
import org.openqa.selenium.internal.FindsById;
import org.openqa.selenium.internal.FindsByLinkText;
import org.openqa.selenium.internal.FindsByName;
import org.openqa.selenium.internal.FindsByXPath;

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
    public static By id(final String id) {
      if (id == null)
        throw new IllegalArgumentException("Cannot find elements with a null id attribute.");

      return new By() {
        @Override
        public List<WebElement> findElements(SearchContext context) {
          if (context instanceof FindsById)
        	return ((FindsById) context).findElementsById(id);
          return ((FindsByXPath) context).findElementsByXPath("*[@id = '" + id + "']");
        }

        @Override
        public WebElement findElement(SearchContext context) {
          if (context instanceof FindsById)
            return ((FindsById) context).findElementById(id);
          return ((FindsByXPath) context).findElementByXPath("*[@id = '" + id + "']");
        }
       
        public String toString() {
          return "By.id: " + id;
        }
      };
    }

    public static By linkText(final String linkText) {
      if (linkText == null)
        throw new IllegalArgumentException("Cannot find elements when link text is null.");

      return new By() {
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
      };
    }
    
    public static By partialLinkText(final String linkText) {
      if (linkText == null)
        throw new IllegalArgumentException("Cannot find elements when link text is null.");

      return new By() {
        @Override
        public List<WebElement> findElements(SearchContext context) {
          return ((FindsByLinkText) context).findElementsByPartialLinkText(linkText);
        }

        @Override
        public WebElement findElement(SearchContext context) {
          return ((FindsByLinkText) context).findElementByPartialLinkText(linkText);
        }
        
        @Override
        public String toString() {
          return "By.linkText: " + linkText;
        }
      };
    }

    public static By name(final String name) {
      if (name == null)
        throw new IllegalArgumentException("Cannot find elements when name text is null.");

      return new By() {
        @Override
        public List<WebElement> findElements(SearchContext context) {
            if (context instanceof FindsByName)
              return ((FindsByName) context).findElementsByName(name);
            return ((FindsByXPath) context).findElementsByXPath("//*[@name = '" + name + "']");
        }

        @Override
        public WebElement findElement(SearchContext context) {
          if (context instanceof FindsByName)
            return ((FindsByName) context).findElementByName(name);
          return ((FindsByXPath) context).findElementByXPath("//*[@name = '" + name + "']");
        }
        
        @Override
        public String toString() {
          return "By.name: " + name;
        }
      };
    }

    public static By xpath(final String xpathExpression) {
       if (xpathExpression == null)
        throw new IllegalArgumentException("Cannot find elements when the XPath expression is null.");

      return new By() {
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
      };
    }

    public static By className(final String className) {
        if (className == null)
         throw new IllegalArgumentException("Cannot find elements when the class name expression is null.");

       return new By() {
         @Override
         public List<WebElement> findElements(SearchContext context) {
             if (context instanceof FindsByClassName)
               return ((FindsByClassName) context).findElementsByClassName(className);
             return ((FindsByXPath) context).findElementsByXPath("//*[" + containingWord("class", className) + "]");
         }

         @Override
         public WebElement findElement(SearchContext context) {
             if (context instanceof FindsByClassName)
               return ((FindsByClassName) context).findElementByClassName(className);
             return ((FindsByXPath) context).findElementByXPath("//*[" + containingWord("class", className) + "]");
         }

         /**
          * Generates a partial xpath expression that matches an element whose specified attribute
          * contains the given CSS word. So to match &lt;div class='foo bar'&gt; you would
          * say "//div[" + containingWord("class", "foo") + "]".
          *
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
       };
     }

    /**
     * Find a single element. Override this method if necessary.
     * @param context A context to use to find the element
     * @return The WebElement that matches the selector
     */
    public WebElement findElement(SearchContext context) {
        List<WebElement> allElements = findElements(context);
        if (allElements == null || allElements.size() == 0)
            throw new NoSuchElementException("Cannot locate an element using " + toString());
        return allElements.get(0);
    }

    

    /**
     * Find many elements.
     *
     * @param context A context to use to find the element
     * @return A list of WebElements matching the selector
     */
    public abstract List<WebElement> findElements(SearchContext context);
    
    /**
     * Find many elements.
     *
     * @param driver A driver to use to find the element
     * @return A list of WebElements matching the selector
     * @deprecated use findElements(SearchContext) instead
     */
    public List<WebElement> findElements(WebDriver driver) {
    	return findElements((SearchContext) driver);
    }
    
    /**
     * Find a single element. Override this method if necessary.
     * @param driver A driver to use to find the element
     * @return The WebElement that matches the selector
     * @deprecated use findElement(SearchContext) instead
     */
    public WebElement findElement(WebDriver driver) {
        return findElement((SearchContext) driver);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        By by = (By) o;

        return toString().equals(by.toString());
    }

    @Override
    public int hashCode() {
        return toString().hashCode();
    }
}
