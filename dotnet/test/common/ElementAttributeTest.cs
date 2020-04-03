using System;
using System.Collections.Generic;
using NUnit.Framework;
using System.Collections.ObjectModel;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
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
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldReturnAnAbsoluteUrlWhenGettingSrcAttributeOfAValidImgTag()
        {
            driver.Url = simpleTestPage;
            IWebElement img = driver.FindElement(By.Id("validImgTag"));
            string attribute = img.GetAttribute("src");
            Assert.AreEqual(EnvironmentManager.Instance.UrlBuilder.WhereIs("icon.gif"), attribute);
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
        public void ShouldReturnAnAbsoluteUrlWhenGettingHrefAttributeOfAValidAnchorTag()
        {
            driver.Url = simpleTestPage;
            IWebElement img = driver.FindElement(By.Id("validAnchorTag"));
            string attribute = img.GetAttribute("href");
            Assert.AreEqual(EnvironmentManager.Instance.UrlBuilder.WhereIs("icon.gif"), attribute);
        }


        [Test]
        public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
        {
            driver.Url = simpleTestPage;
            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.AreEqual(string.Empty, body.GetAttribute("style"));
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
            Assert.AreEqual("1", options[1].GetAttribute("index"));
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
            try
            {
                disabledTextElement1.SendKeys("foo");
                Assert.Fail("Should have thrown exception");
            }
            catch (InvalidElementStateException)
            {
                //Expected
            }

            Assert.AreEqual(string.Empty, disabledTextElement1.Text);

            IWebElement disabledTextElement2 = driver.FindElement(By.Id("disabledTextElement2"));
            try
            {
                disabledTextElement2.SendKeys("bar");
                Assert.Fail("Should have thrown exception");
            }
            catch (InvalidElementStateException)
            {
                //Expected
            }

            Assert.AreEqual(string.Empty, disabledTextElement2.Text);
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
            Assert.AreEqual(null, checkbox.GetAttribute("checked"));
            checkbox.Click();
            Assert.AreEqual("true", checkbox.GetAttribute("checked"));
        }

        [Test]
        public void ShouldOnlyReturnTheValueOfSelectedForRadioButtonsIfItIsSet()
        {
            driver.Url = formsPage;
            IWebElement neverSelected = driver.FindElement(By.Id("cheese"));
            IWebElement initiallyNotSelected = driver.FindElement(By.Id("peas"));
            IWebElement initiallySelected = driver.FindElement(By.Id("cheese_and_peas"));

            Assert.AreEqual(null, neverSelected.GetAttribute("selected"), "false");
            Assert.AreEqual(null, initiallyNotSelected.GetAttribute("selected"), "false");
            Assert.AreEqual("true", initiallySelected.GetAttribute("selected"), "true");

            initiallyNotSelected.Click();
            Assert.AreEqual(null, neverSelected.GetAttribute("selected"));
            Assert.AreEqual("true", initiallyNotSelected.GetAttribute("selected"));
            Assert.AreEqual(null, initiallySelected.GetAttribute("selected"));
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
            Assert.AreEqual("true", one.GetAttribute("selected"));
            Assert.AreEqual(null, two.GetAttribute("selected"));
        }

        [Test]
        public void ShouldReturnValueOfClassAttributeOfAnElement()
        {
            driver.Url = xhtmlTestPage;

            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            String className = heading.GetAttribute("class");

            Assert.AreEqual("header", className);
        }

        [Test]
        public void ShouldReturnTheContentsOfATextAreaAsItsValue()
        {
            driver.Url = formsPage;

            String value = driver.FindElement(By.Id("withText")).GetAttribute("value");

            Assert.AreEqual("Example text", value);
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

            Assert.AreEqual("A hidden line of text", textContent);
        }

        [Test]
        public void ShouldGetNumericAtribute()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));
            Assert.AreEqual("5", element.GetAttribute("rows"));
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

            Assert.AreEqual("th1", th1.GetAttribute("id"), "th1 id");
            Assert.AreEqual("3", th1.GetAttribute("colspan"), "th1 colspan should be 3");

            Assert.AreEqual("td2", td2.GetAttribute("id"), "td2 id");
            Assert.AreEqual("2", td2.GetAttribute("colspan"), "td2 colspan should be 2");
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
            Assert.AreEqual("rotate(30)", svgElement.GetAttribute("transform"));
        }

        [Test]
        public void CanRetrieveTheCurrentValueOfATextFormField_textInput()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("working"));
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
            element.SendKeys("hello world");
            Assert.AreEqual("hello world", element.GetAttribute("value"));
        }

        [Test]
        public void CanRetrieveTheCurrentValueOfATextFormField_emailInput()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("email"));
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
            element.SendKeys("hello world");
            Assert.AreEqual("hello world", element.GetAttribute("value"));
        }

        [Test]
        public void CanRetrieveTheCurrentValueOfATextFormField_textArea()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("emptyTextArea"));
            Assert.AreEqual(string.Empty, element.GetAttribute("value"));
            element.SendKeys("hello world");
            Assert.AreEqual("hello world", element.GetAttribute("value"));
        }

        [Test]
        [IgnoreBrowser(Browser.Opera)]
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
            Assert.AreEqual("true", element1.GetAttribute("required"));
            IWebElement element2 = driver.FindElement(By.Id("emptyTextAreaRequired"));
            Assert.AreEqual("true", element2.GetAttribute("required"));
            IWebElement element3 = driver.FindElement(By.Id("inputRequired"));
            Assert.AreEqual("true", element3.GetAttribute("required"));
            IWebElement element4 = driver.FindElement(By.Id("textAreaRequired"));
            Assert.AreEqual("true", element4.GetAttribute("required"));
            IWebElement element5 = driver.FindElement(By.Id("unwrappable"));
            Assert.AreEqual("true", element5.GetAttribute("nowrap"));
        }

        [Test]
        public void MultipleAttributeShouldBeNullWhenNotSet()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithoutMultiple"));
            Assert.AreEqual(null, element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSet()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithMultipleEqualsMultiple"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsBlank()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithEmptyStringMultiple"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithoutAValue()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithMultipleWithoutValue"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void MultipleAttributeShouldBeTrueWhenSelectHasMultipleWithValueAsSomethingElse()
        {
            driver.Url = selectPage;
            IWebElement element = driver.FindElement(By.Id("selectWithRandomMultipleValue"));
            Assert.AreEqual("true", element.GetAttribute("multiple"));
        }

        [Test]
        public void GetAttributeOfUserDefinedProperty()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("userDefinedProperty.html");
            IWebElement element = driver.FindElement(By.Id("d"));
            Assert.AreEqual("sampleValue", element.GetAttribute("dynamicProperty"));
        }

        [Test]
        public void ShouldReturnValueOfClassAttributeOfAnElementAfterSwitchingIFrame()
        {
            driver.Url = iframePage;
            driver.SwitchTo().Frame("iframe1");

            IWebElement wallace = driver.FindElement(By.XPath("//div[@id='wallace']"));
            String className = wallace.GetAttribute("class");
            Assert.AreEqual("gromit", className);
        }
    }
}
