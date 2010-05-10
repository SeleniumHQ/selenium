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

import java.util.List;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.core.IsNull.nullValue;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.openqa.selenium.Ignore.Driver.CHROME;
import static org.openqa.selenium.Ignore.Driver.FIREFOX;
import static org.openqa.selenium.Ignore.Driver.IE;
import static org.openqa.selenium.Ignore.Driver.SELENESE;

public class ElementAttributeTest extends AbstractDriverTestCase {

  @Ignore(SELENESE)
  public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
    driver.get(pages.simpleTestPage);
    WebElement head = driver.findElement(By.xpath("/html"));
    String attribute = head.getAttribute("cheese");
    assertThat(attribute, is(nullValue()));
  }

  @Ignore(SELENESE)
  public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.xpath("//body"));
    assertThat(body.getAttribute("style"), equalTo(""));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing() {
    driver.get(pages.formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.getAttribute("disabled"), equalTo("false"));
    assertThat(inputElement.isEnabled(), equalTo(true));
    
    WebElement pElement = driver.findElement(By.id("cheeseLiker"));
    assertThat(pElement.getAttribute("disabled"), equalTo("false"));
    assertThat(pElement.isEnabled(), equalTo(true));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing() {
    driver.get(pages.formPage);

    WebElement multiSelect = driver.findElement(By.id("multi"));
    List<WebElement> options = multiSelect.findElements(By.tagName("option"));
    assertThat(options.get(1).getAttribute("index"), equalTo("1"));
  }
  
  public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
    driver.get(pages.formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
    assertThat(inputElement.isEnabled(), is(false));

    inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.isEnabled(), is(true));
  }
  
  public void testElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings() {
    driver.get(pages.formPage);
    WebElement disabledTextElement1 = driver.findElement(By.id("disabledTextElement1"));
    assertThat(disabledTextElement1.isEnabled(), is(false));

    WebElement disabledTextElement2 = driver.findElement(By.id("disabledTextElement2"));
    assertThat(disabledTextElement2.isEnabled(), is(false));
    
    WebElement disabledSubmitElement = driver.findElement(By.id("disabledSubmitElement"));
    assertThat(disabledSubmitElement.isEnabled(), is(false));
  }
  
  @Ignore(value = IE, reason = "Issue 514")
  public void testShouldNotBeAbleToTypeToElementsIfTheyAreDisabledUsingRandomDisabledStrings() {
    driver.get(pages.formPage);
    WebElement disabledTextElement1 = driver.findElement(By.id("disabledTextElement1"));
    disabledTextElement1.sendKeys("foo");
    assertThat(disabledTextElement1.getText(), is(""));

    WebElement disabledTextElement2 = driver.findElement(By.id("disabledTextElement2"));
    disabledTextElement2.sendKeys("bar");
    assertThat(disabledTextElement2.getText(), is(""));
  }

  @Ignore(value = {FIREFOX, CHROME, SELENESE}, reason = "Issue 514")
  public void testShouldNotBeAbleToSubmitFormsWithDisabledSubmitButtons() {
    driver.get(pages.formPage);
    WebElement disabledSubmitElement = driver.findElement(By.id("disabledSubmitElement"));
    assertThat(disabledSubmitElement.isEnabled(), is(false));
    disabledSubmitElement.submit();
    assertThat(driver.getTitle(), is("We Leave From Here"));
  }

  public void testShouldIndicateWhenATextAreaIsDisabled() {
    driver.get(pages.formPage);
    WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
    assertThat(textArea.isEnabled(), is(false));
  }

  public void testShouldIndicateWhenASelectIsDisabled() {
    driver.get(pages.formPage);

    WebElement enabled = driver.findElement(By.name("selectomatic"));
    WebElement disabled = driver.findElement(By.name("no-select"));

    assertTrue(enabled.isEnabled());
    assertFalse(disabled.isEnabled());
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute() {
    driver.get(pages.formPage);
    WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
    assertThat(checkbox.getAttribute("checked"), equalTo("false"));
    checkbox.setSelected();
    assertThat(checkbox.getAttribute("checked"), equalTo("true"));
  }

  @Ignore(SELENESE)
  public void testShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute() {
    driver.get(pages.formPage);
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
    driver.get(pages.formPage);
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
    driver.get(pages.xhtmlTestPage);

    WebElement heading = driver.findElement(By.xpath("//h1"));
    String className = heading.getAttribute("class");

    assertThat(className, equalTo("header"));
  }

  public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
    driver.get(pages.formPage);

    String value = driver.findElement(By.id("withText")).getValue();

    assertThat(value, equalTo("Example text"));
  }

  @Ignore(SELENESE)
  public void testShouldTreatReadonlyAsAValue() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("readonly"));
    String readonly = element.getAttribute("readonly");

    WebElement textInput = driver.findElement(By.name("x"));
    String notReadonly = textInput.getAttribute("readonly");

    assertFalse(readonly.equals(notReadonly));
  }
  
  @Ignore(SELENESE)
  public void testShouldGetNumericAtribute() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    assertThat(element.getAttribute("rows"), is("5"));
  }
}
