package org.openqa.selenium;

import org.assertj.core.api.ThrowableAssert.ThrowingCallable;
import org.junit.Test;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;

public class ShadowElementFinderTest extends JUnit4TestBase {

  @Test
  public void testShadowElementExists() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    boolean hasShadowElement = new ShadowElementFinder(driver).hasShadowElement(element);

    assertThat(hasShadowElement).isTrue();
  }

  @Test
  public void testShadowElementDoesNotExist() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    boolean hasShadowElement = new ShadowElementFinder(driver).hasShadowElement(element);

    assertThat(hasShadowElement).isFalse();
  }

  @Test
  public void testShadowElementExtractionReturnsList() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    By by = By.cssSelector("nested-element");
    Optional<List<WebElement>> result = new ShadowElementFinder(driver).extractShadowElementsOf(element, by);

    assertThat(result).isPresent();
    assertThat(result.get()).hasSize(1);
  }

  @Test
  public void testElementWithoutShadowRootThrowsException() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    By by = By.cssSelector("invalid");
    ThrowingCallable callable = () -> new ShadowElementFinder(driver).extractShadowElementsOf(element, by);

    assertThatExceptionOfType(NoSuchElementException.class).isThrownBy(callable);
  }

  @Test
  public void testShadowElementSafeExtractionIsReturned() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    By by = By.cssSelector("nested-element");
    Optional<WebElement> extractedElement = new ShadowElementFinder(driver).safeLocateElementFromShadow(element, by);

    assertThat(extractedElement).isPresent();
    assertThat(extractedElement.get()).isNotEqualTo(element);
  }

  @Test
  public void testSafeExtractReturnsSameElementWhenElementIsNotShadow() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    By by = By.cssSelector("invalid");
    ThrowingCallable callable = () -> new ShadowElementFinder(driver).safeLocateElementFromShadow(element, by);

    assertThatExceptionOfType(NoSuchElementException.class).isThrownBy(callable);
  }

  @Test
  public void testExtractShadowElementsFromList() {
    driver.get(pages.shadowElementsPage);

    WebElement noShadow = driver.findElement(By.id("no_shadow"));
    WebElement outsideShadow = driver.findElement(By.id("outside_shadow"));
    List<WebElement> list = Arrays.asList(noShadow, outsideShadow);
    By by = By.cssSelector("nested-element");
    List<WebElement> extractedElements = new ShadowElementFinder(driver).extractShadowElementsWithBy(list, by);

    assertThat(extractedElements).isNotNull();
    assertThat(extractedElements).hasSize(1);
    assertThat(extractedElements).allMatch(Objects::nonNull);
    assertThat(extractedElements).doesNotContain(noShadow);
    assertThat(extractedElements).doesNotContain(outsideShadow);
  }

  @Test
  public void testShadowElementsSafeExtractionIsReturned() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    By by = By.cssSelector("nested-element");
    List<WebElement> extractedElement = new ShadowElementFinder(driver).safeLocateElementsFromShadow(element, by);

    assertThat(extractedElement).isNotNull();
    assertThat(extractedElement).hasSize(1);
    assertThat(extractedElement).isNotEqualTo(element);
  }

  @Test
  public void testSafeExtractReturnsSameElementWhenElementsIsNotShadow() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    By by = By.cssSelector("invalid");
    List<WebElement> extractedElement = new ShadowElementFinder(driver).safeLocateElementsFromShadow(element, by);

    assertThat(extractedElement).isNotNull();
    assertThat(extractedElement).isEmpty();
  }

  @Test
  public void testGetCssSelectorByReturnsCorrectString() {
    driver.get(pages.shadowElementsPage);

    String cssString = "someSelector";
    By by = By.cssSelector(cssString);
    String actualCssSelector = new ShadowElementFinder(driver).getCssSelectorOfBy(by);

    assertThat(actualCssSelector).isNotNull();
    assertThat(actualCssSelector).isEqualTo(cssString);
  }

  @Test
  public void testGetCssSelectorByThrowsExceptionForNonCss() {
    driver.get(pages.shadowElementsPage);

    List<By> bys = Arrays.asList(By.xpath("xpath"), By.id("id"), By.linkText("linkText"), By.className("className"),
      By.tagName("tagName"), By.name("name"), By.partialLinkText("partiaLinkText"));
    bys.forEach(by -> {
      ThrowingCallable callable = () -> new ShadowElementFinder(driver).getCssSelectorOfBy(by);
      assertThatExceptionOfType(InvalidSelectorException.class).isThrownBy(callable);
    });
  }
}
