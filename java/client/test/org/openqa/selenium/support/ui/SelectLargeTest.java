package org.openqa.selenium.support.ui;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.JUnit4TestBase;
import org.openqa.selenium.WebElement;

import java.util.List;

import static org.junit.Assert.assertEquals;

/**
 * Test for issue r759.
 */
public class SelectLargeTest extends JUnit4TestBase {
  @Test
  public void multipleSelectShouldBePossibleIfMulitpleAttributeEmpty() {
    driver.get(pages.formPage);

    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));

    Select selection = new Select(selectElement);
    selection.selectByIndex(1);
    selection.selectByIndex(2);

    List<WebElement> picked = selection.getAllSelectedOptions();
    assertEquals(2, picked.size());
    assertEquals("multi_2", picked.get(0).getAttribute("id"));
    assertEquals("multi_3", picked.get(1).getAttribute("id"));

    selection.deselectAll();
    assertEquals(0, selection.getAllSelectedOptions().size());
  }
}
