using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Collections.ObjectModel;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class ElementAttributeTest : DriverTestFixture
    {
        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed()
        {
            driver.Url = simpleTestPage;
            IWebElement head = driver.FindElement(By.XPath("/html"));
            string attribute = head.GetAttribute("cheese");
            Assert.AreEqual(attribute, null);
        }

        [Test]
        public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
        {
            driver.Url = simpleTestPage;
            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.AreEqual(body.GetAttribute("style"), string.Empty);
        }

        [Test]
        public void ShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing()
        {
            driver.Url = formsPage;
            IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.AreEqual(inputElement.GetAttribute("disabled"), "false");
            Assert.IsTrue(inputElement.Enabled);

            IWebElement pElement = driver.FindElement(By.Id("cheeseLiker"));
            Assert.AreEqual(pElement.GetAttribute("disabled"), "false");
            Assert.IsTrue(pElement.Enabled);
        }

        [Test]
        [IgnoreBrowser(Browser.IE)]
        public void ShouldReturnTheValueOfTheIndexAttrbuteEvenIfItIsMissing()
        {
            driver.Url = formsPage;

            IWebElement multiSelect = driver.FindElement(By.Id("multi"));
            ReadOnlyCollection<IWebElement> options = multiSelect.FindElements(By.TagName("option"));
            Assert.AreEqual(options[1].GetAttribute("index"), "1");
        }


        [Test]
        public void ShouldIndicateTheElementsThatAreDisabledAreNotEnabled()
        {
            driver.Url = formsPage;
            IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='notWorking']"));
            Assert.AreEqual(inputElement.Enabled, false);

            inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.AreEqual(inputElement.Enabled, true);
        }

        [Test]
        public void ShouldIndicateWhenATextAreaIsDisabled()
        {
            driver.Url = formsPage;
            IWebElement textArea = driver.FindElement(By.XPath("//textarea[@id='notWorkingArea']"));
            Assert.AreEqual(textArea.Enabled, false);
        }

        [Test]
        public void ShouldIndicateWhenASelectIsDisabled()
        {
            driver.Url = formsPage;

            IWebElement enabled = driver.FindElement(By.Name("selectomatic"));
            IWebElement disabled = driver.FindElement(By.Name("no-select"));

            Assert.IsTrue(enabled.Enabled);
            Assert.IsFalse(disabled.Enabled);
        }

        [Test]
        public void ShouldReturnTheValueOfCheckedForACheckboxEvenIfItLacksThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement checkbox = driver.FindElement(By.XPath("//input[@id='checky']"));
            Assert.AreEqual(checkbox.GetAttribute("checked"), "false");
            checkbox.Select();
            Assert.AreEqual(checkbox.GetAttribute("checked"), "true");
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement neverSelected = driver.FindElement(By.Id("cheese"));
            IWebElement initiallyNotSelected = driver.FindElement(By.Id("peas"));
            IWebElement initiallySelected = driver.FindElement(By.Id("cheese_and_peas"));

            Assert.AreEqual(neverSelected.GetAttribute("selected"), "false");
            Assert.AreEqual(initiallyNotSelected.GetAttribute("selected"), "false");
            Assert.AreEqual(initiallySelected.GetAttribute("selected"), "true");

            initiallyNotSelected.Select();
            Assert.AreEqual(neverSelected.GetAttribute("selected"), "false");
            Assert.AreEqual(initiallyNotSelected.GetAttribute("selected"), "true");
            Assert.AreEqual(initiallySelected.GetAttribute("selected"), "false");
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
            ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.AreEqual(one.Selected, true);
            Assert.AreEqual(two.Selected, false);
            Assert.AreEqual(one.GetAttribute("selected"), "true");
            Assert.AreEqual(two.GetAttribute("selected"), "false");
        }

        [Test]
        public void ShouldReturnValueOfClassAttributeOfAnElement()
        {
            driver.Url = xhtmlTestPage;

            IWebElement heading = driver.FindElement(By.XPath("//h1"));
            String className = heading.GetAttribute("class");

            Assert.AreEqual(className, "header");
        }

        [Test]
        public void ShouldReturnTheContentsOfATextAreaAsItsValue()
        {
            driver.Url = formsPage;

            String value = driver.FindElement(By.Id("withText")).Value;

            Assert.AreEqual(value, "Example text");
        }

        [Test]
        public void ShouldTreatReadonlyAsAValue()
        {
            driver.Url = formsPage;

            IWebElement element = driver.FindElement(By.Name("readonly"));
            string readOnlyAttribute = element.GetAttribute("readonly");

            IWebElement textInput = driver.FindElement(By.Name("x"));
            string notReadOnly = textInput.GetAttribute("readonly");

            Assert.AreNotEqual(readOnlyAttribute, notReadOnly);
        }

        [Test]
        public void ShouldGetNumericAtribute()
        {
            driver.Url = formsPage;
            IWebElement element = driver.FindElement(By.Id("withText"));
            Assert.AreEqual("5", element.GetAttribute("rows"));
        }
    }
}
