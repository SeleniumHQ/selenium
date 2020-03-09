package org.openqa.selenium;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Helper to to verify if some element has a Shadow Root attached to it and allow further querying to locate nested elements attached to it.
 */
public class ShadowElementFinder {

  private JavascriptExecutor jsExecutor;

  public ShadowElementFinder(SearchContext context) {
    jsExecutor = (JavascriptExecutor) context;
  }

  /**
   * Verifies if the given element has a Shadow Root attached to it.
   *
   * @param element The element to be checked for Shadow Root
   * @return boolean True if it has a Shadow Root, false otherwise
   */
  public boolean hasShadowElement(WebElement element) {
    try {
      final String SHADOW_ROOT_SCRIPT = "return arguments[0].shadowRoot.nodeName";
      Object result = jsExecutor.executeScript(SHADOW_ROOT_SCRIPT, element);
      return result != null;
    } catch (Exception ignored) {
      return false;
    }
  }

  /**
   * Runs the script to extract the shadow root of an element using the given {@link By}
   *
   * @param element The element verify and extract the Shadow Root from
   * @param by A {@link org.openqa.selenium.By.ByCssSelector} to run on the element
   * @return A WebElement if there is a Shadow Root attached to the element, null otherwise
   */
  @SuppressWarnings("unchecked")
  public Optional<List<WebElement>> extractShadowElementsOf(WebElement element, By by) {
    try {
      String cssSelector = getCssSelectorOfBy(by);
      final String SHADOW_ROOT_SCRIPT = String.format("return arguments[0].shadowRoot.querySelectorAll('%s')", cssSelector);
      List<WebElement> webElements = (List<WebElement>) jsExecutor.executeScript(SHADOW_ROOT_SCRIPT, element);
      return Optional.ofNullable(webElements);
    } catch (Exception e) {
      throw new NoSuchElementException("It was not possible to locate the elements inside the Shadow Root. Locator " + by.toString());
    }
  }

  /**
   * Safely locates elements from the element using the {@link By}
   *
   * @param element An element with a shadow root
   * @param by A {@link org.openqa.selenium.By.ByCssSelector}
   * @return A list of the found elements, or an empty list if there is an error
   */
  public List<WebElement> safeLocateElementsFromShadow(WebElement element, By by) {
    try {
      Optional<List<WebElement>> optional = extractShadowElementsOf(element, by);
      return optional.orElseGet(ArrayList::new);
    } catch (Exception e) {
      return new ArrayList<>();
    }
  }

  /**
   * Safely locates elements from the element using the {@link By}, and returns the first found element
   *
   * @param element An element with a shadow root
   * @param by A {@link org.openqa.selenium.By.ByCssSelector}
   * @return The first element of the list, or the element provided if nothing is found
   */
  public Optional<WebElement> safeLocateElementFromShadow(WebElement element, By by) {
    Optional<List<WebElement>> optional = extractShadowElementsOf(element, by);
    return optional.map(webElements -> webElements.get(0));
  }

  /**
   * Gets the CssSelector of the given {@link By} if it's a {@link org.openqa.selenium.By.ByCssSelector},
   * throws an exception otherwise.
   *
   * @param by A {@link org.openqa.selenium.By.ByCssSelector}
   * @return The css
   */
  protected String getCssSelectorOfBy(By by) {
    if (by instanceof By.ByCssSelector) {
      By.ByCssSelector byCssSelector = (By.ByCssSelector) by;
      return byCssSelector.getCssSelector();
    } else {
      throw new InvalidSelectorException("Only css selectors are allowing for elements with shadow root");
    }
  }

  /**
   * Extracts the Shadow Root of a list of elements.
   *
   * @param elements A list of {@link WebElement}s
   * @return The Shadow Root of the element, or the same element if it doesn't have a Shadow Root.
   */
  public List<WebElement> extractShadowElementsWithBy(List<WebElement> elements, By by) {
    List<WebElement> extractedElements = new ArrayList<>();
    for (WebElement element : elements) {
      extractedElements.addAll(safeLocateElementsFromShadow(element, by));
    }
    return extractedElements;
  }
}
