/*
Copyright 2010 Selenium committers

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

import static org.hamcrest.Matchers.equalTo;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

import org.junit.Test;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.CacheLookup;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.testing.JUnit4TestBase;
import org.openqa.selenium.testing.JavascriptEnabled;

import java.util.List;

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
  
  @Test
  public void canListDecoratedElements() {
    driver.get(pages.xhtmlTestPage);

    Page page = new Page();
    PageFactory.initElements(driver, page);

    assertThat(page.divs.size(), equalTo(13));
    for (WebElement link : page.divs) {
      assertThat(link.getTagName(), equalTo("div"));
    }
  }

  public static class Page {
    @FindBy(name = "someForm")
    WebElement formElement;

    @FindBy(tagName = "div")
    @CacheLookup
    List<WebElement> divs;
  }
}
