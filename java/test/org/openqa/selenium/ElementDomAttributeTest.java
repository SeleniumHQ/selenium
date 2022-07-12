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

package org.openqa.selenium;

import static java.util.Arrays.asList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;
import static org.openqa.selenium.testing.drivers.Browser.CHROME;
import static org.openqa.selenium.testing.drivers.Browser.EDGE;
import static org.openqa.selenium.testing.drivers.Browser.FIREFOX;
import static org.openqa.selenium.testing.drivers.Browser.HTMLUNIT;
import static org.openqa.selenium.testing.drivers.Browser.IE;
import static org.openqa.selenium.testing.drivers.Browser.SAFARI;

import org.junit.jupiter.api.Test;
import org.openqa.selenium.environment.webserver.Page;
import org.openqa.selenium.testing.JupiterTestBase;
import org.openqa.selenium.testing.NotYetImplemented;

import java.util.List;

public class ElementDomAttributeTest extends JupiterTestBase {

  @Test
  public void testShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed() {
    driver.get(pages.simpleTestPage);
    WebElement head = driver.findElement(By.xpath("/html"));
    String attribute = head.getDomAttribute("cheese");
    assertThat(attribute).isNull();
  }

  @Test
  public void testShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag() {
    driver.get(pages.simpleTestPage);
    WebElement img = driver.findElement(By.id("invalidImgTag"));
    String attribute = img.getDomAttribute("src");
    assertThat(attribute).isNull();
  }

  @Test
  public void testShouldReturnTheActualValueWhenGettingSrcAttributeOfAValidImgTag() {
    driver.get(pages.simpleTestPage);
    WebElement img = driver.findElement(By.id("validImgTag"));
    String attribute = img.getDomAttribute("src");
    assertThat(attribute).isEqualTo("icon.gif");
  }

  @Test
  public void testShouldReturnTheActualValueWhenGettingHrefAttributeOfAValidAnchorTag() {
    driver.get(pages.simpleTestPage);
    WebElement img = driver.findElement(By.id("validAnchorTag"));
    String attribute = img.getDomAttribute("href");
    assertThat(attribute).isEqualTo("icon.gif");
  }

  @Test
  public void testShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty() {
    driver.get(pages.simpleTestPage);
    WebElement body = driver.findElement(By.xpath("//body"));
    assertThat(body.getDomAttribute("style")).isEqualTo("");
  }

  @Test
  public void testShouldReturnTheValueOfTheDisabledAttributeAsNullIfNotSet() {
    driver.get(pages.formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.getDomAttribute("disabled")).isNull();
    assertThat(inputElement.isEnabled()).isTrue();

    WebElement pElement = driver.findElement(By.id("peas"));
    assertThat(pElement.getDomAttribute("disabled")).isNull();
    assertThat(pElement.isEnabled()).isTrue();
  }

  @Test
  public void testShouldNotReturnTheValueOfTheIndexAttributeIfItIsMissing() {
    driver.get(pages.formPage);
    WebElement multiSelect = driver.findElement(By.id("multi"));
    List<WebElement> options = multiSelect.findElements(By.tagName("option"));
    assertThat(options.get(1).getDomAttribute("index")).isNull();
  }

  @Test
  public void testShouldIndicateTheElementsThatAreDisabledAreNotEnabled() {
    driver.get(pages.formPage);
    WebElement inputElement = driver.findElement(By.xpath("//input[@id='notWorking']"));
    assertThat(inputElement.isEnabled()).isFalse();

    inputElement = driver.findElement(By.xpath("//input[@id='working']"));
    assertThat(inputElement.isEnabled()).isTrue();
  }

  @Test
  public void testElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings() {
    driver.get(pages.formPage);
    WebElement disabledTextElement1 = driver.findElement(By.id("disabledTextElement1"));
    assertThat(disabledTextElement1.isEnabled()).isFalse();

    WebElement disabledTextElement2 = driver.findElement(By.id("disabledTextElement2"));
    assertThat(disabledTextElement2.isEnabled()).isFalse();

    WebElement disabledSubmitElement = driver.findElement(By.id("disabledSubmitElement"));
    assertThat(disabledSubmitElement.isEnabled()).isFalse();
  }

  @Test
  @NotYetImplemented(SAFARI)
  public void testShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings() {
    driver.get(pages.formPage);
    WebElement disabledTextElement1 = driver.findElement(By.id("disabledTextElement1"));
    assertThatExceptionOfType(InvalidElementStateException.class)
        .isThrownBy(() -> disabledTextElement1.sendKeys("foo"));
    assertThat(disabledTextElement1.getText()).isEqualTo("");

    WebElement disabledTextElement2 = driver.findElement(By.id("disabledTextElement2"));
    assertThatExceptionOfType(InvalidElementStateException.class)
        .isThrownBy(() -> disabledTextElement2.sendKeys("bar"));
    assertThat(disabledTextElement2.getText()).isEqualTo("");
  }

  @Test
  public void testShouldIndicateWhenATextAreaIsDisabled() {
    driver.get(pages.formPage);
    WebElement textArea = driver.findElement(By.xpath("//textarea[@id='notWorkingArea']"));
    assertThat(textArea.isEnabled()).isFalse();
  }

  @Test
  public void testShouldIndicateWhenASelectIsDisabled() {
    driver.get(pages.formPage);

    WebElement enabled = driver.findElement(By.name("selectomatic"));
    WebElement disabled = driver.findElement(By.name("no-select"));

    assertThat(enabled.isEnabled()).isTrue();
    assertThat(disabled.isEnabled()).isFalse();
  }

  @Test
  public void testShouldReturnTheValueOfSelectedForOptionsOnlyIfTheyAreSelected() {
    driver.get(pages.formPage);
    WebElement selectBox = driver.findElement(By.xpath("//select[@name='selectomatic']"));
    List<WebElement> options = selectBox.findElements(By.tagName("option"));
    WebElement one = options.get(0);
    WebElement two = options.get(1);
    assertThat(one.isSelected()).isTrue();
    assertThat(two.isSelected()).isFalse();
    assertThat(one.getDomAttribute("selected")).isEqualTo("true");
    assertThat(two.getDomAttribute("selected")).isNull();
  }

  @Test
  public void testShouldReturnValueOfClassAttributeOfAnElement() {
    driver.get(pages.xhtmlTestPage);

    WebElement heading = driver.findElement(By.xpath("//h1"));
    String className = heading.getDomAttribute("class");

    assertThat(className).isEqualTo("header");
  }

  @Test
  public void testShouldNotReturnTheContentsOfATextAreaAsItsValue() {
    driver.get(pages.formPage);
    String value = driver.findElement(By.id("withText")).getDomAttribute("value");
    assertThat(value).isNull();
  }

  @Test
  public void testShouldNotReturnInnerHtmlProperty() {
    driver.get(pages.simpleTestPage);
    String html = driver.findElement(By.id("wrappingtext")).getDomAttribute("innerHTML");
    assertThat(html).isNull();
  }

  @Test
  public void testShouldTreatReadonlyAsAValue() {
    driver.get(pages.formPage);

    WebElement element = driver.findElement(By.name("readonly"));
    String readonly = element.getDomAttribute("readonly");

    assertThat(readonly).isNotNull();

    WebElement textInput = driver.findElement(By.name("x"));
    String notReadonly = textInput.getDomAttribute("readonly");

    assertThat(readonly).isNotEqualTo(notReadonly);
  }

  @Test
  public void testShouldNotReturnTextContentProperty() {
    driver.get(pages.simpleTestPage);
    WebElement element = driver.findElement(By.id("hiddenline"));
    assertThat(element.getDomAttribute("textContent")).isNull();
  }

  @Test
  public void testShouldGetNumericAttribute() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    assertThat(element.getDomAttribute("rows")).isEqualTo("5");
  }

  @Test
  public void testCanReturnATextApproximationOfTheStyleAttribute() {
    driver.get(pages.javascriptPage);

    String style = driver.findElement(By.id("red-item")).getDomAttribute("style");

    assertThat(style.toLowerCase().contains("background-color")).isTrue();
  }

  @Test
  public void testShouldCorrectlyReportValueOfColspan() {
    driver.get(pages.tables);

    WebElement th1 = driver.findElement(By.id("th1"));
    WebElement td2 = driver.findElement(By.id("td2"));

    assertThat(th1.getDomAttribute("id")).isEqualTo("th1");
    assertThat(th1.getDomAttribute("colspan")).isEqualTo("3");

    assertThat(td2.getDomAttribute("id")).isEqualTo("td2");
    assertThat(td2.getDomAttribute("colspan")).isEqualTo("2");
  }

  // This is a test-case re-creating issue 900.
  @Test
  public void testShouldReturnValueOfOnClickAttribute() {
    driver.get(pages.javascriptPage);

    WebElement mouseclickDiv = driver.findElement(By.id("mouseclick"));

    String onClickValue = mouseclickDiv.getDomAttribute("onclick");
    String expectedOnClickValue = "displayMessage('mouse click');";
    assertThat(onClickValue).as("Javascript code").isIn(
      "javascript:" + expectedOnClickValue, // Non-IE
      "function anonymous()\n{\n" + expectedOnClickValue + "\n}", // IE
      "function onclick()\n{\n" + expectedOnClickValue + "\n}"); // IE

    WebElement mousedownDiv = driver.findElement(By.id("mousedown"));
    assertThat(mousedownDiv.getDomAttribute("onclick")).isNull();
  }

  @Test
  public void testgetDomAttributeDoesNotReturnAnObjectForSvgProperties() {
    driver.get(pages.svgPage);
    WebElement svgElement = driver.findElement(By.id("rotate"));
    assertThat(svgElement.getDomAttribute("transform")).isEqualTo("rotate(30)");
  }

  @Test
  public void testCanRetrieveTheCurrentValueOfATextFormFieldWithPresetText() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("inputWithText"));
    assertThat(element.getDomAttribute("value")).isEqualTo("Example text");
    element.sendKeys("hello@example.com");
    assertThat(element.getDomAttribute("value")).isEqualTo("Example text");
  }

  @Test
  public void testShouldNotReturnTextOfATextArea() {
    driver.get(pages.formPage);
    WebElement element = driver.findElement(By.id("withText"));
    assertThat(element.getDomAttribute("value")).isNull();
  }

  @Test
  public void testShouldReturnNullForNonPresentBooleanAttributes() {
    driver.get(pages.booleanAttributes);
    WebElement element1 = driver.findElement(By.id("working"));
    assertThat(element1.getDomAttribute("required")).isNull();
    WebElement element2 = driver.findElement(By.id("wallace"));
    assertThat(element2.getDomAttribute("nowrap")).isNull();
  }

  @Test
  @NotYetImplemented(value = CHROME, reason = "It returns a property")
  @NotYetImplemented(EDGE)
  @NotYetImplemented(FIREFOX)
  public void testShouldReturnEmptyStringForPresentBooleanAttributes() {
    driver.get(pages.booleanAttributes);
    WebElement element1 = driver.findElement(By.id("emailRequired"));
    assertThat(element1.getDomAttribute("required")).isEqualTo("");
    WebElement element2 = driver.findElement(By.id("emptyTextAreaRequired"));
    assertThat(element2.getDomAttribute("required")).isEqualTo("required");
    WebElement element3 = driver.findElement(By.id("inputRequired"));
    assertThat(element3.getDomAttribute("required")).isEqualTo("");
    WebElement element4 = driver.findElement(By.id("textAreaRequired"));
    assertThat(element4.getDomAttribute("required")).isEqualTo("false");
    WebElement element5 = driver.findElement(By.id("unwrappable"));
    assertThat(element5.getDomAttribute("nowrap")).isEqualTo("");
  }

  @Test
  public void testMultipleAttributeShouldBeNullWhenNotSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithoutMultiple"));
    assertThat(element.getDomAttribute("multiple")).isNull();
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSet() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleEqualsMultiple"));
    assertThat(element.getDomAttribute("multiple")).isEqualTo("true");
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsBlank() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithEmptyStringMultiple"));
    assertThat(element.getDomAttribute("multiple")).isEqualTo("true");
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMultipleWithoutAValue() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithMultipleWithoutValue"));
    assertThat(element.getDomAttribute("multiple")).isEqualTo("true");
  }

  @Test
  public void testMultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsSomethingElse() {
    driver.get(pages.selectPage);
    WebElement element = driver.findElement(By.id("selectWithRandomMultipleValue"));
    assertThat(element.getDomAttribute("multiple")).isEqualTo("true");
  }

  @Test
  public void shouldTreatContenteditableAsEnumeratedButNotBoolean() {
    checkEnumeratedAttribute("contenteditable", "true", "false", "yes", "no", "", "blabla");
  }

  @Test
  @NotYetImplemented(IE)
  @NotYetImplemented(HTMLUNIT)
  @NotYetImplemented(SAFARI)
  public void shouldTreatDraggableAsEnumeratedButNotBoolean() {
    checkEnumeratedAttribute("draggable", "true", "false", "yes", "no", "", "blabla");
  }

  private void checkEnumeratedAttribute(String name, String... values) {
    asList(values).forEach(value -> {
      driver.get(appServer.create(new Page().withBody(
        String.format("<div id=\"attr\" %s=\"%s\">", name, value))));
      assertThat(driver.findElement(By.id("attr")).getDomAttribute(name)).isEqualTo(value);
    });

    driver.get(appServer.create(new Page().withBody(String.format("<div id=\"attr\" %s>", name))));
    assertThat(driver.findElement(By.id("attr")).getDomAttribute(name)).isEqualTo("");

    driver.get(appServer.create(new Page().withBody("<div id=\"attr\">")));
    assertThat(driver.findElement(By.id("attr")).getDomAttribute(name)).isNull();
  }
}
