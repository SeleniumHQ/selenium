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
        public void DragAndDropRelative()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));
            Point expectedLocation = Drag(img, img.Location, 150, 200);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = Drag(img, img.Location, -50, -25);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = Drag(img, img.Location, 0, 0);
            Assert.AreEqual(expectedLocation, img.Location);
            expectedLocation = Drag(img, img.Location, 1, -1);
            Assert.AreEqual(expectedLocation, img.Location);
        }

        [Test]
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
        [IgnoreBrowser(Browser.Chrome, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Edge, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Safari, "Moving outside of view port throws exception in spec-compliant driver")]
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
        public void ElementInDiv()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test3"));
            Point startLocation = img.Location;
            Point expectedLocation = Drag(img, startLocation, 100, 100);
            Point endLocation = img.Location;
            Assert.AreEqual(expectedLocation, endLocation);
        }

        [Test]
        public void DragTooFar()
        {
            driver.Url = dragAndDropPage;
            IWebElement img = driver.FindElement(By.Id("test1"));

            // Dragging too far left and up does not move the element. It will be at
            // its original location after the drag.
            Point originalLocation = new Point(0, 0);
            Actions actionProvider = new Actions(driver);
            Assert.That(() => actionProvider.DragAndDropToOffset(img, 2147480000, 2147400000).Perform(), Throws.InstanceOf<WebDriverException>());
            new Actions(driver).Release().Perform();
        }

        [Test]
        [IgnoreBrowser(Browser.Chrome, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Edge, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.Safari, "Moving outside of view port throws exception in spec-compliant driver")]
        public void ShouldAllowUsersToDragAndDropToElementsOffTheCurrentViewPort()
        {
            Size originalSize = driver.Manage().Window.Size;
            Size testSize = new Size(300, 300);
            driver.Url = dragAndDropPage;

            driver.Manage().Window.Size = testSize;
            try
            {
                driver.Url = dragAndDropPage;
                IWebElement img = driver.FindElement(By.Id("test3"));
                Point expectedLocation = Drag(img, img.Location, 100, 100);
                Assert.AreEqual(expectedLocation, img.Location);
            }
            finally
            {
                driver.Manage().Window.Size = originalSize;
            }
        }

        [Test]
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
            Assert.That(reporterText, Does.Match("start( move)* down( move)+ up"));
            Assert.AreEqual(1, Regex.Matches(reporterText, "down").Count, "Reporter text:" + reporterText);
            Assert.AreEqual(1, Regex.Matches(reporterText, "up").Count, "Reporter text:" + reporterText);
            Assert.That(reporterText, Does.Contain("move"));
        }

        [Test]
        [IgnoreBrowser(Browser.Firefox, "Moving outside of view port throws exception in spec-compliant driver")]
        [IgnoreBrowser(Browser.IE, "Moving outside of view port throws exception in spec-compliant driver")]
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

        //------------------------------------------------------------------
        // Tests below here are not included in the Java test suite
        //------------------------------------------------------------------
        [Test]
        public void DragAndDropRelativeAndToElement()
        {
            driver.Url = dragAndDropPage;
            IWebElement img1 = driver.FindElement(By.Id("test1"));
            IWebElement img2 = driver.FindElement(By.Id("test2"));
            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(img1, 100, 100).Perform();
            actionProvider.Reset();
            actionProvider.DragAndDrop(img2, img1).Perform();
            Assert.AreEqual(img1.Location, img2.Location);
        }

        private Point Drag(IWebElement elem, Point initialLocation, int moveRightBy, int moveDownBy)
        {
            Point expectedLocation = new Point(initialLocation.X, initialLocation.Y);
            expectedLocation.Offset(moveRightBy, moveDownBy);

            Actions actionProvider = new Actions(driver);
            actionProvider.DragAndDropToOffset(elem, moveRightBy, moveDownBy).Perform();

            return expectedLocation;
        }
    }
}
