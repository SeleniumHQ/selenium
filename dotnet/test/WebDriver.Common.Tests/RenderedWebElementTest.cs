using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class RenderedWebElementTest : DriverTestFixture
    {
        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Test expects hex color, but a rgb tuple is returned.")]
        public void ShouldPickUpStyleOfAnElement()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-parent"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.AreEqual("#008000", backgroundColour);

            element = driver.FindElement(By.Id("red-item"));
            backgroundColour = element.GetCssValue("background-color");

            Assert.AreEqual("#ff0000", backgroundColour);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "WebKit bug 28804")]
        [IgnoreBrowser(Browser.IE, "Position and size are always integer in IE")]
        public void ShouldHandleNonIntegerPositionAndSize()
        {
            driver.Url = rectanglesPage;

            IWebElement r2 = driver.FindElement(By.Id("r2"));
            string left = r2.GetCssValue("left");
            Assert.IsTrue(left.StartsWith("10.9"), "left (\"" + left + "\") should start with \"10.9\".");
            string top = r2.GetCssValue("top");
            Assert.IsTrue(top.StartsWith("10.1"), "top (\"" + top + "\") should start with \"10.1\".");
            Assert.AreEqual(new Point(11, 10), r2.Location);
            string width = r2.GetCssValue("width");
            Assert.IsTrue(width.StartsWith("48.6"), "width (\"" + left + "\") should start with \"48.6\".");
            string height = r2.GetCssValue("height");
            Assert.IsTrue(height.StartsWith("49.3"), "height (\"" + left + "\") should start with \"49.3\".");
            Assert.AreEqual(r2.Size, new Size(49, 49));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "Test expects a color keyword, but a rgba tuple is returned.")]
        public void ShouldAllowInheritedStylesToBeUsed()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-item"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.AreEqual("transparent", backgroundColour);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        [IgnoreBrowser(Browser.Firefox, "moveto JSON protocol command is not yet supported by Firefox")]
        public void ShouldAllowUsersToHoverOverElements()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IHasInputDevices inputDevicesDriver = driver as IHasInputDevices;
            if (inputDevicesDriver == null)
            {
                return;
            }

            IWebElement item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("", item.Text);

            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            //element.Hover();
            inputDevicesDriver.ActionBuilder.MoveToElement(element).Build().Perform();

            item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCorrectlyIdentifyThatAnElementHasWidth()
        {
            driver.Url = xhtmlTestPage;

            IWebElement shrinko = driver.FindElement(By.Id("amazing"));
            Size size = shrinko.Size;
            Assert.IsTrue(size.Width > 0, "Width expected to be greater than 0");
            Assert.IsTrue(size.Height > 0, "Height expected to be greater than 0");
        }

        //[Test]
        //[Category("Javascript")]
        //[Ignore]
        public void CanClickOnSuckerFishMenuItem()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IWebElement target = driver.FindElement(By.Id("item1"));
            Assert.IsTrue(target.Displayed);
            target.Click();

            String text = driver.FindElement(By.Id("result")).Text;
            Assert.IsTrue(text.Contains("item 1"));
        }
    }
}
