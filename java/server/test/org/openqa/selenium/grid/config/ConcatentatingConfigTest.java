package org.openqa.selenium.grid.config;

import com.google.common.collect.ImmutableMap;
import com.google.common.collect.ImmutableSet;
import org.junit.Test;

import static org.assertj.core.api.Assertions.assertThat;

public class ConcatentatingConfigTest {

  @Test
  public void shouldReturnSectionNames() {
    Config config = new ConcatenatingConfig(
      "FOO",
      '_',
      ImmutableMap.of(
        "FOO_CHEESE_SELECTED", "brie",
        "FOO_CHEESE_CURRENT", "cheddar",
        "FOO_VEGETABLES_GREEN", "peas",
        "FOO_", "should not show up",
        "BAR_FOOD_IS", "cheese sticks"));

    assertThat(config.getSectionNames()).isEqualTo(ImmutableSet.of("cheese", "vegetables"));
  }

  @Test
  public void shouldReturnOptionNamesInSection() {
    Config config = new ConcatenatingConfig(
      "FOO",
      '_',
      ImmutableMap.of(
        "FOO_CHEESE_SELECTED", "brie",
        "FOO_CHEESE_CURRENT", "cheddar",
        "FOO_VEGETABLES_GREEN", "peas",
        "FOO_", "should not show up",
        "BAR_FOOD_IS", "cheese sticks"));

    assertThat(config.getOptions("cheese")).isEqualTo(ImmutableSet.of("current", "selected"));
  }

}
