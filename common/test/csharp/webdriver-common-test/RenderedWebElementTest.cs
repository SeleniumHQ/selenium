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
        public void ShouldPickUpStyleOfAnElement()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("green-parent"));
            String backgroundColour = element.GetValueOfCssProperty("background-color");

            Assert.AreEqual("#008000", backgroundColour);

            element = (IRenderedWebElement)driver.FindElement(By.Id("red-item"));
            backgroundColour = element.GetValueOfCssProperty("background-color");

            Assert.AreEqual("#ff0000", backgroundColour);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "WebKit bug 28804")]
        [IgnoreBrowser(Browser.IE, "Position and size are always integer in IE")]
        public void ShouldHandleNonIntegerPositionAndSize()
        {
            driver.Url = rectanglesPage;

            IRenderedWebElement r2 = (IRenderedWebElement)driver.FindElement(By.Id("r2"));
            String left = r2.GetValueOfCssProperty("left");
            Assert.IsTrue(left.StartsWith("10.9"), "left (\"" + left + "\") should start with \"10.9\".");
            String top = r2.GetValueOfCssProperty("top");
            Assert.IsTrue(top.StartsWith("10.1"), "top (\"" + top + "\") should start with \"10.1\".");
            Assert.AreEqual(new Point(11, 10), r2.Location);
            String width = r2.GetValueOfCssProperty("width");
            Assert.IsTrue(width.StartsWith("48.6"), "width (\"" + left + "\") should start with \"48.6\".");
            String height = r2.GetValueOfCssProperty("height");
            Assert.IsTrue(height.StartsWith("49.3"), "height (\"" + left + "\") should start with \"49.3\".");
            Assert.AreEqual(r2.Size, new Size(49, 49));
        }

        [Test]
        [Category("Javascript")]
        public void ShouldAllowInheritedStylesToBeUsed()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("green-item"));
            String backgroundColour = element.GetValueOfCssProperty("background-color");

            Assert.AreEqual("transparent", backgroundColour);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Chrome)]
        public void ShouldAllowUsersToHoverOverElements()
        {
            driver.Url = javascriptPage;

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            IRenderedWebElement item = (IRenderedWebElement)driver.FindElement(By.Id("item1"));
            Assert.AreEqual("", item.Text);

            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].style.background = 'green'", element);
            element.Hover();

            item = (IRenderedWebElement)driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCorrectlyIdentifyThatAnElementHasWidth()
        {
            driver.Url = xhtmlTestPage;

            IRenderedWebElement shrinko = (IRenderedWebElement)driver.FindElement(By.Id("amazing"));
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

            IRenderedWebElement element = (IRenderedWebElement)driver.FindElement(By.Id("menu1"));
            if (!Platform.CurrentPlatform.IsPlatformType(PlatformType.Windows))
            {
                Assert.Ignore("Skipping test: Simulating hover needs native events");
            }

            element.Hover();

            IRenderedWebElement target = (IRenderedWebElement)driver.FindElement(By.Id("item1"));
            Assert.IsTrue(target.Displayed);
            target.Click();

            String text = driver.FindElement(By.Id("result")).Text;
            Assert.IsTrue(text.Contains("item 1"));
        }
    }
}
