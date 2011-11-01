package org.openqa.selenium.support.ui;

import static org.junit.Assert.assertEquals;

import org.openqa.selenium.By;
import org.openqa.selenium.JUnit4TestBase;
import org.openqa.selenium.WebElement;

import org.junit.Test;

import java.util.List;

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

  @Test
  public void selectByVisibleTextShouldNormalizeSpaces() {
    driver.get(pages.formPage);

    WebElement selectElement = driver.findElement(By.name("select_with_spaces"));
    Select selection = new Select(selectElement);

    String one = selection.getOptions().get(0).getText();
    selection.selectByVisibleText(one);
    assertEquals(one, selection.getFirstSelectedOption().getText());

    String two = selection.getOptions().get(1).getText();
    selection.selectByVisibleText(two);
    assertEquals(two, selection.getFirstSelectedOption().getText());

    String four = selection.getOptions().get(2).getText();
    selection.selectByVisibleText(four);
    assertEquals(four, selection.getFirstSelectedOption().getText());

    String longOptionText = selection.getOptions().get(3).getText();
    selection.selectByVisibleText(longOptionText);
    assertEquals(longOptionText, selection.getFirstSelectedOption().getText());
  }
}
