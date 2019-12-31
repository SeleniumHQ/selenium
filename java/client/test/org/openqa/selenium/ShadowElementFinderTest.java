package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.MARIONETTE;

/**
 * Shadow Root is not supported by Firefox.
 * 
 */
public class ShadowElementFinderTest extends JUnit4TestBase {

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testShadowElementExists() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    boolean hasShadowElement = new ShadowElementFinder(driver).hasShadowElement(element);

    assertThat(hasShadowElement).isTrue();
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testShadowElementDoesNotExist() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    boolean hasShadowElement = new ShadowElementFinder(driver).hasShadowElement(element);

    assertThat(hasShadowElement).isFalse();
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testShadowElementUnsafeExtractionIsReturned() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    Optional<WebElement> result = new ShadowElementFinder(driver).extractShadowElementOf(element);

    assertThat(result.isPresent()).isTrue();
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testShadowElementUnsafeExtractionIsNull() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    Optional<WebElement> result = new ShadowElementFinder(driver).extractShadowElementOf(element);

    assertThat(result.isPresent()).isFalse();
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testShadowElementSafeExtractionIsReturned() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("outside_shadow"));
    WebElement extractedElement = new ShadowElementFinder(driver).safeExtractShadowElementOf(element);

    assertThat(extractedElement).isNotNull();
    assertThat(extractedElement).isNotEqualTo(element);
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testSafeExtractReturnsSameElementWhenElementIsNotShadow() {
    driver.get(pages.shadowElementsPage);

    WebElement element = driver.findElement(By.id("no_shadow"));
    WebElement extractedElement = new ShadowElementFinder(driver).safeExtractShadowElementOf(element);

    assertThat(extractedElement).isNotNull();
    assertThat(extractedElement).isEqualTo(element);
  }

  @Test
  @Ignore(FIREFOX)
  @Ignore(MARIONETTE)
  public void testExtractShadowElementsFromList() {
    driver.get(pages.shadowElementsPage);

    WebElement noShadow = driver.findElement(By.id("no_shadow"));
    WebElement outsideShadow = driver.findElement(By.id("outside_shadow"));
    List<WebElement> list = Arrays.asList(noShadow, outsideShadow);
    List<WebElement> extractedElements = new ShadowElementFinder(driver).extractShadowElements(list);

    assertThat(extractedElements).isNotNull();
    assertThat(extractedElements).hasSize(2);
    assertThat(extractedElements).allMatch(Objects::nonNull);
    assertThat(extractedElements).contains(noShadow);
    assertThat(extractedElements).doesNotContain(outsideShadow);
  }
}
