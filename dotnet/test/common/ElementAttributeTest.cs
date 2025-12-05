// <copyright file="ElementAttributeTest.cs" company="Selenium Committers">
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
// </copyright>

using NUnit.Framework;
using OpenQA.Selenium.Environment;
using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium;

[TestFixture]
public class ElementAttributeTest : DriverTestFixture
{
    [Test]
    public void ShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed()
    {
        driver.Url = simpleTestPage;
        IWebElement head = driver.FindElement(By.XPath("/html"));
        string attribute = head.GetAttribute("cheese");
        Assert.That(attribute, Is.Null);
    }

    [Test]
    public void ShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag()
    {
        driver.Url = simpleTestPage;
        IWebElement img = driver.FindElement(By.Id("invalidImgTag"));
        string attribute = img.GetAttribute("src");
        Assert.That(attribute, Is.Null);
    }

    [Test]
    public void ShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag()
    {
        driver.Url = simpleTestPage;
        IWebElement img = driver.FindElement(By.Id("validImgTag"));
        string attribute = img.GetAttribute("src");
        Assert.That(attribute, Is.EqualTo(EnvironmentManager.Instance.UrlBuilder.WhereIs("icon.gif")));
    }

    [Test]
    public void ShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag()
    {
        driver.Url = simpleTestPage;
        IWebElement img = driver.FindElement(By.Id("validAnchorTag"));
        string attribute = img.GetAttribute("href");
        Assert.That(attribute, Is.EqualTo(EnvironmentManager.Instance.UrlBuilder.WhereIs("icon.gif")));
    }


    [Test]
    public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
    {
        driver.Url = simpleTestPage;
        IWebElement body = driver.FindElement(By.XPath("//body"));
        Assert.That(body.GetAttribute("style"), Is.Empty);
    }

    [Test]
    public void ShouldReturnTheValueOfTheDisabledAttributeAsNullIfNotSet()
    {
        driver.Url = formsPage;
        IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
        Assert.That(inputElement.GetAttribute("disabled"), Is.Null);
        Assert.That(inputElement.Enabled, "Element is not enabled");

        IWebElement pElement = driver.FindElement(By.Id("peas"));
        Assert.That(inputElement.GetAttribute("disabled"), Is.Null);
        Assert.That(inputElement.Enabled, "Element is not enabled");
    }

    [Test]
    public void ShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing()
    {
        driver.Url = formsPage;

        IWebElement multiSelect = driver.FindElement(By.Id("multi"));
        ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
        Assert.That(options[1].GetAttribute("index"), Is.EqualTo("1"));
    }


    [Test]
    public void ShouldIndicateTheElementsThatAreDisabledAreNotEnabled()
    {
        driver.Url = formsPage;
        IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='notWorking']"));
        Assert.That(inputElement.Enabled, Is.False, "Element should be disabled");

        inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
        Assert.That(inputElement.Enabled, Is.True, "Element should be enabled");
    }

    [Test]
    public void ElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings()
    {
        driver.Url = formsPage;
        IWebElement disabledTextElement1 = driver.FindElement(By.Id("disabledTextElement1"));
        Assert.That(disabledTextElement1.Enabled, Is.False, "disabledTextElement1 should be disabled");

        IWebElement disabledTextElement2 = driver.FindElement(By.Id("disabledTextElement2"));
        Assert.That(disabledTextElement2.Enabled, Is.False, "disabledTextElement2 should be disabled");

        IWebElement disabledSubmitElement = driver.FindElement(By.Id("disabledSubmitElement"));
        Assert.That(disabledSubmitElement.Enabled, Is.False, "disabledSubmitElement should be disabled");
    }

    [Test]
    public void ShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings()
    {
        driver.Url = formsPage;
        IWebElement disabledTextElement1 = driver.FindElement(By.Id("disabledTextElement1"));

        Assert.That(() =>
        {
            disabledTextElement1.SendKeys("foo");
        }, Throws.TypeOf<ElementNotInteractableException>());

        Assert.That(disabledTextElement1.Text, Is.Empty);

        IWebElement disabledTextElement2 = driver.FindElement(By.Id("disabledTextElement2"));

        Assert.That(
            () => disabledTextElement2.SendKeys("bar"),
            Throws.TypeOf<ElementNotInteractableException>());

        Assert.That(disabledTextElement2.Text, Is.Empty);
    }

    [Test]
    public void ShouldIndicateWhenATextAreaIsDisabled()
    {
        driver.Url = formsPage;
        IWebElement textArea = driver.FindElement(By.XPath("//textarea[@id='notWorkingArea']"));
        Assert.That(textArea.Enabled, Is.False);
    }

    [Test]
    public void ShouldIndicateWhenASelectIsDisabled()
    {
        driver.Url = formsPage;

        IWebElement enabled = driver.FindElement(By.Name("selectomatic"));
        IWebElement disabled = driver.FindElement(By.Name("no-select"));

        Assert.That(enabled.Enabled, Is.True, "Expected select element to be enabled");
        Assert.That(disabled.Enabled, Is.False, "Expected select element to be disabled");
    }

    [Test]
    public void ShouldReturnTheValueOfCheckedForACheckboxOnlyIfItIsChecked()
    {
        driver.Url = formsPage;
        IWebElement checkbox = driver.FindElement(By.XPath("//input[@id='checky']"));
        Assert.That(checkbox.GetAttribute("checked"), Is.Null);
        checkbox.Click();
        Assert.That(checkbox.GetAttribute("checked"), Is.EqualTo("true"));
    }

    [Test]
    public void ShouldOnlyReturnTheValueOfSelectedForRadioButtonsIfItIsSet()
    {
        driver.Url = formsPage;
        IWebElement neverSelected = driver.FindElement(By.Id("cheese"));
        IWebElement initiallyNotSelected = driver.FindElement(By.Id("peas"));
        IWebElement initiallySelected = driver.FindElement(By.Id("cheese_and_peas"));

        Assert.That(neverSelected.GetAttribute("selected"), Is.Null, "false");
        Assert.That(initiallyNotSelected.GetAttribute("selected"), Is.Null, "false");
        Assert.That(initiallySelected.GetAttribute("selected"), Is.EqualTo("true"), "true");

        initiallyNotSelected.Click();
        Assert.That(neverSelected.GetAttribute("selected"), Is.Null);
        Assert.That(initiallyNotSelected.GetAttribute("selected"), Is.EqualTo("true"));
        Assert.That(initiallySelected.GetAttribute("selected"), Is.Null);
    }

    [Test]
    public void ShouldReturnTheValueOfSelectedForOptionsOnlyIfTheyAreSelected()
    {
        driver.Url = formsPage;
        IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
        ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
        IWebElement one = options[0];
        IWebElement two = options[1];
        Assert.That(one.Selected, Is.True);
        Assert.That(two.Selected, Is.False);
        Assert.That(one.GetAttribute("selected"), Is.EqualTo("true"));
        Assert.That(two.GetAttribute("selected"), Is.Null);
    }

    [Test]
    public void ShouldReturnValueOfClassAttributeOfAnElement()
    {
        driver.Url = xhtmlTestPage;

        IWebElement heading = driver.FindElement(By.XPath("//h1"));
        String className = heading.GetAttribute("class");

        Assert.That(className, Is.EqualTo("header"));
    }

    [Test]
    public void ShouldReturnTheContentsOfATextAreaAsItsValue()
    {
        driver.Url = formsPage;

        String value = driver.FindElement(By.Id("withText")).GetAttribute("value");

        Assert.That(value, Is.EqualTo("Example text"));
    }

    [Test]
    public void ShouldReturnInnerHtml()
    {
        driver.Url = simpleTestPage;

        string html = driver.FindElement(By.Id("wrappingtext")).GetAttribute("innerHTML");
        Assert.That(html, Does.Contain("<tbody>"));
    }

    [Test]
    public void ShouldTreatReadonlyAsAValue()
    {
        driver.Url = formsPage;

        IWebElement element = driver.FindElement(By.Name("readonly"));
        string readOnlyAttribute = element.GetAttribute("readonly");

        Assert.That(readOnlyAttribute, Is.Not.Null);

        IWebElement textInput = driver.FindElement(By.Name("x"));
        string notReadOnly = textInput.GetAttribute("readonly");

        Assert.That(notReadOnly, Is.Null);
    }

    [Test]
    public void ShouldReturnHiddenTextForTextContentAttribute()
    {
        driver.Url = simpleTestPage;

        IWebElement element = driver.FindElement(By.Id("hiddenline"));
        string textContent = element.GetAttribute("textContent");

        Assert.That(textContent, Is.EqualTo("A hidden line of text"));
    }

    [Test]
    public void ShouldGetNumericAtribute()
    {
        driver.Url = formsPage;
        IWebElement element = driver.FindElement(By.Id("withText"));
        Assert.That(element.GetAttribute("rows"), Is.EqualTo("5"));
    }

    [Test]
    public void CanReturnATextApproximationOfTheStyleAttribute()
    {
        driver.Url = javascriptPage;
        string style = driver.FindElement(By.Id("red-item")).GetAttribute("style");

        Assert.That(style.ToLower(), Does.Contain("background-color"));
    }

    public void ShouldCorrectlyReportValueOfColspan()
    {
        driver.Url = tables;
        System.Threading.Thread.Sleep(1000);

        IWebElement th1 = driver.FindElement(By.Id("th1"));
        IWebElement td2 = driver.FindElement(By.Id("td2"));

        Assert.That(th1.GetAttribute("id"), Is.EqualTo("th1"), "th1 id");
        Assert.That(th1.GetAttribute("colspan"), Is.EqualTo("3"), "th1 colspan should be 3");

        Assert.That(td2.GetAttribute("id"), Is.EqualTo("td2"), "td2 id");
        Assert.That(td2.GetAttribute("colspan"), Is.EqualTo("2"), "td2 colspan should be 2");
    }

    // This is a test-case re-creating issue 900.
    [Test]
    public void ShouldReturnValueOfOnClickAttribute()
    {
        driver.Url = javascriptPage;

        IWebElement mouseclickDiv = driver.FindElement(By.Id("mouseclick"));

        string onClickValue = mouseclickDiv.GetAttribute("onclick");
        string expectedOnClickValue = "displayMessage('mouse click');";
        List<string> acceptableOnClickValues = new List<string>();
        acceptableOnClickValues.Add("javascript:" + expectedOnClickValue);
        acceptableOnClickValues.Add("function anonymous()\n{\n" + expectedOnClickValue + "\n}");
        acceptableOnClickValues.Add("function onclick()\n{\n" + expectedOnClickValue + "\n}");
        Assert.That(acceptableOnClickValues, Contains.Item(onClickValue));

        IWebElement mousedownDiv = driver.FindElement(By.Id("mousedown"));
        Assert.That(mousedownDiv.GetAttribute("onclick"), Is.Null);
    }

    [Test]
    public void GetAttributeDoesNotReturnAnObjectForSvgProperties()
    {
        if (TestUtilities.IsOldIE(driver))
        {
            Assert.Ignore("IE8 and earlier do not support SVG");
        }

        driver.Url = svgPage;
        IWebElement svgElement = driver.FindElement(By.Id("rotate"));
        Assert.That(svgElement.GetAttribute("transform"), Is.EqualTo("rotate(30)"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_textInput()
    {
        driver.Url = formsPage;
        IWebElement element = driver.FindElement(By.Id("working"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_emailInput()
    {
        driver.Url = formsPage;
        IWebElement element = driver.FindElement(By.Id("email"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_textArea()
    {
        driver.Url = formsPage;
        IWebElement element = driver.FindElement(By.Id("emptyTextArea"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldReturnNullForNonPresentBooleanAttributes()
    {
        driver.Url = booleanAttributes;
        IWebElement element1 = driver.FindElement(By.Id("working"));
        Assert.That(element1.GetAttribute("required"), Is.Null);
        IWebElement element2 = driver.FindElement(By.Id("wallace"));
        Assert.That(element2.GetAttribute("nowrap"), Is.Null);
    }

    [Test]
    public void ShouldReturnTrueForPresentBooleanAttributes()
    {
        driver.Url = booleanAttributes;
        IWebElement element1 = driver.FindElement(By.Id("emailRequired"));
        Assert.That(element1.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element2 = driver.FindElement(By.Id("emptyTextAreaRequired"));
        Assert.That(element2.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element3 = driver.FindElement(By.Id("inputRequired"));
        Assert.That(element3.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element4 = driver.FindElement(By.Id("textAreaRequired"));
        Assert.That(element4.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element5 = driver.FindElement(By.Id("unwrappable"));
        Assert.That(element5.GetAttribute("nowrap"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeNullWhenNotSet()
    {
        driver.Url = selectPage;
        IWebElement element = driver.FindElement(By.Id("selectWithoutMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.Null);
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSet()
    {
        driver.Url = selectPage;
        IWebElement element = driver.FindElement(By.Id("selectWithMultipleEqualsMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsBlank()
    {
        driver.Url = selectPage;
        IWebElement element = driver.FindElement(By.Id("selectWithEmptyStringMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithoutAValue()
    {
        driver.Url = selectPage;
        IWebElement element = driver.FindElement(By.Id("selectWithMultipleWithoutValue"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsSomethingElse()
    {
        driver.Url = selectPage;
        IWebElement element = driver.FindElement(By.Id("selectWithRandomMultipleValue"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void GetAttributeOfUserDefinedProperty()
    {
        driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("userDefinedProperty.html");
        IWebElement element = driver.FindElement(By.Id("d"));
        Assert.That(element.GetAttribute("dynamicProperty"), Is.EqualTo("sampleValue"));
    }

    [Test]
    public void ShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame()
    {
        driver.Url = iframePage;
        driver.SwitchTo().Frame("iframe1");

        IWebElement wallace = driver.FindElement(By.XPath("//div[@id='wallace']"));
        String className = wallace.GetAttribute("class");
        Assert.That(className, Is.EqualTo("gromit"));
    }
}
