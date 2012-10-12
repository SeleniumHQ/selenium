using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;
using System.Drawing;
using OpenQA.Selenium.Interactions;

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

            IWebElement element = driver.FindElement(By.Id("green-parent"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#008000").Or.EqualTo("rgba(0, 128, 0, 1)"));

            element = driver.FindElement(By.Id("red-item"));
            backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("#ff0000").Or.EqualTo("rgba(255, 0, 0, 1)"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Chrome, "WebKit bug 28804")]
        [IgnoreBrowser(Browser.PhantomJS, "WebKit bug 28804")]
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
        public void ShouldAllowInheritedStylesToBeUsed()
        {
            driver.Url = javascriptPage;

            IWebElement element = driver.FindElement(By.Id("green-item"));
            string backgroundColour = element.GetCssValue("background-color");

            Assert.That(backgroundColour, Is.EqualTo("transparent").Or.EqualTo("rgba(0, 0, 0, 0)"));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IPhone)]
        [IgnoreBrowser(Browser.HtmlUnit)]
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
            Actions actionBuilder = new Actions(driver);
            actionBuilder.MoveToElement(element).Perform();

            item = driver.FindElement(By.Id("item1"));
            Assert.AreEqual("Item 1", item.Text);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCorrectlyIdentifyThatAnElementHasWidth()
        {
            driver.Url = xhtmlTestPage;

            IWebElement shrinko = driver.FindElement(By.Id("linkId"));
            Size size = shrinko.Size;
            Assert.IsTrue(size.Width > 0, "Width expected to be greater than 0");
            Assert.IsTrue(size.Height > 0, "Height expected to be greater than 0");
        }

        [Test]
        [Category("Javascript")]
        public void CorrectlyDetectMapElementsAreShown()
        {
            driver.Url = mapVisibilityPage;

            IWebElement area = driver.FindElement(By.Id("mtgt_unnamed_0"));

            bool isShown = area.Displayed;
            Assert.IsTrue(isShown, "The element and the enclosing map should be considered shown.");
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

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        public void MovingMouseByRelativeOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            new Actions(driver).MoveToElement(trackerDiv).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 50, 200));

            new Actions(driver).MoveByOffset(10, 20).Build().Perform();

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 60, 220));
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        public void MovingMouseToRelativeElementOffset()
        {
            driver.Url = mouseTrackerPage;

            IWebElement trackerDiv = driver.FindElement(By.Id("mousetracker"));
            new Actions(driver).MoveToElement(trackerDiv, 95, 195).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 95, 195));
        }

        [Test]
        [Category("Javascript")]
        [NeedsFreshDriver(BeforeTest = true)]
        [IgnoreBrowser(Browser.HtmlUnit, "Advanced mouse actions only implemented in rendered browsers")]
        public void MoveRelativeToBody()
        {
            driver.Url = mouseTrackerPage;

            new Actions(driver).MoveByOffset(50, 100).Build().Perform();

            IWebElement reporter = driver.FindElement(By.Id("status"));

            WaitFor(FuzzyMatchingOfCoordinates(reporter, 40, 20));
        }

        private Func<bool> FuzzyMatchingOfCoordinates(IWebElement element, int x, int y)
        {
            return () =>
            {
                return FuzzyPositionMatching(x, y, element.Text);
            };
        }

        private bool FuzzyPositionMatching(int expectedX, int expectedY, String locationTuple)
        {
            string[] splitString = locationTuple.Split(',');
            int gotX = int.Parse(splitString[0].Trim());
            int gotY = int.Parse(splitString[1].Trim());

            // Everything within 5 pixels range is OK
            const int ALLOWED_DEVIATION = 5;
            return Math.Abs(expectedX - gotX) < ALLOWED_DEVIATION && Math.Abs(expectedY - gotY) < ALLOWED_DEVIATION;
        }
    }
}
