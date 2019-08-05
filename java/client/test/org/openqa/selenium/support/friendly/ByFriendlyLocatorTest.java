package org.openqa.selenium.support.friendly;

import com.google.common.collect.ImmutableList;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.openqa.selenium.support.friendly.ByFriendlyLocator.withTagName;

public class ByFriendlyLocatorTest extends JUnit4TestBase {

  @Test
  public void shouldBeAbleToFindElementsAboveAnother() {
    driver.get(appServer.whereIs("friendly_locators.html"));

    WebElement lowest = driver.findElement(By.id("below"));

    List<WebElement> elements = driver.findElements(withTagName("p").above(lowest));
    List<String> ids = elements.stream().map(e -> e.getAttribute("id")).collect(Collectors.toList());

    assertThat(ids).isEqualTo(ImmutableList.of("above", "mid"));
  }

  @Test
  public void shouldBeAbleToCombineFilters() {
    driver.get(appServer.whereIs("friendly_locators.html"));

    List<WebElement> seen = driver.findElements(withTagName("td").above(By.id("center")).toRightOf(By.id("second")));

    List<String> ids = seen.stream().map(e -> e.getAttribute("id")).collect(Collectors.toList());
    assertThat(ids).isEqualTo(ImmutableList.of("third"));
  }

}
