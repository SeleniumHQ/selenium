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
    return extractShadowElementOf(element).isPresent();
  }

  /**
   * Runs the script to extract the shadow root of an element.
   * <br>This method might
   *
   * @param element The element verify and extract the Shadow Root from
   * @return A WebElement if there is a Shadow Root attached to the element, null otherwise
   */
  public Optional<WebElement> extractShadowElementOf(WebElement element) {
    final String SHADOW_ROOT_SCRIPT = "arguments[0].shadowRoot";
    WebElement shadowElement = (WebElement) jsExecutor.executeScript(SHADOW_ROOT_SCRIPT, element);
    return Optional.ofNullable(shadowElement);
  }

  /**
   * Safely extracts the Shadow Root of an element.
   *
   * @param element The element verify and extract the Shadow Root from
   * @return The Shadow Root of the element, or the same element if it doesn't have a Shadow Root.
   */
  public WebElement safeExtractShadowElementOf(WebElement element) {
    return extractShadowElementOf(element).orElse(element);
  }

  /**
   * Safely extracts the Shadow Root of a list of elements.
   *
   * @param elements A list of {@link WebElement}s
   * @return The Shadow Root of the element, or the same element if it doesn't have a Shadow Root.
   */
  public List<WebElement> extractShadowElements(List<WebElement> elements) {
    List<WebElement> extractedElements = new ArrayList<>();
    for (WebElement element : elements) {
      extractedElements.add(safeExtractShadowElementOf(element));
    }
    return extractedElements;
  }
}
