using System.Drawing;
using NUnit.Framework;
using OpenQA.Selenium.Environment;

namespace OpenQA.Selenium
{
    [TestFixture]
    public class PositionAndSizeTest : DriverTestFixture
    {
        [Test]
        public void ShouldGetCoordinatesOfAnElementInViewPort()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/simple_page.html");
            Assert.AreEqual(new Point(10, 10), GetLocationInViewPort(By.Id("box")));
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesOfAnEmptyElement()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_empty_element.html");
            Assert.AreEqual(new Point(10, 10), GetLocationInViewPort(By.Id("box")));
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesOfATransparentElement()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_transparent_element.html");
            Assert.AreEqual(new Point(10, 10), GetLocationInViewPort(By.Id("box")));
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesOfAHiddenElement()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_hidden_element.html");
            Assert.AreEqual(new Point(10, 10), GetLocationInViewPort(By.Id("box")));
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesOfAnInvisibleElement()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_invisible_element.html");
            Assert.AreEqual(new Point(0, 0), GetLocationInViewPort(By.Id("box")));
            Assert.AreEqual(new Point(0, 0), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldScrollPageAndGetCoordinatesOfAnElementThatIsOutOfViewPort()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_element_out_of_view.html");
            int windowHeight = driver.Manage().Window.Size.Height;
            Point location = GetLocationInViewPort(By.Id("box"));
            Assert.AreEqual(10, location.X);
            Assert.GreaterOrEqual(location.Y, 0);
            Assert.AreEqual(new Point(10, 5010), GetLocationOnPage(By.Id("box")));
            // GetLocationInViewPort only works within the context of a single frame
            // for W3C-spec compliant remote ends.
            // Assert.LessOrEqual(location.Y, windowHeight - 100);
        }

        [Test]
        public void ShouldGetCoordinatesOfAnElementInAFrame()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/element_in_frame.html");
            driver.SwitchTo().Frame("ifr");
            IWebElement box = driver.FindElement(By.Id("box"));
            Assert.AreEqual(new Point(10, 10), box.Location);
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesInViewPortOfAnElementInAFrame()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/element_in_frame.html");
            driver.SwitchTo().Frame("ifr");
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
            // GetLocationInViewPort only works within the context of a single frame
            // for W3C-spec compliant remote ends.
            // Assert.AreEqual(new Point(25, 25), GetLocationInViewPort(By.Id("box")));
        }

        [Test]
        public void ShouldGetCoordinatesInViewPortOfAnElementInANestedFrame()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/element_in_nested_frame.html");
            driver.SwitchTo().Frame("ifr");
            driver.SwitchTo().Frame("ifr");
            Assert.AreEqual(new Point(10, 10), GetLocationOnPage(By.Id("box")));
            // GetLocationInViewPort only works within the context of a single frame
            // for W3C-spec compliant remote ends.
            // Assert.AreEqual(new Point(40, 40), GetLocationInViewPort(By.Id("box")));
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox)]
        public void ShouldGetCoordinatesOfAnElementWithFixedPosition()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("coordinates_tests/page_with_fixed_element.html");
            Assert.AreEqual(0, GetLocationInViewPort(By.Id("fixed")).Y);
            Assert.AreEqual(0, GetLocationOnPage(By.Id("fixed")).Y);

            driver.FindElement(By.Id("bottom")).Click();
            Assert.AreEqual(0, GetLocationInViewPort(By.Id("fixed")).Y);
            Assert.Greater(GetLocationOnPage(By.Id("fixed")).Y, 0);
        }

        [Test]
        [Category("Javascript")]
        public void ShouldCorrectlyIdentifyThatAnElementHasWidthAndHeight()
        {
            driver.Url = xhtmlTestPage;

            IWebElement shrinko = driver.FindElement(By.Id("linkId"));
            Size size = shrinko.Size;
            Assert.IsTrue(size.Width > 0, "Width expected to be greater than 0");
            Assert.IsTrue(size.Height > 0, "Height expected to be greater than 0");
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Android)]
        [IgnoreBrowser(Browser.Opera)]
        [IgnoreBrowser(Browser.Chrome, "WebKit bug 28804")]
        [IgnoreBrowser(Browser.IPhone, "WebKit bug 28804")]
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

        private Point GetLocationInViewPort(By locator)
        {
            IWebElement element = driver.FindElement(locator);
            return ((ILocatable)element).Coordinates.LocationInViewport;
        }

        private Point GetLocationOnPage(By locator)
        {
            IWebElement element = driver.FindElement(locator);
            return ((ILocatable)element).Coordinates.LocationInDom;
        }
    }
}
