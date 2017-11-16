// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

package org.openqa.selenium.support.ui;

import static org.junit.Assert.assertEquals;

import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.testing.JUnit4TestBase;

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
    System.out.println("four = " + four);
    selection.selectByVisibleText(four.trim());
    assertEquals(four, selection.getFirstSelectedOption().getText());

    String longOptionText = selection.getOptions().get(3).getText();

    System.out.println("longOptionText = " + longOptionText);

    selection.selectByVisibleText(longOptionText.trim());
    assertEquals(longOptionText, selection.getFirstSelectedOption().getText());
  }
}
