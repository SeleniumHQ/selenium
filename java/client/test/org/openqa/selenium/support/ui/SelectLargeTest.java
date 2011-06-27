package org.openqa.selenium.support.ui;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

import java.util.List;

/**
 * Test for issue r759.
 */
public class SelectLargeTest extends AbstractDriverTestCase {
  public void testMultipleSelectShouldBePossibleIfMulitpleAttributeEmpty() {
    driver.get(pages.formPage);

    WebElement selectElement = driver.findElement(By.name("select_empty_multiple"));

    Select selection = new Select(selectElement);
    selection.selectByIndex(1);
    selection.selectByIndex(2);

    List<WebElement> picked = selection.getAllSelectedOptions();
    assertEquals(2, picked.size());
    assertEquals("multi_2", picked.get(0).getAttribute("id"));
    assertEquals("multi_3", picked.get(1).getAttribute("id"));

    System.out.println("Deselecting");
    
    selection.deselectAll();
    assertEquals(0, selection.getAllSelectedOptions().size());
  }
}
