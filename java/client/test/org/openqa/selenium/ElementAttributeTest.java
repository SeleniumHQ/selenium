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
import static org.hamcrest.Matchers.*;
import static org.hamcrest.core.IsNull.nullValue;
import static org.openqa.selenium.Ignore.Driver.*;

public class ElementAttributeTest extends AbstractDriverTestCase {

  public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
    driver.get(pages.simpleTestPage);
    WebElement head = driver.findElement(By.xpath("/html"));
    String attribute = head.getAttribute("cheese");
    assertThat(attribute, is(nullValue()));
  }

  public void testShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag() {
    driver.get(pages.simpleTestPage);
    WebElement img = driver.findElement(By.id("invalidImgTag"));
    String attribute = img.getAttribute("src");
    assertThat(attribute, is(nullValue()));
  }

  @Ignore({CHROME, OPERA})
  public void testShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag() {
      driver.get(pages.simpleTestPage);
      WebElement img = driver.findElement(By.id("validImgTag"));
      String attribute = img.getAttribute("src");
      assertThat(attribute, equalTo(appServer.whereIs("icon.gif")));
    }

  @Ignore({CHROME, OPERA})
  public void testShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag() {
      driver.get(pages.simpleTestPage);
      WebElement img = driver.findElement(By.id("validAnchorTag"));
      String attribute = img.getAttribute("href");
      assertThat(attribute, equalTo(appServer.whereIs("icon.gif")));
    }

  public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.xpath("//body"));
    assertThat(body.getAttribute("style"), equalTo(""));
  }

  public void testShouldReturnTheValueOfTheDisabledAttributeAsFalseIfNotSet() {
    driver.get(pages.formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.getAttribute("disabled"), equalTo("false"));
    assertThat(inputElement.isEnabled(), equalTo(true));
    
    WebElement pElement = driver.findElement(By.id("peas"));
    assertThat(pElement.getAttribute("disabled"), equalTo("false"));
    assertThat(pElement.isEnabled(), equalTo(true));
  }

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

  @Ignore(value = {IPHONE, SELENESE},
      reason = "sendKeys does not determine whether the element is disabled")
  public void testShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings() {
    driver.get(pages.formPage);
    WebElement disabledTextElement1 = driver.findElement(By.id("disabledTextElement1"));
    try {
      disabledTextElement1.sendKeys("foo");
      fail("Should have thrown exception");
    } catch (InvalidElementStateException e) {
      //Expected
    }
    assertThat(disabledTextElement1.getText(), is(""));

    WebElement disabledTextElement2 = driver.findElement(By.id("disabledTextElement2"));
    try {
      disabledTextElement2.sendKeys("bar");
      fail("Should have thrown exception");
    } catch (InvalidElementStateException e) {
      //Expected
    }
    assertThat(disabledTextElement2.getText(), is(""));
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

  public void testShouldReturnTheValueOfCheckedForACheckboxOnlyIfItIsChecked() {
    driver.get(pages.formPage);
    WebElement checkbox = driver.findElement(By.xpath("//input[@id='checky']"));
    assertThat(checkbox.getAttribute("checked"), equalTo(null));
    checkbox.click();
    assertThat(checkbox.getAttribute("checked"), equalTo("true"));
  }

  public void testShouldOnlyReturnTheValueOfSelectedForRadioButtonsIfItIsSet() {
    driver.get(pages.formPage);
    WebElement neverSelected = driver.findElement(By.id("cheese"));
    WebElement initiallyNotSelected = driver.findElement(By.id("peas"));
    WebElement initiallySelected = driver.findElement(By.id("cheese_and_peas"));

    assertThat(neverSelected.getAttribute("selected"), equalTo(null));
    assertThat(initiallyNotSelected.getAttribute("selected"), equalTo(null));
    assertThat(initiallySelected.getAttribute("selected"), equalTo("true"));

    initiallyNotSelected.click();
    assertThat(neverSelected.getAttribute("selected"), equalTo(null));
    assertThat(initiallyNotSelected.getAttribute("selected"), equalTo("true"));
    assertThat(initiallySelected.getAttribute("selected"), equalTo(null));
  }

  public void testShouldReturnTheValueOfSelectedForOptionsOnlyIfTheyAreSelected() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
    List<WebElement> options = selectBox.findElements(By.tagName("option"));
    WebElement one = options.get(0);
    WebElement two = options.get(1);
    assertThat(one.isSelected(), is(true));
    assertThat(two.isSelected(), is(false));
    assertThat(one.getAttribute("selected"), equalTo("true"));
    assertThat(two.getAttribute("selected"), equalTo(null));
  }

  public void testShouldReturnValueOfClassAttributeOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement heading = driver.findElement(By.xpath("//h1"));
    String className = heading.getAttribute("class");

    assertThat(className, equalTo("header"));
  }

  public void testShouldReturnTheContentsOfATextAreaAsItsValue() {
    driver.get(pages.formPage);

    String value = driver.findElement(By.id("withText")).getAttribute("value");

    assertThat(value, equalTo("Example text"));
  }

  public void testShouldTreatReadonlyAsAValue() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("readonly"));
    String readonly = element.getAttribute("readonly");

    WebElement textInput = driver.findElement(By.name("x"));
    String notReadonly = textInput.getAttribute("readonly");

    assertFalse(readonly.equals(notReadonly));
  }
  
  public void testShouldGetNumericAtribute() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    assertThat(element.getAttribute("rows"), is("5"));
  }

  @Ignore({FIREFOX, HTMLUNIT})
  public void testCanReturnATextApproximationOfTheStyleAttribute() {
    driver.get(pages.javascriptPage);

    String style = driver.findElement(By.id("red-item")).getAttribute("style");

    System.out.println("style = " + style);
    assertTrue(style.toLowerCase().contains("background-color"));
  }

  public void testShouldCorrectlyReportValueOfColspan() {
    driver.get(pages.tables);

    try {
      Thread.sleep(1000);
    } catch (InterruptedException e) {
      e.printStackTrace();  //To change body of catch statement use File | Settings | File Templates.
    }

    WebElement th1 = driver.findElement(By.id("th1"));
    WebElement td2 = driver.findElement(By.id("td2"));

    assertEquals("th1 id", "th1", th1.getAttribute("id"));
    assertEquals("th1 colspan should be 3", "3", th1.getAttribute("colspan"));

    assertEquals("td2 id", "td2", td2.getAttribute("id"));
    assertEquals("td2 colspan should be 2", "2", td2.getAttribute("colspan"));
  }

  // This is a test-case re-creating issue 900.
  @SuppressWarnings("unchecked")
  @Ignore(SELENESE)
  public void testShouldReturnValueOfOnClickAttribute() {
    driver.get(pages.javascriptPage);

    WebElement mouseclickDiv = driver.findElement(By.id("mouseclick"));

    String onClickValue = mouseclickDiv.getAttribute("onclick");
    String expectedOnClickValue = "displayMessage('mouse click');";
    assertThat("Javascript code expected", onClickValue, anyOf(
        equalTo("javascript:" + expectedOnClickValue), //Non-IE
        equalTo("function anonymous()\n{\n" + expectedOnClickValue + "\n}"), // IE
        equalTo("function onclick()\n{\n" + expectedOnClickValue + "\n}"))); //IE

    WebElement mousedownDiv = driver.findElement(By.id("mousedown"));
    assertEquals(null, mousedownDiv.getAttribute("onclick"));
  }

  @Ignore(value = {IE, IPHONE}, reason = "IE7 Does not support SVG; " +
      "SVG elements crash the iWebDriver app (issue 1134)")
  public void testGetAttributeDoesNotReturnAnObjectForSvgProperties() {
    driver.get(pages.svgPage);
    WebElement svgElement = driver.findElement(By.id("rotate"));
    assertEquals("rotate(30)", svgElement.getAttribute("transform"));
  }

  public void testCanRetrieveTheCurrentValueOfATextFormField_textInput() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("working"));
    assertEquals("", element.getAttribute("value"));
    element.sendKeys("hello world");
    assertEquals("hello world", element.getAttribute("value"));
  }

  public void testCanRetrieveTheCurrentValueOfATextFormField_emailInput() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("email"));
    assertEquals("", element.getAttribute("value"));
    element.sendKeys("hello world");
    assertEquals("hello world", element.getAttribute("value"));
  }

  public void testCanRetrieveTheCurrentValueOfATextFormField_textArea() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("emptyTextArea"));
    assertEquals("", element.getAttribute("value"));
    element.sendKeys("hello world");
    assertEquals("hello world", element.getAttribute("value"));
  }

}
