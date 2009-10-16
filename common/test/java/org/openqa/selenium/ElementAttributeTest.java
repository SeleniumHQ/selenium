/*
Copyright 2007-2009 WebDriver committers
Copyright 2007-2009 Google Inc.

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

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNull.nullValue;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

import java.util.List;

public class ElementAttributeTest extends AbstractDriverTestCase {

  @Ignore({IE, SELENESE})
  public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
    driver.get(simpleTestPage);
    WebElement head = driver.findElement(By.xpath("/html"));
    String attribute = head.getAttribute("cheese");
    assertThat(attribute, is(nullValue()));
  }

  @Ignore(SELENESE)
  public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
    driver.get(simpleTestPage);
    WebElement body = driver.findElement(By.xpath("//body"));
    assertThat(body.getAttribute("style"), equalTo(""));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
    driver.get(formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.getAttribute("disabled"), equalTo("false"));
  }

  @Ignore({IE, SELENESE})
  public void testShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing() {
    driver.get(formPage);

    WebElement multiSelect = driver.findElement(By.id("multi"));
    List<WebElement> options = multiSelect.findElements(By.tagName("option"));
    assertThat(options.get(1).getAttribute("index"), equalTo("1"));
  }


  public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
    driver.get(formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
    assertThat(inputElement.isEnabled(), is(false));

    inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.isEnabled(), is(true));
  }

  public void testShouldIndicateWhenATextAreaIsDisabled() {
    driver.get(formPage);
    WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
    assertThat(textArea.isEnabled(), is(false));
  }

  public void testShouldIndicateWhenASelectIsDisabled() {
    driver.get(formPage);

    WebElement enabled = driver.findElement(By.name("selectomatic"));
    WebElement disabled = driver.findElement(By.name("no-select"));

    assertTrue(enabled.isEnabled());
    assertFalse(disabled.isEnabled());
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
    driver.get(formPage);
    WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
    assertThat(checkbox.getAttribute("checked"), equalTo("false"));
    checkbox.setSelected();
    assertThat(checkbox.getAttribute("checked"), equalTo("true"));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {
    driver.get(formPage);
    WebElement neverSelected = driver.findElement(By.id("cheese"));
    WebElement initiallyNotSelected = driver.findElement(By.id("peas"));
    WebElement initiallySelected = driver.findElement(By.id("cheese_and_peas"));

    assertThat(neverSelected.getAttribute("selected"), equalTo("false"));
    assertThat(initiallyNotSelected.getAttribute("selected"), equalTo("false"));
    assertThat(initiallySelected.getAttribute("selected"), equalTo("true"));

    initiallyNotSelected.setSelected();
    assertThat(neverSelected.getAttribute("selected"), equalTo("false"));
    assertThat(initiallyNotSelected.getAttribute("selected"), equalTo("true"));
    assertThat(initiallySelected.getAttribute("selected"), equalTo("false"));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute() {
    driver.get(formPage);
    WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
    List<WebElement> options = selectBox.findElements(By.tagName("option"));
    WebElement one = options.get(0);
    WebElement two = options.get(1);
    assertThat(one.isSelected(), is(true));
    assertThat(two.isSelected(), is(false));
    assertThat(one.getAttribute("selected"), equalTo("true"));
    assertThat(two.getAttribute("selected"), equalTo("false"));
  }

  public void testShouldReturnValueOfClassAttributeOfAnElement() {
    driver.get(xhtmlTestPage);

    WebElement heading = driver.findElement(By.xpath("//h1"));
    String className = heading.getAttribute("class");

    assertThat(className, equalTo("header"));
  }

  public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
    driver.get(formPage);

    String value = driver.findElement(By.id("withText")).getValue();

    assertThat(value, equalTo("Example text"));
  }

  @Ignore(SELENESE)
  public void testShouldTreatReadonlyAsAValue() {
    driver.get(formPage);

    WebElement element = driver.findElement(By.name("readonly"));
    String readonly = element.getAttribute("readonly");

    WebElement textInput = driver.findElement(By.name("x"));
    String notReadonly = textInput.getAttribute("readonly");

    assertFalse(readonly.equals(notReadonly));
  }
}
