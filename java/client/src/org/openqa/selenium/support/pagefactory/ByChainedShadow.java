package org.openqa.selenium.support.pagefactory;

import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.ShadowElementFinder;
import org.openqa.selenium.WebElement;

import java.util.ArrayList;
import java.util.List;

/**
 * Similar to {@link ByChained}, but for each {@link By} provided it will verify if it has a Shadow Root
 * attached to it, and return it.
 * <br> if you need to find an element that is inside a Shadow Root, use:
 * <pre>
 * driver.findElements(new ByChainedShadow(shadowRootBy, targetElementBy))
 * </pre>
 *
 * This will locate the shadow element first using <var>shadowRootBy</var>, and from there use
 * <var>targetElementBy</var> to locate the element inside the shadow element.
 * <br>
 * <br>Note that using {@link org.openqa.selenium.By.ByXPath} will throw an exception if used inside
 * any Shadow Root. Using {@link org.openqa.selenium.By.ByXPath} on <var>shadowRootBy</var> it's ok
 * (as it is the first find), using it on <var>targetElementBy</var> won't work and will throw an error.
 */
public class ByChainedShadow extends ByChained {

  private By[] bys;

  public ByChainedShadow(By... bys) {
    super(bys);
    this.bys = bys;
  }

  @Override
  public List<WebElement> findElements(SearchContext context) {
    if (bys.length == 0) {
      return new ArrayList<>();
    }

    List<WebElement> elements = null;
    ShadowElementFinder shadowElementFinder = new ShadowElementFinder(context);
    for (By by : bys) {
      List<WebElement> newElements = new ArrayList<>();
      if (elements == null) {
        newElements = by.findElements(context);
      } else {
          List<WebElement> webElements = shadowElementFinder.extractShadowElementsWithBy(elements, by);
          newElements.addAll(webElements);
      }
      elements = newElements;
    }

    return elements;
  }
}
