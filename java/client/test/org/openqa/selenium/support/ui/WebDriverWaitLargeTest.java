/*
Copyright 2007-2011 WebDriver committers
Copyright 2007-2011 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package org.openqa.selenium.support.ui;

import org.openqa.selenium.AbstractDriverTestCase;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import com.google.common.base.Predicate;
import com.google.common.base.Throwables;

/**
 * @author ahaas@google.com (Andreas Haas)
 *
 */
public class WebDriverWaitLargeTest extends AbstractDriverTestCase {

  public void testWebDriverWaitWithStaleElementException() {
    driver.get(pages.dynamicallyModifiedPage);

    WebElement buttonRemoveAndInsert = driver.findElement(By.id("buttonDelete"));

    WebDriverWait webDriverWait = new WebDriverWait(driver, 10);

    buttonRemoveAndInsert.click();

    webDriverWait.until(new Predicate<WebDriver>() {
      public boolean apply(WebDriver driver) {

        WebElement element = driver.findElement(By.id("element-to-remove"));

        try {
          Thread.sleep(1000);
        } catch (InterruptedException e) {
          Throwables.propagate(e);
        }

        return !element.getText().equals(null);
      }
    });

    assertEquals("new element", driver.findElement(By.id("element-to-remove")).getText());

  }
}
