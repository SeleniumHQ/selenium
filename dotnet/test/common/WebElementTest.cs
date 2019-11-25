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
            Assert.That(parent, Is.InstanceOf<IWrapsDriver>());
        }

        [Test]
        public void ElementShouldReturnOriginDriver()
        {
            driver.Url = simpleTestPage;
            IWebElement parent = driver.FindElement(By.Id("containsSomeDiv"));
            Assert.That(((IWrapsDriver)parent).WrappedDriver, Is.EqualTo(driver));
        }

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void ShouldToggleElementAndCheckIfElementIsSelected()
        {
            driver.Url = simpleTestPage;
            IWebElement checkbox = driver.FindElement(By.Id("checkbox1"));
            Assert.That(checkbox.Selected, Is.False);
            checkbox.Click();
            Assert.That(checkbox.Selected, Is.True);
            checkbox.Click();
            Assert.That(checkbox.Selected, Is.False);
        }

        [Test]
        public void ShouldThrowExceptionOnNonExistingElement()
        {
            driver.Url = simpleTestPage;
            Assert.That(() => driver.FindElement(By.Id("doesnotexist")), Throws.InstanceOf<NoSuchElementException>());
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
            Assert.That(hidden.Displayed, Is.False, "Element with ID 'hidden' should not be displayed");

            IWebElement none = driver.FindElement(By.Id("none"));
            Assert.That(none.Displayed, Is.False, "Element with ID 'none' should not be displayed");

            IWebElement displayed = driver.FindElement(By.Id("displayed"));
            Assert.That(displayed.Displayed, Is.True, "Element with ID 'displayed' should not be displayed");
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

            Assert.That(driver.Url, Does.StartWith(resultPage));
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
