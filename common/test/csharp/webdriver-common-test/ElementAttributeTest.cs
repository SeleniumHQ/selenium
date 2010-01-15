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
        public void ShouldReturnNullWhenGettingTheValueOfAnAttributeThatIsNotListed()
        {
            driver.Url = simpleTestPage;
            IWebElement head = driver.FindElement(By.XPath("/html"));
            string attribute = head.GetAttribute("cheese");
            Assert.IsNull(attribute);
        }

        [Test]
        public void ShouldReturnEmptyAttributeValuesWhenPresentAndTheValueIsActuallyEmpty()
        {
            driver.Url = simpleTestPage;
            IWebElement body = driver.FindElement(By.XPath("//body"));
            Assert.AreEqual(string.Empty, body.GetAttribute("style"));
        }

        [Test]
        public void ShouldReturnTheValueOfTheDisabledAttrbuteEvenIfItIsMissing()
        {
            driver.Url = formsPage;
            IWebElement inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.AreEqual("false", inputElement.GetAttribute("disabled"));
            Assert.IsTrue(inputElement.Enabled);

            IWebElement pElement = driver.FindElement(By.Id("cheeseLiker"));
            Assert.AreEqual("false", pElement.GetAttribute("disabled"));
            Assert.IsTrue(pElement.Enabled);
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
            Assert.IsFalse(inputElement.Enabled);

            inputElement = driver.FindElement(By.XPath("//input[@id='working']"));
            Assert.IsTrue(inputElement.Enabled);
        }

        [Test]
        public void ShouldIndicateWhenATextAreaIsDisabled()
        {
            driver.Url = formsPage;
            IWebElement textArea = driver.FindElement(By.XPath("//textarea[@id='notWorkingArea']"));
            Assert.IsFalse(textArea.Enabled);
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
            Assert.AreEqual("false", checkbox.GetAttribute("checked"));
            checkbox.Select();
            Assert.AreEqual("true", checkbox.GetAttribute("checked"));
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForRadioButtonsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement neverSelected = driver.FindElement(By.Id("cheese"));
            IWebElement initiallyNotSelected = driver.FindElement(By.Id("peas"));
            IWebElement initiallySelected = driver.FindElement(By.Id("cheese_and_peas"));

            Assert.AreEqual("false", neverSelected.GetAttribute("selected"), "false");
            Assert.AreEqual("false", initiallyNotSelected.GetAttribute("selected"), "false");
            Assert.AreEqual("true", initiallySelected.GetAttribute("selected"), "true");

            initiallyNotSelected.Select();
            Assert.AreEqual("false", neverSelected.GetAttribute("selected"));
            Assert.AreEqual("true", initiallyNotSelected.GetAttribute("selected"));
            Assert.AreEqual("false", initiallySelected.GetAttribute("selected"));
        }

        [Test]
        public void ShouldReturnTheValueOfSelectedForOptionsInSelectsEvenIfTheyLackThatAttribute()
        {
            driver.Url = formsPage;
            IWebElement selectBox = driver.FindElement(By.XPath("//select[@name='selectomatic']"));
            ReadOnlyCollection<IWebElement> options = selectBox.FindElements(By.TagName("option"));
            IWebElement one = options[0];
            IWebElement two = options[1];
            Assert.IsTrue(one.Selected);
            Assert.IsFalse(two.Selected);
            Assert.AreEqual("true", one.GetAttribute("selected"));
            Assert.AreEqual("false", two.GetAttribute("selected"));
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

            String value = driver.FindElement(By.Id("withText")).Value;

            Assert.AreEqual("Example text", value);
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
