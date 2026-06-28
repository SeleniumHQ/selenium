// <copyright file="ElementAttributeTests.cs" company="Selenium Committers">
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

using System.Collections.ObjectModel;

namespace OpenQA.Selenium.Tests;

[TestFixture]
public class ElementAttributeTests : DriverTestFixture
{
    [Test]
    public void ShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement head = Driver.FindElement(By.XPath("/html"));
        string attribute = head.GetAttribute("cheese");
        Assert.That(attribute, Is.Null);
    }

    [Test]
    public void ShouldReturnNullWhenGettingSrcAttributeOfInvalidImgTag()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement img = Driver.FindElement(By.Id("invalidImgTag"));
        string attribute = img.GetAttribute("src");
        Assert.That(attribute, Is.Null);
    }

    [Test]
    public void ShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement img = Driver.FindElement(By.Id("validImgTag"));
        string attribute = img.GetAttribute("src");
        Assert.That(attribute, Is.EqualTo(Urls.WhereIs("icon.gif")));
    }

    [Test]
    public void ShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement img = Driver.FindElement(By.Id("validAnchorTag"));
        string attribute = img.GetAttribute("href");
        Assert.That(attribute, Is.EqualTo(Urls.WhereIs("icon.gif")));
    }

    [Test]
    public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
    {
        Driver.Url = Urls.SimpleTestPage;
        IWebElement body = Driver.FindElement(By.XPath("//body"));
        Assert.That(body.GetAttribute("style"), Is.Empty);
    }

    [Test]
    public void ShouldReturnTheValueOfTheDisabledAttributeAsNullIfNotSet()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement inputElement = Driver.FindElement(By.XPath("//input[@id='working']"));
        Assert.That(inputElement.GetAttribute("disabled"), Is.Null);
        Assert.That(inputElement.Enabled, "Element is not enabled");

        IWebElement pElement = Driver.FindElement(By.Id("peas"));
        Assert.That(inputElement.GetAttribute("disabled"), Is.Null);
        Assert.That(inputElement.Enabled, "Element is not enabled");
    }

    [Test]
    public void ShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement multiSelect = Driver.FindElement(By.Id("multi"));
        ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
        Assert.That(options[1].GetAttribute("index"), Is.EqualTo("1"));
    }

    [Test]
    public void ShouldIndicateTheElementsThatAreDisabledAreNotEnabled()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement inputElement = Driver.FindElement(By.XPath("//input[@id='notWorking']"));
        Assert.That(inputElement.Enabled, Is.False, "Element should be disabled");

        inputElement = Driver.FindElement(By.XPath("//input[@id='working']"));
        Assert.That(inputElement.Enabled, Is.True, "Element should be enabled");
    }

    [Test]
    public void ElementsShouldBeDisabledIfTheyAreDisabledUsingRandomDisabledStrings()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement disabledTextElement1 = Driver.FindElement(By.Id("disabledTextElement1"));
        Assert.That(disabledTextElement1.Enabled, Is.False, "disabledTextElement1 should be disabled");

        IWebElement disabledTextElement2 = Driver.FindElement(By.Id("disabledTextElement2"));
        Assert.That(disabledTextElement2.Enabled, Is.False, "disabledTextElement2 should be disabled");

        IWebElement disabledSubmitElement = Driver.FindElement(By.Id("disabledSubmitElement"));
        Assert.That(disabledSubmitElement.Enabled, Is.False, "disabledSubmitElement should be disabled");
    }

    [Test]
    public void ShouldThrowExceptionIfSendingKeysToElementDisabledUsingRandomDisabledStrings()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement disabledTextElement1 = Driver.FindElement(By.Id("disabledTextElement1"));

        Assert.That(() =>
        {
            disabledTextElement1.SendKeys("foo");
        }, Throws.TypeOf<ElementNotInteractableException>());

        Assert.That(disabledTextElement1.Text, Is.Empty);

        IWebElement disabledTextElement2 = Driver.FindElement(By.Id("disabledTextElement2"));

        Assert.That(
            () => disabledTextElement2.SendKeys("bar"),
            Throws.TypeOf<ElementNotInteractableException>());

        Assert.That(disabledTextElement2.Text, Is.Empty);
    }

    [Test]
    public void ShouldIndicateWhenATextAreaIsDisabled()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement textArea = Driver.FindElement(By.XPath("//textarea[@id='notWorkingArea']"));
        Assert.That(textArea.Enabled, Is.False);
    }

    [Test]
    public void ShouldIndicateWhenASelectIsDisabled()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement enabled = Driver.FindElement(By.Name("selectomatic"));
        IWebElement disabled = Driver.FindElement(By.Name("no-select"));

        Assert.That(enabled.Enabled, Is.True, "Expected select element to be enabled");
        Assert.That(disabled.Enabled, Is.False, "Expected select element to be disabled");
    }

    [Test]
    public void ShouldReturnTheValueOfCheckedForACheckboxOnlyIfItIsChecked()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement checkbox = Driver.FindElement(By.XPath("//input[@id='checky']"));
        Assert.That(checkbox.GetAttribute("checked"), Is.Null);
        checkbox.Click();
        Assert.That(checkbox.GetAttribute("checked"), Is.EqualTo("true"));
    }

    [Test]
    public void ShouldOnlyReturnTheValueOfSelectedForRadioButtonsIfItIsSet()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement neverSelected = Driver.FindElement(By.Id("cheese"));
        IWebElement initiallyNotSelected = Driver.FindElement(By.Id("peas"));
        IWebElement initiallySelected = Driver.FindElement(By.Id("cheese_and_peas"));

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
        Driver.Url = Urls.FormsPage;
        IWebElement selectBox = Driver.FindElement(By.XPath("//select[@name='selectomatic']"));
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
        Driver.Url = Urls.XhtmlTestPage;

        IWebElement heading = Driver.FindElement(By.XPath("//h1"));
        String className = heading.GetAttribute("class");

        Assert.That(className, Is.EqualTo("header"));
    }

    [Test]
    public void ShouldReturnTheContentsOfATextAreaAsItsValue()
    {
        Driver.Url = Urls.FormsPage;

        String value = Driver.FindElement(By.Id("withText")).GetAttribute("value");

        Assert.That(value, Is.EqualTo("Example text"));
    }

    [Test]
    public void ShouldReturnInnerHtml()
    {
        Driver.Url = Urls.SimpleTestPage;

        string html = Driver.FindElement(By.Id("wrappingtext")).GetAttribute("innerHTML");
        Assert.That(html, Does.Contain("<tbody>"));
    }

    [Test]
    public void ShouldTreatReadonlyAsAValue()
    {
        Driver.Url = Urls.FormsPage;

        IWebElement element = Driver.FindElement(By.Name("readonly"));
        string readOnlyAttribute = element.GetAttribute("readonly");

        Assert.That(readOnlyAttribute, Is.Not.Null);

        IWebElement textInput = Driver.FindElement(By.Name("x"));
        string notReadOnly = textInput.GetAttribute("readonly");

        Assert.That(notReadOnly, Is.Null);
    }

    [Test]
    public void ShouldReturnHiddenTextForTextContentAttribute()
    {
        Driver.Url = Urls.SimpleTestPage;

        IWebElement element = Driver.FindElement(By.Id("hiddenline"));
        string textContent = element.GetAttribute("textContent");

        Assert.That(textContent, Is.EqualTo("A hidden line of text"));
    }

    [Test]
    public void ShouldGetNumericAtribute()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("withText"));
        Assert.That(element.GetAttribute("rows"), Is.EqualTo("5"));
    }

    [Test]
    public void CanReturnATextApproximationOfTheStyleAttribute()
    {
        Driver.Url = Urls.JavascriptPage;
        string style = Driver.FindElement(By.Id("red-item")).GetAttribute("style");

        Assert.That(style.ToLower(), Does.Contain("background-color"));
    }

    public void ShouldCorrectlyReportValueOfColspan()
    {
        Driver.Url = Urls.Tables;
        System.Threading.Thread.Sleep(1000);

        IWebElement th1 = Driver.FindElement(By.Id("th1"));
        IWebElement td2 = Driver.FindElement(By.Id("td2"));

        Assert.That(th1.GetAttribute("id"), Is.EqualTo("th1"), "th1 id");
        Assert.That(th1.GetAttribute("colspan"), Is.EqualTo("3"), "th1 colspan should be 3");

        Assert.That(td2.GetAttribute("id"), Is.EqualTo("td2"), "td2 id");
        Assert.That(td2.GetAttribute("colspan"), Is.EqualTo("2"), "td2 colspan should be 2");
    }

    // This is a test-case re-creating issue 900.
    [Test]
    public void ShouldReturnValueOfOnClickAttribute()
    {
        Driver.Url = Urls.JavascriptPage;

        IWebElement mouseclickDiv = Driver.FindElement(By.Id("mouseclick"));

        string onClickValue = mouseclickDiv.GetAttribute("onclick");
        string expectedOnClickValue = "displayMessage('mouse click');";
        List<string> acceptableOnClickValues = new List<string>();
        acceptableOnClickValues.Add("javascript:" + expectedOnClickValue);
        acceptableOnClickValues.Add("function anonymous()\n{\n" + expectedOnClickValue + "\n}");
        acceptableOnClickValues.Add("function onclick()\n{\n" + expectedOnClickValue + "\n}");
        Assert.That(acceptableOnClickValues, Contains.Item(onClickValue));

        IWebElement mousedownDiv = Driver.FindElement(By.Id("mousedown"));
        Assert.That(mousedownDiv.GetAttribute("onclick"), Is.Null);
    }

    [Test]
    public void GetAttributeDoesNotReturnAnObjectForSvgProperties()
    {
        if (TestUtilities.IsOldIE(Driver))
        {
            Assert.Ignore("IE8 and earlier do not support SVG");
        }

        Driver.Url = Urls.SvgPage;
        IWebElement svgElement = Driver.FindElement(By.Id("rotate"));
        Assert.That(svgElement.GetAttribute("transform"), Is.EqualTo("rotate(30)"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_textInput()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("working"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_emailInput()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("email"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void CanRetrieveTheCurrentValueOfATextFormField_textArea()
    {
        Driver.Url = Urls.FormsPage;
        IWebElement element = Driver.FindElement(By.Id("emptyTextArea"));
        Assert.That(element.GetAttribute("value"), Is.Empty);
        element.SendKeys("hello world");
        Assert.That(element.GetAttribute("value"), Is.EqualTo("hello world"));
    }

    [Test]
    public void ShouldReturnNullForNonPresentBooleanAttributes()
    {
        Driver.Url = Urls.BooleanAttributes;
        IWebElement element1 = Driver.FindElement(By.Id("working"));
        Assert.That(element1.GetAttribute("required"), Is.Null);
        IWebElement element2 = Driver.FindElement(By.Id("wallace"));
        Assert.That(element2.GetAttribute("nowrap"), Is.Null);
    }

    [Test]
    public void ShouldReturnTrueForPresentBooleanAttributes()
    {
        Driver.Url = Urls.BooleanAttributes;
        IWebElement element1 = Driver.FindElement(By.Id("emailRequired"));
        Assert.That(element1.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element2 = Driver.FindElement(By.Id("emptyTextAreaRequired"));
        Assert.That(element2.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element3 = Driver.FindElement(By.Id("inputRequired"));
        Assert.That(element3.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element4 = Driver.FindElement(By.Id("textAreaRequired"));
        Assert.That(element4.GetAttribute("required"), Is.EqualTo("true"));
        IWebElement element5 = Driver.FindElement(By.Id("unwrappable"));
        Assert.That(element5.GetAttribute("nowrap"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeNullWhenNotSet()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("selectWithoutMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.Null);
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSet()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("selectWithMultipleEqualsMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsBlank()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("selectWithEmptyStringMultiple"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithoutAValue()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("selectWithMultipleWithoutValue"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsSomethingElse()
    {
        Driver.Url = Urls.SelectPage;
        IWebElement element = Driver.FindElement(By.Id("selectWithRandomMultipleValue"));
        Assert.That(element.GetAttribute("multiple"), Is.EqualTo("true"));
    }

    [Test]
    public void GetAttributeOfUserDefinedProperty()
    {
        Driver.Url = Urls.WhereIs("userDefinedProperty.html");
        IWebElement element = Driver.FindElement(By.Id("d"));
        Assert.That(element.GetAttribute("dynamicProperty"), Is.EqualTo("sampleValue"));
    }

    [Test]
    public void ShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame()
    {
        Driver.Url = Urls.IframesPage;
        Driver.SwitchTo().Frame("iframe1");

        IWebElement wallace = Driver.FindElement(By.XPath("//div[@id='wallace']"));
        String className = wallace.GetAttribute("class");
        Assert.That(className, Is.EqualTo("gromit"));
    }
}
