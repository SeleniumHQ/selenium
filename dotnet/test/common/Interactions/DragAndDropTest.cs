using System;
using NUnit.Framework;
using System.Drawing;
using System.Text.RegularExpressions;
using OpenQA.Selenium.Environment;
using OpenQA.Selenium.Internal;

namespace OpenQA.Selenium.Interactions
{
    [TestFixture]
    public class DragAndDropTest : DriverTestFixture
    {
        [SetUp]
        public void SetupTest()
        {
            IActionExecutor actionExecutor = driver as IActionExecutor;
            if (actionExecutor != null)
            {
                actionExecutor.ResetInputState();
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropRelative()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));
            Point expectedLocation = drag(img, img.Location, 150, 200);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, -50, -25);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, 0, 0);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = drag(img, img.Location, 1, -1);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropToElement()
        {
            driver.Url = dragAndDropPage;
            IWebElement img1 = driver.FindElement(By.Id("test1"));
            IWebElement img2 = driver.FindElement(By.Id("test2"));
            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDrop(img2, img1).Perform();
            Assert.AreEqual(img1.Location, img2.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropToElementInIframe()
        {
            driver.Url = iframePage;
            IWebElement iframe = driver.FindElement(By.TagName("iframe"));
            ((IJavaScriptExecutor)driver).ExecuteScript("arguments[0].src = arguments[1]", iframe,
                                                        dragAndDropPage);
            driver.SwitchTo().Frame(0);
            IWebElement img1 = WaitFor<IWebElement>(() =>
                {
                    try
                    {
                        IWebElement element1 = driver.FindElement(By.Id("test1"));
                        return element1;
                    }
                    catch (NoSuchElementException)
                    {
                        return null;
                    }
                }, "Element with ID 'test1' not found");

            IWebElement img2 = driver.FindElement(By.Id("test2"));
            new Actions(driver).DragAndDrop(img2, img1).Perform();
            Assert.AreEqual(img1.Location, img2.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropElementWithOffsetInIframeAtBottom()
        {
            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("iframeAtBottom.html");

            IWebElement iframe = driver.FindElement(By.TagName("iframe"));
            driver.SwitchTo().Frame(iframe);

            IWebElement img1 = driver.FindElement(By.Id("test1"));
            Point initial = img1.Location;

            new Actions(driver).DragAndDropToOffset(img1, 20, 20).Perform();
            initial.Offset(20, 20);
            Assert.AreEqual(initial, img1.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropElementWithOffsetInScrolledDiv()
        {
            if (TestUtilities.IsFirefox(driver) && TestUtilities.IsNativeEventsEnabled(driver))
            {
                return;
            }

            driver.Url = EnvironmentManager.Instance.UrlBuilder.WhereIs("dragAndDropInsideScrolledDiv.html");

            IWebElement el = driver.FindElement(By.Id("test1"));
            Point initial = el.Location;

            new Actions(driver).DragAndDropToOffset(el, 3700, 3700).Perform();
            initial.Offset(3700, 3700);
            Assert.AreEqual(initial, el.Location);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void ElementInDiv()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test3"));
            Point startLocation = img.Location;
            Point expectedLocation = drag(img, startLocation, 100, 100);
            Point endLocation = img.Location;
            Assert.AreEqual(expectedLocation, endLocation);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.IE, "Dragging too far in IE causes the element not to move, instead of moving to 0,0.")]
        //[IgnoreBrowser(Browser.Chrome, "Dragging too far in Chrome causes the element not to move, instead of moving to 0,0.")]
        [IgnoreBrowser(Browser.PhantomJS, "Dragging too far in PhantomJS causes the element not to move, as PhantomJS doesn't support dragging outside the viewport.")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragTooFar()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));

            // Dragging too far left and up does not move the element. It will be at 
            // its original location after the drag.
            Point originalLocation = new Point(0, 0);
            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(img, int.MinValue, int.MinValue).Perform();
            Point newLocation = img.Location;
            Assert.LessOrEqual(newLocation.X, 0);
            Assert.LessOrEqual(newLocation.Y, 0);

            // TODO(jimevans): re-enable this test once moveto does not exceed the
            // coordinates accepted by the browsers (Firefox in particular). At the
            // moment, even though the maximal coordinates are limited, mouseUp 
            // fails because it cannot get the element at the given coordinates.
            //actionProvider.DragAndDropToOffset(img, int.MaxValue, int.MaxValue).Perform();
            //We don't know where the img is dragged to , but we know it's not too
            //far, otherwise this function will not return for a long long time
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Firefox, "Problem with drag off viewport. See issue #1771")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void ShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort()
        {
            driver.Url = dragAndDropPage;

            IJavaScriptExecutor js = (IJavaScriptExecutor)driver;
            int height = Convert.ToInt32(js.ExecuteScript("return window.outerHeight;"));
            int width = Convert.ToInt32(js.ExecuteScript("return window.outerWidth;"));
            bool mustUseOffsetHeight = width == 0 && height == 0;
            if (mustUseOffsetHeight)
            {
                width = Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;"));
                height = Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;"));
            }

            js.ExecuteScript("window.resizeTo(300, 300);");
            if (mustUseOffsetHeight)
            {
                width = width + 300 - Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientWidth ? document.documentElement.clientWidth : document.body.clientWidth;"));
                height = height + 300 - Convert.ToInt32(js.ExecuteScript("return document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight;"));
            }

            try
            {
                driver.Url = dragAndDropPage;
                IWebElement img = driver.FindElement(By.Id("test3"));
                Point expectedLocation = drag(img, img.Location, 100, 100);
                Assert.AreEqual(expectedLocation, img.Location);
            }
            finally
            {
                js.ExecuteScript("window.resizeTo(arguments[0], arguments[1]);", width, height);
            }
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Android, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.IPhone, "Mobile browser does not support drag-and-drop")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void DragAndDropOnJQueryItems()
        {
            driver.Url = droppableItems;

            IWebElement toDrag = driver.FindElement(By.Id("draggable"));
            IWebElement dropInto = driver.FindElement(By.Id("droppable"));

            // Wait until all event handlers are installed.
            System.Threading.Thread.Sleep(500);

            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDrop(toDrag, dropInto).Perform();

            string text = dropInto.FindElement(By.TagName("p")).Text;

            DateTime endTime = DateTime.Now.Add(TimeSpan.FromSeconds(15));

            while (text != "Dropped!" && (DateTime.Now < endTime))
            {
                System.Threading.Thread.Sleep(200);
                text = dropInto.FindElement(By.TagName("p")).Text;
            }

            Assert.AreEqual("Dropped!", text);

            IWebElement reporter = driver.FindElement(By.Id("drop_reports"));
            // Assert that only one mouse click took place and the mouse was moved
            // during it.
            string reporterText = reporter.Text;
            Assert.IsTrue(Regex.IsMatch(reporterText, "start( move)* down( move)+ up"));
            Assert.AreEqual(1, Regex.Matches(reporterText, "down").Count, "Reporter text:" + reporterText);
            Assert.AreEqual(1, Regex.Matches(reporterText, "up").Count, "Reporter text:" + reporterText);
            Assert.IsTrue(reporterText.Contains("move"), "Reporter text:" + reporterText);
        }

        [Test]
        [Category("Javascript")]
        [IgnoreBrowser(Browser.HtmlUnit)]
        [IgnoreBrowser(Browser.Opera, "Untested")]
        [IgnoreBrowser(Browser.PhantomJS, "Untested")]
        [IgnoreBrowser(Browser.Safari, "Advanced User Interactions not implmented on Safari")]
        public void CanDragAnElementNotVisibleInTheCurrentViewportDueToAParentOverflow()
        {
            driver.Url = dragDropOverflowPage;

            IWebElement toDrag = driver.FindElement(By.Id("time-marker"));
            IWebElement dragTo = driver.FindElement(By.Id("11am"));

            Point srcLocation = toDrag.Location;
            Point targetLocation = dragTo.Location;

            int yOffset = targetLocation.Y - srcLocation.Y;
            Assert.AreNotEqual(0, yOffset);

            new Actions(driver).DragAndDropToOffset(toDrag, 0, yOffset).Perform();

            Assert.AreEqual(dragTo.Location, toDrag.Location);
        }

        //[Test]
        public void MemoryTest()
        {
            driver.Url = dragAndDropPage;
            IWebElement img1 = driver.FindElement(By.Id("test1"));
            IWebElement img2 = driver.FindElement(By.Id("test2"));
            System.Threading.Thread.Sleep(1000);
            for (int i = 0; i < 500; i++)
            {
                string foo = img1.GetAttribute("id");
                //img1 = driver.FindElement(By.Id("test1"));
                //Actions a = new Actions(driver);
                //a.MoveToElement(img1).Perform();
            }

            driver.Url = simpleTestPage;
        }

        private Point drag(IWebElement elem, Point initialLocation, int moveRightBy, int moveDownBy)
        {
            Point expectedLocation = new Point(initialLocation.X, initialLocation.Y);
            expectedLocation.Offset(moveRightBy, moveDownBy);

            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(elem, moveRightBy, moveDownBy).Perform();

            return expectedLocation;
        }
    }
}
