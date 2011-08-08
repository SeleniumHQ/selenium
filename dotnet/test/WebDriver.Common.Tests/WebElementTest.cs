using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class WebElementTest : DriverTestFixture
    {
        [Test]
        public void ElementShouldImplementWrapsDriver()
        {
            driver.Url = simpleTestPage;
            IWebElement parent = driver.FindElement(By.Id("containsSomeDiv"));
            Assert.IsTrue(parent is IWrapsDriver);
        }

        [Test]
        public void ElementShouldReturnOriginDriver()
        {
            driver.Url = simpleTestPage;
            IWebElement parent = driver.FindElement(By.Id("containsSomeDiv"));
            Assert.IsTrue(((IWrapsDriver)parent).WrappedDriver == driver);
        }

        //////////////////////////////////////////////////////////
        // Tests below here do not exist in the Java unit tests.
        //////////////////////////////////////////////////////////

        [Test]
        public void ShouldToggleElementAndCheckIfElementIsSelected()
        {
            driver.Url = simpleTestPage;
            IWebElement checkbox = driver.FindElement(By.Id("checkbox1"));
            Assert.IsFalse(checkbox.Selected);
            checkbox.Click();
            Assert.IsTrue(checkbox.Selected);
            checkbox.Click();
            Assert.IsFalse(checkbox.Selected);
        }

        [Test]
        [ExpectedException(typeof(NoSuchElementException))]
        public void ShouldThrowExceptionOnNonExistingElement()
        {
            driver.Url = simpleTestPage;
            driver.FindElement(By.Id("doesnotexist"));
        }

        [Test]
        public void ShouldGetElementName() 
        {
            driver.Url = simpleTestPage;

            IWebElement oneliner = driver.FindElement(By.Id("oneline"));
            Assert.AreEqual("p", oneliner.TagName.ToLower());

        }

        [Test]
        public void ShouldGetElementText() 
        {

            driver.Url = simpleTestPage;

            IWebElement oneliner = driver.FindElement(By.Id("oneline"));
            Assert.AreEqual("A single line of text", oneliner.Text);

            IWebElement twoblocks = driver.FindElement(By.Id("twoblocks"));
            Assert.AreEqual("Some text" + 
                System.Environment.NewLine + 
                "Some more text", twoblocks.Text);

        }

        [Test]
        public void ShouldReturnWhetherElementIsDisplayed() 
        {
            driver.Url = javascriptPage;

            IWebElement hidden = driver.FindElement(By.Id("hidden"));
            Assert.IsFalse(hidden.Displayed);

            IWebElement none = driver.FindElement(By.Id("none"));
            Assert.IsFalse(none.Displayed);

            IWebElement displayed = driver.FindElement(By.Id("displayed"));
            Assert.IsTrue(displayed.Displayed);
        }

        [Test]
        public void ShouldClearElement()
        {
            driver.Url = javascriptPage;

            IWebElement textbox = driver.FindElement(By.Id("keyUp"));
            textbox.SendKeys("a@#$ç.ó");
            textbox.Clear();
            Assert.AreEqual("", textbox.GetAttribute("value"));
        }

        [Test]
        public void ShouldClearRenderedElement()
        {
            driver.Url = javascriptPage;

            IWebElement textbox = driver.FindElement(By.Id("keyUp"));
            textbox.SendKeys("a@#$ç.ó");
            textbox.Clear();
            Assert.AreEqual("", textbox.GetAttribute("value"));
        }

        [Test]
        public void ShouldSendKeysToElement() 
        {
            driver.Url = javascriptPage;

            IWebElement textbox = driver.FindElement(By.Id("keyUp"));
            textbox.SendKeys("a@#$ç.ó");
            Assert.AreEqual("a@#$ç.ó", textbox.GetAttribute("value"));
        }

        [Test]
        public void ShouldSubmitElement() 
        {
            driver.Url = javascriptPage;

            IWebElement submit = driver.FindElement(By.Id("submittingButton"));
            submit.Submit();

            Assert.IsTrue(driver.Url.StartsWith(resultPage));
        }

        [Test]
        public void ShouldClickLinkElement() 
        {
            driver.Url = javascriptPage;
            IWebElement changedDiv = driver.FindElement(By.Id("dynamo"));
            IWebElement link = driver.FindElement(By.LinkText("Update a div"));
            link.Click();
            Assert.AreEqual("Fish and chips!", changedDiv.Text);
        }

        [Test]
        public void ShouldGetAttributesFromElement() 
        {
            driver.Url = (javascriptPage);

            IWebElement dynamo = driver.FindElement(By.Id("dynamo"));
            IWebElement mousedown = driver.FindElement(By.Id("mousedown"));
            Assert.AreEqual("mousedown", mousedown.GetAttribute("id"));
            Assert.AreEqual("dynamo", dynamo.GetAttribute("id"));

        }
    }
}
