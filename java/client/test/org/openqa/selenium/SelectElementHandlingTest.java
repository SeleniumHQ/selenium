/*
Copyright 2007-2009 Selenium committers

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

package org.openqa.selenium;

import org.junit.Test;
import org.openqa.selenium.testing.Ignore;
import org.openqa.selenium.testing.JUnit4TestBase;

import static org.junit.Assert.assertThat;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.testing.Ignore.Driver.ANDROID;
import static org.openqa.selenium.testing.Ignore.Driver.CHROME;
import static org.openqa.selenium.testing.Ignore.Driver.IPHONE;
import static org.openqa.selenium.testing.Ignore.Driver.OPERA;
import static org.openqa.selenium.testing.Ignore.Driver.SELENESE;

import static org.hamcrest.Matchers.is;

import java.util.List;

public class SelectElementHandlingTest extends JUnit4TestBase {

  @Ignore({CHROME, SELENESE, IPHONE, OPERA, ANDROID})
  @Test
  public void testShouldBePossibleToDeselectASingleOptionFromASelectWhichAllowsMultipleChoices() {
    driver.get(pages.formPage);

    WebElement multiSelect = driver.findElement(By.id("multi"));
    List<WebElement> options = multiSelect.findElements(By.tagName("option"));

    WebElement option = options.get(0);
    assertThat(option.isSelected(), is(true));
    option.click();
    assertThat(option.isSelected(), is(false));
    option.click();
    assertThat(option.isSelected(), is(true));

    option = options.get(2);
    assertThat(option.isSelected(), is(true));
  }

  @Ignore({OPERA, SELENESE, ANDROID})
  @Test
  public void testShouldBeAbleToChangeTheSelectedOptionInASelect() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
    List<WebElement> options = selectBox.findElements(By.tagName("option"));
    WebElement one = options.get(0);
    WebElement two = options.get(1);
    assertThat(one.isSelected(), is(true));
    assertThat(two.isSelected(), is(false));

    two.click();
    assertThat(one.isSelected(), is(false));
    assertThat(two.isSelected(), is(true));
  }

  @Ignore({SELENESE, ANDROID})
  @Test
  public void testShouldBeAbleToSelectMoreThanOneOptionFromASelectWhichAllowsMultipleChoices() {
    driver.get(pages.formPage);

    WebElement multiSelect = driver.findElement(By.id("multi"));
    List<WebElement> options = multiSelect.findElements(By.tagName("option"));
    for (WebElement option : options) {
      if (!option.isSelected()) {
        option.click();
      }
    }

    for (int i = 0; i < options.size(); i++) {
      WebElement option = options.get(i);
      assertThat("Option at index is not selected but should be: " + i, option.isSelected(),
          is(true));
    }
  }

  @Ignore({SELENESE, ANDROID})
  @Test
  public void testShouldSelectFirstOptionByDefaultIfNoneIsSelected() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.xpath("//select[@name='select-default']"));
    List<WebElement> options = selectBox.findElements(By.tagName("option"));
    WebElement one = options.get(0);
    WebElement two = options.get(1);
    assertThat(one.isSelected(), is(true));
    assertThat(two.isSelected(), is(false));

    two.click();
    assertThat(one.isSelected(), is(false));
    assertThat(two.isSelected(), is(true));
  }

  @Ignore({SELENESE, CHROME})
  @Test
  public void testCanSelectElementsInOptGroups() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("two-in-group"));
    element.click();
    assertTrue("Expected to be selected", element.isSelected());
  }

  @Test
  public void testCanGetValueFromOptionViaAttributeWhenAttributeDoesntExist() {
	  driver.get(pages.formPage);
	  WebElement element = driver.findElement(By.cssSelector("select[name='select-default'] option"));
	  assertThat(element.getAttribute("value"), is("One"));
	  element = driver.findElement(By.id("blankOption"));
	  assertThat(element.getAttribute("value"), is(""));
  }

  @Test
  public void testCanGetValueFromOptionViaAttributeWhenAttributeIsEmptyString() {
	  driver.get(pages.formPage);
	  WebElement element = driver.findElement(By.id("optionEmptyValueSet"));
	  assertThat(element.getAttribute("value"), is(""));
  }
}
