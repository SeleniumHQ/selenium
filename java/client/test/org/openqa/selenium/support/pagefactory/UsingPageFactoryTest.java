/*
Copyright 2010 WebDriver committers
Copyright 2010 Google Inc.

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


package org.openqa.selenium.support.pagefactory;

import org.junit.Test;
import org.openqa.selenium.JUnit4TestBase;
import org.openqa.selenium.JavascriptEnabled;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

import static org.junit.Assert.assertEquals;

public class UsingPageFactoryTest extends JUnit4TestBase {

  @Test
  @JavascriptEnabled
  public void canExecuteJsUsingDecoratedElements() {
    driver.get(pages.xhtmlTestPage);

    Page page = new Page();
    PageFactory.initElements(driver, page);

    String tagName = (String) ((JavascriptExecutor) driver).executeScript(
        "return arguments[0].tagName", page.formElement);

    assertEquals("form", tagName.toLowerCase());
  }

  public static class Page {
    @FindBy(name = "someForm")
    WebElement formElement;
  }
}
