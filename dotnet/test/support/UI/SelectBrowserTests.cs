using System;
using System.Collections.Generic;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium.Support.UI
{
    [TestFixture]
    public class SelectBrowserTests : DriverTestFixture
    {
        [OneTimeSetUp]
        public void RunBeforeAnyTest()
        {
            EnvironmentManager.Instance.WebServer.Start();
        }

        [OneTimeTearDown]
        public void RunAfterAnyTests()
        {
            EnvironmentManager.Instance.CloseCurrentDriver();
            EnvironmentManager.Instance.WebServer.Stop();
        }

        [SetUp]
        public void Setup()
        {
            driver.Url = formsPage;
        }

        [Test]
        public void ShouldThrowAnExceptionIfTheElementIsNotASelectElement()
        {
            IWebElement element = driver.FindElement(By.Name("checky"));
            Assert.Throws<UnexpectedTagNameException>(() => { SelectElement elementWrapper = new SelectElement(element); });
        }

        [Test]
        public void ShouldIndicateThatASelectCanSupportMultipleOptions()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.IsTrue(elementWrapper.IsMultiple);
        }

        [Test]
        public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithEmptyMultipleAttribute()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.IsTrue(elementWrapper.IsMultiple);
        }

        [Test]
        public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithTrueMultipleAttribute()
        {
            IWebElement element = driver.FindElement(By.Name("multi_true"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.IsTrue(elementWrapper.IsMultiple);
        }

        [Test]
        public void ShouldNotIndicateThatANormalSelectSupportsMulitpleOptions()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.IsFalse(elementWrapper.IsMultiple);
        }

        [Test]
        public void ShouldIndicateThatASelectCanSupportMultipleOptionsWithFalseMultipleAttribute()
        {
            IWebElement element = driver.FindElement(By.Name("multi_false"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.IsTrue(elementWrapper.IsMultiple);
        }

        [Test]
        public void ShouldReturnAllOptionsWhenAsked()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            IList<IWebElement> returnedOptions = elementWrapper.Options;

            Assert.AreEqual(4, returnedOptions.Count);

            string one = returnedOptions[0].Text;
            Assert.AreEqual("One", one);

            string two = returnedOptions[1].Text;
            Assert.AreEqual("Two", two);

            string three = returnedOptions[2].Text;
            Assert.AreEqual("Four", three);

            string four = returnedOptions[3].Text;
            Assert.AreEqual("Still learning how to count, apparently", four);

        }

        [Test]
        public void ShouldReturnOptionWhichIsSelected()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);

            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(1, returnedOptions.Count);

            string one = returnedOptions[0].Text;
            Assert.AreEqual("One", one);
        }

        [Test]
        public void ShouldReturnOptionsWhichAreSelected()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);

            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(2, returnedOptions.Count);

            string one = returnedOptions[0].Text;
            Assert.AreEqual("Eggs", one);

            string two = returnedOptions[1].Text;
            Assert.AreEqual("Sausages", two);
        }

        [Test]
        public void ShouldReturnFirstSelectedOption()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);

            IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];

            Assert.AreEqual("Eggs", firstSelected.Text);
        }

        // [Test]
        // [ExpectedException(typeof(NoSuchElementException))]
        // The .NET bindings do not have a "FirstSelectedOption" property,
        // and no one has asked for it to this point. Given that, this test
        // is not a valid test.
        public void ShouldThrowANoSuchElementExceptionIfNothingIsSelected()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);

            Assert.AreEqual(0, elementWrapper.AllSelectedOptions.Count);
        }

        [Test]
        public void ShouldAllowOptionsToBeSelectedByVisibleText()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.SelectByText("select_2");
            IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
            Assert.AreEqual("select_2", firstSelected.Text);
        }

        [Test]
        public void ShouldAllowOptionsToBeSelectedByPartialText()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.SelectByText("4", true);
            IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
            Assert.AreEqual("select_4", firstSelected.Text);
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByTextExactMatchIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByText("4"));
        }

        [Test]
        public void ShouldNotAllowInvisibleOptionsToBeSelectedByVisibleText()
        {
            IWebElement element = driver.FindElement(By.Name("invisi_select"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByText("Apples"));
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByVisibleTextIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByText("not there"));
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByVisibleTextIfOptionDisabled()
        {
            IWebElement element = driver.FindElement(By.Name("single_disabled"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByText("Disabled"));
        }

        [Test]
        public void ShouldAllowOptionsToBeSelectedByIndex()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.SelectByIndex(1);
            IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
            Assert.AreEqual("select_2", firstSelected.Text);
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByIndexIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByIndex(10));
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByIndexIfOptionDisabled()
        {
            IWebElement element = driver.FindElement(By.Name("single_disabled"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByIndex(1));
        }

        [Test]
        public void ShouldAllowOptionsToBeSelectedByReturnedValue()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.SelectByValue("select_2");
            IWebElement firstSelected = elementWrapper.AllSelectedOptions[0];
            Assert.AreEqual("select_2", firstSelected.Text);
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByReturnedValueIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByValue("not there"));
        }

        [Test]
        public void ShouldThrowExceptionOnSelectByReturnedValueIfOptionDisabled()
        {
            IWebElement element = driver.FindElement(By.Name("single_disabled"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.SelectByValue("disabled"));
        }

        [Test]
        public void ShouldAllowUserToDeselectAllWhenSelectSupportsMultipleSelections()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.DeselectAll();
            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(0, returnedOptions.Count);
        }

        [Test]
        public void ShouldNotAllowUserToDeselectAllWhenSelectDoesNotSupportMultipleSelections()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<InvalidOperationException>(() => elementWrapper.DeselectAll());
        }

        [Test]
        public void ShouldAllowUserToDeselectOptionsByVisibleText()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.DeselectByText("Eggs");
            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(1, returnedOptions.Count);
        }

        [Test]

        public void ShouldNotAllowUserToDeselectOptionsByInvisibleText()
        {
            IWebElement element = driver.FindElement(By.Name("invisi_select"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.DeselectByText("Apples"));
        }

        [Test]
        public void ShouldAllowOptionsToBeDeselectedByIndex()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.DeselectByIndex(0);
            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(1, returnedOptions.Count);
        }

        [Test]
        public void ShouldAllowOptionsToBeDeselectedByReturnedValue()
        {
            IWebElement element = driver.FindElement(By.Name("multi"));
            SelectElement elementWrapper = new SelectElement(element);
            elementWrapper.DeselectByValue("eggs");
            IList<IWebElement> returnedOptions = elementWrapper.AllSelectedOptions;

            Assert.AreEqual(1, returnedOptions.Count);
        }

        [Test]
        public void ShouldThrowExceptionOnDeselectByReturnedValueIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.DeselectByValue("not there"));
        }

        [Test]
        public void ShouldThrowExceptionOnDeselectByTextIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.DeselectByText("not there"));
        }

        [Test]
        public void ShouldThrowExceptionOnDeselectByIndexIfOptionDoesNotExist()
        {
            IWebElement element = driver.FindElement(By.Name("select_empty_multiple"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<NoSuchElementException>(() => elementWrapper.DeselectByIndex(10));
        }

        [Test]
        public void ShouldNotAllowUserToDeselectByTextWhenSelectDoesNotSupportMultipleSelections()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<InvalidOperationException>(() => elementWrapper.DeselectByText("Four"));
        }

        [Test]
        public void ShouldNotAllowUserToDeselectByValueWhenSelectDoesNotSupportMultipleSelections()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<InvalidOperationException>(() => elementWrapper.DeselectByValue("two"));
        }

        [Test]
        public void ShouldNotAllowUserToDeselectByIndexWhenSelectDoesNotSupportMultipleSelections()
        {
            IWebElement element = driver.FindElement(By.Name("selectomatic"));
            SelectElement elementWrapper = new SelectElement(element);
            Assert.Throws<InvalidOperationException>(() => elementWrapper.DeselectByIndex(0));
        }
    }
}
